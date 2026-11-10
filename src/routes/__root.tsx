import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AgeGate } from "../components/site/AgeGate";
import { CookieConsent } from "../components/site/CookieConsent";
import { Toaster } from "../components/ui/sonner";
import { AppProvider } from "../lib/store";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 font-serif text-6xl leading-none text-silver-sheen">
          Esta puerta no existe.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          La página que buscas se movió, se cerró o nunca estuvo en el club. Puedes volver al inicio
          o explorar las creadoras activas.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-signal px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-candy"
          >
            Volver al inicio
          </Link>
          <Link
            to="/explorar"
            className="inline-flex h-11 items-center justify-center rounded-full border border-hairline px-6 text-sm text-pearl transition-colors hover:bg-white/5"
          >
            Explorar creadoras
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center">
        <p className="eyebrow">Algo interrumpió la función</p>
        <h1 className="mt-4 font-serif text-5xl leading-none text-pearl">La página no cargó.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio. Si el problema
          persiste, escríbenos a soporte.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-signal px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-candy"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-hairline px-6 text-sm text-pearl transition-colors hover:bg-white/5"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Xclusive — Un paraíso prohibido" },
      {
        name: "description",
        content:
          "Club privado editorial para creadoras independientes. Membresías, salones en vivo y bóveda protegida.",
      },
      { name: "author", content: "TAMV Online Network" },
      { name: "theme-color", content: "#0d0709" },
      { property: "og:title", content: "Xclusive — Un paraíso prohibido" },
      {
        property: "og:description",
        content:
          "Club privado editorial para creadoras independientes y sus comunidades más cercanas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Outlet />
        <AgeGate />
        <CookieConsent />
        <Toaster position="top-center" />
      </AppProvider>
    </QueryClientProvider>
  );
}
