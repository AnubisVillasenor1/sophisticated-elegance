import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarClock,
  Check,
  Clock,
  Copy,
  CreditCard,
  Film,
  Heart,
  ImageIcon,
  Layers,
  Lock,
  MessageSquare,
  Plus,
  Radio,
  Settings2,
  Sparkles,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  PlatformShell,
  SectionCard,
  SettingsRow,
  StudioTabs,
} from "@/components/platform/PlatformShell";
import {
  Avatar,
  Badge,
  Button,
  Cover,
  DataRow,
  DemoBadge,
  EmptyState,
  Field,
  Input,
  ProgressBar,
  Select,
  StatCard,
  Switch,
  Textarea,
  btn,
} from "@/components/lux/ui";
import { suggestCaption, suggestPrice } from "@/lib/ai";
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import {
  creatorMembers,
  creatorThreads,
  creatorTips,
  getCreator,
  monthlySeries,
} from "@/lib/selectors";
import { AUTH_MODE } from "@/lib/auth/mode";
import { ServerContentComposer } from "@/components/platform/ServerContentComposer";
import { getCreatorEarnings, type CreatorEarnings } from "@/lib/payments/operations.functions";
import { useApp, useDashboardData, useMyCreator } from "@/lib/store";
import type { CoverKey, Creator, LiveRoom, PostVisibility, Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudio")({
  head: () => ({
    meta: [
      { title: "Estudio de creadora — Xclusive" },
      {
        name: "description",
        content:
          "Panel de creadora: contenido, planes, salones, encargos, ingresos DEMO, afiliados y ajustes.",
      },
    ],
  }),
  component: StudioPage,
});

type StudioTab =
  | "resumen"
  | "contenido"
  | "planes"
  | "salones"
  | "encargos"
  | "ingresos"
  | "afiliados"
  | "ajustes";

const COVERS: CoverKey[] = [
  "portrait",
  "salon",
  "noir",
  "sol",
  "mystic",
  "vinyl",
  "vale",
  "art",
  "marea",
  "jade",
  "ai",
  "obsidian",
  "cherry",
  "amber",
  "rose",
  "atrio",
  "boveda",
];

