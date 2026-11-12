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
- Login LIVE probado en navegador real sobre producción: una contraseña
  incorrecta devuelve **400** de Supabase y la interfaz muestra “Correo o
  contraseña incorrectos.”. La cuenta DEMO `fan@xclusive.demo` / `demo1234`
  **falla en LIVE**, lo que confirma que las credenciales demo no autentican.
- Producción LIVE: `/`, `/entrar`, `/registro`, `/explorar`, `/cuenta` y
  `/health.json` responden **200**. `/entrar` no contiene cuentas ni contraseñas
  DEMO.

---

## 4. Matriz de avance recalculada

| Dominio                       |    Peso |  Antes |  Ahora | Justificación                                                                                                                    |
| ----------------------------- | ------: | -----: | -----: | -------------------------------------------------------------------------------------------------------------------------------- |
| Interfaz y experiencia        |      10 |      9 |      9 | Sin cambios; se preservó el acabado y el tutorial                                                                                |
| CI y compilación              |      10 |     10 |     10 | `tsc`, pruebas, lint y build verificados                                                                                         |
| Backend y persistencia        |      15 |      2 |      8 | Tablas propias para pedidos, libro mayor, accesos, recibos legales, auditoría y webhooks, con RLS                                 |
| Autenticación y RBAC          |      15 |      8 |      9 | Auth real, MFA TOTP, recuperación, rol de servidor y rate limit; falta exigir AAL2 por política                                  |
| Pagos y contabilidad          |      15 |      0 |      7 | Motor de cobro con precio de servidor, partida doble, webhook firmado e idempotencia; **sin PSP configurado** ni retiros       |
| KYC, edad y consentimiento    |      10 |      2 |      2 | Sigue siendo declarativo; la aceptación se registra, no se certifica                                                             |
| Almacenamiento y comunicación |       5 |      0 |      1 | Bucket privado `vault` creado; faltan carga, URL firmada y revocación en la UI                                                   |
| Seguridad y observabilidad    |      10 |      4 |      7 | Auditoría persistente con retención propia, RLS sin autoconcesión y cabeceras; falta telemetría externa                          |
| Despliegue y operaciones      |       5 |      3 |      4 | `preflight` y `apply-db` reproducibles, build verificado; falta rollback automatizado                                             |
| Cumplimiento legal y fiscal   |       5 |      1 |      4 | Recibos firmados y persistidos por documento; falta revisión legal y fiscal formal                                                |
| **Total**                     | **100** | **25** | **61** |                                                                                                                                  |

### Lectura correcta del número

61/100 significa que la plataforma ya tiene identidad real, evidencia legal
persistida, pedidos con precio de servidor, libro mayor de partida doble y
auditoría con retención propia. **No significa que pueda cobrar todavía**: falta
configurar el PSP, y sin KYC no puede operar contenido adulto ni retiros. Los
bloqueadores restantes son de dinero, verificación de terceros y operación.

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

---

## 9. Iteración 2: identidad estable, evidencia legal y segundo factor

Fecha de corte: 11 de noviembre de 2026 (segunda pasada).

### Correcciones aplicadas

| Hallazgo | Corrección | Evidencia |
| --- | --- | --- |
| `joinedAt` se recalculaba en cada render LIVE | `Viewer.createdAt` sale de `profiles.created_at`; el perfil se crea una sola vez con `upsert ... ignoreDuplicates` | `src/lib/auth/auth.functions.ts`, `userFromViewer` en `src/lib/store.tsx` |
| `acceptLegal` no persistía en LIVE | Se firma en el servidor con SHA-256, id de recibo y fecha; el navegador guarda el recibo y refresca la UI | `recordLegalAcceptance`, `src/lib/auth/legal-receipts.ts` |
| El alta con confirmación por correo perdía la evidencia | Se guarda como evidencia pendiente y se envía en el primer inicio de sesión verificado | `savePendingLegalEvidence` / `flushPendingLegalEvidence`, `SessionProvider` |
| El rol `creator` no abría `/estudio` | El servidor resuelve `creatorSlug` desde `app_metadata.creator_slug` o `CREATOR_SLUGS`; nunca desde `user_metadata` | `src/lib/auth/creator-link.ts`, `src/routes/estudio.tsx` |
| Los 4 retratos y 2 portadas no se usaban | Retratos asignados a Valentina, Alba, Sofía y Maréa; `atrio.webp` en Salones y `boveda.webp` en la bóveda | `src/lib/creator-portraits.ts`, `src/lib/seed.ts`, `src/styles.css` |
| No había recuperación de cuenta ni MFA | Rutas `/recuperar` y `/restablecer`; inscripción TOTP y cambio de contraseña en Mi cuenta → Seguridad | `src/routes/recuperar.tsx`, `src/routes/restablecer.tsx`, `SecurityTab` |

