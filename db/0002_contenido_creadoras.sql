-- Xclusive · contenido de creadoras, solicitudes y operación
--
-- Aditivo: no toca ninguna tabla existente. Prefijo `xclusive_` para convivir
-- con el otro producto que comparte este proyecto de Supabase.
--
-- Aplicar con: node scripts/apply-db.mjs db/0002_contenido_creadoras.sql

begin;

-- --------------------------------------------------------------- contenido --
-- Una fila por pieza. `media_path` apunta al bucket privado `vault`; la
-- portada vive en el bucket público `xclusive-public` para poder mostrarla
-- antes de comprar.

create table if not exists public.xclusive_content (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  creator_slug text not null,
  kind         text not null default 'post' check (kind in ('post','clip')),
  title        text not null,
  description  text not null default '',
  category     text not null default 'Editorial',
  price_mxn    integer not null default 0 check (price_mxn >= 0),
  visibility   text not null default 'ppv' check (visibility in ('public','members','ppv')),
  cover_url    text,
  media_path   text,
  status       text not null default 'draft' check (status in ('draft','published','hidden')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists xclusive_content_public_idx
  on public.xclusive_content (status, created_at desc);
create index if not exists xclusive_content_owner_idx
  on public.xclusive_content (owner_id, created_at desc);
create index if not exists xclusive_content_slug_idx
  on public.xclusive_content (creator_slug, status);

drop trigger if exists xclusive_content_touch on public.xclusive_content;
create trigger xclusive_content_touch
  before update on public.xclusive_content
  for each row execute function public.xclusive_touch_updated_at();

alter table public.xclusive_content enable row level security;

drop policy if exists xclusive_content_read_published on public.xclusive_content;
create policy xclusive_content_read_published on public.xclusive_content
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists xclusive_content_read_own on public.xclusive_content;
create policy xclusive_content_read_own on public.xclusive_content
  for select to authenticated
  using (owner_id = auth.uid());

grant select on public.xclusive_content to anon, authenticated;
revoke insert, update, delete on public.xclusive_content from anon, authenticated;

-- ------------------------------------------------------- solicitudes ARCO ----

create table if not exists public.xclusive_data_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('acceso','rectificacion','cancelacion','oposicion')),
  details     text not null default '',
  status      text not null default 'pending'
              check (status in ('pending','in_review','fulfilled','rejected')),
  resolution  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists xclusive_data_requests_user_idx
  on public.xclusive_data_requests (user_id, created_at desc);
create index if not exists xclusive_data_requests_status_idx
  on public.xclusive_data_requests (status, created_at);

drop trigger if exists xclusive_data_requests_touch on public.xclusive_data_requests;
create trigger xclusive_data_requests_touch
  before update on public.xclusive_data_requests
  for each row execute function public.xclusive_touch_updated_at();

alter table public.xclusive_data_requests enable row level security;

drop policy if exists xclusive_data_requests_read_own on public.xclusive_data_requests;
create policy xclusive_data_requests_read_own on public.xclusive_data_requests
  for select to authenticated
  using (user_id = auth.uid());

grant select on public.xclusive_data_requests to authenticated;
revoke insert, update, delete on public.xclusive_data_requests from anon, authenticated;

-- --------------------------------------------------------------- denuncias --

create table if not exists public.xclusive_reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references auth.users (id) on delete cascade,
  target_type  text not null check (target_type in ('live','post','clip','creator','message')),
  target_id    text not null,
  target_label text not null,
  reason       text not null,
  details      text not null default '',
  status       text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  resolution   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists xclusive_reports_status_idx
  on public.xclusive_reports (status, created_at desc);

drop trigger if exists xclusive_reports_touch on public.xclusive_reports;
create trigger xclusive_reports_touch
  before update on public.xclusive_reports
  for each row execute function public.xclusive_touch_updated_at();

alter table public.xclusive_reports enable row level security;

drop policy if exists xclusive_reports_read_own on public.xclusive_reports;
create policy xclusive_reports_read_own on public.xclusive_reports
  for select to authenticated
  using (reporter_id = auth.uid());

grant select on public.xclusive_reports to authenticated;
revoke insert, update, delete on public.xclusive_reports from anon, authenticated;

-- ------------------------------------------------------------- retiros -------
-- La solicitud se registra, pero queda bloqueada hasta que existan PSP, KYC y
-- cuenta bancaria validada. Registrar la intención no promete el pago.

create table if not exists public.xclusive_payout_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  creator_slug  text not null,
  amount_mxn    integer not null check (amount_mxn > 0),
  status        text not null default 'blocked'
                check (status in ('blocked','requested','approved','paid','rejected')),
  blocked_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists xclusive_payout_user_idx
  on public.xclusive_payout_requests (user_id, created_at desc);

drop trigger if exists xclusive_payout_touch on public.xclusive_payout_requests;
create trigger xclusive_payout_touch
  before update on public.xclusive_payout_requests
  for each row execute function public.xclusive_touch_updated_at();

alter table public.xclusive_payout_requests enable row level security;

drop policy if exists xclusive_payout_read_own on public.xclusive_payout_requests;
create policy xclusive_payout_read_own on public.xclusive_payout_requests
  for select to authenticated
  using (user_id = auth.uid());

grant select on public.xclusive_payout_requests to authenticated;
revoke insert, update, delete on public.xclusive_payout_requests from anon, authenticated;

-- ------------------------------------------------------------- almacenamiento

insert into storage.buckets (id, name, public)
values ('xclusive-public', 'xclusive-public', true)
on conflict (id) do nothing;

-- Cartera pública: cualquiera lee; solo la persona autenticada escribe dentro
-- de su propia carpeta `creators/<uid>/…`.
drop policy if exists xclusive_public_read on storage.objects;
create policy xclusive_public_read on storage.objects
  for select using (bucket_id = 'xclusive-public');

drop policy if exists xclusive_public_insert on storage.objects;
create policy xclusive_public_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'xclusive-public'
    and (storage.foldername(name))[1] = 'creators'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Bóveda privada: la persona escribe en su carpeta; la lectura se hace con
-- URL firmada desde el servidor tras comprobar el acceso.
drop policy if exists xclusive_vault_insert on storage.objects;
create policy xclusive_vault_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'vault'
    and (storage.foldername(name))[1] = 'creators'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists xclusive_vault_read_own on storage.objects;
create policy xclusive_vault_read_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'vault'
    and (storage.foldername(name))[1] = 'creators'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

commit;
