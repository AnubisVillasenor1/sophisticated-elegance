import { useRouterState } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { XclusiveEmblem } from "./XclusiveEmblem";

const INTRO_KEY = "xclusive.intro.v1";
const INTRO_MS = 10_000;

/**
 * Intro cinematográfica de la portada.
 *
 * Se muestra una vez por sesión, después de la puerta de edad y solo en `/`.
 * Respeta `prefers-reduced-motion`, admite Escape y tiene salida explícita.
 */
export function CinematicIntro() {
  const { state, hydrated } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!hydrated || !state.ageVerified || pathname !== "/") return;
    try {
      if (window.sessionStorage.getItem(INTRO_KEY)) return;
    } catch {
      // Sin sessionStorage: la intro se muestra igualmente.
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVisible(true);
  }, [hydrated, state.ageVerified, pathname]);

  const dismiss = useCallback(() => {
    setClosing(true);
    try {
      window.sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // noop
    }
    window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 760);
  }, []);

  useEffect(() => {
    if (!visible) return;
    enterRef.current?.focus();
    const timer = window.setTimeout(dismiss, INTRO_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Presentación de Xclusive"
      className={cn(
        "intro-shell fixed inset-0 z-[2100] overflow-hidden bg-[#040203] text-pearl",
        closing && "intro-exit",
      )}
    >
      {/* Barrido de luz y atmósfera */}
      <div className="intro-sweep pointer-events-none absolute left-1/2 top-1/2 h-[170vmax] w-[170vmax] -translate-x-1/2 -translate-y-1/2" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,rgba(244,63,94,0.20),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,2,3,0.92)_0%,transparent_28%,transparent_72%,rgba(4,2,3,0.96)_100%)]" />
      <div className="grain pointer-events-none absolute inset-0 opacity-70" />
      <div className="intro-vignette pointer-events-none absolute inset-0" />

      {/* Marcas de esquina */}
      <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-pearl/20 sm:left-6 sm:top-6" />
      <span className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r border-t border-pearl/20 sm:right-6 sm:top-6" />
      <span className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b border-l border-pearl/20 sm:bottom-6 sm:left-6" />
      <span className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-pearl/20 sm:bottom-6 sm:right-6" />

      <button
        type="button"
        onClick={dismiss}
        className="intro-line absolute right-5 top-5 z-20 rounded-full border border-pearl/15 bg-black/30 px-4 py-2 text-[0.6rem] uppercase tracking-[0.2em] text-silver backdrop-blur transition-colors hover:border-pearl/35 hover:text-pearl sm:right-10 sm:top-10"
        style={{ animationDelay: "150ms" }}
      >
        Saltar intro
      </button>

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-20 text-center">
        <p
          className="intro-line text-[0.56rem] uppercase tracking-[0.46em] text-muted-foreground sm:text-[0.62rem]"
          style={{ animationDelay: "180ms" }}
        >
          TAMV Online Network presenta
        </p>

        <div className="intro-emblem relative mt-7 sm:mt-9">
          <div className="absolute inset-[-14%] rounded-full bg-signal/25 blur-3xl" />
          <div className="absolute inset-[4%] rounded-full border border-signal/15" />
          <XclusiveEmblem animated className="relative w-[min(62vw,360px)]" />
        </div>

        <h1
          className="intro-line mt-6 font-serif text-[clamp(2.6rem,9vw,6.5rem)] leading-none tracking-[0.18em] text-silver-sheen sm:mt-8"
          style={{ animationDelay: "620ms" }}
        >
          XCLUSIVE
        </h1>

        <div
          className="intro-line mt-5 flex items-center gap-4"
          style={{ animationDelay: "820ms" }}
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-signal/70 sm:w-20" />
          <span className="whitespace-nowrap text-[0.55rem] uppercase tracking-[0.34em] text-signal sm:text-[0.62rem]">
            Edición privada · MMXXVI
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-signal/70 sm:w-20" />
        </div>

        <p
          className="intro-line mt-6 max-w-xl font-serif text-xl italic leading-snug text-silver sm:text-2xl"
          style={{ animationDelay: "980ms" }}
        >
          Un paraíso prohibido.
          <br />
          Solo para quienes saben entrar.
        </p>

        <button
          ref={enterRef}
          type="button"
          onClick={dismiss}
          className="intro-line group mt-9 inline-flex items-center gap-3 rounded-full border border-signal/45 bg-signal/10 px-8 py-3.5 text-[0.68rem] uppercase tracking-[0.22em] text-pearl shadow-ember transition-all hover:-translate-y-0.5 hover:bg-signal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 sm:mt-11"
          style={{ animationDelay: "1180ms" }}
        >
          Entrar al club
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <div
          className="intro-line mt-8 h-px w-44 overflow-hidden bg-pearl/10"
          style={{ animationDelay: "1380ms" }}
          aria-hidden
        >
          <div className="intro-progress h-full w-full origin-left bg-gradient-to-r from-signal/40 via-signal to-candy" />
        </div>
      </div>

      <div
        className="intro-line absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2 px-8 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:justify-between sm:px-12"
        style={{ animationDelay: "1500ms" }}
      >
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-signal" /> 18+ · Modo DEMO · Sin cargos reales
        </span>
        <span className="hidden sm:block">Obsidiana · Cereza · Perla</span>
        <span>Xclusive</span>
      </div>
    </div>
  );
}
