import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Cookie,
  CreditCard,
  FileText,
  LifeBuoy,
  Lock,
  Mail,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { Badge, SectionHeading, btn } from "@/components/lux/ui";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/ayuda")({
  head: () => ({
    meta: [
      { title: "Centro de ayuda — Xclusive" },
      {
        name: "description",
        content:
          "Preguntas frecuentes, derechos ARCO, cancelación, PROFECO y contacto del prototipo Xclusive.",
      },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "¿Xclusive ya cobra dinero real?",
    a: "No. Todo el prototipo opera en Modo DEMO. Las suscripciones, propinas, compras, boletos y retiros son simulaciones. No hay pasarela de pagos conectada, no se solicita tarjeta y no se generan saldos retirables ni obligaciones de pago.",
  },
  {
    q: "¿Dónde se guardan mis datos?",
    a: "En este prototipo, los datos se guardan en localStorage de tu navegador. No se envían a un servidor. Puedes exportarlos o eliminarlos desde Mi cuenta. En producción se migrarán a una base de datos con control de acceso, cifrado y auditoría.",
  },
  {
    q: "¿Cómo cancelo una membresía?",
    a: "Desde Mi cuenta → Membresías, con un clic. La cancelación impide renovaciones futuras, no genera penalización y conserva el acceso hasta el cierre del periodo ya pagado. Si consideras que tus derechos fueron vulnerados, puedes acudir a PROFECO.",
  },
  {
    q: "¿Cómo ejerzo mis derechos ARCO?",
    a: "Desde Mi cuenta → Legal y privacidad puedes enviar una solicitud de Acceso, Rectificación, Cancelación u Oposición. El plazo máximo para informar si procede es de 20 días hábiles; si procede, se hace efectivo en 15 días hábiles. También puedes escribir a privacidad@tamvonline.network.",
  },
  {
    q: "¿Por qué el contenido adulto está deshabilitado?",
    a: "Porque aún no se completa la verificación de edad con proveedor especializado, el consentimiento documentado, la moderación con apelación, la revisión legal y la aprobación del PSP. La normativa mexicana exige mecanismos confiables que no se limiten a autodeclaración.",
  },
  {
    q: "¿Cómo se calculan las comisiones?",
    a: "Antes de confirmar una compra se muestra precio bruto, comisión de Xclusive, comisión estimada del PSP, impuestos aplicables, total y neto estimado para la creadora. Las comisiones son referenciales en DEMO y deben constar en el contrato antes de cobrar.",
  },
  {
    q: "¿Qué pasa si reporto contenido?",
    a: "El reporte recibe un identificador y un estado. El equipo de confianza y seguridad lo revisa, puede ocultar o eliminar contenido y documenta la decisión. La persona afectada puede solicitar revisión mediante el proceso de apelación de la Política de Contenido.",
  },
  {
    q: "¿Puedo compartir mi cuenta o mi membresía?",
    a: "No. El acceso es personal, intransferible y vinculado a tu cuenta. Compartir credenciales, revender membresías, crear cuentas múltiples para evadir límites o eludir controles de seguridad puede provocar la suspensión.",
  },
];

function HelpPage() {
  const { state } = useApp();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Centro de ayuda"
        title={
          <>
            Respuestas claras.
            <br />
            <em className="text-silver-sheen">Sin letra pequeña.</em>
          </>
        }
        description="Todo lo que necesitas saber sobre el prototipo, tus derechos, la cancelación y el estado real de cada función."
        aside={
          <div className="rounded-xl border border-hairline bg-background/60 p-5 backdrop-blur">
            <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              <LifeBuoy className="h-3.5 w-3.5" /> Contacto directo
            </p>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <a
                  href={`mailto:${state.settings.supportEmail}`}
                  className="inline-flex items-center gap-2 text-silver hover:text-pearl"
                >
                  <Mail className="h-3.5 w-3.5" /> {state.settings.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${state.settings.privacyEmail}`}
                  className="inline-flex items-center gap-2 text-silver hover:text-pearl"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> {state.settings.privacyEmail}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> Documentos versión{" "}
                {state.settings.termsVersion}
              </li>
            </ul>
            <Link
              to="/legal/$doc"
              params={{ doc: "demo" }}
              className={`${btn("secondary", "sm")} mt-4 w-full`}
            >
              Estado de cumplimiento <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <CreditCard className="h-4 w-4" />,
              title: "Pagos y DEMO",
              body: "Sin cargos reales. Desglose de comisiones antes de confirmar.",
              to: "/legal/demo",
            },
            {
              icon: <UserCog className="h-4 w-4" />,
              title: "Mi cuenta",
              body: "Membresías, compras, bóveda y notificaciones.",
              to: "/cuenta",
            },
            {
              icon: <Lock className="h-4 w-4" />,
              title: "Privacidad y ARCO",
              body: "Datos tratados, plazos y solicitudes.",
              to: "/legal/privacidad",
            },
            {
              icon: <Cookie className="h-4 w-4" />,
              title: "Cookies",
              body: "Preferencias y control desde tu cuenta.",
              to: "/legal/cookies",
            },
          ].map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-xl border border-hairline bg-card/40 p-5 transition-colors hover:border-signal/30"
            >
              <span className="text-signal">{item.icon}</span>
              <p className="mt-3 text-sm text-pearl">{item.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
            </Link>
          ))}
        </div>

        <SectionHeading
          className="mt-14"
          eyebrow="Preguntas frecuentes"
          title={<>Lo que más nos preguntan.</>}
        />
        <div className="mt-6 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-card/30">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-5 py-4 open:bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-pearl">
                {item.q}
                <span className="text-silver transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-hairline bg-card/40 p-5">
            <Badge tone="info">Cancelación</Badge>
            <p className="mt-3 font-serif text-2xl text-pearl">Cancelar es un clic.</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Desde tu cuenta, en el mismo medio o con un mecanismo igual o más sencillo. Sin
              penalización. Si no puedes cancelar directamente, PROFECO puede intervenir.
            </p>
            <Link
              to="/legal/$doc"
              params={{ doc: "cancelacion" }}
              className="mt-4 inline-flex items-center gap-1 text-[0.68rem] text-pearl underline-offset-4 hover:underline"
            >
              Ver política <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-xl border border-hairline bg-card/40 p-5">
            <Badge tone="warning">PROFECO</Badge>
            <p className="mt-3 font-serif text-2xl text-pearl">Si algo no se resolvió.</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Puedes acudir a una ODECO, usar Concilianet o Conciliaexprés. Lleva identificación,
              comprobante, descripción del servicio y narración de hechos.
            </p>
            <a
              href="https://www.gob.mx/profeco"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-[0.68rem] text-pearl underline-offset-4 hover:underline"
            >
              Sitio de PROFECO <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <div className="rounded-xl border border-hairline bg-card/40 p-5">
            <Badge tone="success">Transparencia</Badge>
            <p className="mt-3 font-serif text-2xl text-pearl">Qué existe y qué no.</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              El documento de Estado DEMO enumera con precisión las funciones operativas, las
              simuladas y la ruta mínima a producción antes de cobrar.
            </p>
            <Link
              to="/legal/$doc"
              params={{ doc: "demo" }}
              className="mt-4 inline-flex items-center gap-1 text-[0.68rem] text-pearl underline-offset-4 hover:underline"
            >
              Leer estado DEMO <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
