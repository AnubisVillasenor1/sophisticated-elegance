# Blueprint de producción — Xclusive

Documento de referencia para convertir el prototipo DEMO en una plataforma operativa. **No es una migración ejecutable.** Las reglas de Lovable prohíben editar `supabase/migrations/` o `drizzle/`: cualquier cambio real de esquema debe solicitarse desde el editor de Lovable o aprobarse con el equipo de infraestructura.

> **Estado tras la remediación P0:** la identidad y los roles ya se resuelven en el servidor con Supabase Auth (ver [`AUDITORIA-REMEDIACION.md`](AUDITORIA-REMEDIACION.md)). Este documento describe lo que aún falta para operar con dinero y contenido privado: persistencia transaccional, PSP, ledger, KYC y verificación de edad certificada.

## 1. Principios

1. **Dinero y contenido adulto son dominios de alto riesgo.** Se habilitan solo después de completar los controles de la sección 10.
2. **Consentimiento demostrable.** Cada aceptación legal, consentimiento de contenido y acuerdo de creadora se registra con documento, versión, fecha, cuenta, canal y hash.
3. **Mínimo privilegio.** Ningún cliente accede a datos de otra cuenta; la autorización se aplica en base de datos y en servidor, no solo en la interfaz.
4. **Idempotencia.** Pagos, webhooks, retiros y entregas usan claves idempotentes y máquinas de estado.
5. **Trazabilidad.** Las acciones sensibles generan eventos de auditoría inmutables.
6. **Transparencia.** Comisión, impuestos, PSP, total y neto se muestran antes de confirmar. No se promete una función no implementada.

## 2. Arquitectura objetivo

```
Navegador (React / TanStack Start)
        │  HTTPS, cookies seguras, CSRF
        ▼
Worker / servidor SSR  ── Auth, RBAC, rate limit, validación (Zod)
        │
        ├── PostgreSQL (Supabase o equivalente) + RLS
        ├── Storage privado (medios) + URLs firmadas efímeras
        ├── PSP (Stripe Connect / Mercado Pago / Adyen)
        ├── KYC + verificación de edad (proveedor certificado)
        ├── Correo transaccional y notificaciones
        └── Moderación (humana + clasificadores) y auditoría
```

El prototipo actual concentra el dominio en `src/lib/` y el estado en `src/lib/store.tsx`. En producción, esas acciones pasan a _server functions_ o endpoints con validación y autorización; la UI puede conservar los mismos componentes.

## 3. Modelo de datos

### 3.1 Identidad y cuentas

```sql
create table accounts (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  password_hash text,                    -- null si solo usa proveedor externo
  role text not null check (role in ('fan','creator','admin','moderator','finance')),
  status text not null default 'active' check (status in ('active','suspended','deleted')),
  display_name text not null,
  avatar_url text,
  referral_code text unique,
  locale text not null default 'es-MX',
  currency text not null default 'MXN',
  email_verified_at timestamptz,
  mfa_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table creator_profiles (
  account_id uuid primary key references accounts(id),
  slug citext unique not null,
  headline text not null,
  bio text not null,
  city text,
  categories text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending','approved','suspended','rejected')),
  revenue_share_bps int not null default 8000 check (revenue_share_bps between 5000 and 9500),
  kyc_status text not null default 'not_started'
    check (kyc_status in ('not_started','pending','approved','rejected','expired')),
  age_verification_status text not null default 'not_started',
  adult_enabled boolean not null default false,
  joined_at timestamptz not null default now(),
  constraint adult_requires_controls check (
    not adult_enabled or (kyc_status = 'approved' and age_verification_status = 'approved')
  )
);

create table creator_applications (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  legal_name text not null,
  city text,
  categories text[] not null,
  socials jsonb,
  bio text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references accounts(id),
  note text,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz
);
```

### 3.2 Catálogo y acceso

