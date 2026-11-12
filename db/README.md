# Base de datos de Xclusive

Este directorio contiene el esquema que la aplicación necesita **además** de lo
que Lovable gestiona en `supabase/migrations/`. No se toca esa carpeta: aquí
solo viven las tablas propias de Xclusive, con prefijo `xclusive_`, para no
colisionar con otras aplicaciones que comparten el mismo proyecto de Supabase.

## Qué crea

| Tabla | Para qué |
| --- | --- |
| `xclusive_orders` | Pedido con importe, comisión e idempotencia. El precio lo fija el servidor. |
| `xclusive_ledger_entries` | Libro mayor de partida doble. Debe cuadrar al peso por pedido. |
| `xclusive_entitlements` | Acceso concedido tras un pago verificado, no antes. |
| `xclusive_legal_acceptances` | Recibo legal firmado por el servidor, consultable. |
| `xclusive_audit_log` | Auditoría estructurada con retención propia. |
| `xclusive_webhook_events` | Idempotencia de webhooks por identificador del proveedor. |

También crea el bucket **privado** `vault` (el mismo que crea la API de Storage
si se ejecuta por separado; la sentencia es idempotente).

## Cómo aplicarlo

```sh
# 1. Añade POSTGRES_URL a .env (Project Settings → Database → Connection string)
# 2. Revisa el SQL sin ejecutarlo
node scripts/apply-db.mjs db/0001_comercio_auditoria.sql --dry-run

# 3. Aplícalo
node scripts/apply-db.mjs db/0001_comercio_auditoria.sql

# 4. Comprueba el estado de todas las dependencias
node scripts/preflight.mjs
```

El script es idempotente: `create table if not exists`, `create index if not
exists` y `drop policy if exists` antes de crearla. Se puede ejecutar varias
veces sin efectos secundarios.

## Reglas de seguridad

- **RLS activo en las seis tablas.**
- El navegador solo puede **leer sus propias** filas (`user_id = auth.uid()`).
- No existen políticas de `insert`, `update` o `delete` para `authenticated`:
  una sesión comprometida no puede fabricar un pedido pagado, autoconcederse un
  acceso ni insertar un recibo legal.
- Las escrituras las hace únicamente la clave de servicio desde server
  functions y desde el webhook firmado.
- `xclusive_ledger_entries`, `xclusive_audit_log` y `xclusive_webhook_events` no
  se exponen al navegador en absoluto.

## Por qué no se reutilizan las tablas existentes

El proyecto de Supabase es compartido con otro producto (canciones, lecciones y
certificados). Su tabla `entitlements` tiene columnas de Stripe y otra semántica;
usarla para las compras de Xclusive mezclaría dos negocios en el mismo libro.
Por eso todo lo nuevo lleva prefijo propio.

## Pendiente fuera de este esquema

Estas piezas no son esquema y dependen de terceros o de configuración:

1. **PSP**: `PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY` y
   `STRIPE_WEBHOOK_SECRET`. Sin ellas el checkout responde con fallo cerrado.
2. **KYC y edad certificada**: requieren proveedor externo.
3. **MFA obligatorio por política**: se puede añadir
   `auth.jwt() ->> 'aal' = 'aal2'` a las políticas de lectura cuando todas las
   cuentas tengan segundo factor; hoy bloquearía a quien no lo tenga.
