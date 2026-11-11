import { ArrowDown } from "lucide-react";

const heroImage = "/editorial/hero.webp";

export function HeroEditorial() {
  return (
    <figure className="group relative mx-auto w-[min(84vw,420px)]">
      <div className="absolute -inset-5 rounded-full bg-ember opacity-80 blur-2xl" />
      <div className="relative overflow-hidden rounded-t-[48%] rounded-b-xl border border-pearl/15 bg-card shadow-deep">
        <img
          src={heroImage}
          alt="Retrato editorial en un pasillo bañado de luz natural"
          width={719}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="aspect-[4/5] w-full object-cover object-[center_28%] transition-transform duration-1000 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/10" />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
          <span className="text-[0.56rem] uppercase tracking-[0.28em] text-pearl/80">
            Xclusive · Editorial 01
          </span>
          <span className="rounded-full border border-pearl/20 bg-background/40 px-2.5 py-1 font-mono text-[0.55rem] text-pearl/80 backdrop-blur">
            01
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
