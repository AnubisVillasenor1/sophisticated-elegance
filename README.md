# Xclusive — Sophisticated Elegance

Club editorial privado para creadoras independientes: membresías, clips, salones en vivo, bóveda protegida, mensajería, estudio de creadora, administración y centro legal. Estética de club privado; arquitectura de bóveda.

**Sitio en producción:** https://sophisticated-elegance.vercel.app
**Repositorio:** https://github.com/AnubisVillasenor1/sophisticated-elegance

> **Estado real:** identidad y permisos ya se resuelven en el servidor con Supabase Auth. El comercio, los pagos, los retiros y la verificación de edad certificada **siguen siendo DEMO o dependen de terceros**. Los precios, comisiones y saldos son datos de demostración claramente etiquetados.

### Autenticación (remediación P0)

- **LIVE (por defecto):** registro y acceso con Supabase Auth. La sesión se verifica en cada server function con bearer token. El rol (`fan`, `creator`, `admin`) lo resuelve el servidor con `ADMIN_EMAILS` / `CREATOR_EMAILS` y `app_metadata`; `user_metadata` nunca concede rol. Sin allowlist no hay administradores.
- **DEMO:** solo en builds explícitos (`npm run dev:demo` / `npm run build:demo`). Las cuentas y su contraseña no existen en builds LIVE.
- **Fail closed:** sin configuración de Supabase no se establece sesión; sin sesión válida las server functions rechazan la operación.
- **Auditoría:** las acciones sensibles emiten eventos `xclusive.audit` con actor, acción y resultado.

El detalle, la matriz antes/después y lo que sigue bloqueado están en [`docs/AUDITORIA-REMEDIACION.md`](docs/AUDITORIA-REMEDIACION.md). El despliegue canónico es Vercel: [`DEPLOY.md`](DEPLOY.md).

---

## Lo que ya está implementado

### Experiencia pública

- **Portada editorial** con hero cinematográfico, retrato editorial, lookbook de cinco piezas y atmósfera mística (`aura`, `btn-lux`, `lift`, `mystic-rule`).
- **Directorio de creadoras** (10 perfiles con feed, niveles, salones y verificación declarada).
- **Perfil de creadora** con portada, biografía, membresías y contenido protegido.
- **Clips y bundles** con precio, comisión de plataforma y desglose antes de confirmar.
- **Salones en vivo** con aforo, horario, nivel requerido y estado real de la función.
- **Ecosistema** con capacidades implementadas, en revisión y dependientes de terceros.
- **Registro** con consentimiento, aceptación legal versionada y verificación de edad declarativa.
- **Centro legal** con nueve documentos versionados, aceptación con hash y derechos ARCO.

### Guía interactiva (12 pasos)

Recorrido guiado por toda la plataforma, implementado en `src/components/site/PlatformTour.tsx`:

- Navega entre rutas mientras explica cada zona (`/`, `/explorar`, `/clips`, `/salones`, `/creadoras`, `/boveda`, `/ecosistema`, `/registro` y cuenta).
- Spotlight sobre el área descrita, tarjeta con progreso `01 / 12` y salto de sección.
- Teclado completo: `←` / `→` para moverse, `Esc` para salir, foco atrapado dentro del diálogo.
- Persistencia en `localStorage` (`xclusive.tour.v1`) y oferta de bienvenida única.
- Disparadores en cabecera, pie de página y botón flotante «Guía».

### Suscripciones con ajuste del +15%

Las tarifas se centralizan en `src/lib/pricing.ts` para que portada, semilla y store nunca se desincronicen:

```ts
export function subscriptionPrice(baseMXN: number): number {
  return Math.round((baseMXN * 115) / 100); // evita el error de coma flotante de 1.15
}
```

| Creadora     | Insider | VIP Club | Inner Circle |
| ------------ | ------: | -------: | -----------: |
| Valentina R. |     171 |      449 |         1139 |
| Camila Noir  |     114 |      344 |          861 |
| Renata Sol   |     138 |      322 |          748 |
| Alba Mística |      92 |      253 |          621 |
| Luna Ferrer  |     115 |      299 |          805 |
| Sofía Duarte |     173 |      483 |         1265 |
| Danna Vale   |     104 |      276 |          690 |
| Marea        |     161 |      414 |         1024 |
| Jade Onyx    |      98 |      242 |          598 |
| Nina Volt    |      81 |      230 |          575 |

La portada anuncia las llaves de referencia en **$138 / $368 / $943 MXN**. Las tarifas guardadas en sesiones antiguas se resincronizan con la semilla vigente al hidratar el estado.

### Activos locales (sin dependencias remotas)

- `public/editorial/` — cinco piezas WebP (`hero`, `luz-de-jardin`, `una-noche-en-marfil`, `hora-dorada`, `atelier-nocturno`), 150.5 KB en total.
- `public/covers/` — 15 portadas procedurales generadas con `scripts/generate-covers.mjs`.
- `public/brand/` — emblema, wordmark y lockup en tres resoluciones con `srcset`.
- `scripts/fetch-editorial.mjs` documenta la descarga y optimización de las editoriales.

