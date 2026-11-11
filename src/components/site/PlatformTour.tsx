import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass, SkipForward, Sparkles, X } from "lucide-react";

import { TIER_PRICES_MXN } from "@/lib/pricing";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BrandEmblem } from "./brand";

const TOUR_KEY = "xclusive.tour.v1";

type TourStep = {
  route: string;
  target?: string;
  chapter: string;
  title: string;
  body: string;
};

const money = (value: number) => `$${value.toLocaleString("es-MX")} MXN`;

function buildSteps(isCreator: boolean, isAdmin: boolean, isLoggedIn: boolean): TourStep[] {
  const accountRoute = isCreator
    ? "/estudio"
    : isAdmin
      ? "/admin"
      : isLoggedIn
        ? "/cuenta"
        : "/entrar";
  return [
    {
      route: "/",
      target: '[data-tour="home-hero"]',
      chapter: "La entrada",
      title: "Bienvenida al club",
      body: "Xclusive es un club editorial privado: cada creadora decide quién entra, qué se muestra y cuánto vale su cercanía. Este recorrido te muestra dónde está cada llave.",
    },
    {
      route: "/",
      target: '[data-tour="home-creators"]',
      chapter: "El elenco",
      title: "Creadoras con nombre propio",
      body: "Cada perfil tiene su tono, su feed y sus tres niveles de membresía. Puedes entrar al directorio completo cuando quieras.",
    },
    {
      route: "/",
      target: '[data-tour="home-memberships"]',
      chapter: "Las llaves",
      title: "Tres niveles, precios claros",
      body: `Insider desde ${money(TIER_PRICES_MXN[0])}, VIP Club desde ${money(TIER_PRICES_MXN[1])} e Inner Circle desde ${money(TIER_PRICES_MXN[2])}. Cada creadora ajusta beneficios sobre esta base.`,
    },
    {
      route: "/",
      target: '[data-tour="home-ecosystem"]',
      chapter: "El ecosistema",
      title: "Todo en una sola cuenta",
      body: "Membresías, clips, salones en vivo, mensajes, encargos y bóveda comparten un mismo libro de ingresos y reglas visibles antes de confirmar.",
    },
    {
      route: "/explorar",
      target: '[data-tour="explore-search"]',
      chapter: "Explorar",
      title: "Encuentra a tu creadora",
      body: "Filtra por categoría, ciudad y disponibilidad. Los resultados se ordenan por afinidad, actividad y cercanía sin esconder el precio de cada llave.",
    },
    {
      route: "/clips",
      target: '[data-tour="clips-search"]',
      chapter: "Clips",
      title: "Contenido a la carta",
      body: "Compra piezas individuales o bundles sin suscripción. Antes de confirmar ves el precio, la comisión de plataforma y qué incluye exactamente.",
    },
    {
      route: "/salones",
      target: '[data-tour="salones-grid"]',
      chapter: "Salones",
      title: "En vivo, con aforo y reglas",
      body: "Los salones muestran horario, nivel requerido y aforo. Si la función está pausada, la plataforma lo declara en lugar de fingir actividad.",
    },
    {
      route: "/creadoras",
      target: '[data-tour="creators-grid"]',
      chapter: "Directorio",
      title: "Perfiles completos",
      body: "Cada ficha reúne biografía, feed público, membresías, salones programados y verificación declarada. Nada de métricas inventadas.",
    },
    {
      route: "/boveda",
      target: '[data-tour="boveda-summary"]',
      chapter: "La bóveda",
      title: "Tu contenido protegido",
      body: "Aquí viven las compras, suscripciones y piezas desbloqueadas. La bóveda respeta el nivel contratado y permite descargar solo lo que ya posees.",
    },
    {
      route: "/ecosistema",
      target: '[data-tour="ecosystem-capabilities"]',
      chapter: "Capacidades",
      title: "Qué existe y qué no",
      body: "El ecosistema lista las capacidades implementadas, las que están en revisión y las que dependen de terceros. La transparencia es parte del producto.",
    },
    {
      route: "/registro",
      target: '[data-tour="signup-form"]',
      chapter: "Acceso",
      title: "Solicita tu invitación",
      body: "El registro documenta consentimiento, verificación de edad declarativa y aceptación legal. Puedes borrar tus datos locales desde tu cuenta.",
    },
    {
      route: accountRoute,
      target: '[data-tour="page-main"], [data-tour="platform-main"], main',
      chapter: "Tu cuenta",
      title: "El centro de control",
      body: "Desde tu cuenta gestionas membresías, privacidad, notificaciones y derechos ARCO. Si eres creadora, el estudio añade publicación, salones e ingresos.",
    },
  ];
}

type TourContextValue = {
  start: () => void;
  isOpen: boolean;
};

const TourContext = createContext<TourContextValue | null>(null);

