# Remediación P0 — Xclusive

Este documento registra qué se corrigió, con qué evidencia y qué sigue bloqueado.
No sustituye una auditoría independiente ni una prueba de penetración.

Fecha de corte: 11 de noviembre de 2026.

---

## 1. Resumen ejecutivo

La auditoría anterior calificó la preparación para producción real en **25/100**.
El núcleo del problema no era la interfaz: era que la identidad, los permisos y el
estado operativo vivían en el navegador.

En esta iteración se sustituyó la autoridad de identidad por **Supabase Auth +
verificación de servidor**. El rol ya no lo decide el cliente. Las credenciales de
demostración dejaron de existir en los builds LIVE. El comercio, los pagos, la
verificación de edad certificada y la persistencia transaccional **siguen sin
resolverse** y así se declaran.

**Preparación estimada después de esta iteración: 39/100.**

No es una métrica automática del repositorio. Es una estimación ponderada con la
misma matriz de la auditoría, actualizada solo donde existe evidencia verificable.

---

## 2. Qué cambió (antes → después)

| #   | Hallazgo P0          | Antes                                                             | Después                                                                                                                               | Evidencia                                                                              |
| --- | -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Login y registro     | `store.tsx` comparaba `demoHash` contra usuarios del estado local | LIVE usa `supabase.auth.signInWithPassword` / `signUp`; DEMO solo existe si el build lo declara                                       | `src/lib/auth/SessionProvider.tsx`, `src/routes/entrar.tsx`, `src/routes/registro.tsx` |
| 2   | Sesión               | `sessionUserId` persistido en `localStorage`                      | En LIVE la sesión es de Supabase y `sessionUserId` se fuerza a `null` al hidratar y al persistir                                      | `src/lib/store.tsx` (hidratación y persistencia)                                       |
| 3   | Identidad mostrada   | `user` salía del estado local                                     | En LIVE `user` se proyecta desde el `viewer` verificado por el servidor                                                               | `userFromViewer` en `src/lib/store.tsx`                                                |
| 4   | Roles                | `role` se leía y modificaba en el cliente                         | El servidor resuelve `fan` / `creator` / `admin` con allowlist y `app_metadata`; `user_metadata` nunca concede rol                    | `src/lib/auth/roles.ts`, `roles.server.ts`, `auth.functions.ts`                        |
| 5   | Credenciales DEMO    | Visibles en la interfaz y en el bundle                            | Solo se renderizan si `VITE_DEMO_MODE=true`; el build LIVE las elimina. El texto plano de la contraseña demo ya no está en la semilla | `src/lib/auth/demo-accounts.ts`, `src/lib/seed.ts`, `src/routes/index.tsx`             |
| 6   | Guardas del store    | `login`/`signup` siempre operaban localmente                      | En LIVE devuelven error y remiten al flujo real; `logout` revoca en Supabase                                                          | `src/lib/store.tsx`                                                                    |
| 7   | Abuso y fuerza bruta | Sin límite propio                                                 | Limitador por clave en server functions + límites nativos de Supabase Auth                                                            | `src/lib/auth/rate-limit.ts`, `auth.functions.ts`                                      |
| 8   | Trazabilidad         | Sin eventos de autorización                                       | Eventos JSON estructurados (`xclusive.audit`) con acción, actor, resultado y detalle mínimo                                           | `src/lib/auth/audit.server.ts`                                                         |
| 9   | Secretos             | `.env` versionado                                                 | `.env` deja de trackearse; `.gitignore` cubre `.env*`; se añaden `.env.example` y `.env.demo`                                         | `.gitignore`, `.env.example`                                                           |
| 10  | Modo DEMO/LIVE       | Ambos convivían sin frontera                                      | El modo se fija en compilación (`--mode demo` o `VITE_DEMO_MODE=true`); el resto es LIVE                                              | `vite.config.ts`, `src/lib/auth/mode.ts`, scripts `dev:demo` / `build:demo`            |
| 11  | Deploy canónico      | README decía Vercel; DEPLOY describía Cloudflare                  | Vercel es el destino canónico; Cloudflare queda como alternativa documentada y no probada en esta iteración                           | `DEPLOY.md`                                                                            |
| 12  | Perfil y membresías  | Sin lectura/escritura real                                        | Server functions con RLS: `getViewer`, `updateMyProfile`, `listMyMemberships`                                                         | `src/lib/auth/auth.functions.ts`                                                       |

