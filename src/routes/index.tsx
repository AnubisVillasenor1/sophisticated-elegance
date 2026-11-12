import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookMarked,
  Check,
  Cookie,
  Fingerprint,
  Radio,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import portrait from "@/assets/editorial_portrait.jpg";
import { CreatorCard, LiveCard } from "@/components/lux/cards";
import { Badge, Button, DemoBadge, Divider, SectionHeading, btn } from "@/components/lux/ui";
import { SiteLayout } from "@/components/site/SiteLayout";
import { VideoReel } from "@/components/site/VideoReel";
import { BrandWatermark } from "@/components/site/brand";
import { EditorialLookbook } from "@/components/site/EditorialLookbook";
import { HeroEditorial } from "@/components/site/HeroEditorial";
import { PlatformAreaBanners } from "@/components/site/PlatformAreaBanners";
import { demoMode } from "@/lib/auth/demo-accounts";
import { formatNumber } from "@/lib/format";
import { BASE_TIER_PRICES_MXN, tierPriceLabel } from "@/lib/pricing";
import { CAPABILITIES, ECOSYSTEM_PRINCIPLES } from "@/lib/platforms";
import { useApp } from "@/lib/store";
import { liveNow, topCreators } from "@/lib/selectors";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Xclusive — Un paraíso prohibido · Club privado de creadoras" },
      {
        name: "description",
        content:
          "Xclusive by TAMV Online Network: club privado editorial para creadoras independientes. Membresías, salones en vivo y bóveda protegida en Modo DEMO.",
      },
      { property: "og:title", content: "Xclusive — Un paraíso prohibido" },
      {
        property: "og:description",
        content: "Un club privado editorial para creadoras y sus comunidades más cercanas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { state, user } = useApp();
  const creators = topCreators(state, 6);
  const lives = state.settings.liveEnabled ? liveNow(state).slice(0, 3) : [];
  const totalMembers = state.creators.reduce((sum, c) => sum + c.members, 0);

  return (
    <SiteLayout>
      {/* Hero */}
      <section
        data-tour="home-hero"
        className="grain relative flex min-h-[100svh] items-center overflow-hidden pt-10"
      >
        <div className="pointer-events-none absolute inset-0 aura" />
        <div className="pointer-events-none absolute inset-0 bg-ember animate-breathe" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-veil" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-10">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <DemoBadge>Lanzamiento privado · Simulación segura</DemoBadge>
              <Badge tone="success">
                <ShieldCheck className="h-3 w-3" /> Solo 18+
              </Badge>
            </div>
            <h1 className="mt-7 font-serif text-5xl leading-[0.94] text-pearl sm:text-7xl lg:text-8xl">
              Lo que se revela
              <br />
              <em className="text-silver-sheen">a pocos</em>, se recuerda siempre.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Un club privado donde cada creadora decide quién entra, qué se muestra y cuánto vale
              su cercanía. Membresías, contenido a la carta, salones y bóveda bajo un mismo techo.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/registro" className={btn("primary", "lg")}>
                Solicitar invitación <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/explorar" className={btn("secondary", "lg")}>
                Explorar el club
              </Link>
              <Link to="/ecosistema" className={btn("ghost", "lg")}>
                Ver el ecosistema <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-hairline pt-6 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> {formatNumber(totalMembers)} miembros
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5" /> {state.creators.length} creadoras
              </span>
              <span className="inline-flex items-center gap-2">
                <Fingerprint className="h-3.5 w-3.5" /> Un solo libro de ingresos
              </span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <HeroEditorial />
            <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-2">
              <div className="rounded-xl border border-hairline bg-background/60 p-3 backdrop-blur">
                <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Modo
                </p>
                <p className="mt-1 font-serif text-xl text-pearl">DEMO seguro</p>
              </div>
              <div className="rounded-xl border border-hairline bg-background/60 p-3 backdrop-blur">
                <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Contenido
                </p>
                <p className="mt-1 font-serif text-xl text-pearl">Editorial</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto marquee */}
      <section className="border-y border-hairline py-6">
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
            {[
              "Consentimiento",
              "Curaduría",
              "Privacidad",
              "Cercanía",
              "Control",
              "Arte",
              "Confianza",
              "Verificación",
              "Transparencia",
            ]
              .concat([
                "Consentimiento",
                "Curaduría",
                "Privacidad",
                "Cercanía",
                "Control",
                "Arte",
                "Confianza",
                "Verificación",
                "Transparencia",
              ])
              .map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="flex items-center gap-16 font-serif text-3xl italic text-silver/70"
                >
                  {word}
                  <span className="h-1.5 w-1.5 rotate-45 bg-signal/70" />
                </span>
              ))}
          </div>
        </div>
      </section>

      <EditorialLookbook />

      {/* Story / proof */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-28">
        <div className="lg:col-span-5">
          <figure className="group relative overflow-hidden rounded-xl shadow-deep">
            <img
              src={portrait}
              alt="Retrato editorial en penumbra con luz cereza"
              width={1024}
              height={1408}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
              <div>
                <p className="font-serif text-2xl text-pearl">Valentina R.</p>
                <p className="text-xs text-muted-foreground">Fotografía · Ciudad de México</p>
              </div>
              <Badge tone="dark">Perfil editorial</Badge>
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          <p className="eyebrow">I — El paraíso prohibido</p>
          <h2 className="mt-5 font-serif text-4xl leading-[1.02] text-pearl sm:text-6xl">
            No es una plataforma.
            <br />
            <em className="text-silver/80">Es una puerta que se cierra detrás de ti.</em>
          </h2>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Xclusive nace como un jardín secreto: cada creadora cultiva su propio santuario y elige
            a quién entrega la llave. La estética es de club privado; la arquitectura, de bóveda.
          </p>
          <ul className="mt-8 grid gap-3">
            {[
              "Membresías de tres niveles configuradas por cada creadora.",
              "Contenido protegido con acceso personal e intransferible.",
              "Comisiones visibles antes de confirmar cualquier compra.",
              "Aceptación legal registrada con versión, fecha y hash.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-silver">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" /> {item}
              </li>
            ))}
          </ul>
          <div className="mt-9 grid grid-cols-3 gap-4 border-t border-hairline pt-7">
            {[
              ["03", "niveles por creadora"],
              ["100%", "consentimiento documentado"],
              ["0", "cargos reales en DEMO"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-serif text-3xl text-pearl">{value}</p>
                <p className="mt-1 text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live now */}
      {lives.length > 0 ? (
        <section className="border-y border-hairline bg-black/15">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
            <SectionHeading
              eyebrow="II — Salones abiertos"
              title={<>Ahora mismo, puertas entreabiertas.</>}
              description="Salas en vivo con cupo limitado. Entra, escucha y participa. En Modo DEMO la transmisión es una simulación editorial."
              action={
                <Link to="/salones" className={btn("secondary", "md")}>
                  Ver todos los salones <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {lives.map(({ creator, room }) => (
                <LiveCard key={room.id} room={room} creator={creator} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Featured creators */}
      <section
        data-tour="home-creators"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
      >
        <SectionHeading
          eyebrow="III — El elenco"
          title={<>Diez universos. Una misma llave.</>}
          description="Fotografía, cosplay, fitness, música, arte, editorial europeo y una creadora híbrida con IA declarada. Cada perfil con su propio tono y sus propias reglas."
          action={
            <Link to="/creadoras" className={btn("secondary", "md")}>
              Directorio completo <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Membership levels */}
      <section
        data-tour="home-memberships"
        className="relative overflow-hidden border-y border-hairline bg-gradient-to-b from-cherry/30 to-background"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.22]"
          style={{ backgroundImage: "url('/covers/boveda.webp')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <SectionHeading
            align="center"
            eyebrow="IV — Membresías"
            title={<>Tres llaves. Ninguna letra pequeña.</>}
            description="Cada creadora define el precio y los beneficios. Xclusive solo comunica como activas las funciones implementadas y probadas."
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
            {[
              {
                level: "I",
                name: "Insider",
                price: tierPriceLabel(BASE_TIER_PRICES_MXN[0]),
                description: "La primera llave.",
                perks: [
                  "Feed editorial",
                  "Mensajes con moderación",
                  "Avisos de salones",
                  "Acceso a contenido público",
                ],
                featured: false,
              },
              {
                level: "II",
                name: "VIP Club",
                price: tierPriceLabel(BASE_TIER_PRICES_MXN[1]),
                description: "Dentro del círculo.",
                perks: [
                  "Todo lo de Insider",
                  "Galerías protegidas",
                  "Prioridad en salones",
                  "Insignia VIP visible",
                ],
                featured: true,
              },
              {
                level: "III",
                name: "Xtrime Inner Circle",
                price: tierPriceLabel(BASE_TIER_PRICES_MXN[2]),
                description: "Donde casi nadie llega.",
                perks: [
                  "Todo lo de VIP",
                  "Sesión privada trimestral",
                  "Piezas firmadas digitalmente",
                  "Línea directa XTRIME",
                ],
                featured: false,
              },
            ].map((tier) => (
              <article
                key={tier.name}
                className={`relative flex h-full flex-col rounded-xl border p-6 ${
                  tier.featured
                    ? "border-signal/40 bg-gradient-to-b from-cherry/90 to-card shadow-ember"
                    : "border-hairline bg-card/50"
                }`}
              >
                <span className="pointer-events-none absolute -right-2 -top-8 font-serif text-[8rem] leading-none text-pearl/[0.05]">
                  {tier.level}
                </span>
                <p className="eyebrow">Nivel {tier.level}</p>
                <h3 className="mt-3 font-serif text-3xl text-pearl">{tier.name}</h3>
                <p className="mt-1 font-serif text-sm italic text-silver/80">{tier.description}</p>
                <p className="mt-5 font-serif text-3xl text-pearl">
                  {tier.price}
                  <span className="ml-1 font-sans text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                    / mes
                  </span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 border-t border-hairline pt-5">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex gap-2.5 text-xs leading-relaxed text-foreground/85"
                    >
                      <span className="mt-1.5 h-1 w-2.5 shrink-0 bg-signal" /> {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/explorar"
                  className={`${btn(tier.featured ? "primary" : "secondary", "md")} mt-6 w-full`}
                >
                  Elegir creadora
                </Link>
                <p className="mt-3 text-center text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Precio referencial · DEMO
                </p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-[0.7rem] leading-relaxed text-muted-foreground">
            La existencia de un nivel no implica que todos los beneficios estén disponibles desde el
            primer día. Consulta el{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "terminos" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              contrato de creadoras
            </Link>{" "}
            y la{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "comisiones" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              política de comisiones
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Ecosystem */}
      <section
        data-tour="home-ecosystem"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
      >
        <SectionHeading
          eyebrow="V — El ecosistema"
          title={<>Todo lo que necesitas, en una sola cuenta.</>}
          description="Membresías, contenido a la carta, salones en vivo, mensajes, encargos y bóveda. Cada pieza con reglas claras y comisiones visibles antes de confirmar."
          action={
            <Link to="/ecosistema" className={btn("secondary", "md")}>
              Ver el ecosistema <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.slice(0, 9).map((capability) => (
            <div
              key={capability.id}
              className="rounded-xl border border-hairline bg-white/[0.02] p-4 transition-colors hover:border-signal/25"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-serif text-xl text-pearl">{capability.name}</p>
                <Badge tone="outline">{capability.category}</Badge>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {capability.summary}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ECOSYSTEM_PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-xl border border-hairline bg-card/40 p-5">
              <Sparkles className="h-4 w-4 text-signal" />
              <p className="mt-3 text-sm text-pearl">{principle.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PlatformAreaBanners />

      {/* Trust / legal */}
      <section className="border-y border-hairline bg-black/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
          <SectionHeading
            eyebrow="VI — Confianza verificable"
            title={<>El cumplimiento no es una sección. Es la arquitectura.</>}
            description="Aceptación registrada documento por documento. Derechos ARCO operables. Cookies con preferencias reales. Cancelación sin penalización. Y un Modo DEMO que declara con precisión qué no existe todavía."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <ScrollText className="h-5 w-5" />,
                title: "Términos y contrato",
                body: "Términos, contrato de creadoras, comisiones, cancelación y PROFECO en documentos consultables.",
                to: "/legal/terminos",
                label: "Leer documentos",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Privacidad y ARCO",
                body: "Aviso de Privacidad, procedimiento ARCO con plazos y solicitudes rastreables desde tu cuenta.",
                to: "/legal/privacidad",
                label: "Ejercer derechos",
              },
              {
                icon: <Cookie className="h-5 w-5" />,
                title: "Cookies y consentimiento",
                body: "Preferencias de cookies gestionables y registro de aceptación con versión, fecha y hash.",
                to: "/legal/cookies",
                label: "Preferencias",
              },
              {
                icon: <Radio className="h-5 w-5" />,
                title: "Contenido y moderación",
                body: "Contenido prohibido, verificación de edad, reportes, sanciones y apelación con evidencia.",
                to: "/legal/contenido",
                label: "Política de contenido",
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-xl border border-hairline bg-card/40 p-5 transition-all hover:-translate-y-0.5 hover:border-signal/30"
              >
                <span className="text-signal">{item.icon}</span>
                <p className="mt-4 font-serif text-xl text-pearl">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.16em] text-silver group-hover:text-pearl">
                  {item.label} <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 grid gap-4 rounded-xl border border-warning/25 bg-warning/5 p-5 md:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-sm text-warning">
                <ScrollText className="h-4 w-4" /> Documentos en estado de borrador
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Versión {state.settings.termsVersion}. Requieren revisión legal, fiscal y de
                cumplimiento antes de operar públicamente o habilitar cobros reales en México.
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm text-info">
                <BookMarked className="h-4 w-4" /> Contenido adulto deshabilitado
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Permanecerá apagado hasta completar verificación de edad con proveedor
                especializado, consentimiento documentado, moderación, revisión legal y aprobación
                del PSP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sala de proyección */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="VI — Sala de proyección"
          title={
            <>
              La marca, <em className="text-silver-sheen">en movimiento.</em>
            </>
          }
          description="Piezas editoriales silenciosas que se reproducen al pasar el cursor o al tocar. Son una muestra del acabado audiovisual de la plataforma."
          action={
            <Link to="/clips" className={btn("secondary", "md")}>
              Ver todos los clips <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-7">
          <VideoReel />
        </div>
        <Divider className="mt-14" />
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.3]"
          style={{ backgroundImage: "url('/covers/atrio.webp')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-ember opacity-70" />
        <BrandWatermark className="-left-24 top-1/2 w-80 -translate-y-1/2 opacity-[0.06] sm:w-[26rem]" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:py-32">
          <p className="eyebrow">VII — La puerta</p>
          <h2 className="mt-5 font-serif text-4xl leading-[1] text-pearl sm:text-6xl">
            Si llegaste hasta aquí,
            <br />
            <em className="text-silver-sheen">ya sabes si esto es para ti.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Crea tu cuenta, acepta los documentos y entra al prototipo completo. Sin tarjeta, sin
            cargos y sin promesas que no podamos sostener.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link
                to={
                  user.role === "creator"
                    ? "/estudio"
                    : user.role === "admin"
                      ? "/admin"
                      : "/cuenta"
                }
                className={btn("primary", "lg")}
              >
                Continuar como {user.name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/registro" className={btn("primary", "lg")}>
                  Crear cuenta <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/entrar" className={btn("secondary", "lg")}>
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
          {demoMode ? (
            <>
              <div className="mx-auto mt-10 grid max-w-2xl gap-2 text-left sm:grid-cols-3">
                {[
                  ["fan@xclusive.demo", "Miembro"],
                  ["valentina@xclusive.demo", "Creadora"],
                  ["admin@xclusive.demo", "Administración"],
                ].map(([email, role]) => (
                  <div
                    key={email}
                    className="rounded-lg border border-hairline bg-background/50 p-3 backdrop-blur"
                  >
                    <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {role}
                    </p>
                    <p className="mt-1 truncate font-mono text-[0.65rem] text-pearl">{email}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                Contraseña de demostración: demo1234
              </p>
            </>
          ) : null}
        </div>
      </section>
    </SiteLayout>
  );
}
