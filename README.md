# Sophisticated Elegance — Xclusive

Plataforma editorial de creadoras independientes: membresías, clips, salones en vivo, bóveda protegida, mensajería, estudio de creadora, administración y centro legal. Implementación funcional en **Modo DEMO**: sin cobros, retiros ni contenido adulto.

- **Demo local:** `npm install` → `npm run dev` → `http://localhost:8080`
- **Cuentas:** `fan@xclusive.demo`, `valentina@xclusive.demo`, `admin@xclusive.demo` · contraseña `demo1234`
- **Despliegue:** [DEPLOY.md](DEPLOY.md)
- **Blueprint de producción:** [docs/PRODUCCION.md](docs/PRODUCCION.md)
- **Legal:** `/legal` (nueve documentos versionados, aceptación con hash y derechos ARCO)

> El contenido adulto permanece deshabilitado hasta completar verificación de edad certificada, consentimiento documentado, revisión legal y aprobación del PSP. Los textos legales son borradores y requieren revisión profesional.

crea el proyeto con una elegancia sofisticada

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9be8ede3-26fa-4535-9c5f-591219e921da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/AnubisVillasenor1/sophisticated-elegance.git
cd sophisticated-elegance
npm install
npm run dev
```

### Comprobaciones antes de publicar

```sh
npm run build
npx tsc --noEmit
npx vitest run
npm run lint
```

### Estructura

- `src/lib/` — dominio DEMO: tipos, semilla, selectores, legal, plataformas, acciones y estado (`store.tsx`).
- `src/components/lux/` — sistema visual: primitivas, tarjetas, checkout, comisiones y reportes.
- `src/components/site/` — cabecera, pie, layouts públicos, aviso de edad y cookies.
- `src/routes/` — páginas públicas, estudio de creadora, bóveda, mensajes, cuenta, administración y centro legal.
- `src/integrations/` — integraciones de Lovable/Supabase conservadas; el DEMO no las requiere.
