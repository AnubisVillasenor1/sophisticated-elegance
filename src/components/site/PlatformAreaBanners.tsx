import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { btn } from "@/components/lux/ui";

const areas = [
  {
    title: "Perfiles y galerías",
    description: "Descubre creadoras, colecciones y espacios editoriales privados.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_3akt4e3akt4e3akt-c2hkoEoVGiGBHSsJ4rVuTWLOIWkTAp.jpg",
    alt: "Banner Xclusive en negro, rojo y plata que presenta los perfiles, las galerías y sus secciones.",
    href: "/explorar" as const,
    action: "Explorar perfiles",
  },
  {
    title: "Comunidad y monetización",
    description: "Salones, contenido y opciones de membresía para cada comunidad.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_4ew3fa4ew3fa4ew3-KXc3ih54jEe3VNsa92yuSdShCRqzGS.jpg",
    alt: "Banner Xclusive en negro, rojo y plata que presenta la comunidad, el contenido y la monetización.",
    href: "/salones" as const,
    action: "Ver la comunidad",
  },
  {
    title: "Administración y cumplimiento",
    description: "Acceso a la operación de la plataforma y a la información de confianza.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_7e07zq7e07zq7e07-yoyDlRpSvJn7pCTAJlfw3o12ooI2ba.jpg",
    alt: "Banner Xclusive en negro, rojo y plata que presenta las áreas de administración, privacidad, términos y soporte técnico.",
    href: "/admin" as const,
    action: "Ir a administración",
  },
];

export function PlatformAreaBanners() {
  return (
    <section
      aria-labelledby="platform-areas-title"
      className="border-y border-hairline bg-black/15"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <p className="eyebrow text-center">El mapa de Xclusive</p>
        <h2
          id="platform-areas-title"
          className="mt-3 text-center font-serif text-3xl text-pearl sm:text-4xl"
        >
          Entra por el universo que buscas.
        </h2>
        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {areas.map((area) => (
            <article
              key={area.title}
              className="group overflow-hidden rounded-xl border border-hairline bg-card/50 transition-colors hover:border-signal/35"
            >
              <img
                src={area.image}
                alt={area.alt}
                width={1315}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[1.64/1] w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
              />
              <div className="p-5">
                <h3 className="font-serif text-2xl text-pearl">{area.title}</h3>
                <p className="mt-2 min-h-10 text-xs leading-relaxed text-muted-foreground">
                  {area.description}
                </p>
                <Link to={area.href} className={`${btn("secondary", "sm")} mt-4`}>
                  {area.action}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