function StudioPage() {
  const { state, user } = useApp();
  const creator = useMyCreator();

  if (!user) {
    return (
      <PlatformShell
        title="Mi estudio"
        eyebrow="Acceso"
        subtitle="Inicia sesión con una cuenta de creadora."
      >
        <EmptyState
          icon={<Lock className="h-6 w-6" />}
          title="Necesitas una llave."
          description="Entra con la cuenta de creadora de demostración para abrir el estudio completo."
          action={
            <Link to="/entrar" className={btn("primary", "md")}>
              Iniciar sesión <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />
      </PlatformShell>
    );
  }

  if (user.role !== "creator") {
    return (
      <PlatformShell
        title="Mi estudio"
        eyebrow="Acceso restringido"
        subtitle="Esta sección es para creadoras."
      >
        <EmptyState
          icon={<Lock className="h-6 w-6" />}
          title="El estudio es de las creadoras."
          description="Tu cuenta es de miembro. Desde Mi cuenta puedes gestionar membresías, compras y derechos ARCO. Si quieres publicar, solicita un perfil de creadora."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/cuenta" className={btn("primary", "md")}>
                Ir a Mi cuenta
              </Link>
              <Link to="/registro" className={btn("secondary", "md")}>
                Solicitar perfil
              </Link>
            </div>
          }
        />
      </PlatformShell>
    );
  }

  // En LIVE el vínculo creadora → perfil lo resuelve el servidor. Si la cuenta
  // tiene rol de creadora pero aún no tiene perfil editorial asignado, no se
  // inventa un estudio: se indica el paso que falta.
  if (!creator && AUTH_MODE === "live" && !user.creatorSlug) {
    return (
      <PlatformShell
        title="Mi estudio"
        eyebrow="Perfil sin vincular"
        subtitle="Tu cuenta tiene rol de creadora, pero todavía no está enlazada a un perfil editorial."
      >
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="Falta el vínculo con tu perfil."
          description="La administración debe asignar el slug de tu perfil (app_metadata.creator_slug o la variable de servidor CREATOR_SLUGS). Mientras tanto, tu contenido y tus ingresos no están expuestos."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/cuenta" className={btn("primary", "md")}>
                Ir a Mi cuenta
              </Link>
              <Link to="/ayuda" className={btn("secondary", "md")}>
                Contactar soporte
              </Link>
            </div>
          }
        />
      </PlatformShell>
    );
  }

  if (!creator) {
    const application = state.applications.find((a) => a.userId === user.id);
    return (
      <PlatformShell
        title="Mi estudio"
        eyebrow="Solicitud en revisión"
        subtitle="Tu perfil de creadora todavía no está activo."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard
            title="Estado de tu solicitud"
            description="La curaduría revisa cada postulación."
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4">
                <span className="rounded-full border border-warning/30 bg-warning/10 p-2 text-warning">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm text-pearl">
                    {application
                      ? application.status === "pending"
                        ? "Solicitud recibida"
                        : application.status === "approved"
                          ? "Solicitud aprobada"
                          : "Solicitud rechazada"
                      : "Sin solicitud registrada"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {application
                      ? application.note || "Revisión en curso."
                      : "Puedes enviar tu postulación desde la página de registro."}
                  </p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Identidad y edad declaradas (en producción: verificación certificada).",
                  "Aceptación del contrato de creadoras y la política de comisiones.",
                  "Revisión de contenido permitido y consentimiento documentado.",
                  "Activación del perfil y primeras herramientas del estudio.",
                ].map((step) => (
                  <li
                    key={step}
                    className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" /> {step}
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
          <SectionCard title="Mientras tanto" description="Explora el club y prepara tu concepto.">
            <div className="space-y-2">
              <Link to="/explorar" className={cn(btn("secondary", "md"), "w-full")}>
                <BookOpen className="h-4 w-4" /> Explorar el club
              </Link>
              <Link
                to="/legal/$doc"
                params={{ doc: "contrato-creadoras" }}
                className={cn(btn("secondary", "md"), "w-full")}
              >
                <Layers className="h-4 w-4" /> Leer contrato
              </Link>
              <Link
                to="/legal/$doc"
                params={{ doc: "comisiones" }}
                className={cn(btn("secondary", "md"), "w-full")}
              >
                <Wallet className="h-4 w-4" /> Ver comisiones
              </Link>
            </div>
            <p className="mt-4 text-[0.65rem] leading-relaxed text-muted-foreground">
              En Modo DEMO la aprobación puede realizarse desde la cuenta de administración para
              probar el flujo completo.
            </p>
          </SectionCard>
        </div>
      </PlatformShell>
    );
  }

  return <StudioDashboard creator={creator} />;
}

function StudioDashboard({ creator }: { creator: Creator }) {
  const { state, user } = useApp();
  const dashboard = useDashboardData(creator.id);
  const [tab, setTab] = useState<StudioTab>("resumen");
  const currency = state.currency;
  const threads = creatorThreads(state, creator.id);
  const unread = threads.reduce((sum, t) => sum + t.unread, 0);
  const liveRoom = creator.rooms.find((r) => r.status === "live");
  const customOrders = state.purchases.filter(
    (p) => p.creatorId === creator.id && p.kind === "custom",
  );

  return (
    <PlatformShell
      title="Mi estudio"
      eyebrow={`Creadora · ${creator.categories[0] ?? "Editorial"}`}
      subtitle={`${creator.name} · reparto ${creator.revenueShare}% · Modo DEMO`}
      actions={
        <Link
          to="/creadora/$slug"
          params={{ slug: creator.slug }}
          className={cn(btn("secondary", "sm"), "hidden sm:inline-flex")}
        >
          Ver perfil público <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StudioTabs
          value={tab}
          onChange={(id) => setTab(id as StudioTab)}
          items={[
            { id: "resumen", label: "Resumen", icon: <BarChart3 className="h-3.5 w-3.5" /> },
            {
              id: "contenido",
              label: "Contenido",
              icon: <ImageIcon className="h-3.5 w-3.5" />,
              badge: creator.posts.length,
            },
            { id: "planes", label: "Planes", icon: <Layers className="h-3.5 w-3.5" /> },
            {
              id: "salones",
              label: "Salones",
              icon: <Radio className="h-3.5 w-3.5" />,
              badge: creator.rooms.length,
            },
            {
              id: "encargos",
              label: "Encargos",
              icon: <Wand2 className="h-3.5 w-3.5" />,
              badge: customOrders.length,
            },
            { id: "ingresos", label: "Ingresos", icon: <Wallet className="h-3.5 w-3.5" /> },
            { id: "afiliados", label: "Afiliados", icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { id: "ajustes", label: "Ajustes", icon: <Settings2 className="h-3.5 w-3.5" /> },
          ]}
        />
        <div className="flex items-center gap-2">
          <DemoBadge>Estudio DEMO</DemoBadge>
          <Badge tone={creator.status === "approved" ? "success" : "warning"}>
            <BadgeCheck className="h-3 w-3" />{" "}
            {creator.status === "approved" ? "Perfil activo" : "En revisión"}
          </Badge>
        </div>
      </div>

      <div className="mt-6">
        {tab === "resumen" ? (
          <ResumenTab
            creator={creator}
            net={dashboard.net}
            available={dashboard.available}
            unread={unread}
            liveRoom={liveRoom}
            customOrders={customOrders.length}
            onGoTo={setTab}
          />
        ) : null}
        {tab === "contenido" ? <ContenidoTab creator={creator} /> : null}
        {tab === "planes" ? <PlanesTab creator={creator} /> : null}
        {tab === "salones" ? <SalonesTab creator={creator} /> : null}
        {tab === "encargos" ? <EncargosTab creator={creator} /> : null}
        {tab === "ingresos" ? <IngresosTab creator={creator} /> : null}
        {tab === "afiliados" ? <AfiliadosTab creator={creator} /> : null}
        {tab === "ajustes" ? <AjustesTab creator={creator} /> : null}
      </div>

      <p className="mt-8 text-center text-[0.62rem] leading-relaxed text-muted-foreground">
        Todos los importes del estudio son simulados. El reparto y las comisiones mostradas son
        referenciales y deben constar en el contrato antes de operar con pagos reales.{" "}
        {user?.name ? `Sesión: ${user.name}.` : ""}
      </p>
    </PlatformShell>
  );
}

/* ------------------------------------------------------------------ */
/* Resumen                                                             */
/* ------------------------------------------------------------------ */

/**
 * Saldo real de la creadora, calculado en el servidor desde los pedidos
 * pagados. En DEMO no se muestra: el saldo local es de demostración y no debe
 * confundirse con dinero devengado.
 */
function ServerEarnings() {
  const { state } = useApp();
  const [data, setData] = useState<CreatorEarnings | null>(null);

  useEffect(() => {
    if (AUTH_MODE !== "live") return;
    let alive = true;
    getCreatorEarnings()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch(() => {
        if (alive) setData(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (AUTH_MODE !== "live" || !data) return null;

  return (
    <SectionCard
      title="Libro de ventas (servidor)"
      description="Pedidos pagados y conciliados. El saldo no es retirable hasta contar con PSP y verificación de identidad."
    >
      {!data.available ? (
        <p className="text-xs text-muted-foreground">{data.reason ?? "No disponible."}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DataRow label="Pedidos pagados" value={formatNumber(data.orders)} />
          <DataRow label="Bruto cobrado" value={formatMoney(data.grossMXN, state.currency)} />
          <DataRow
            label="Comisión plataforma"
            value={formatMoney(data.platformFeeMXN, state.currency)}
          />
          <DataRow label="Neto devengado" value={formatMoney(data.netMXN, state.currency)} />
        </div>
      )}
    </SectionCard>
  );
}

function ResumenTab({
  creator,
  net,
  available,
  unread,
  liveRoom,
  customOrders,
  onGoTo,
}: {
  creator: Creator;
  net: number;
  available: number;
  unread: number;
  liveRoom: LiveRoom | undefined;
  customOrders: number;
  onGoTo: (tab: StudioTab) => void;
}) {
  const { state } = useApp();
  const currency = state.currency;
  const transactions = state.transactions
    .filter((t) => t.creatorId === creator.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Miembros activos"
          value={formatNumber(creatorMembers(state, creator.id))}
          hint="Membresías activas en DEMO."
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Ingreso neto"
          value={formatMoney(net, currency)}
          hint="Después de comisión de plataforma."
          icon={<Wallet className="h-4 w-4" />}
          tone="signal"
        />
        <StatCard
          label="Disponible"
          value={formatMoney(available, currency)}
          hint="Mínimo de retiro DEMO: $300 MXN."
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          label="Propinas"
          value={formatMoney(creatorTips(state, creator.id), currency)}
          hint="Propinas simuladas registradas."
          icon={<Heart className="h-4 w-4" />}
        />
      </div>

      <ServerEarnings />

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Ahora mismo"
          description="Lo que requiere tu atención."
          className="lg:col-span-2"
        >
          <div className="divide-y divide-hairline">
            <SettingsRow
              icon={<MessageSquare className="h-4 w-4" />}
              title="Mensajes sin leer"
              description={
                unread > 0
                  ? `${unread} mensaje${unread === 1 ? "" : "s"} esperando respuesta.`
                  : "Bandeja al día."
              }
              action={
                <Link to="/mensajes" className={btn("secondary", "sm")}>
                  Abrir bandeja <ArrowUpRight className="h-3 w-3" />
                </Link>
              }
            />
            <SettingsRow
              icon={<Radio className="h-4 w-4" />}
              title={liveRoom ? "Salón en vivo" : "Sin salón en vivo"}
              description={
                liveRoom ? liveRoom.title : "Programa un salón para abrir tu próxima sala."
              }
              action={
                <Button variant="secondary" size="sm" onClick={() => onGoTo("salones")}>
                  {liveRoom ? "Gestionar" : "Programar"}
                </Button>
              }
            />
            <SettingsRow
              icon={<Wand2 className="h-4 w-4" />}
              title="Encargos en curso"
              description={
                customOrders > 0
                  ? `${customOrders} encargo${customOrders === 1 ? "" : "s"} por revisar.`
                  : "No hay encargos pendientes."
              }
              action={
                <Button variant="secondary" size="sm" onClick={() => onGoTo("encargos")}>
                  Revisar
                </Button>
              }
            />
            <SettingsRow
              icon={<Wallet className="h-4 w-4" />}
              title="Retiros DEMO"
              description={
                available >= 300
                  ? "Puedes solicitar un retiro simulado."
                  : "Aún no alcanzas el mínimo de $300 MXN."
              }
              action={
                <Button variant="secondary" size="sm" onClick={() => onGoTo("ingresos")}>
                  Ver ingresos
                </Button>
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="Actividad reciente" description="Últimos movimientos del libro DEMO.">
          {transactions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Todavía no hay movimientos.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 border-b border-hairline pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs text-pearl">
                      {tx.kind === "tip"
                        ? "Propina"
                        : tx.kind === "subscription"
                          ? "Membresía"
                          : tx.kind}
                    </p>
                    <p className="text-[0.6rem] text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs text-silver">{formatMoney(tx.netMXN, currency)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Publica una pieza",
            body: "Feed, PPV o bóveda con audiencia definida.",
            tab: "contenido" as StudioTab,
            icon: <ImageIcon className="h-4 w-4" />,
          },
          {
            title: "Ajusta tus planes",
            body: "Tres niveles con precio y beneficios propios.",
            tab: "planes" as StudioTab,
            icon: <Layers className="h-4 w-4" />,
          },
          {
            title: "Abre un salón",
            body: "Sala abierta, para miembros o con boleto.",
            tab: "salones" as StudioTab,
            icon: <Radio className="h-4 w-4" />,
          },
        ].map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onGoTo(item.tab)}
            className="rounded-xl border border-hairline bg-white/[0.02] p-4 text-left transition-colors hover:border-signal/30 hover:bg-white/[0.04]"
          >
            <span className="text-signal">{item.icon}</span>
            <p className="mt-3 text-sm text-pearl">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contenido                                                           */
/* ------------------------------------------------------------------ */

function ContenidoTab({ creator }: { creator: Creator }) {
  const { state, createPost, deletePost } = useApp();
  const [form, setForm] = useState({
    title: "",
    body: "",
    visibility: "public" as PostVisibility,
    tierId: creator.tiers[0]?.id ?? "",
    priceMXN: 0,
    cover: creator.cover,
    tags: "",
    mature: false,
  });
  const currency = state.currency;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createPost(creator.id, {
      title: form.title,
      body: form.body,
      visibility: form.visibility,
      tierId: form.visibility === "tier" ? form.tierId : null,
      priceMXN: form.visibility === "ppv" ? Number(form.priceMXN) : 0,
      cover: form.cover,
      tags: form.tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
      mature: form.mature,
    });
    toast(result.message);
    if (result.ok) setForm((prev) => ({ ...prev, title: "", body: "", tags: "", priceMXN: 0 }));
  };

  return (
    <div className="space-y-5">
      {AUTH_MODE === "live" ? <ServerContentComposer /> : null}
      <div className="grid gap-5 lg:grid-cols-12">
        <SectionCard
          title="Nueva publicación"
          description="Decide quién puede verla desde el primer momento."
          className="lg:col-span-5"
        >
          <form onSubmit={submit} className="space-y-4">
            <Field label="Título" required>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="El nombre de la pieza"
                required
              />
            </Field>
            <Field
              label="Texto"
              required
              hint="Contenido editorial, no explícito. La moderación puede revisarlo."
            >
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Describe la pieza, el proceso o la intención."
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Audiencia">
                <Select
                  value={form.visibility}
                  onChange={(e) =>
                    setForm({ ...form, visibility: e.target.value as PostVisibility })
                  }
                >
                  <option value="public">Público</option>
                  <option value="members">Miembros</option>
                  <option value="tier">Tier específico</option>
                  <option value="ppv">PPV</option>
                  <option value="vault">Bóveda (VIP+)</option>
                </Select>
              </Field>
              <Field label="Portada">
                <Select
                  value={form.cover}
                  onChange={(e) => setForm({ ...form, cover: e.target.value as CoverKey })}
                >
                  {COVERS.map((cover) => (
                    <option key={cover} value={cover}>
                      {cover}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {form.visibility === "tier" ? (
              <Field label="Tier">
                <Select
                  value={form.tierId}
                  onChange={(e) => setForm({ ...form, tierId: e.target.value })}
                >
                  {creator.tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
            {form.visibility === "ppv" ? (
              <Field
                label={`Precio (${currency})`}
                hint="Se muestra desglose de comisiones antes de confirmar."
              >
                <Input
                  type="number"
                  min={0}
                  value={form.priceMXN}
                  onChange={(e) => setForm({ ...form, priceMXN: Number(e.target.value) })}
                />
              </Field>
            ) : null}
            <Field label="Etiquetas" hint="Separadas por coma.">
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="editorial, luz, proceso"
              />
            </Field>
            <Switch
              checked={form.mature}
              onChange={(value) => setForm({ ...form, mature: value })}
              label="Marcar como 18+"
              description="El contenido adulto sigue deshabilitado hasta completar verificación y revisión legal."
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    body: suggestCaption(prev.title || "archivo", creator),
                  }))
                }
              >
                <Sparkles className="h-3.5 w-3.5" /> Sugerir texto
              </Button>
              <Button type="submit" size="sm">
                <Plus className="h-3.5 w-3.5" /> Publicar
              </Button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-4 lg:col-span-7">
          <ClipsManager creator={creator} />
          {creator.posts.length === 0 ? (
            <EmptyState
              title="Tu feed está en blanco."
              description="Publica la primera pieza para abrir la conversación."
              icon={<ImageIcon className="h-6 w-6" />}
            />
          ) : (
            creator.posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-hairline bg-card/50"
              >
                <Cover kind={post.cover} alt="" className="aspect-[16/7] w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <Badge
                      tone={
                        post.visibility === "public"
                          ? "success"
                          : post.visibility === "ppv"
                            ? "warning"
                            : "signal"
                      }
                    >
                      {post.visibility}
                    </Badge>
                    {post.mature ? <Badge tone="outline">18+</Badge> : null}
                  </div>
                </Cover>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl text-pearl">{post.title}</h3>
                      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        const result = deletePost(creator.id, post.id);
                        toast(result.message);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Archivar
                    </Button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ClipsManager({ creator }: { creator: Creator }) {
  const { state, createClip } = useApp();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Editorial",
    priceMXN: 120,
    duration: "08:00",
    cover: creator.cover as CoverKey,
    mature: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createClip(creator.id, {
      title: form.title,
      description: form.description,
      category: form.category,
      priceMXN: Math.max(0, Math.round(Number(form.priceMXN) || 0)),
      duration: form.duration,
      cover: form.cover,
      mature: form.mature,
    });
    toast(result.message);
    if (result.ok) setForm((prev) => ({ ...prev, title: "", description: "" }));
  };

  return (
    <SectionCard
      title="Clips del marketplace"
      description="Piezas cortas con precio propio. Cada venta muestra el desglose de comisiones."
    >
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Título" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nombre del clip"
              required
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Descripción" hint="Contenido editorial, no explícito.">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Qué muestra el clip y por qué es distinto."
            />
          </Field>
        </div>
        <Field label="Categoría">
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Editorial"
          />
        </Field>
        <Field label={`Precio (${state.currency})`}>
          <Input
            type="number"
            min={0}
            value={form.priceMXN}
            onChange={(e) => setForm({ ...form, priceMXN: Number(e.target.value) })}
          />
        </Field>
        <Field label="Duración" hint="Formato mm:ss.">
          <Input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="08:00"
          />
        </Field>
        <Field label="Portada">
          <Select
            value={form.cover}
            onChange={(e) => setForm({ ...form, cover: e.target.value as CoverKey })}
          >
            {COVERS.map((cover) => (
              <option key={cover} value={cover}>
                {cover}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Switch
            checked={form.mature}
            onChange={(value) => setForm({ ...form, mature: value })}
            label="Marcar como 18+"
            description="El contenido adulto sigue deshabilitado hasta completar verificación y revisión legal."
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="sm">
            <Plus className="h-3.5 w-3.5" /> Publicar clip
          </Button>
        </div>
      </form>

      <div className="mt-5 space-y-2.5 border-t border-hairline pt-4">
        {creator.clips.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Todavía no hay clips publicados. El primero aparecerá aquí y en el marketplace.
          </p>
        ) : (
          creator.clips.map((clip) => (
            <div
              key={clip.id}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-white/[0.02] p-3"
            >
              <Cover kind={clip.cover} alt="" className="h-12 w-16 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-pearl">{clip.title}</p>
                <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                  {formatMoney(clip.priceMXN, state.currency)} · {clip.duration} ·{" "}
                  {formatNumber(clip.sales)} ventas
                </p>
              </div>
              <Badge tone={clip.mature ? "warning" : "outline"}>
                {clip.mature ? "18+" : clip.category}
              </Badge>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Planes                                                              */
/* ------------------------------------------------------------------ */

function PlanesTab({ creator }: { creator: Creator }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {creator.tiers.map((tier) => (
        <TierEditor key={tier.id} creator={creator} tier={tier} />
      ))}
      <div className="rounded-xl border border-hairline bg-white/[0.02] p-5 lg:col-span-3">
        <p className="text-sm text-pearl">Sobre los planes</p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          El precio y los beneficios son configurables, pero la plataforma solo comunica como
          activas las funciones realmente implementadas. La renovación automática requiere
          consentimiento expreso y puede cancelarse en cualquier momento sin penalización. En Modo
          DEMO no se realizan cargos.
        </p>
      </div>
    </div>
  );
}

function TierEditor({ creator, tier }: { creator: Creator; tier: Tier }) {
  const { state, saveTier } = useApp();
  const [name, setName] = useState(tier.name);
  const [price, setPrice] = useState(tier.priceMXN);
  const [tagline, setTagline] = useState(tier.tagline);
  const [perks, setPerks] = useState(tier.perks.join("\n"));
  const [featured, setFeatured] = useState(tier.featured);

  return (
    <article
      className={cn(
        "rounded-xl border p-5",
        featured
          ? "border-signal/40 bg-gradient-to-b from-cherry/70 to-card"
          : "border-hairline bg-card/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge tone="outline">Nivel {tier.level}</Badge>
        {featured ? <Badge tone="signal">Destacado</Badge> : null}
      </div>
      <div className="mt-3 space-y-3">
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={`Precio (${state.currency})`}>
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </Field>
        <Field label="Lema">
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </Field>
        <Field label="Beneficios" hint="Uno por línea.">
          <Textarea value={perks} onChange={(e) => setPerks(e.target.value)} className="min-h-28" />
        </Field>
        <Switch
          checked={featured}
          onChange={setFeatured}
          label="Destacar plan"
          description="Se muestra como recomendado en el perfil."
        />
      </div>
      <Button
        className="mt-4 w-full"
        size="sm"
        onClick={() => {
          const result = saveTier(creator.id, tier.id, {
            name: name.trim() || tier.name,
            priceMXN: Math.max(0, Math.round(price)),
            tagline: tagline.trim() || tier.tagline,
            perks: perks
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean),
            featured,
          });
          toast(result.message);
        }}
      >
        <Check className="h-3.5 w-3.5" /> Guardar plan
      </Button>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Salones                                                             */
/* ------------------------------------------------------------------ */

function SalonesTab({ creator }: { creator: Creator }) {
  const { state, createRoom, setRoomStatus } = useApp();
  const [form, setForm] = useState({
    title: "",
    description: "",
    access: "free" as "free" | "members" | "ticket",
    ticketPriceMXN: 120,
    startsAt: "",
    durationMin: 60,
    capacity: 50,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = form.startsAt ? new Date(form.startsAt) : new Date(Date.now() + 86_400_000);
    const result = createRoom(creator.id, {
      title: form.title,
      description: form.description,
      access: form.access,
      ticketPriceMXN: form.ticketPriceMXN,
      startsAt: start.toISOString(),
      durationMin: Number(form.durationMin),
      capacity: Number(form.capacity),
    });
    toast(result.message);
    if (result.ok) setForm((prev) => ({ ...prev, title: "", description: "" }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Programar salón"
        description="Sala abierta, para miembros o con boleto."
        className="lg:col-span-5"
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tertulia de medianoche"
              required
            />
          </Field>
          <Field label="Descripción">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Qué va a pasar en la sala."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Acceso">
              <Select
                value={form.access}
                onChange={(e) => setForm({ ...form, access: e.target.value as typeof form.access })}
              >
                <option value="free">Abierto</option>
                <option value="members">Solo miembros</option>
                <option value="ticket">Con boleto</option>
              </Select>
            </Field>
            <Field
              label={`Boleto (${state.currency})`}
              hint={
                form.access === "ticket"
                  ? "Se muestra desglose antes de confirmar."
                  : "No aplica para este acceso."
              }
            >
              <Input
                type="number"
                min={0}
                value={form.ticketPriceMXN}
                disabled={form.access !== "ticket"}
                onChange={(e) => setForm({ ...form, ticketPriceMXN: Number(e.target.value) })}
              />
            </Field>
            <Field label="Fecha y hora">
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </Field>
            <Field label="Duración (min)">
              <Input
                type="number"
                min={10}
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
              />
            </Field>
            <Field label="Cupo">
              <Input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Button type="submit" className="w-full" size="sm">
            <Plus className="h-3.5 w-3.5" /> Programar salón
          </Button>
        </form>
      </SectionCard>

      <div className="space-y-4 lg:col-span-7">
        {creator.rooms.length === 0 ? (
          <EmptyState
            title="Sin salones todavía."
            description="Programa el primero y aparecerá en la agenda pública."
            icon={<Radio className="h-6 w-6" />}
          />
        ) : (
          creator.rooms.map((room) => (
            <article
              key={room.id}
              className="overflow-hidden rounded-xl border border-hairline bg-card/50"
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        room.status === "live"
                          ? "signal"
                          : room.status === "scheduled"
                            ? "info"
                            : "outline"
                      }
                    >
                      {room.status === "live"
                        ? "En vivo"
                        : room.status === "scheduled"
                          ? "Programado"
                          : "Finalizado"}
                    </Badge>
                    <Badge tone="dark">
                      {room.access === "free"
                        ? "Abierto"
                        : room.access === "members"
                          ? "Miembros"
                          : formatMoney(room.ticketPriceMXN, state.currency)}
                    </Badge>
                  </div>
                  <p className="mt-2 font-serif text-xl text-pearl">{room.title}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                    <CalendarClock className="h-3 w-3" /> {formatDateTime(room.startsAt)} ·{" "}
                    {room.durationMin} min · cupo {room.capacity}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.status !== "live" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toast(setRoomStatus(creator.id, room.id, "live").message)}
                    >
                      <Radio className="h-3.5 w-3.5" /> Abrir
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toast(setRoomStatus(creator.id, room.id, "ended").message)}
                    >
                      Cerrar
                    </Button>
                  )}
                  <Link to="/salon/$id" params={{ id: room.id }} className={btn("secondary", "sm")}>
                    Ver sala
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Encargos                                                            */
/* ------------------------------------------------------------------ */

function EncargosTab({ creator }: { creator: Creator }) {
  const { state, user, createOffer, completePurchase } = useApp();
  const [form, setForm] = useState({
    kind: "custom" as "custom" | "call" | "audio",
    title: "",
    description: "",
    priceMXN: 800,
    turnaroundDays: 7,
    slots: 5,
  });
  const orders = state.purchases
    .filter((p) => p.creatorId === creator.id && p.kind === "custom")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createOffer(creator.id, {
      kind: form.kind,
      title: form.title,
      description: form.description,
      priceMXN: Number(form.priceMXN),
      turnaroundDays: Number(form.turnaroundDays),
      slots: Number(form.slots),
    });
    toast(result.message);
    if (result.ok) setForm((prev) => ({ ...prev, title: "", description: "" }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Nuevo encargo"
        description="Piezas personalizadas, llamadas o audio."
        className="lg:col-span-5"
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Tipo">
            <Select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as typeof form.kind })}
            >
              <option value="custom">Pieza personalizada</option>
              <option value="call">Llamada privada</option>
              <option value="audio">Audio personalizado</option>
            </Select>
          </Field>
          <Field label="Título" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Retrato a la luz de vela"
              required
            />
          </Field>
          <Field label="Descripción">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Qué incluye y qué no incluye."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`Precio (${state.currency})`}>
              <Input
                type="number"
                min={0}
                value={form.priceMXN}
                onChange={(e) => setForm({ ...form, priceMXN: Number(e.target.value) })}
              />
            </Field>
            <Field label="Días">
              <Input
                type="number"
                min={1}
                value={form.turnaroundDays}
                onChange={(e) => setForm({ ...form, turnaroundDays: Number(e.target.value) })}
              />
            </Field>
            <Field label="Lugares">
              <Input
                type="number"
                min={1}
                value={form.slots}
                onChange={(e) => setForm({ ...form, slots: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Button type="submit" className="w-full" size="sm">
            <Plus className="h-3.5 w-3.5" /> Publicar encargo
          </Button>
        </form>
      </SectionCard>

      <div className="space-y-5 lg:col-span-7">
        <SectionCard title="Encargos publicados" description="Visibles en tu perfil público.">
          {creator.offers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Todavía no has publicado encargos.</p>
          ) : (
            <div className="space-y-3">
              {creator.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col gap-2 rounded-lg border border-hairline bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm text-pearl">{offer.title}</p>
                    <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                      {offer.kind} · {offer.turnaroundDays} días · {offer.slots} lugares
                    </p>
                  </div>
                  <p className="font-serif text-xl text-pearl">
                    {formatMoney(offer.priceMXN, state.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Solicitudes recibidas"
          description="Marca como entregado cuando el encargo esté listo."
        >
          {orders.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay solicitudes de encargo.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const fan = state.users.find((u) => u.id === order.fanId);
                return (
                  <div
                    key={order.id}
                    className="rounded-lg border border-hairline bg-white/[0.02] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={fan?.name ?? "Miembro"}
                          tint={fan?.avatarTint ?? "#c56c83"}
                          size={28}
                          ring={false}
                        />
                        <div>
                          <p className="text-xs text-pearl">{fan?.name ?? "Miembro"}</p>
                          <p className="text-[0.6rem] text-muted-foreground">{order.label}</p>
                        </div>
                      </div>
                      <Badge tone={order.status === "delivered" ? "success" : "warning"}>
                        {order.status === "delivered" ? "Entregado" : "En curso"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline pt-3">
                      <p className="text-xs text-silver">
                        {formatMoney(order.amountMXN, state.currency)}
                      </p>
                      {order.status !== "delivered" && user ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toast(completePurchase(order.id).message)}
                        >
                          <Check className="h-3.5 w-3.5" /> Marcar entregado
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ingresos                                                            */
/* ------------------------------------------------------------------ */

function IngresosTab({ creator }: { creator: Creator }) {
  const { state, requestPayout } = useApp();
  const dashboard = useDashboardData(creator.id);
  const currency = state.currency;
  const series = monthlySeries(state, creator.id);
  const max = Math.max(1, ...series.map((s) => s.gross));
  const payouts = state.payouts.filter((p) => p.creatorId === creator.id);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bruto"
          value={formatMoney(
            state.transactions
              .filter((t) => t.creatorId === creator.id)
              .reduce((s, t) => s + t.grossMXN, 0),
            currency,
          )}
          hint="Ventas DEMO acumuladas."
        />
        <StatCard
          label="Neto"
          value={formatMoney(dashboard.net, currency)}
          hint={`Reparto ${creator.revenueShare}%`}
          tone="signal"
        />
        <StatCard
          label="Disponible"
          value={formatMoney(dashboard.available, currency)}
          hint="Después de retiros pagados y solicitados."
        />
        <StatCard
          label="Retiros"
          value={formatNumber(payouts.length)}
          hint="Solicitudes DEMO registradas."
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Últimos seis meses"
          description="Bruto y neto del libro DEMO."
          className="lg:col-span-2"
        >
          <div className="flex h-48 items-end gap-2">
            {series.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end gap-1">
                  <div
                    className="flex-1 rounded-t bg-signal/70"
                    style={{ height: `${Math.max(3, (point.gross / max) * 100)}%` }}
                    title={`Bruto ${point.gross}`}
                  />
                  <div
                    className="flex-1 rounded-t bg-silver/30"
                    style={{ height: `${Math.max(3, (point.net / max) * 100)}%` }}
                    title={`Neto ${point.net}`}
                  />
                </div>
                <span className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[0.62rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-signal" /> Bruto
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-silver/40" /> Neto
            </span>
          </div>
        </SectionCard>

        <SectionCard title="Retiro DEMO" description="No se transfiere dinero real.">
          <div className="space-y-3">
            <div className="rounded-xl border border-hairline bg-white/[0.02] p-4">
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                Disponible
              </p>
              <p className="mt-1 font-serif text-3xl text-pearl">
                {formatMoney(dashboard.available, currency)}
              </p>
              <p className="mt-1 text-[0.65rem] text-muted-foreground">
                Mínimo $300 MXN · procesamiento simulado.
              </p>
            </div>
            <Button
              className="w-full"
              size="sm"
              disabled={dashboard.available < 300}
              onClick={() => toast(requestPayout(creator.id).message)}
            >
              <Wallet className="h-3.5 w-3.5" /> Solicitar retiro
            </Button>
            <p className="text-[0.62rem] leading-relaxed text-muted-foreground">
              En producción, el retiro requerirá verificación de identidad, cuenta bancaria
              validada, retención fiscal y aprobación del PSP. El saldo DEMO no es redimible.
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Movimientos" description="Comisión de plataforma ya descontada.">
          {dashboard.transactions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin movimientos.</p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto scroll-lux pr-1">
              {dashboard.transactions.map((tx) => (
                <div key={tx.id} className="rounded-lg border border-hairline bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-pearl">{tx.kind}</p>
                    <p className="text-xs text-pearl">{formatMoney(tx.grossMXN, currency)}</p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[0.62rem] text-muted-foreground">
                    <span>{formatDate(tx.createdAt)}</span>
                    <span>
                      Comisión −{formatMoney(tx.feeMXN, currency)} · Neto{" "}
                      {formatMoney(tx.netMXN, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Retiros" description="Historial de solicitudes.">
          {payouts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin retiros solicitados.</p>
          ) : (
            <div className="space-y-2">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-white/[0.02] p-3"
                >
                  <div>
                    <p className="text-xs text-pearl">{formatMoney(payout.amountMXN, currency)}</p>
                    <p className="text-[0.6rem] text-muted-foreground">
                      {formatDate(payout.requestedAt)}
                    </p>
                  </div>
                  <Badge tone={payout.status === "paid" ? "success" : "warning"}>
                    {payout.status === "paid" ? "Pagado" : "Solicitado"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="rounded-xl border border-warning/25 bg-warning/5 p-4">
        <p className="text-xs font-medium text-warning">Transparencia de comisiones</p>
        <p className="mt-1.5 max-w-4xl text-[0.7rem] leading-relaxed text-muted-foreground">
          Antes de confirmar cualquier compra se muestra precio bruto, comisión de Xclusive,
          comisión estimada del PSP, impuestos aplicables y neto estimado para la creadora. Las
          cifras son referenciales en DEMO y no constituyen una promesa de pago. Consulta la
          política de comisiones y el contrato.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Afiliados                                                           */
/* ------------------------------------------------------------------ */

function AfiliadosTab({ creator }: { creator: Creator }) {
  const { state } = useApp();
  const referral = state.referrals.find((r) => r.creatorId === creator.id);
  const code = referral?.code ?? creator.affiliateCode;
  const domain = (state.settings.domain || "xclusive.demo")
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
  const link = `https://${domain}/creadora/${creator.slug}?ref=${code}`;
  const clicks = referral?.clicks ?? 0;
  const signups = referral?.signups ?? 0;
  const conversion = clicks > 0 ? Math.round((signups / clicks) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <SectionCard
        title="Tu código de afiliada"
        description="Comparte el enlace y mide el interés real."
        className="lg:col-span-2"
      >
        <div className="rounded-xl border border-hairline bg-black/25 p-5">
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Código</p>
          <p className="mt-2 font-mono text-2xl tracking-[0.12em] text-pearl">{code}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  toast.success("Código copiado.");
                } catch {
                  toast.error("No se pudo copiar el código.");
                }
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Copiar código
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  toast.success("Enlace copiado.");
                } catch {
                  toast.error("No se pudo copiar el enlace.");
                }
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> Copiar enlace
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 rounded-lg border border-hairline bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all font-mono text-[0.62rem] text-silver">{link}</p>
          <span className="shrink-0 text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
            Enlace atribuido
          </span>
        </div>
        <p className="mt-2 text-[0.62rem] leading-relaxed text-muted-foreground">
          Cada apertura con <span className="font-mono">?ref={code}</span> se registra como clic en
          este navegador y atribuye el registro cuando alguien crea su cuenta desde el enlace.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-hairline bg-white/[0.02] p-3 text-center">
            <p className="font-serif text-2xl text-pearl">{formatNumber(referral?.clicks ?? 0)}</p>
            <p className="mt-1 text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
              Clics
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-white/[0.02] p-3 text-center">
            <p className="font-serif text-2xl text-pearl">{formatNumber(referral?.signups ?? 0)}</p>
            <p className="mt-1 text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
              Registros
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-white/[0.02] p-3 text-center">
            <p className="font-serif text-2xl text-pearl">{conversion}%</p>
            <p className="mt-1 text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
              Conversión
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-white/[0.02] p-3 text-center">
            <p className="font-serif text-2xl text-pearl">
              {formatMoney(referral?.earningsMXN ?? 0, state.currency)}
            </p>
            <p className="mt-1 text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
              Comisión
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Cómo funciona" description="Reglas claras, sin promesas infladas.">
        <ul className="space-y-3">
          {[
            "El programa es simulado en este prototipo; no genera pagos reales.",
            "La comisión se calcula sobre ventas atribuidas y se muestra en el libro DEMO.",
            "No se permite spam, auto-referencia fraudulenta ni publicidad engañosa.",
            "Las reglas definitivas deberán constar en el contrato y en la política de comisiones.",
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" /> {item}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ajustes                                                             */
/* ------------------------------------------------------------------ */

function AjustesTab({ creator }: { creator: Creator }) {
  const { state, updateCreator } = useApp();
  const [headline, setHeadline] = useState(creator.headline);
  const [bio, setBio] = useState(creator.bio);
  const [city, setCity] = useState(creator.city);
  const [categories, setCategories] = useState(creator.categories.join(", "));
  const [tags, setTags] = useState(creator.tags.join(", "));
  const [welcomeMessage, setWelcomeMessage] = useState(creator.welcomeMessage);
  const [freeTrial, setFreeTrial] = useState(creator.freeTrial);
  const [aiAssistant, setAiAssistant] = useState(creator.aiAssistant);
  const [cover, setCover] = useState<CoverKey>(creator.cover);
  const [avatarTint, setAvatarTint] = useState(creator.avatarTint);

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Perfil público"
        description="Lo que ve tu comunidad antes de entrar."
        className="lg:col-span-7"
      >
        <div className="space-y-4">
          <Field label="Titular" required>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </Field>
          <Field label="Biografía">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-28" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ciudad">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="Portada">
              <Select value={cover} onChange={(e) => setCover(e.target.value as CoverKey)}>
                {COVERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categorías" hint="Separadas por coma.">
              <Input value={categories} onChange={(e) => setCategories(e.target.value)} />
            </Field>
            <Field label="Etiquetas" hint="Separadas por coma.">
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </Field>
          </div>
          <Field label="Mensaje de bienvenida" hint="Se envía al abrir una conversación nueva.">
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="min-h-24"
            />
          </Field>
          <Field label="Color de avatar" hint="Valor hexadecimal.">
            <Input value={avatarTint} onChange={(e) => setAvatarTint(e.target.value)} />
          </Field>
          <Button
            size="sm"
            onClick={() => {
              const result = updateCreator(creator.id, {
                headline: headline.trim() || creator.headline,
                bio: bio.trim(),
                city: city.trim() || creator.city,
                categories: categories
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean),
                tags: tags
                  .split(",")
                  .map((t) => t.trim().replace(/^#/, ""))
                  .filter(Boolean),
                welcomeMessage: welcomeMessage.trim() || creator.welcomeMessage,
                avatarTint: avatarTint.trim() || creator.avatarTint,
                cover,
              });
              toast(result.message);
            }}
          >
            <Check className="h-3.5 w-3.5" /> Guardar perfil
          </Button>
        </div>
      </SectionCard>

      <div className="space-y-5 lg:col-span-5">
        <SectionCard title="Preferencias" description="Controla la experiencia de tu comunidad.">
          <div className="space-y-3">
            <Switch
              checked={freeTrial}
              onChange={setFreeTrial}
              label="Prueba gratuita de 7 días"
              description="Simulada; no solicita tarjeta."
            />
            <Switch
              checked={aiAssistant}
              onChange={setAiAssistant}
              label="Asistente de IA"
              description="Respuestas automáticas declaradas como IA simulada."
            />
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                const result = updateCreator(creator.id, { freeTrial, aiAssistant });
                toast(result.message);
              }}
            >
              Guardar preferencias
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Vista previa" description="Así se verá tu tarjeta.">
          <div className="overflow-hidden rounded-xl border border-hairline">
            <Cover kind={cover} src={creator.image} alt="" className="aspect-[16/10] w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-[0.58rem] uppercase tracking-[0.16em] text-silver/80">
                  {categories.split(",")[0]?.trim() ?? "Editorial"}
                </p>
                <p className="font-serif text-xl text-pearl">{creator.name}</p>
              </div>
            </Cover>
            <div className="flex items-center gap-2 p-3">
              <Avatar
                name={creator.name}
                src={creator.image}
                tint={avatarTint}
                size={30}
                ring={false}
              />
              <p className="line-clamp-2 text-[0.68rem] text-muted-foreground">{headline}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Datos de la cuenta" description="Identificadores del prototipo.">
          <DataRow label="Handle" value={creator.handle} />
          <DataRow label="Slug" value={creator.slug} mono />
          <DataRow label="Reparto" value={`${creator.revenueShare}%`} />
          <DataRow label="Código afiliada" value={creator.affiliateCode} mono />
          <DataRow label="Estado" value={creator.status} />
          <DataRow label="Miembro desde" value={formatDate(creator.joinedAt)} />
          <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground">
            Sesión: {state.sessionUserId ?? "sin sesión"}. Los cambios se guardan en este navegador
            (localStorage) y no se envían a un servidor.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