```sql
create table tiers (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(account_id),
  level int not null check (level between 1 and 5),
  name text not null,
  price_minor int not null check (price_minor >= 0),
  currency text not null default 'MXN',
  tagline text,
  perks text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  unique (creator_id, level)
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(account_id),
  title text not null,
  body text not null,
  visibility text not null check (visibility in ('public','members','tier','ppv','vault')),
  tier_id uuid references tiers(id),
  price_minor int not null default 0,
  currency text not null default 'MXN',
  cover_key text,
  tags text[] not null default '{}',
  is_mature boolean not null default false,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected','removed')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table clips (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(account_id),
  title text not null,
  description text,
  price_minor int not null,
  currency text not null default 'MXN',
  duration_seconds int,
  storage_key text not null,
  moderation_status text not null default 'pending',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table live_rooms (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(account_id),
  title text not null,
  description text,
  access text not null check (access in ('free','members','ticket')),
  ticket_price_minor int not null default 0,
  starts_at timestamptz not null,
  duration_minutes int not null,
  capacity int,
  status text not null default 'scheduled' check (status in ('scheduled','live','ended','cancelled')),
  rtmp_ingest_secret_ref text,           -- referencia a Secrets, nunca el valor
  created_at timestamptz not null default now()
);

create table custom_offers (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(account_id),
  kind text not null check (kind in ('custom','call','audio')),
  title text not null,
  description text,
  price_minor int not null,
  turnaround_days int not null,
  slots int not null,
  active boolean not null default true
);
```

### 3.3 Comercio

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references accounts(id),
  creator_id uuid not null references creator_profiles(account_id),
  tier_id uuid not null references tiers(id),
  status text not null check (status in ('trialing','active','past_due','cancelled','expired')),
  price_minor int not null,
  currency text not null,
  auto_renew boolean not null default true,
  started_at timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  psp_subscription_id text unique
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references accounts(id),
  creator_id uuid not null references creator_profiles(account_id),
  kind text not null check (kind in ('subscription','ppv','clip','bundle','ticket','tip','custom')),
  item_id uuid,
  label text not null,
  gross_minor int not null,
  platform_fee_minor int not null,
  psp_fee_minor int not null default 0,
  tax_minor int not null default 0,
  net_minor int not null,
  currency text not null,
  status text not null default 'pending'
    check (status in ('pending','authorized','paid','failed','refunded','partially_refunded','disputed')),
  idempotency_key text unique not null,
  psp_intent_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table entitlements (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references accounts(id),
  creator_id uuid not null references creator_profiles(account_id),
  item_type text not null check (item_type in ('clip','post','bundle','room','custom')),
  item_id uuid not null,
  order_id uuid not null references orders(id),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  unique (fan_id, item_type, item_id)
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(account_id),
  amount_minor int not null check (amount_minor > 0),
  currency text not null,
  status text not null default 'requested'
    check (status in ('requested','reviewing','approved','processing','paid','rejected','failed')),
  requested_at timestamptz not null default now(),
  approved_by uuid references accounts(id),
  approved_at timestamptz,
  psp_transfer_id text unique,
  failure_reason text
);

create table ledger_entries (
  id bigserial primary key,
  order_id uuid references orders(id),
  payout_id uuid references payouts(id),
  account_id uuid references accounts(id),
  entry_type text not null,               -- sale, fee, tax, refund, payout, adjustment
  debit_minor bigint not null default 0,
  credit_minor bigint not null default 0,
  currency text not null,
  created_at timestamptz not null default now()
);
```

### 3.4 Legal, consentimiento y privacidad

```sql
create table legal_documents (
  id text not null,                        -- terminos, privacidad, contenido...
  version text not null,
  title text not null,
  body_md text not null,
  status text not null check (status in ('draft','published','retired')),
  effective_at timestamptz not null,
  content_hash text not null,              -- SHA-256 del cuerpo publicado
  published_at timestamptz,
  primary key (id, version)
);

create table legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  document_id text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  channel text not null,                   -- registro, checkout, modal, api
  ip_hash text,
  user_agent text,
  acceptance_hash text not null,           -- SHA-256(cuenta|doc|versión|fecha|canal)
  foreign key (document_id, document_version)
    references legal_documents(id, version),
  unique (account_id, document_id, document_version)
);