### Garantías concretas del nuevo flujo

- El cliente **no envía su rol**. Lo calcula el servidor.
- Sin `ADMIN_EMAILS` no hay administradores: **fallo cerrado**.
- Sin sesión válida, `requireSupabaseAuth` rechaza la server function.
- Un build LIVE no puede activar credenciales demo desde el navegador: el flag
  se resuelve en compilación, no en runtime.
- Las operaciones administrativas sensibles se registran en el log de auditoría.
- La eliminación de cuenta (ARCO) exige confirmación explícita y clave de servicio
  en el servidor; si falta, se declara no disponible.

---

## 3. Evidencia de pruebas

Ejecutado en local con Node y npm del entorno:

```sh
npx tsc --noEmit        # 0 errores
npm test                # 7 archivos, 36 pruebas aprobadas
npm run lint            # 0 errores, 16 avisos preexistentes de fast-refresh
npm run build           # build LIVE con Nitro/Vercel correcto
npm run build:demo      # build DEMO con cuentas locales
```

Comprobaciones adicionales:

- El bundle LIVE **no contiene** la contraseña `demo1234`.
- El bundle DEMO sí contiene las cuentas demo, como se espera.
- Las pruebas nuevas cubren:
  - resolución de modo (`demo` solo con el literal exacto);
  - allowlists y `app_metadata`;
  - rechazo de `user_metadata` como fuente de rol;
  - fallo cerrado de roles;
  - ventana y reinicio del limitador;
  - traducción de errores de autenticación.

Archivo: `src/lib/auth/auth.test.ts`.

### Comprobación contra Supabase real

- `GET /auth/v1/settings` con la clave publishable: **200**, proveedor de correo
  habilitado y registro abierto.
- `POST /auth/v1/admin/users` con la clave de servicio configurada: **401**. La
  creación de una cuenta de prueba y su borrado no pudieron completarse; se
  documenta como bloqueo en la sección 5 en lugar de declararlo superado.
- Producción LIVE: `/`, `/entrar`, `/registro`, `/explorar`, `/cuenta` y
  `/health.json` responden **200**. `/entrar` no contiene cuentas ni contraseñas
  DEMO.

---

## 4. Matriz de avance recalculada

| Dominio                       |    Peso |  Antes |  Ahora | Justificación                                                                                                                    |
| ----------------------------- | ------: | -----: | -----: | -------------------------------------------------------------------------------------------------------------------------------- |
| Interfaz y experiencia        |      10 |      9 |      9 | Sin cambios; se preservó el acabado y el tutorial                                                                                |
| CI y compilación              |      10 |     10 |     10 | `tsc`, pruebas, lint y build verificados                                                                                         |
| Backend y persistencia        |      15 |      0 |      2 | Perfil y membresías ya se leen/escriben en Supabase con RLS; el comercio sigue local                                             |
| Autenticación y RBAC          |      15 |      0 |      8 | Auth real, sesión de servidor, rol de servidor, rate limit y auditoría; faltan MFA, recuperación guiada y revocación desde la UI |
| Pagos y contabilidad          |      15 |      0 |      0 | Sin PSP, webhooks, ledger ni conciliación                                                                                        |
| KYC, edad y consentimiento    |      10 |      2 |      2 | Sigue siendo declarativo; la aceptación se registra, no se certifica                                                             |
| Almacenamiento y comunicación |       5 |      0 |      0 | Bóveda y mensajería siguen siendo demo                                                                                           |
| Seguridad y observabilidad    |      10 |      2 |      4 | Auditoría estructurada, rate limit y secretos saneados; sin retención inmutable ni telemetría distribuida                        |
| Despliegue y operaciones      |       5 |      2 |      3 | Destino canónico, modos de build y entornos documentados; faltan migraciones, smoke tests y rollback                             |
| Cumplimiento legal y fiscal   |       5 |      0 |      1 | Aceptación versionada enviada al servidor; falta tabla consultable y revisión legal                                              |
| **Total**                     | **100** | **25** | **39** |                                                                                                                                  |

