# Despliegue de Xclusive (Modo DEMO)

Este repositorio contiene un prototipo funcional de plataforma de creadoras. Todo el estado vive en el navegador (`localStorage`): no hay base de datos, pasarela de pagos, verificación de identidad ni transferencias reales.

> **Importante:** el despliegue publica la experiencia DEMO. No habilita cobros, retiros ni contenido adulto. Antes de operar con dinero real hay que completar el [plan de producción](docs/PRODUCCION.md).

## Requisitos

- Node.js 22 o superior (probado con Node 26 y npm 11).
- npm (el repositorio también conserva `bun.lock`, pero los comandos de esta guía usan npm).
- Cuenta de Cloudflare con Workers habilitado para publicar.
- Wrangler autenticado (`npx wrangler login`) o variables `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en CI.

## 1. Verificar en local

```sh
npm ci
npm run dev
```

Abre `http://localhost:8080`. La compilación de producción y las pruebas deben pasar antes de publicar:

```sh
npm run build
npx tsc --noEmit
npx vitest run
```

Salida esperada del build: `.output/` con el worker de Cloudflare y los assets estáticos.

Comprobaciones automáticas (también corren en GitHub Actions, `.github/workflows/ci.yml`):

```sh
npx tsc --noEmit
npm test
npm run lint
npm run build
```

Archivos de producción incluidos en `public/`:

- `_headers`: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y caché de assets.
- `robots.txt` y `sitemap.xml`: indexación pública; `/admin`, `/estudio`, `/boveda`, `/mensajes` y `/cuenta` quedan fuera.
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`: instalación como aplicación.
- `og.png`: tarjeta social 1200×630 usada por Open Graph y Twitter.
- `health.json`: estado del servicio y declaración de Modo DEMO.

Los iconos y la tarjeta social se regeneran con `powershell -File scripts/generate-brand-assets.ps1`.

## 2. Cuentas de demostración

| Rol            | Correo                    | Contraseña |
| -------------- | ------------------------- | ---------- |
| Miembro        | `fan@xclusive.demo`       | `demo1234` |
| Creadora       | `valentina@xclusive.demo` | `demo1234` |
| Administración | `admin@xclusive.demo`     | `demo1234` |

Los datos se guardan por navegador. Para volver al estado inicial entra a **Mi cuenta → Datos → Reiniciar DEMO** o borra el almacenamiento local del sitio.

## 3. Publicar en Cloudflare Workers

El build usa el preset `cloudflare-module` de Nitro y genera la configuración del worker en `.output/server/wrangler.json`.

```sh
npm ci
npm run build
npx nitro deploy --prebuilt
```

Alternativa equivalente con Wrangler:

```sh
npm run build
npx wrangler deploy --config .output/server/wrangler.json
```

El nombre del worker se deriva del repositorio (`anubisvillasenor1-sophisticated-elegance`). El despliegue imprime la URL `https://<worker>.<cuenta>.workers.dev`.

> Este repositorio fue creado con Lovable y conserva las integraciones de Supabase (`src/integrations/supabase/`, `src/hooks/use-session.ts`) y las migraciones de `drizzle/` y `supabase/`. El Modo DEMO no las usa: la sesión, el catálogo y las aceptaciones legales viven en `localStorage`. No edites `drizzle/` ni `supabase/migrations/` a mano; cualquier cambio de esquema se solicita desde Lovable.

### Vista previa sin cuenta de Cloudflare

Para una demostración inmediata, Wrangler puede publicar en una cuenta temporal:

```sh
npm run build
npx wrangler deploy --temporary --config .output/server/wrangler.json
```

La URL resultante es pública y temporal; no sirve como dominio definitivo ni garantiza persistencia. Para producción usa una cuenta propia autenticada.

### Dominio propio

1. En Cloudflare → Workers & Pages → el worker desplegado → **Settings → Domains & Routes**.
2. Agrega el dominio o subdominio (por ejemplo `xclusive.tamvonline.network`).
3. Espera la emisión del certificado y verifica que el dominio raíz redirija a `https://`.