create table content_consents (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creator_profiles(account_id),
  subject_name text not null,
  document_type text not null,
  document_hash text not null,
  scope text not null,                     -- pieza, sesión, campaña
  valid_from date not null,
  valid_until date,
  revoked_at timestamptz,
  evidence_url text,                       -- almacenamiento privado
  reviewed_by uuid references accounts(id),
  created_at timestamptz not null default now()
);

create table data_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  type text not null check (type in ('acceso','rectificacion','cancelacion','oposicion')),
  details text not null,
  status text not null default 'recibida'
    check (status in ('recibida','en_revision','procede','no_procede','resuelta')),
  created_at timestamptz not null default now(),
  due_at timestamptz not null,             -- 20 días hábiles
  resolved_at timestamptz,
  resolution_note text,
  identity_verified_at timestamptz
);

create table cookie_consents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  anonymous_id text,
  analytics boolean not null default false,
  preferences boolean not null default true,
  decided_at timestamptz not null default now(),
  policy_version text not null
);
```

### 3.5 Moderación y auditoría

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_account_id uuid not null references accounts(id),
  target_type text not null check (target_type in ('post','clip','room','message','profile','order')),
  target_id uuid not null,
  target_label text not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  resolution text,
  reviewed_by uuid references accounts(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table audit_events (
  id bigserial primary key,
  actor_id uuid references accounts(id),
  actor_role text,
  action text not null,                    -- login, purchase, payout.approve, legal.accept...
  target_type text,
  target_id text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  kind text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
```

## 4. RBAC y RLS

Roles: `fan`, `creator`, `moderator`, `finance`, `admin`. Un `admin` no debe aprobar su propio retiro ni resolver su propio reporte; usa separación de funciones.

| Recurso            | fan                    | creator              | moderator           | finance          | admin              |
| ------------------ | ---------------------- | -------------------- | ------------------- | ---------------- | ------------------ |
| Perfil público     | leer                   | leer / editar propio | leer                | leer             | leer / editar      |
| Posts / clips      | leer según entitlement | CRUD propio          | leer todo + retirar | leer             | leer todo          |
| Membresías         | CRUD propias           | leer las recibidas   | leer                | leer             | leer               |
| Órdenes            | leer propias           | leer las propias     | leer                | leer / conciliar | leer               |
| Retiros            | —                      | solicitar propio     | —                   | aprobar / pagar  | supervisar         |
| Reportes           | crear                  | crear                | resolver            | —                | resolver / escalar |
| ARCO               | crear propio           | crear propio         | —                   | —                | resolver           |
| Documentos legales | leer                   | leer                 | leer                | leer             | publicar           |
| Aceptaciones       | leer propias           | leer propias         | leer                | —                | leer               |
| Configuración      | —                      | —                    | —                   | —                | editar             |

Reglas RLS mínimas:

```sql
alter table posts enable row level security;

create policy posts_read on posts for select using (
  moderation_status = 'approved' and (
    visibility = 'public'
    or creator_id = auth.uid()
    or (visibility = 'members' and exists (
      select 1 from subscriptions s
      where s.fan_id = auth.uid() and s.creator_id = posts.creator_id
        and s.status in ('active','trialing')
    ))
    or (visibility = 'tier' and exists (
      select 1 from subscriptions s
      where s.fan_id = auth.uid() and s.tier_id = posts.tier_id
        and s.status in ('active','trialing')
    ))
    or exists (
      select 1 from entitlements e
      where e.fan_id = auth.uid() and e.item_id = posts.id
        and e.revoked_at is null and (e.expires_at is null or e.expires_at > now())
    )
  )
);

create policy posts_write on posts for all
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

alter table orders enable row level security;
create policy orders_read on orders for select using (
  fan_id = auth.uid()
  or creator_id = auth.uid()
  or exists (select 1 from accounts a where a.id = auth.uid() and a.role in ('admin','finance'))
);
-- Las escrituras de órdenes solo las hace el servidor con service role.
```

Los roles elevados se comprueban contra una tabla de permisos o un claim firmado, nunca contra un valor editable por el cliente.

## 5. Pagos y comisiones

