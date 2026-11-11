import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Layers, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge, SectionHeading, btn } from "@/components/lux/ui";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import {
  CAPABILITIES,
  CAPABILITY_CATEGORIES,
  ECOSYSTEM_PRINCIPLES,
  type CapabilityCategory,
} from "@/lib/platforms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecosistema")({
  head: () => ({
    meta: [
      { title: "Ecosistema — Xclusive" },
      {
        name: "description",
        content:
          "Las capacidades de Xclusive: membresías, contenido a la carta, salones en vivo, mensajes, encargos y bóveda bajo un mismo régimen de consentimiento y comisiones visibles.",
      },
    ],
  }),
  component: EcosystemPage,
});

type Filter = "Todas" | CapabilityCategory;

function EcosystemPage() {
  const [filter, setFilter] = useState<Filter>("Todas");
  const capabilities =
    filter === "Todas" ? CAPABILITIES : CAPABILITIES.filter((c) => c.category === filter);
  const filters: Filter[] = ["Todas", ...CAPABILITY_CATEGORIES];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Arquitectura del producto"
        title={
          <>
            Todas las piezas.
            <br />
            <em className="text-silver-sheen">Un solo libro de ingresos.</em>
          </>
        }
        description="Xclusive reúne membresías, contenido a la carta, salones en vivo, mensajes y encargos en una misma cuenta, sometidos a un régimen único de consentimiento, comisiones visibles y control de la creadora."
        aside={
          <div className="rounded-xl border border-hairline bg-background/60 p-5 backdrop-blur">
            <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              <Layers className="h-3.5 w-3.5" /> Capacidades
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Suscripciones", "Tiers"],
                ["PPV", "Mensajes"],
                ["Clips", "Catálogo"],
                ["Live", "Propinas"],
                ["Encargos", "Paquetes"],
                ["Bóveda", "Estudio"],
              ].map(([a, b]) => (
                <div key={a}>
                  <p className="font-serif text-xl text-pearl">{a}</p>
                  <p className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section
        data-tour="ecosystem-capabilities"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14"
      >
        <div className="flex flex-wrap gap-1.5">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.66rem] transition-colors",
                filter === item
                  ? "border-signal bg-signal/15 text-pearl"
                  : "border-hairline text-muted-foreground hover:text-pearl",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {capabilities.map((capability) => (
            <article
              key={capability.id}
              className="rounded-xl border border-hairline bg-card/40 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-2xl text-pearl">{capability.name}</h2>
                    <Badge tone="outline">{capability.category}</Badge>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {capability.summary}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Qué incluye
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {capability.features.map((item) => (
                      <li key={item} className="flex gap-2 text-xs leading-relaxed text-silver">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-signal" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Dónde vive en Xclusive
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {capability.surfaces.map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-hairline bg-black/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
          <SectionHeading
            eyebrow="Principios"
            title={<>Lo que sostiene el conjunto.</>}
            description="No se trata de sumar funciones, sino de subordinarlas a un mismo estándar de confianza y trazabilidad."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_PRINCIPLES.map((principle) => (
              <div
                key={principle.title}
                className="rounded-xl border border-hairline bg-white/[0.02] p-5"
              >
                <Sparkles className="h-4 w-4 text-signal" />
                <p className="mt-3 text-sm text-pearl">{principle.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-5 rounded-xl border border-signal/25 bg-signal/5 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-2xl text-pearl">Recorre el producto completo.</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Crea tu cuenta y navega membresías, clips, salones y bóveda. Sin tarjeta ni cargos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/registro" className={btn("primary", "md")}>
              Crear cuenta <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/explorar" className={btn("secondary", "md")}>
              Explorar
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