/** Botón flotante y disparador del recorrido. */
export function usePlatformTour() {
  return useContext(TourContext);
}

type Rect = { top: number; left: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function PlatformTourProvider({ children }: { children: ReactNode }) {
  const { state, user, hydrated } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [offer, setOffer] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 1280, h: 800 });
  const [reduceMotion, setReduceMotion] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const steps = useMemo(
    () => buildSteps(user?.role === "creator", user?.role === "admin", Boolean(user)),
    [user],
  );

  const step = steps[index] ?? steps[0]!;

  const remember = useCallback((value: "done" | "later") => {
    try {
      window.localStorage.setItem(TOUR_KEY, value);
    } catch {
      // sin almacenamiento: el recorrido sigue funcionando en esta sesión
    }
  }, []);

  const start = useCallback(() => {
    setOffer(false);
    setIndex(0);
    setRect(null);
    setOpen(true);
  }, []);

  const finish = useCallback(() => {
    remember("done");
    setOpen(false);
    setRect(null);
  }, [remember]);

  const dismissOffer = useCallback(() => {
    remember("later");
    setOffer(false);
  }, [remember]);

  /* Oferta de bienvenida: solo la primera vez, después de la puerta de edad. */
  useEffect(() => {
    if (!hydrated || !state.ageVerified) return;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(TOUR_KEY);
    } catch {
      stored = "later";
    }
    if (stored) return;

    let tries = 0;
    const timer = window.setInterval(() => {
      const intro = document.querySelector('[aria-label="Presentación de Xclusive"]');
      tries += 1;
      if (!intro) {
        setOffer(true);
        window.clearInterval(timer);
      } else if (tries > 30) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hydrated, state.ageVerified]);

  /* Preferencias de movimiento y tamaño de ventana. */
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(media.matches);
    const syncViewport = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    syncMotion();
    syncViewport();
    media.addEventListener("change", syncMotion);
    window.addEventListener("resize", syncViewport);
    return () => {
      media.removeEventListener("change", syncMotion);
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  /* Navegación y medición del objetivo de cada paso. */
  useEffect(() => {
    if (!open) return;
    if (pathname !== step.route) {
      navigate({ to: step.route as never });
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const selector = step.target ?? '[data-tour="page-main"], main';
    let found = false;

    const measure = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      const pad = 8;
      setRect({
        top: Math.max(8, box.top - pad),
        left: Math.max(8, box.left - pad),
        width: Math.max(24, box.width + pad * 2),
        height: Math.max(24, box.height + pad * 2),
      });
    };

    const resolve = (attempt: number) => {
      if (cancelled) return;
      const element = document.querySelector(selector) as HTMLElement | null;
      if (!element) {
        if (attempt < 24) timers.push(window.setTimeout(() => resolve(attempt + 1), 120));
        else setRect(null);
        return;
      }
      if (!found) {
        found = true;
        element.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: reduceMotion ? "auto" : "smooth",
        });
        requestAnimationFrame(() => {
          if (cancelled) return;
          measure(element);
        });
        timers.push(
          window.setTimeout(
            () => {
              if (!cancelled) measure(element);
            },
            reduceMotion ? 80 : 520,
          ),
        );
      }
    };

    resolve(0);

    const onViewportChange = () => {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element) measure(element);
    };
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [open, pathname, step, navigate, reduceMotion]);

  /* Foco y teclado. */
  useEffect(() => {
    if (!open) return;
    nextRef.current?.focus();
  }, [open, index]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0) return;
      if (next >= steps.length) {
        finish();
        return;
      }
      setRect(null);
      setIndex(next);
    },
    [finish, steps.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === "Tab" && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, goTo, finish]);

  const value = useMemo<TourContextValue>(() => ({ start, isOpen: open }), [start, open]);

  const isMobile = viewport.w < 640;
  const cardWidth = Math.min(408, viewport.w - 32);
  const estimatedHeight = 268;
  const cardLeft = rect
    ? clamp(
        rect.left + rect.width / 2 - cardWidth / 2,
        16,
        Math.max(16, viewport.w - cardWidth - 16),
      )
    : Math.max(16, (viewport.w - cardWidth) / 2);
  const cardTop = (() => {
    if (!rect) return Math.max(16, (viewport.h - estimatedHeight) / 2);
    const below = rect.top + rect.height + 16;
    if (below + estimatedHeight < viewport.h - 16) return below;
    const above = rect.top - estimatedHeight - 16;
    if (above > 16) return above;
    return clamp(
      rect.top + rect.height / 2 - estimatedHeight / 2,
      16,
      Math.max(16, viewport.h - estimatedHeight - 16),
    );
  })();

  return (
    <TourContext.Provider value={value}>
      {children}

      {hydrated && state.ageVerified && !open && !offer ? (
        <button
          type="button"
          onClick={start}
          className="group fixed bottom-5 right-4 z-[1400] inline-flex min-h-11 items-center gap-2 rounded-full border border-signal/35 bg-background/85 px-4 py-2.5 text-[0.66rem] uppercase tracking-[0.18em] text-pearl shadow-deep backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-signal/70 hover:bg-signal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 sm:right-6"
          aria-label="Abrir la guía interactiva de Xclusive"
        >
          <Compass className="h-4 w-4 text-signal transition-transform group-hover:rotate-45" />
          Guía
        </button>
      ) : null}

      {offer ? (
        <div className="fixed inset-0 z-[1950] flex items-center justify-center overflow-y-auto bg-background/80 px-4 py-10 backdrop-blur-md">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-offer-title"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-hairline bg-background p-6 shadow-deep sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 aura opacity-80" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <BrandEmblem sizes="64px" className="w-14" />
                <button
                  type="button"
                  onClick={dismissOffer}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors hover:text-pearl"
                  aria-label="Cerrar la invitación al recorrido"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="eyebrow mt-6">Guía interactiva</p>
              <h2
                id="tour-offer-title"
                className="mt-3 font-serif text-4xl leading-[1.02] text-pearl"
              >
                Un recorrido por
                <br />
                <em className="text-silver-sheen">todo el club.</em>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Doce paradas por la portada, el directorio, los clips, los salones, la bóveda y tu
                cuenta. Puedes avanzar, volver y salir cuando quieras.
              </p>
              <ul className="mt-5 grid gap-2 text-[0.72rem] text-silver">
                {[
                  "Navega contigo entre páginas",
                  "Señala cada zona con luz",
                  "Se guarda tu progreso",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-signal" /> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full btn-lux px-5 text-sm font-medium text-primary-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70"
                >
                  Comenzar recorrido <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={dismissOffer}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-hairline px-5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-pearl"
                >
                  Explorar por mi cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="pointer-events-none fixed inset-0 z-[1900]">
          {rect ? (
            <div
              aria-hidden
              className={cn(
                "absolute rounded-2xl border border-pearl/45",
                !reduceMotion && "transition-all duration-300 ease-out",
              )}
              style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                boxShadow:
                  "0 0 0 9999px rgba(4, 2, 3, 0.78), 0 0 0 6px rgba(237, 49, 92, 0.18), 0 0 60px rgba(237, 49, 92, 0.25)",
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
          )}

          <div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-step-title"
            aria-describedby="tour-step-body"
            className={cn(
              "pointer-events-auto fixed overflow-hidden rounded-2xl border border-hairline bg-background/95 shadow-deep backdrop-blur-xl",
              !reduceMotion && "animate-fade-up",
            )}
            style={
              isMobile
                ? { left: 12, right: 12, bottom: 12 }
                : { top: cardTop, left: cardLeft, width: cardWidth }
            }
          >
            <div className="h-0.5 w-full bg-white/8">
              <div
                className="h-full bg-gradient-to-r from-signal/60 via-signal to-candy transition-all duration-500"
                style={{ width: `${((index + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.26em] text-signal">
                    {step.chapter} · {String(index + 1).padStart(2, "0")} /{" "}
                    {String(steps.length).padStart(2, "0")}
                  </p>
                  <h2
                    id="tour-step-title"
                    aria-live="polite"
                    className="mt-2 font-serif text-2xl leading-tight text-pearl"
                  >
                    {step.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={finish}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors hover:text-pearl"
                  aria-label="Cerrar el recorrido"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p
                id="tour-step-body"
                className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground"
              >
                {step.body}
              </p>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline pt-4">
                <button
                  type="button"
                  onClick={finish}
                  className="inline-flex min-h-9 items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-pearl"
                >
                  <SkipForward className="h-3.5 w-3.5" /> Saltar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    disabled={index === 0}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-pearl transition-colors hover:bg-white/5 disabled:pointer-events-none disabled:opacity-35"
                    aria-label="Paso anterior"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    ref={nextRef}
                    type="button"
                    onClick={() => goTo(index + 1)}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full btn-lux px-4 text-xs font-medium text-primary-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70"
                  >
                    {index === steps.length - 1 ? "Terminar" : "Siguiente"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </TourContext.Provider>
  );
}

/** Enlace o botón compacto para encabezados y pies de página. */
export function TourTrigger({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const tour = usePlatformTour();
  if (!tour) return null;
  return (
    <button
      type="button"
      onClick={tour.start}
      className={cn(
        "inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-pearl",
        compact
          ? "h-9 w-9 justify-center rounded-full border border-hairline"
          : "text-[0.78rem] underline-offset-4 hover:underline",
        className,
      )}
      aria-label="Abrir la guía interactiva de Xclusive"
    >
      <Compass className="h-3.5 w-3.5" />
      {compact ? null : "Guía interactiva"}
    </button>
  );
}