### 5.1 Flujo de compra

1. El servidor calcula el desglose autoritativo: bruto, comisión de plataforma, comisión estimada del PSP, impuestos y neto.
2. Crea una orden `pending` con `idempotency_key` única y un intento de pago en el PSP.
3. El PSP confirma por webhook firmado. Se valida la firma, se deduplica por ID de evento y se consulta el estado real antes de acreditar.
4. Se marca la orden `paid`, se crea el entitlement y se escribe el asiento contable.
5. Si el webhook falla, un job de reconciliación consulta el PSP y corrige el estado. Nunca se acredita solo por retorno del navegador.

### 5.2 Reglas

- La comisión de plataforma se guarda en _basis points_ (`revenue_share_bps`) y queda congelada en la orden al momento de la compra.
- Los reembolsos y contracargos revierten entitlements y generan asientos de ajuste.
- Los retiros requieren KYC aprobado, cuenta bancaria validada, revisión de riesgo y aprobación de `finance`. Se pagan por transferencia del PSP, no manualmente.
- Los impuestos se calculan con el proveedor fiscal correspondiente; el DEMO no los determina.
- Nunca se promete un porcentaje si el PSP o los impuestos pueden modificarlo sin mostrarlo antes de confirmar.

### 5.3 Estados

`pending → authorized → paid → (refunded | partially_refunded | disputed)`.
Un pago `failed` no crea entitlement. Un `disputed` congela el neto de la creadora hasta resolverse.

## 6. Verificación de edad, KYC y contenido adulto

El contenido adulto está **deshabilitado** en el DEMO y debe permanecer así hasta cumplir todo lo siguiente:

1. Proveedor especializado de verificación de edad (no autodeclaración), con evidencia mínima y privacidad por diseño.
2. KYC de cada creadora y de cada persona que aparezca en el contenido, con documento vigente y prueba de vida.
3. Consentimiento documentado por pieza o sesión: identidad, alcance, vigencia, revocación y evidencia almacenada de forma privada.
4. Revisión legal específica por jurisdicción (México y mercados objetivo), incluyendo obligaciones de registro, retención y reporte.
5. Aprobación escrita del PSP y del procesador de pagos para el giro; sin ella no hay cobro.
6. Moderación previa o posterior según riesgo, con apelación, evidencia conservada y tiempos de respuesta.
7. Controles técnicos: marca de agua, URLs firmadas, límite de reproducciones, detección de redistribución y revocación de acceso.
8. Registro de edad y consentimiento separado del perfil público; datos sensibles cifrados y con acceso auditado.

Si falta cualquiera de estos puntos, `adult_enabled` permanece en `false` y la plataforma solo muestra contenido editorial no explícito.

## 7. Legal y aceptaciones

- Los documentos viven versionados. Publicar una versión nueva no borra las aceptaciones anteriores.
- Cada aceptación guarda: cuenta, documento, versión, fecha, canal, hash del documento y hash de la aceptación; además IP y agente de usuario se almacenan hasheados o minimizados.
- El hash de aceptación se calcula en servidor: `SHA-256(account_id|document_id|version|accepted_at|channel|document_hash)`.
- Un cambio material de términos exige nueva aceptación antes de continuar usando funciones de pago.
- El procedimiento ARCO verifica identidad, registra plazo de 20 días hábiles para respuesta y 15 días hábiles para ejecución cuando procede.
- La cancelación de membresías es self-service, sin penalización y con acceso hasta el final del periodo pagado. Se documenta el derecho a acudir a PROFECO.
- Los textos legales del DEMO son borradores y no constituyen asesoría legal.

## 8. Moderación y confianza

Ciclo: `reporte → triage → revisión → decisión → apelación → cierre`.

- Categorías prohibidas: contenido no consentido, menores o apariencia de menores, trata, violencia sexual, doxing, suplantación, contenido íntimo sin consentimiento, malware y fraude.
- Conserva evidencia con acceso restringido y cadena de custodia; no la dupliques en canales informales.
- Sanciones graduadas: advertencia, retiro de pieza, suspensión temporal, suspensión definitiva y reporte a autoridades cuando corresponda.
- Toda decisión sensible queda en `audit_events` con actor, motivo y evidencia.
- Los clasificadores automáticos solo priorizan; una persona decide los casos que afectan acceso o ingresos.