No se necesitan variables de entorno para el Modo DEMO. No agregues secretos al repositorio: en producción se configuran como _Secrets_ del worker o del proveedor.

## 4. Publicar desde GitHub

Dos rutas válidas:

- **Lovable:** publicar desde el editor conectado. Los commits de este repositorio se sincronizan con Lovable; no reescribas el historial publicado.
- **Cloudflare Workers Builds:** conecta el repositorio y usa:
  - Build command: `npm ci && npm run build`
  - Deploy command: `npx wrangler deploy --config .output/server/wrangler.json`
  - Variables: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

Mantén la rama en estado compilable: cada push puede sincronizarse con Lovable.

## 5. Publicar en Vercel (alternativa)

Vercel no ejecuta el preset de Cloudflare, así que el build se cambia con una variable de entorno, sin tocar `vite.config.ts`:

```sh
npm ci
NITRO_PRESET=vercel npm run build
npx vercel deploy --prebuilt --prod
```

En PowerShell: `$env:NITRO_PRESET='vercel'; npm run build`.

`vercel.json` fija el mismo comando para los despliegues automáticos desde GitHub y replica las cabeceras de `public/_headers` (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, caché de assets), porque Vercel no lee `_headers`. El resultado queda en `.vercel/output` (Build Output API de Nitro).

Sitio publicado: https://sophisticated-elegance.vercel.app

Cada push a `main` dispara un build en Vercel. La configuración de Cloudflare (`wrangler.jsonc`, `.output/server/wrangler.json`) sigue siendo la vía principal; Vercel es la demo pública mientras no haya credenciales de Cloudflare.

## 6. Verificación posterior al despliegue

- [ ] `/` carga el landing y el aviso de edad aparece en una sesión nueva.
- [ ] Aceptar el aviso guarda la decisión y muestra el banner de cookies.
- [ ] `/legal` lista los nueve documentos y cada uno abre sin error.
- [ ] `/explorar`, `/clips`, `/salones` y `/creadoras` muestran contenido.
- [ ] `/entrar` permite entrar con las tres cuentas DEMO.
- [ ] Miembro: membresía, compra, propina, bóveda, mensajes y ARCO.
- [ ] Creadora: publicar, editar plan, abrir salón, ver ingresos y solicitar retiro DEMO.
- [ ] Administración: aprobar solicitud, resolver reporte, resolver ARCO y marcar retiro.
- [ ] Los importes muestran el sello DEMO y no se solicita tarjeta.
- [ ] El contenido adulto permanece deshabilitado.
- [ ] `/auth` redirige a `/entrar` y `/membresias` redirige a `/explorar`.
- [ ] `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/og.png` y `/health.json` responden 200.
- [ ] Las cabeceras de seguridad de `_headers` llegan en la respuesta del dominio (`Strict-Transport-Security`, `X-Content-Type-Options`).
- [ ] La intro cinematográfica aparece una vez por sesión, se puede saltar con Escape y no se muestra con `prefers-reduced-motion`.

## 7. Reversión

Cloudflare conserva las versiones del worker. En **Workers → Deployments** selecciona la versión anterior y usa **Rollback**. Para retirar el sitio, elimina la ruta del dominio y el worker; no borres el repositorio ni el historial de Git.

## 8. Límites conocidos del DEMO

- Sin backend, autenticación real, recuperación de contraseña ni sesiones de servidor.
- Sin PSP, facturación, impuestos, conciliación, retiros ni obligación de pago.
- Sin KYC, verificación de edad certificada ni firma electrónica.
- Sin almacenamiento de medios ni URLs firmadas; las portadas son imágenes locales o degradados CSS.
- Sin IA conectada: las sugerencias son heurísticas locales declaradas como simulación.
- Los hashes de aceptación son deterministas y no criptográficos.

Todo lo anterior está desarrollado como módulos funcionales de interfaz y se documenta en [docs/PRODUCCION.md](docs/PRODUCCION.md).
