import { Play, Pause, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/lux/ui";
import { SHOWCASE_VIDEOS, type VideoAsset } from "@/lib/site-media";
import { cn } from "@/lib/utils";

/**
 * Sala de proyección.
 *
 * Los clips son silenciosos y se reproducen en el momento: en escritorio al
 * pasar el cursor, en móvil al tocar. Nunca se descarga el archivo completo de
 * golpe: `preload="metadata"` y póster optimizado. Si el navegador bloquea la
 * reproducción automática, el póster sigue siendo la pieza visible.
 */
function ReelCard({ asset, className }: { asset: VideoAsset; className?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const node = ref.current;
    if (!node) return;
    const attempt = node.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const pause = () => {
    const node = ref.current;
    if (!node) return;
    node.pause();
    setPlaying(false);
  };

  const toggle = () => {
    if (playing) pause();
    else play();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={pause}
      aria-label={playing ? "Pausar clip" : "Reproducir clip"}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-hairline bg-card text-left outline-none transition-all duration-500 hover:border-signal/40 focus-visible:border-signal/60 focus-visible:ring-2 focus-visible:ring-signal/40",
        className,
      )}
    >
      <video
        ref={ref}
        src={asset.src}
        poster={asset.poster}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden="true"
        className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/25" />
      <span className="absolute left-3 top-3 flex items-center gap-2">
        <Badge tone="dark">
          {playing ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" /> En curso
            </>
          ) : (
            <>
              <Play className="h-3 w-3" /> Clip
            </>
          )}
        </Badge>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-silver backdrop-blur">
          <VolumeX className="h-3 w-3" /> Sin audio
        </span>
      </span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "grid h-14 w-14 place-items-center rounded-full border border-white/25 bg-black/45 text-pearl backdrop-blur-md transition-all duration-300",
            playing ? "scale-90 opacity-0" : "opacity-100 group-hover:scale-105",
          )}
        >
          <Play className="ml-0.5 h-5 w-5" />
        </span>
      </span>
      <span className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <span className="text-[0.62rem] uppercase tracking-[0.2em] text-silver/85">
          {asset.orientation === "portrait" ? "Vertical 9:16" : "Horizontal 16:9"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.62rem] text-silver/85">
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pausar" : "Reproducir"}
        </span>
      </span>
    </button>
  );
}

export function VideoReel({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {SHOWCASE_VIDEOS.map((asset) => (
          <ReelCard key={asset.src} asset={asset} className="aspect-[4/5]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <ReelCard
        asset={SHOWCASE_VIDEOS[0]!}
        className="aspect-[4/5] lg:col-span-5 lg:aspect-auto lg:min-h-[460px]"
      />
      <div className="grid gap-4 lg:col-span-7">
        <ReelCard
          asset={SHOWCASE_VIDEOS[1]!}
          className="aspect-video lg:aspect-auto lg:min-h-[260px]"
        />
        <ReelCard
          asset={SHOWCASE_VIDEOS[2]!}
          className="aspect-video lg:aspect-auto lg:min-h-[180px]"
        />
      </div>
    </div>
  );
}
