# Despliegue de Xclusive

**Destino canónico: Vercel.**
Sitio: <https://sophisticated-elegance.vercel.app>
Proyecto: `prj_xtn4fMajuBdI5NKfnTDbNmuCFaNn` (team `team_QbYxBq0wdGuWTaCKV6U5TL2N`).

Cloudflare Workers se conserva como alternativa histórica de Nitro, pero **no es
el entorno canónico ni se valida en esta guía**.

---

## Modos de autenticación

| Modo                   | Cómo se activa                                                     | Qué hace                                                                                   |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **LIVE** (por defecto) | Sin flag, o `VITE_DEMO_MODE=false`                                 | Supabase Auth, sesión verificada por servidor, roles por allowlist. Sin credenciales demo. |
| **DEMO**               | `npm run dev:demo` / `npm run build:demo`, o `VITE_DEMO_MODE=true` | Cuentas locales de `src/lib/seed.ts`. Todo el comercio es simulado.                        |

El modo se fija en **tiempo de compilación**. Un build LIVE no puede activar el
modo DEMO desde el navegador.

---

## 1. Verificación local

```sh
npm ci
cp .env.example .env      # rellena los valores reales
npm run dev
```

Comprobaciones obligatorias antes de publicar:

```sh
npm run typecheck
npm test
npm run lint
npm run build
```

Build de demostración (opcional):

```sh
npm run build:demo
```

---

## 2. Variables de entorno

### Públicas (build)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SITE_URL`
- `VITE_DEMO_MODE` — debe ser `false` en producción.

### Servidor (runtime)

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `ADMIN_EMAILS` — correos separados por comas.
- `CREATOR_EMAILS` - correos separados por comas.
- `CREATOR_SLUGS` - vinculo cuenta -> perfil editorial, con pares
  `correo=slug` separados por comas (por ejemplo `ana@x.com=valentina-r`). Sin
  este valor, una creadora con rol pero sin `app_metadata.creator_slug` ve un
  aviso de perfil sin vincular en `/estudio`; nunca se inventa un perfil.
- `SUPABASE_SERVICE_ROLE_KEY` — solo si se habilitan borrado de cuenta y panel
  de administración. **Nunca** en el cliente ni con prefijo `VITE_`.

Sin `ADMIN_EMAILS` no hay administradores. Es un fallo cerrado deliberado.

---

## 3. Publicar en Vercel

```sh
npx vercel pull --yes --environment=production
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

El build usa el preset `vercel` y escribe `.vercel/output/`. Las cabeceras de
seguridad se aplican desde `vite.config.ts` (`routeRules`) y `public/_headers`.

### Configurar variables

```sh
npx vercel env add ADMIN_EMAILS production
npx vercel env add CREATOR_EMAILS production
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Para las variables `VITE_*`, usa el panel del proyecto o `vercel env add` y
**redespliega** después de cambiarlas: se incorporan en compilación.

---

## 4. Verificación posterior

1. `GET /health.json` responde 200.
2. `/entrar` no muestra cuentas DEMO y no contiene `demo1234` en el bundle.
3. Un registro nuevo recibe correo de confirmación de Supabase.
4. Un correo fuera de `ADMIN_EMAILS` no puede abrir `/admin` como administrador.
5. `/cuenta`, `/estudio`, `/admin` y `/boveda` responden 200 o redirigen de forma
   controlada, sin errores 500.
6. El log del servidor muestra eventos `xclusive.audit` en las acciones sensibles.

---

## 5. Limitaciones conocidas

- No hay migraciones automáticas ni smoke tests posteriores al despliegue.
- No hay rollback automatizado; se revierte con el panel de Vercel.
- La auditoría y la aceptación legal quedan en logs del servidor porque aún no
  existen las tablas `audit_log` y `legal_acceptances`.
- La credencial de servicio configurada es rechazada con `401` por la API de
  administración de Supabase. El panel admin y el borrado ARCO devuelven
  “no disponible” hasta rotarla.
- El comercio, los pagos y la verificación de edad siguen siendo DEMO o
  dependen de terceros. Ver [`docs/AUDITORIA-REMEDIACION.md`](docs/AUDITORIA-REMEDIACION.md).
