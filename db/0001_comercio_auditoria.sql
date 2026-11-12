-- Xclusive · esquema de comercio, evidencia legal y auditoría
--
-- Aditivo y no destructivo: no toca ninguna tabla existente del proyecto.
-- Todas las tablas propias llevan el prefijo `xclusive_` para no colisionar con
-- otras aplicaciones que comparten esta base de datos.
--
-- Aplicar con:  node scripts/apply-db.mjs db/0001_comercio_auditoria.sql
--
-- RLS: las escrituras las hace únicamente la clave de servicio desde server
-- functions. El navegador solo puede LEER sus propias filas. Sin políticas de
-- INSERT/UPDATE para `authenticated`, una sesión comprometida no puede
-- autoconcederse acceso ni fabricar un pedido pagado.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- pedidos ---

create table if not exists public.xclusive_orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  creator_id        text not null,
  kind              text not null check (kind in ('ppv','clip','bundle','custom','ticket','tip','subscription')),
  item_id           text not null,
  item_label        text not null,
  gross_mxn         integer not null check (gross_mxn > 0),
  platform_fee_mxn  integer not null default 0 check (platform_fee_mxn >= 0),
  creator_net_mxn   integer not null default 0 check (creator_net_mxn >= 0),
  psp_fee_mxn       integer not null default 0 check (psp_fee_mxn >= 0),
  currency          text not null default 'MXN',
  status            text not null default 'requires_payment'
                    check (status in ('requires_payment','paid','failed','refunded','canceled','expired')),
  provider          text,
  provider_session_id text,
  provider_payment_id text,
  idempotency_key   text not null,
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  paid_at           timestamptz,
  unique (user_id, idempotency_key)
);

create index if not exists xclusive_orders_user_idx on public.xclusive_orders (user_id, created_at desc);
create index if not exists xclusive_orders_creator_idx on public.xclusive_orders (creator_id, status);
create index if not exists xclusive_orders_provider_idx on public.xclusive_orders (provider_payment_id);

-- ------------------------------------------------------------- libro mayor ---
-- Partida doble: por cada pedido pagado la suma de débitos iguala la de
-- créditos. El saldo de la creadora nunca se deriva del cliente.

create table if not exists public.xclusive_ledger_entries (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.xclusive_orders (id) on delete cascade,
  account     text not null check (account in ('psp_clearing','platform_revenue','creator_payable','psp_fee','tax_payable','refund')),
  direction   text not null check (direction in ('debit','credit')),
  amount_mxn  integer not null check (amount_mxn >= 0),
  currency    text not null default 'MXN',
  created_at  timestamptz not null default now()
);

create index if not exists xclusive_ledger_order_idx on public.xclusive_ledger_entries (order_id);
create index if not exists xclusive_ledger_account_idx on public.xclusive_ledger_entries (account, created_at desc);

-- ------------------------------------------------------------- accesos ------

create table if not exists public.xclusive_entitlements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  creator_id       text not null,
  kind             text not null check (kind in ('post','clip','bundle','ticket','membership')),
  item_id          text not null,
  granted_by_order uuid references public.xclusive_orders (id) on delete set null,
  expires_at       timestamptz,
  revoked_at       timestamptz,
  created_at       timestamptz not null default now(),
  unique (user_id, kind, item_id)
);

create index if not exists xclusive_entitlements_user_idx on public.xclusive_entitlements (user_id) where revoked_at is null;

-- --------------------------------------------------- evidencia legal --------
-- El recibo lo firma el servidor; el cliente no puede insertarlo.

create table if not exists public.xclusive_legal_acceptances (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  doc_id       text not null,
  doc_version  text not null,
  channel      text not null,
  receipt_id   text not null unique,
  hash         text not null,
  accepted_at  timestamptz not null,
  created_at   timestamptz not null default now(),
  unique (user_id, doc_id, doc_version)
);

create index if not exists xclusive_legal_user_idx on public.xclusive_legal_acceptances (user_id);

-- ------------------------------------------------------------ auditoría -----

create table if not exists public.xclusive_audit_log (
  id          bigserial primary key,
  action      text not null,
  actor_id    uuid,
  outcome     text not null check (outcome in ('ok','denied','error')),
  detail      text,
  created_at  timestamptz not null default now()
);

create index if not exists xclusive_audit_action_idx on public.xclusive_audit_log (action, created_at desc);
create index if not exists xclusive_audit_actor_idx on public.xclusive_audit_log (actor_id, created_at desc);

-- ------------------------------------------------- webhooks idempotentes ---
-- La clave primaria es el id del evento del proveedor: así un reintento del
-- webhook no vuelve a acreditar la misma compra.

create table if not exists public.xclusive_webhook_events (
  id            text primary key,
  provider      text not null,
  type          text not null,
  payload_hash  text not null,
  processed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------- updated_at -----

create or replace function public.xclusive_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists xclusive_orders_touch on public.xclusive_orders;
create trigger xclusive_orders_touch
  before update on public.xclusive_orders
  for each row execute function public.xclusive_touch_updated_at();

-- ------------------------------------------------------------------- RLS ----

alter table public.xclusive_orders             enable row level security;
alter table public.xclusive_ledger_entries     enable row level security;
alter table public.xclusive_entitlements       enable row level security;
alter table public.xclusive_legal_acceptances  enable row level security;
alter table public.xclusive_audit_log          enable row level security;
alter table public.xclusive_webhook_events     enable row level security;

-- Lectura propia. No hay política de escritura: solo la clave de servicio
-- (que omite RLS) puede insertar o actualizar.
drop policy if exists xclusive_orders_read_own on public.xclusive_orders;
create policy xclusive_orders_read_own on public.xclusive_orders
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists xclusive_entitlements_read_own on public.xclusive_entitlements;
create policy xclusive_entitlements_read_own on public.xclusive_entitlements
  for select to authenticated
  using (user_id = auth.uid() and revoked_at is null);

drop policy if exists xclusive_legal_read_own on public.xclusive_legal_acceptances;
create policy xclusive_legal_read_own on public.xclusive_legal_acceptances
  for select to authenticated
  using (user_id = auth.uid());

-- El libro mayor, la auditoría y los webhooks no se exponen al navegador.

-- ---------------------------------------------------------------- permisos ---

grant select on public.xclusive_orders            to authenticated;
grant select on public.xclusive_entitlements      to authenticated;
grant select on public.xclusive_legal_acceptances to authenticated;

revoke all on public.xclusive_orders             from anon;
revoke all on public.xclusive_ledger_entries     from anon;
revoke all on public.xclusive_entitlements       from anon;
revoke all on public.xclusive_legal_acceptances  from anon;
revoke all on public.xclusive_audit_log          from anon;
revoke all on public.xclusive_webhook_events     from anon;

revoke all on public.xclusive_ledger_entries from authenticated;
revoke all on public.xclusive_audit_log      from authenticated;
revoke all on public.xclusive_webhook_events from authenticated;

-- --------------------------------------------------------------- bóveda -----
-- Bucket privado. La descarga siempre pasa por una URL firmada de corta vida
-- emitida por una server function que comprueba el acceso.

insert into storage.buckets (id, name, public)
values ('vault', 'vault', false)
on conflict (id) do nothing;

commit;
