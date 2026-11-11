import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react";

import { LEGAL_STATUS } from "@/lib/legal";
import { useApp } from "@/lib/store";
import { Badge, DemoBadge } from "@/components/lux/ui";
import { Logo } from "./brand";

const columns = [
  {
    title: "Plataforma",
    links: [
      { to: "/explorar", label: "Explorar creadoras" },
      { to: "/clips", label: "Marketplace de clips" },
      { to: "/salones", label: "Salones en vivo" },
      { to: "/boveda", label: "Mi bóveda" },
      { to: "/ecosistema", label: "Ecosistema" },
    ],
  },
  {
    title: "Creadoras",
    links: [
      { to: "/estudio", label: "Estudio" },
      { to: "/registro", label: "Solicitar perfil" },
      { doc: "contrato-creadoras", label: "Contrato de creadoras" },
      { doc: "comisiones", label: "Comisiones" },
      { doc: "aceptacion", label: "Aceptación y consentimiento" },
    ],
  },
  {
    title: "Confianza",
    links: [
      { doc: "terminos", label: "Términos" },
      { doc: "privacidad", label: "Privacidad" },
      { doc: "cookies", label: "Cookies" },
      { doc: "contenido", label: "Contenido y moderación" },
      { doc: "demo", label: "Modo DEMO" },
    ],
  },
] as const;

export function SiteFooter() {
  const { state } = useApp();
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-black/20">
      <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-ember opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo showEmblem={false} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {state.settings.tagline}. Club privado editorial para creadoras independientes y sus
              comunidades más cercanas.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="success">
                <ShieldCheck className="h-3 w-3" /> Solo 18+
              </Badge>
              <DemoBadge>Modo DEMO</DemoBadge>
            </div>
            <p className="mt-5 text-[0.68rem] leading-relaxed text-muted-foreground/80">
              Sin cargos reales. Sin saldos retirables. Contenido adulto deshabilitado hasta
              completar verificación especializada y revisión legal.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"doc" in link ? (
                      <Link
                        to="/legal/$doc"
                        params={{ doc: link.doc }}
                        className="inline-flex items-center gap-1 text-[0.78rem] text-muted-foreground transition-colors hover:text-pearl"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <Link
                        to={link.to}
                        className="inline-flex items-center gap-1 text-[0.78rem] text-muted-foreground transition-colors hover:text-pearl"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <p className="eyebrow">Contacto</p>
            <ul className="mt-4 space-y-3 text-[0.78rem] text-muted-foreground">
              <li>
                <a
                  href={`mailto:${state.settings.supportEmail}`}
                  className="inline-flex items-center gap-2 hover:text-pearl"
                >
                  <Mail className="h-3.5 w-3.5" /> Soporte
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${state.settings.privacyEmail}`}
                  className="inline-flex items-center gap-2 hover:text-pearl"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Privacidad
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${state.settings.legalEmail}`}
                  className="inline-flex items-center gap-2 hover:text-pearl"
                >
                  <Mail className="h-3.5 w-3.5" /> Legal y contratos
                </a>
              </li>
              <li className="break-all font-mono text-[0.65rem] text-muted-foreground/70">
                {state.settings.domain}
              </li>
              <li>
                <Link to="/ayuda" className="inline-flex items-center gap-2 hover:text-pearl">
                  <ArrowUpRight className="h-3.5 w-3.5" /> Centro de ayuda
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-hairline pt-6 text-[0.66rem] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 TAMV Online Network · {state.settings.brandName}. Todos los derechos reservados.
          </p>
          <p className="max-w-2xl md:text-right">
            <Link to="/legal" className="underline-offset-4 hover:text-pearl hover:underline">
              Marco legal
            </Link>{" "}
            · {LEGAL_STATUS}. Documentos versión {state.settings.termsVersion}. No constituyen
            asesoría legal ni una oferta de cobro.
          </p>
        </div>
      </div>
    </footer>
  );
}
