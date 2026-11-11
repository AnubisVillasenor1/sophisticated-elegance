import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

const editorials = [
  {
    image: "/editorial/luz-de-jardin.webp",
    width: 401,
    height: 498,
    alt: "Retrato editorial en exterior con vegetación al fondo",
    title: "Luz de jardín",
    note: "Naturaleza · Editorial",
    size: "sm:col-span-5 sm:row-span-2",
    ratio: "aspect-[4/5] sm:aspect-auto sm:h-full",
    position: "object-[center_26%]",
  },
  {
    image: "/editorial/una-noche-en-marfil.webp",
    width: 415,
    height: 739,
    alt: "Vestido largo en tono marfil en una escena de arquitectura contemporánea",
    title: "Una noche en marfil",
    note: "Siluetas · Noche",
    size: "sm:col-span-7",
    ratio: "aspect-[16/10]",
    position: "object-[center_38%]",
  },
  {
    image: "/editorial/hora-dorada.webp",
    width: 500,
    height: 773,
    alt: "Silueta de moda en negro frente a la luz cálida del atardecer",
    title: "Hora dorada",
    note: "Luz · Textura",
    size: "sm:col-span-4",
    ratio: "aspect-[4/5] sm:aspect-[5/4]",
    position: "object-[center_32%]",
  },
  {
    image: "/editorial/atelier-nocturno.webp",
    width: 500,
    height: 726,
    alt: "Retrato nocturno en vestido negro con iluminación ámbar",
    title: "Atelier nocturno",
    note: "Retrato · Contraste",
    size: "sm:col-span-3",
    ratio: "aspect-[4/5] sm:aspect-[5/4]",
    position: "object-[center_25%]",
  },
];

export function EditorialLookbook() {
  return (
    <section className="border-y border-hairline bg-black/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Selección de temporada · 2026</p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.02] text-pearl sm:text-6xl">
              Un estilo propio.
              <br />
              <em className="text-silver-sheen">Sin pedir permiso.</em>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              La mirada de cada creadora es distinta. Descubre un universo de fotografía, moda y
              narrativa visual curado para el club.
            </p>
          </div>
          <Link
            to="/creadoras"
            className="inline-flex min-h-11 items-center gap-2 self-start border-b border-signal/50 pb-2 text-xs uppercase tracking-[0.16em] text-pearl transition-colors hover:border-signal sm:self-auto"
          >
            Conocer creadoras <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid auto-rows-[minmax(180px,1fr)] grid-cols-1 gap-3 sm:grid-cols-12 sm:auto-rows-[minmax(170px,1fr)] sm:gap-4">
          {editorials.map((item) => (
            <Link
              key={item.title}
              to="/creadoras"
              aria-label={`${item.title}: ${item.note}. Explorar creadoras.`}
              className={`group relative isolate overflow-hidden rounded-xl border border-pearl/10 bg-card ${item.size} ${item.ratio}`}
            >
              <img
                src={item.image}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 size-full object-cover ${item.position} transition-transform duration-1000 ease-out group-hover:scale-[1.04]`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-background/5" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.18em] text-pearl/70">
                    {item.note}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl leading-tight text-pearl sm:text-3xl">
                    {item.title}
                  </h3>
                </div>
                <span className="rounded-full border border-pearl/20 bg-background/30 p-2 text-pearl backdrop-blur transition-colors group-hover:border-signal/70 group-hover:bg-signal/20">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[0.62rem] leading-relaxed text-muted-foreground">
          Selección editorial de referencia. El contenido para adultos permanece deshabilitado.
        </p>
      </div>
    </section>
  );
}