### Lectura correcta del número

39/100 significa que el núcleo de identidad dejó de depender del navegador. **No
significa que la plataforma pueda cobrar o custodiar contenido privado.** Los
bloqueadores restantes son de dinero, verificación de terceros y persistencia
transaccional.

---

## 5. Lo que sigue bloqueado (P0)

Estos puntos **no se declaran terminados**:

1. **Pagos y retiros.** No hay PSP aprobado, checkout de servidor, webhooks
   firmados, ledger de doble entrada, conciliación ni liquidaciones.
2. **KYC/AML y edad certificada.** La aceptación es declarativa. Falta proveedor
   certificado y proceso operativo.
3. **Persistencia del dominio completo.** Compras, suscripciones, propinas,
   mensajes, salones, reportes y retiros siguen en `localStorage` como DEMO.
4. **RLS de `memberships`.** La política actual permite insertar la propia
   membresía. Corregirlo exige una migración que este repositorio no puede editar.
5. **Tablas `legal_acceptances` y `audit_log`.** Sin ellas, la evidencia legal y
   de auditoría queda en los logs del proveedor, no en una tabla consultable.
6. **Credencial de servicio de Supabase.** La clave `sb_secret_…` configurada en
   Vercel es rechazada con `401` por la API de administración. Por eso el panel
   de administración y el borrado ARCO se declaran **no disponibles** hasta
   rotar la clave. No se simula un panel vacío: la server function devuelve
   `available: false`. La clave publishable sí fue validada contra
   `/auth/v1/settings`.
7. **Almacenamiento privado de la bóveda.** Sin URLs firmadas, control de
   derechos, revocación ni registro de descargas.
8. **Observabilidad de producción.** Sin OpenTelemetry, métricas de negocio,
   alertas ni SLO.
9. **Recuperación de cuenta y MFA.** Supabase puede enviar correos, pero no hay
   flujo de recuperación probado ni segundo factor.
10. **Consentimiento de las tres fotos de personas reales.** Sigue sin publicarse
    por falta de consentimiento verificable.

---

## 6. Decisiones de arquitectura

- **Sin cookies ni sesiones SSR nuevas.** Se reutiliza el bearer token que ya
  existía (`attachSupabaseAuth` + `requireSupabaseAuth`). Menos superficie nueva,
  menos riesgo de romper el SSR actual.
- **Rol solo en servidor.** Allowlist de entorno + `app_metadata`. `user_metadata`
  es editable por el usuario y por eso se ignora para autorización.
- **Modo DEMO en compilación.** Un flag de runtime habría permitido que un build
  LIVE activara credenciales demo desde el navegador.
- **Comercio etiquetado como DEMO.** No se simula un cobro real ni se promete un
  retiro. La interfaz lo declara en cada punto sensible.
- **Fallback cerrado.** Si falta la configuración de Supabase, la sesión no se
  establece; si falta la allowlist, no hay administradores.

---

## 7. Configuración requerida en Vercel

Variables públicas (build):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SITE_URL`
- `VITE_DEMO_MODE=false`

Variables de servidor (runtime):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `ADMIN_EMAILS` (separados por comas)
- `CREATOR_EMAILS` (separados por comas)
- `SUPABASE_SERVICE_ROLE_KEY` (solo si se habilitan borrado de cuenta y panel admin)

Sin `ADMIN_EMAILS` no existe ningún administrador. Es intencional.

---

## 8. Próximo trabajo de mayor impacto

1. Solicitar a Lovable/infraestructura las migraciones de `legal_acceptances`,
   `audit_log`, órdenes, ledger y entitlements.
2. Corregir la política RLS de `memberships` para impedir la autoconcesión.
3. Mover compras y suscripciones a server functions con idempotencia.
4. Integrar un PSP aprobado para el modelo de negocio y construir webhooks
   firmados antes de habilitar cualquier cobro.
5. Contratar KYC y verificación de edad certificada.
6. Añadir telemetría, alertas y respaldo/restauración probados.