### Pruebas de esta iteración

```sh
npx tsc --noEmit        # 0 errores
npm test                # 8 archivos, 48 pruebas aprobadas
npm run lint            # 0 errores, 16 avisos preexistentes
npm run build           # build LIVE correcto; incluye las 6 imágenes
```

Las pruebas nuevas cubren el vínculo creadora → slug, el rechazo de
`user_metadata`, la deduplicación de recibos, el fallo cerrado cuando el servidor
no firma y el reenvío de evidencia pendiente solo para el correo correcto.

### Matriz actualizada

| Dominio | Peso | Antes | Ahora | Motivo |
| --- | ---: | ---: | ---: | --- |
| Interfaz y experiencia | 10 | 9 | 10 | Todos los assets de `src/assets` y `public/covers` integrados |
| CI y compilación | 10 | 10 | 10 | `tsc`, 48 pruebas, lint y build verificados |
| Backend y persistencia | 15 | 2 | 3 | Perfil estable y vínculo de creadora; comercio sigue local |
| Autenticación y RBAC | 15 | 8 | 11 | Recuperación, cambio de contraseña y TOTP; falta política AAL2 en RLS |
| Pagos y contabilidad | 15 | 0 | 0 | Sin PSP, webhooks ni ledger |
| KYC, edad y consentimiento | 10 | 2 | 2 | Sigue declarativo |
| Almacenamiento y comunicación | 5 | 0 | 0 | Bóveda y mensajería demo |
| Seguridad y observabilidad | 10 | 4 | 5 | Hash firmado por servidor; sin tabla de auditoría |
| Despliegue y operaciones | 5 | 3 | 4 | Rutas nuevas y variables documentadas; faltan migraciones y rollback |
| Cumplimiento legal y fiscal | 5 | 1 | 2 | Recibo firmado y versionado; falta tabla consultable y revisión legal |
| **Total** | **100** | **39** | **46** | |

### Lo que sigue bloqueado (no se declara terminado)

1. **Cobros reales.** Sin PSP aprobado, claves, webhooks firmados, ledger de
   doble entrada y conciliación no existe una compra real. El comercio sigue en
   `localStorage` y etiquetado DEMO.
2. **Persistencia del dominio.** Compras, suscripciones, propinas, mensajes,
   salones y retiros necesitan tablas y migraciones que este repositorio no
   puede crear (Lovable gestiona el esquema).
3. **AAL2 en el servidor.** La aplicación no publica la sesión hasta verificar
   TOTP, pero exigir AAL2 en cada consulta requiere una política RLS
   (`auth.jwt()->>'aal' = 'aal2'`) o una comprobación con service role.
4. **KYC/AML y edad certificada.** No hay proveedor contratado.
5. **Bóveda privada real.** Sin bucket, URLs firmadas, revocación ni registro de
   descargas.
6. **Panel admin y borrado ARCO.** La clave de servicio configurada en Vercel
   responde 401; el panel se declara no disponible en lugar de simular datos.
7. **Consentimiento de las fotos de personas reales.** Los retratos se usan como
   arte editorial; falta el consentimiento verificable antes de publicar
   contenido adulto o promocional con ellas.

**Conclusión honesta:** la plataforma ya autentica, recupera cuentas, protege el
acceso con segundo factor y registra evidencia legal firmada, pero **no puede
cobrar ni custodiar contenido privado** sin PSP, KYC y las migraciones de
persistencia. Declarar 100% sería falso.

---

## 10. Iteración 3: catálogo visual completo y medios locales

Fecha de corte: 11 de noviembre de 2026 (tercera pasada).

Los 14 archivos subidos al repositorio se integraron al bundle. Ya no queda
ninguna imagen servida desde almacenamiento externo: los tres banners que
apuntaban a `public.blob.vercel-storage.com` ahora se importan desde
`src/assets`, de modo que el despliegue no depende de ese bucket ni de su CORS.

### Asignación

