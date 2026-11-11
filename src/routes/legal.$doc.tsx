import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, FileText, Printer, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, Button, DemoBadge, btn } from "@/components/lux/ui";
import { BrandWatermark, BrandWordmark } from "@/components/site/brand";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LEGAL_DOCS, legalDoc } from "@/lib/legal";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/legal/$doc")({
  head: ({ params }) => {
    const doc = legalDoc(params.doc);
    return {
      meta: [
        { title: `${doc?.title ?? "Documento legal"} — Xclusive` },
        { name: "description", content: doc?.short ?? "Documento legal del prototipo Xclusive." },
      ],
    };
  },
  component: LegalDocPage,
});

function LegalDocPage() {
  const { doc: docId } = Route.useParams();
  const { user, acceptLegal } = useApp();
  const doc = legalDoc(docId);
  const [expanded, setExpanded] = useState<string | null>(doc?.sections[0]?.id ?? null);

  if (!doc) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="eyebrow">Documento no encontrado</p>
          <h1 className="mt-4 font-serif text-5xl text-pearl">Este documento no existe.</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Consulta el centro legal para ver todos los documentos disponibles.
          </p>
          <Link to="/legal" className={cn(btn("primary", "md"), "mt-8")}>
            <ArrowLeft className="h-4 w-4" /> Centro legal
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const accepted = user?.legalAcceptances.find((a) => a.docId === doc.id);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/legal" className={btn("ghost", "sm")}>
            <ArrowLeft className="h-3.5 w-3.5" /> Centro legal
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="outline">Versión {doc.version}</Badge>
            <Badge tone="warning">{doc.status}</Badge>
            <DemoBadge>Borrador</DemoBadge>
            <button type="button" onClick={() => window.print()} className={btn("secondary", "sm")}>
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* TOC */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 rounded-xl border border-hairline bg-card/40 p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                Contenido
              </p>
              <nav className="mt-3 space-y-1">
                {doc.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-1.5 text-[0.72rem] leading-snug text-muted-foreground transition-colors hover:bg-white/5 hover:text-pearl"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="mt-4 border-t border-hairline pt-4">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Otros documentos
                </p>
                <div className="mt-2 space-y-1">
                  {LEGAL_DOCS.filter((d) => d.id !== doc.id)
                    .slice(0, 6)
                    .map((d) => (
                      <Link
                        key={d.id}
                        to="/legal/$doc"
                        params={{ doc: d.id }}
                        className="block truncate text-[0.68rem] text-muted-foreground hover:text-pearl"
                      >
                        {d.title}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Document */}
          <article className="lg:col-span-9">
            <div className="relative overflow-hidden rounded-xl border border-hairline bg-card/30 p-6 sm:p-9">
              <BrandWatermark sizes="320px" className="-right-14 -top-14 w-52 opacity-[0.06]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <BrandWordmark sizes="160px" priority className="mb-4 h-[18px]" />
                  <p className="eyebrow">Xclusive by TAMV Online Network</p>
                  <h1 className="mt-3 font-serif text-4xl leading-tight text-pearl sm:text-5xl">
                    {doc.title}
                  </h1>
                </div>
                <span className="hidden rounded-full border border-hairline p-3 text-silver sm:block">
                  <FileText className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="outline">Versión {doc.version}</Badge>
                <Badge tone="outline">{doc.readingMin} min de lectura</Badge>
                <Badge tone="warning">{doc.status}</Badge>
              </div>
              <p className="mt-6 border-l-2 border-signal/50 pl-4 text-sm italic leading-relaxed text-silver">
                {doc.preamble}
              </p>

              <div className="legal-prose mt-8">
                {doc.sections.map((section, index) => {
                  const isOpen = expanded === section.id || index === 0;
                  return (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-28 border-t border-hairline py-6 first:border-0 first:pt-0"
                    >
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen && index !== 0 ? null : section.id)}
                        className="flex w-full items-center justify-between gap-4 text-left"
                      >
                        <h2 className="font-serif text-2xl text-pearl">{section.title}</h2>
                        <span className="text-silver">{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen ? (
                        <div className="mt-3">
                          {section.paragraphs.map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                          {section.bullets ? (
                            <ul>
                              {section.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                          {section.table ? (
                            <div className="mt-4 overflow-x-auto rounded-lg border border-hairline">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-white/[0.04]">
                                  <tr>
                                    {section.table.headers.map((header) => (
                                      <th key={header} className="px-3 py-2 font-medium text-pearl">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {section.table.rows.map((row) => (
                                    <tr key={row.join("-")} className="border-t border-hairline">
                                      {row.map((cell) => (
                                        <td key={cell} className="px-3 py-2 text-muted-foreground">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>

              <div className="mt-8 rounded-xl border border-warning/25 bg-warning/5 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-warning">
                  <ShieldCheck className="h-3.5 w-3.5" /> Documento preliminar
                </p>
                <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">
                  Requiere revisión legal, fiscal, de protección de datos y de cumplimiento antes de
                  su publicación o de habilitar cobros reales. No constituye asesoría legal ni una
                  oferta vinculante.
                </p>
              </div>
            </div>

            {user ? (
              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-hairline bg-card/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-pearl">
                    {accepted ? "Aceptación registrada" : "Registrar aceptación"}
                  </p>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-muted-foreground">
                    {accepted
                      ? `Aceptado el ${new Date(accepted.acceptedAt).toLocaleDateString("es-MX")} · canal ${accepted.channel} · hash ${accepted.hash.slice(0, 12)}…`
                      : "Se guardará documento, versión, fecha, cuenta, canal y hash de demostración."}
                  </p>
                </div>
                <Button
                  variant={accepted ? "secondary" : "primary"}
                  disabled={Boolean(accepted && accepted.docVersion === doc.version)}
                  onClick={() => {
                    const result = acceptLegal([doc.id]);
                    toast(result.message);
                  }}
                >
                  <Check className="h-4 w-4" /> {accepted ? "Aceptado" : "Aceptar documento"}
                </Button>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-hairline bg-card/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Inicia sesión para registrar tu aceptación de este documento.
                </p>
                <Link to="/entrar" className={btn("primary", "sm")}>
                  Iniciar sesión
                </Link>
              </div>
            )}
          </article>
        </div>
      </div>
    </SiteLayout>
  );
}
