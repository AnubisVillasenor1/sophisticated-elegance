import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FileText, Printer, ShieldCheck } from "lucide-react";

import { Badge, DemoBadge, SectionHeading, btn } from "@/components/lux/ui";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import {
  LEGAL_CONTACT,
  LEGAL_DOCS,
  LEGAL_GROUPS,
  LEGAL_STATUS,
  LEGAL_UPDATED,
  LEGAL_VERSION,
} from "@/lib/legal";
import { BRAND_BANNERS } from "@/lib/site-media";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title: "Centro legal — Xclusive" },
      {
        name: "description",
        content:
          "Términos, privacidad, cookies, contrato de creadoras, comisiones, cancelación y política de contenido de Xclusive.",
      },
    ],
  }),
  component: LegalIndexPage,
});

function LegalIndexPage() {
  return (
    <SiteLayout>
      <PageHero
        image={BRAND_BANNERS.admin}
        eyebrow="Centro legal"
        title={
          <>
            Todo lo que aceptas,
            <br />
            <em className="text-silver-sheen">en un solo lugar.</em>
          </>
        }
        description="Documentos consolidados del prototipo, con versión, estado y lectura estimada. Cada aceptación se registra con documento, versión, fecha, canal y hash."
        aside={
          <div className="rounded-xl border border-warning/25 bg-warning/5 p-5">
            <p className="flex items-center gap-2 text-sm text-warning">
              <ShieldCheck className="h-4 w-4" /> Estado de los documentos
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{LEGAL_STATUS}.</p>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              Versión {LEGAL_VERSION} · Actualizado {LEGAL_UPDATED}
            </p>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEGAL_GROUPS.map((group) => (
            <div key={group.title} className="rounded-xl border border-hairline bg-card/40 p-5">
              <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {group.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {group.description}
              </p>
              <ul className="mt-4 space-y-2">
                {group.ids.map((id) => {
                  const doc = LEGAL_DOCS.find((d) => d.id === id);
                  if (!doc) return null;
                  return (
                    <li key={id}>
                      <Link
                        to="/legal/$doc"
                        params={{ doc: id }}
                        className="group flex items-center justify-between gap-2 rounded-lg border border-hairline bg-white/[0.02] px-3 py-2.5 text-xs text-pearl transition-colors hover:border-signal/30"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-silver" /> {doc.title}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-pearl" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <SectionHeading
          className="mt-14"
          eyebrow="Documentos completos"
          title={<>Versión consolidada.</>}
          description="Cada documento es consultable, imprimible y registra su propia versión."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LEGAL_DOCS.map((doc) => (
            <Link
              key={doc.id}
              to="/legal/$doc"
              params={{ doc: doc.id }}
              className="group flex flex-col rounded-xl border border-hairline bg-card/40 p-5 transition-all hover:-translate-y-0.5 hover:border-signal/30"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone="outline">{doc.version}</Badge>
                <span className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {doc.readingMin} min
                </span>
              </div>
              <p className="mt-3 font-serif text-2xl leading-tight text-pearl">{doc.title}</p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                {doc.short}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.16em] text-silver group-hover:text-pearl">
                Leer documento <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-hairline bg-white/[0.02] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-pearl">Contacto legal y de privacidad</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {LEGAL_CONTACT.legal} · {LEGAL_CONTACT.privacy} · {LEGAL_CONTACT.address}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <DemoBadge>Documentos de prototipo</DemoBadge>
              <button
                type="button"
                onClick={() => window.print()}
                className={btn("secondary", "sm")}
              >
                <Printer className="h-3.5 w-3.5" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