---

## Stack

- **React 19** + **TypeScript** estricto (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- **TanStack Start / Router** con SSR.
- **Tailwind CSS v4** y sistema visual propio en `src/components/lux/`.
- **Vitest** + Testing Library (jsdom).
- **Nitro** para el empaquetado; preset `vercel` en producción.
- Integraciones de Lovable/Supabase conservadas; el DEMO no las requiere (ver «Pendientes»).

```
src/
├─ components/
│  ├─ lux/          primitivas, tarjetas, checkout, comisiones
│  ├─ platform/     shell del estudio, bóveda, cuenta y admin
│  └─ site/         cabecera, pie, layouts, age gate, cookies, tour
├─ lib/             dominio: tipos, semilla, selectores, precios, legal, store
├─ routes/          páginas públicas, estudio, bóveda, mensajes, cuenta, legal
├─ test/            pruebas de integración y de UI
└─ styles.css       tokens y utilidades (aura, btn-lux, lift, mystic-rule)
```

---

## Desarrollo

Requisitos: Node.js 22+ y npm.

```sh
git clone https://github.com/AnubisVillasenor1/sophisticated-elegance.git
cd sophisticated-elegance
npm install
npm run dev
```

Vite imprime la URL local al arrancar.

### Cuentas de demostración

| Rol      | Correo                    | Contraseña |
| -------- | ------------------------- | ---------- |
| Fan      | `fan@xclusive.demo`       | `demo1234` |
| Creadora | `valentina@xclusive.demo` | `demo1234` |
| Admin    | `admin@xclusive.demo`     | `demo1234` |

### Scripts

| Comando           | Qué hace                                         |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo con SSR y HMR.            |
| `npm run build`   | Build de producción (Nitro; preset por defecto). |
| `npm run preview` | Sirve el build localmente.                       |
| `npm run lint`    | ESLint (0 errores; warnings de fast-refresh).    |
| `npm run format`  | Prettier sobre el proyecto.                      |
| `npm test`        | Vitest: 6 archivos, 23 pruebas.                  |

### Comprobaciones antes de publicar

```sh
npx tsc --noEmit
npm run lint
npm test
$env:NITRO_PRESET='vercel'; npm run build   # PowerShell
```

Resultado esperado: `tsc` sin errores, lint sin errores, 23/23 pruebas y build correcto.

---

## Despliegue

Producción corre en Vercel con build precompilado:

```sh
$env:NITRO_PRESET='vercel'; npm run build
npx vercel deploy --prebuilt --prod
```

- Proyecto: `prj_xtn4fMajuBdI5NKfnTDbNmuCFaNn` (team `team_QbYxBq0wdGuWTaCKV6U5TL2N`).
- Alias de producción: https://sophisticated-elegance.vercel.app
- `vercel.json` fija `NITRO_PRESET=vercel` para builds desde el panel.
- Guía detallada: [DEPLOY.md](DEPLOY.md).

---

## Cumplimiento y límites explícitos

- **Contenido adulto deshabilitado** hasta completar verificación de edad certificada, consentimiento documentado por creadora y aprobación del procesador de pagos.
- **Sin dinero real:** los saldos, comisiones y propinas son simulación visible. No se solicita ni se procesa ningún medio de pago.
- **Textos legales en borrador** (`versión 2026.11-demo`): requieren revisión legal, fiscal y de protección de datos antes de operar.
- **Consentimiento e imagen:** no se publican fotografías de personas reales sin licencia y consentimiento verificables. Las cinco editoriales locales son material de referencia estético del proyecto.
- **Derechos ARCO:** solicitudes rastreables desde la cuenta, con plazos y estados.

---

## Pendientes para producción real

1. **Pagos y KYC:** cuenta live del PSP, onboarding de creadoras, impuestos y conciliación.
2. **Verificación de edad:** proveedor certificado y aprobación del PSP para contenido sensible.
3. **Backend real:** esquema Supabase con RLS, autenticación, storage y migración del store local.
4. **Correo transaccional** y notificaciones fuera del navegador.
5. **Cloudflare Workers:** requiere `CLOUDFLARE_API_TOKEN` y `wrangler login` para el preset alternativo.

Nada de lo anterior se declara como terminado: son dependencias externas y de cumplimiento, no tareas de código pendientes.

---

## Convenciones del repositorio

- No se editan `supabase/migrations/` ni `drizzle/`: el esquema se cambia desde Lovable.
- No se editan archivos generados (cabecera «automatically generated»).
- No se reescribe historial publicado (`main` alimenta el editor de Lovable).
- Los secretos viven fuera del repositorio; `LOVABLE_API_KEY` nunca en código de navegador.

## Documentación

- [DEPLOY.md](DEPLOY.md) — despliegue y verificación.
- [docs/PRODUCCION.md](docs/PRODUCCION.md) — blueprint de producción.
- [AGENTS.md](AGENTS.md) — reglas de convivencia con Lovable.