## 9. Seguridad

- Autenticación con cookies `HttpOnly`, `Secure`, `SameSite=Lax` y tokens rotatorios; MFA obligatorio para admin, finance y moderator.
- CSRF en formularios y endpoints mutables; validación Zod en servidor; límites de tasa por cuenta, IP y ruta.
- Cifrado en tránsito y en reposo; claves en Secrets, rotación documentada; nunca en el repositorio ni en el cliente.
- Storage privado: los medios no se sirven por URL pública. URLs firmadas de corta duración, ligadas a cuenta y dispositivo.
- Webhooks con verificación de firma, tolerancia de tiempo, deduplicación e idempotencia.
- Registro de auditoría inmutable; retención mínima y acceso de solo lectura.
- Backups cifrados, pruebas de restauración y plan de continuidad.
- Revisión de dependencias, análisis estático y pruebas de seguridad antes de cada release mayor.
- Datos sensibles (documentos, edad, consentimiento, datos bancarios) en tablas separadas con acceso auditado y minimización.

## 10. Puertas de lanzamiento

No se habilita cobro real hasta completar:

- [ ] Entidad legal, RFC, domicilio, términos y aviso de privacidad revisados por abogado.
- [ ] PSP aprobado para el giro, cuenta Connect/merchant validada y webhooks probados en sandbox y producción.
- [ ] KYC y verificación de edad certificada integrados y auditados.
- [ ] Contrato de creadoras firmado electrónicamente, con comisión, pagos, cancelación y propiedad intelectual.
- [ ] Flujo de reembolsos, contracargos, conciliación y retiros probado con casos de error.
- [ ] Moderación operativa 24/7 con apelación y tiempos de respuesta.
- [ ] ARCO, cookies, retención y borrado probados con datos reales de prueba.
- [ ] Monitoreo, alertas, auditoría, backups y respuesta a incidentes activos.
- [ ] Prueba de carga y plan de capacidad para salones en vivo.
- [ ] Revisión de accesibilidad, móvil y navegadores objetivo.
- [ ] Contenido adulto: todos los puntos de la sección 6 aprobados por legal, PSP y operaciones.

## 11. Mapa DEMO → producción

| Módulo DEMO           | Archivo actual                    | Destino en producción                        |
| --------------------- | --------------------------------- | -------------------------------------------- |
| Estado y acciones     | `src/lib/store.tsx`               | Server functions + PostgreSQL + RLS          |
| Semilla               | `src/lib/seed.ts`                 | Migraciones y datos de catálogo              |
| Selectores            | `src/lib/selectors.ts`            | Consultas servidor / vistas SQL              |
| Legal                 | `src/lib/legal.ts`                | Tabla `legal_documents` + CMS con versionado |
| Checkout y comisiones | `src/components/lux/checkout.tsx` | Orden + PSP + ledger                         |
| Estudio               | `src/routes/estudio.tsx`          | Panel con permisos de creadora               |
| Mensajes              | `src/routes/mensajes.tsx`         | Mensajería persistente + moderación          |
| Bóveda                | `src/routes/boveda.tsx`           | Entitlements + URLs firmadas                 |
| Cuenta / ARCO         | `src/routes/cuenta.tsx`           | Perfil, aceptaciones y solicitudes ARCO      |
| Administración        | `src/routes/admin.tsx`            | Consola con RBAC y auditoría                 |
| IA local              | `src/lib/ai.ts`                   | Gateway de IA del proveedor, con divulgación |

## 12. Operación del DEMO

- No introduzcas datos personales reales en el prototipo.
- No conectes pagos reales sin completar la sección 10.
- No habilites contenido adulto desde la consola: el interruptor permanece bloqueado por diseño.
- Reinicia el DEMO desde **Mi cuenta → Datos** antes de una demostración pública.
- Reporta cualquier comportamiento inesperado con el identificador de la cuenta y la ruta afectada.
