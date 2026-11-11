// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Cabeceras de seguridad compartidas por todos los despliegues. Nitro las escribe en
// `.vercel/output/config.json` y el worker de Cloudflare las aplica en cada respuesta,
// además de las que declara `public/_headers`.
const securityHeaders = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' data: blob:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline'; connect-src 'self' https:;",
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // El tipo del wrapper solo declara `preset`, `output` y `cloudflare`, pero en tiempo de
  // ejecución pasa el objeto completo a Nitro. `routeRules` escribe las cabeceras en
  // `.vercel/output/config.json`, que es lo único que Vercel respeta en un build prebuilt.
  nitro: {
    routeRules: {
      "/**": { headers: securityHeaders },
      "/assets/**": {
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      },
      "/brand/**": {
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      },
      "/covers/**": {
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      },
      "/health.json": { headers: { "Cache-Control": "no-store" } },
    },
  } as unknown as { preset?: string },
});
