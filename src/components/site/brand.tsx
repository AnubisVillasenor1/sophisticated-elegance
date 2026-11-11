import { Link } from "@tanstack/react-router";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Marca oficial de Xclusive.
 *
 * Los recortes se generan a partir del arte original (emblema + logotipo).
 * El fondo negro del arte se descarta con `mix-blend-mode: screen`, así el
 * logotipo se integra en cualquier superficie oscura sin halos ni cajas.
 */
const EMBLEM_SRC = "/brand/emblem-512.webp";
const EMBLEM_SRCSET =
  "/brand/emblem-96.webp 96w, /brand/emblem-256.webp 256w, /brand/emblem-512.webp 512w";
const WORDMARK_SRC = "/brand/wordmark-900.webp";
const WORDMARK_SRCSET = "/brand/wordmark-480.webp 480w, /brand/wordmark-900.webp 900w";
const LOCKUP_SRC = "/brand/lockup-600.webp";
const LOCKUP_SRCSET =
  "/brand/lockup-320.webp 320w, /brand/lockup-600.webp 600w, /brand/lockup-1000.webp 1000w";

type ArtProps = {
  className?: string;
  sizes?: string;
  priority?: boolean;
  alt?: string;
};

export function BrandEmblem({ className, sizes = "48px", priority = false, alt = "" }: ArtProps) {
  return (
    <img
      src={EMBLEM_SRC}
      srcSet={EMBLEM_SRCSET}
      sizes={sizes}
      alt={alt}
      width={512}
      height={512}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      draggable={false}
      className={cn("brand-art select-none", className)}
    />
  );
}

export function BrandWordmark({
  className,
  sizes = "160px",
  priority = false,
  alt = "Xclusive",
}: ArtProps) {
  return (
    <img
      src={WORDMARK_SRC}
      srcSet={WORDMARK_SRCSET}
      sizes={sizes}
      alt={alt}
      width={900}
      height={211}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      draggable={false}
      className={cn("brand-art w-auto select-none", className)}
    />
  );
}

/** Logotipo completo (emblema + palabra + lema). Para portada, acceso y cierre. */
export function BrandLockup({
  className,
  sizes = "(max-width: 640px) 70vw, 420px",
  priority = false,
  alt = "Xclusive — Un paraíso prohibido",
}: ArtProps) {
  return (
    <img
      src={LOCKUP_SRC}
      srcSet={LOCKUP_SRCSET}
      sizes={sizes}
      alt={alt}
      width={1000}
      height={957}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      draggable={false}
      className={cn("brand-art h-auto max-w-full select-none", className)}
    />
  );
}

/** Emblema de fondo, decorativo. No debe recibir foco ni leerse como contenido. */
export function BrandWatermark({
  className,
  sizes = "520px",
}: {
  className?: string;
  sizes?: string;
}) {
  return (
    <BrandEmblem
      aria-hidden
      sizes={sizes}
      className={cn("pointer-events-none absolute select-none", className)}
    />
  );
}

export function Logo({
  className,
  showEmblem = true,
  showByline = true,
}: {
  className?: string;
  showEmblem?: boolean;
  showByline?: boolean;
}) {
  const { state } = useApp();
  const brand = state.settings.brandName || "Xclusive";
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${brand}, inicio`}
    >
      {showEmblem ? (
        <BrandEmblem
          priority
          sizes="44px"
          className="h-9 w-9 shrink-0 drop-shadow-[0_0_16px_rgba(244,63,94,0.35)] transition-transform duration-500 group-hover:scale-105 sm:h-11 sm:w-11"
        />
      ) : null}
      <span className="flex flex-col justify-center leading-none">
        <BrandWordmark
          priority
          alt={brand}
          sizes="130px"
          className="h-[20px] transition-opacity duration-500 group-hover:opacity-90 sm:h-[26px]"
        />
        {showByline ? (
          <span className="mt-1.5 hidden text-[0.44rem] uppercase tracking-[0.32em] text-muted-foreground sm:block">
            by TAMV
          </span>
        ) : null}
      </span>
    </Link>
  );
}
