import { Link } from "@tanstack/react-router";
import emblem from "@/assets/xclusive_emblem.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showEmblem = true,
}: {
  className?: string;
  showEmblem?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Xclusive, inicio"
    >
      {showEmblem ? (
        <img
          src={emblem.url}
          alt=""
          aria-hidden
          className="h-7 w-auto mix-blend-screen opacity-90 transition-opacity group-hover:opacity-100"
        />
      ) : null}
      <span className="flex flex-col leading-none">
        <span className="font-serif text-2xl tracking-tight text-silver-sheen">Xclusive</span>
        <span className="mt-0.5 text-[0.48rem] uppercase tracking-[0.34em] text-muted-foreground">
          by TAMV
        </span>
      </span>
    </Link>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif text-lg text-pearl", className)}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-signal/40 bg-signal/10 text-signal">
        X
      </span>
      Xclusive
    </span>
  );
}
