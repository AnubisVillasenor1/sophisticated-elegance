import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HERO_VIDEO } from "@/lib/site-media";

/**
 * Portada editorial.
 *
 * El video sustituye a la fotografía fija cuando el navegador puede
 * reproducirlo. Reglas:
 *  - silencioso, en bucle y `playsInline` para que el móvil no lo abra a pantalla
 *    completa;
 *  - `preload="metadata"` y póster optimizado para no gastar datos de más;
 *  - si se prefiere menos movimiento o el ahorro de datos está activo, se queda
 *    el póster: nunca se fuerza la animación.
 */
export function HeroEditorial() {
  const [animate, setAnimate] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData =
      "connection" in navigator &&
      Boolean((navigator.connection as { saveData?: boolean } | undefined)?.saveData);
    const update = () => setAnimate(!reduced.matches && !saveData);
    update();
    reduced.addEventListener?.("change", update);
    return () => reduced.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    if (!animate) {
      node.pause();
      return;
    }
    const attempt = node.play();
    if (attempt && typeof attempt.catch === "function") attempt.catch(() => undefined);
  }, [animate]);

  return (
    <figure className="group relative mx-auto w-[min(84vw,420px)]">
      <div className="absolute -inset-5 rounded-full bg-ember opacity-80 blur-2xl" />
      <div className="relative overflow-hidden rounded-t-[48%] rounded-b-xl border border-pearl/15 bg-card shadow-deep">
        <video
          ref={videoRef}
          src={HERO_VIDEO.src}
          poster={HERO_VIDEO.poster}
          aria-label={HERO_VIDEO.alt}
          muted
          loop
          playsInline
          autoPlay={animate}
          preload="metadata"
          disablePictureInPicture
          controls={false}
          className="aspect-[4/5] w-full object-cover object-[center_28%] transition-transform duration-1000 group-hover:scale-[1.025]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/10" />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
          <span className="text-[0.56rem] uppercase tracking-[0.28em] text-pearl/80">
            Xclusive · Editorial 01
          </span>
          <span className="rounded-full border border-pearl/20 bg-background/40 px-2.5 py-1 font-mono text-[0.55rem] text-pearl/80 backdrop-blur">
            {animate ? "FILM" : "01"}
          </span>
        </div>
        <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.2em] text-silver/80">
              Obsidiana · Cereza · Perla
            </p>
            <p className="mt-1 font-serif text-2xl text-pearl">La presencia lo cambia todo.</p>
          </div>
          <ArrowDown aria-hidden="true" className="mb-1 size-4 shrink-0 text-pearl/70" />
        </figcaption>
      </div>
    </figure>
  );
}