| Archivo | Uso |
| --- | --- |
| `Gemini_Generated_Image_3akt…jpg` | Banner de «Perfiles y galerías» en la home y fondo de `/explorar` |
| `Gemini_Generated_Image_4ew3…jpg` | Banner de «Comunidad y monetización» y fondo de `/ecosistema` |
| `Gemini_Generated_Image_7e07…jpg` | Banner de «Administración y cumplimiento» y fondo de `/legal` |
| `rooms1.avif` | Salón «Sesión de medianoche» (Valentina) y hero de `/ayuda` |
| `rooms2.jpg` | Salón «Cuarto oscuro — XTRIME» (Valentina) |
| `rooms3.avif` | Salón «Círculo de luna» (Alba) y hero de `/salones` |
| `rooms4.jpg` | Salón «Noche de vinilo» (Luna) y hero de `/clips` |
| `modelo1.jpg` | Retrato de Camila Noir |
| `modelo2.jpg` | Retrato de Nina Blake |
| `modelo3.jpg` | Retrato de Renata Sol |
| `modelo4.jpg` | Retrato de Danna Cruz |
| `descarga.jpg` | Retrato de Jade K. |
| `videoframe_2014.png` | Retrato de Luna Ferrer |

Los retratos se usan en la portada de la creadora, en las tarjetas, en los
avatares de salón, estudio y administración, y en el hero de su perfil. Un
estado guardado en `localStorage` de una versión anterior recibe las imágenes
nuevas al hidratar (`normalizeStoredState`).

### Único archivo no publicado

`modelo5.jpg` lleva la marca de agua **KALINKAFOX** y corresponde a una autora
externa. Publicarlo como retrato de una creadora de la plataforma atribuiría una
obra ajena y podría infringir derechos de autor. Se conserva en el repositorio,
pero no se muestra hasta contar con licencia o autorización verificable. No se
recortó la marca para disimular el origen.

### Pruebas de esta iteración

```sh
npx tsc --noEmit        # 0 errores
npm test                # 8 archivos, 48 pruebas aprobadas
npm run lint            # 0 errores, 16 avisos preexistentes
npm run build           # 19 de 20 imágenes emitidas con hash de contenido
python asset_usage.py   # unused: ['modelo5.jpg'] (bloqueo documentado)
```

La matriz global no cambia de forma material: el catálogo visual pasa de 9 a 10
sobre 10 y el resto de dominios sigue igual. **46/100**, no 100.

---

## 11. Iteracion 4: capa de datos real y motor de cobro

Fecha de corte: 11 de noviembre de 2026 (cuarta pasada).

Se creo el esquema propio de Xclusive en la base de datos compartida, con prefijo
xclusive_ para no colisionar con el otro producto que vive en el mismo proyecto.
Ninguna tabla existente se modifico.

### Base de datos

| Tabla | Contenido |
| --- | --- |
| xclusive_orders | Pedido con importe, comision, estado e idempotencia |
| xclusive_ledger_entries | Libro mayor de partida doble |
| xclusive_entitlements | Acceso concedido solo tras pago verificado |
| xclusive_legal_acceptances | Recibo firmado por el servidor, consultable |
| xclusive_audit_log | Auditoria con retencion propia |
| xclusive_webhook_events | Idempotencia por evento del proveedor |

RLS activo en las seis. El navegador solo lee sus propias filas; no hay politica
de insercion ni de actualizacion, de modo que una sesion comprometida no puede
fabricar un pedido pagado ni autoconcederse acceso. Se creo ademas el bucket
privado vault.

### Cobro

- El precio se resuelve en el servidor desde el catalogo; el navegador solo elige
  que quiere comprar.
- El reparto se calcula en pesos enteros y el asiento cuadra al peso por pedido.
- El webhook verifica la firma del proveedor antes de leer el cuerpo y es
  idempotente por identificador de evento.
- El acceso se concede en el webhook, nunca al volver del checkout.
- Sin PAYMENT_PROVIDER, STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET, el checkout
  responde con fallo cerrado y no crea pedido.

### Operacion

- scripts/preflight.mjs comprueba entorno, Auth, tablas, bucket y pagos.
- scripts/apply-db.mjs aplica el SQL de forma idempotente.
- db/README.md documenta el esquema y sus limites.

### Pruebas

``sh
npx tsc --noEmit        # 0 errores
npm test                # 9 archivos, 56 pruebas aprobadas
npm run lint            # 0 errores, 16 avisos preexistentes
node scripts/preflight.mjs
``n
La matriz sube a **61/100**. Sigue sin poder cobrar hasta configurar el PSP, y
sin KYC no puede operar contenido adulto ni retiros. Declarar 100% seria falso.

