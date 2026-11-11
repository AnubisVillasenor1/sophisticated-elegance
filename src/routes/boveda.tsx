import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookMarked,
  CalendarClock,
  Check,
  Download,
  Film,
  KeyRound,
  Lock,
  Package,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PlatformShell, SectionCard, StudioTabs } from "@/components/platform/PlatformShell";
import {
  Avatar,
  Badge,
  Button,
  Cover,
  CopyButton,
  DataRow,
  DemoBadge,
  EmptyState,
  Modal,
  StatCard,
  btn,
} from "@/components/lux/ui";
import { formatDate, formatMoney, formatNumber, shortHash } from "@/lib/format";
import { fanPurchases, fanSubscriptions, getCreator } from "@/lib/selectors";
import { useApp, useMyCreator } from "@/lib/store";
import type { Purchase, Subscription } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/boveda")({
  head: () => ({
    meta: [
      { title: "Mi bóveda — Xclusive" },
      {
        name: "description",
        content:
          "Contenido desbloqueado, membresías activas, encargos y accesos protegidos del prototipo Xclusive.",
      },
    ],
  }),
  component: VaultPage,
});

type VaultTab = "biblioteca" | "membresias" | "pedidos" | "acceso";

function VaultPage() {
  const { state, user } = useApp();
  const myCreator = useMyCreator();

  if (!user) {
    return (
      <PlatformShell
        title="Mi bóveda"
        eyebrow="Acceso"
        subtitle="Tu contenido protegido, en un solo lugar."
      >
        <EmptyState
          icon={<Lock className="h-6 w-6" />}
          title="La bóveda requiere una llave."
          description="Inicia sesión para ver el contenido que has desbloqueado, tus membresías y tus encargos."
          action={
            <Link to="/entrar" className={btn("primary", "md")}>
              Iniciar sesión <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />
      </PlatformShell>
    );
  }

  if (user.role === "creator") {
    return <CreatorVault creatorName={myCreator?.name ?? user.name} />;
  }

  if (user.role === "admin") {
    return (
      <PlatformShell
        title="Mi bóveda"
        eyebrow="Administración"
        subtitle="La bóveda es una vista de miembro."
      >
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Vista de administración."
          description="Desde la administración puedes revisar reportes, solicitudes y pagos. La bóveda personal pertenece a cada miembro."
          action={
            <Link to="/admin" className={btn("primary", "md")}>
              Ir a administración
            </Link>
          }
        />
      </PlatformShell>
    );
  }

  return <FanVault />;
}

function FanVault() {
  const { state, user, cancelSubscription } = useApp();
  const [tab, setTab] = useState<VaultTab>("biblioteca");
  const fanId = user?.id ?? "";
  const purchases = useMemo(
    () => fanPurchases(state, fanId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [state, fanId],
  );
  const subscriptions = useMemo(() => fanSubscriptions(state, fanId), [state, fanId]);
  const content = purchases.filter((p) => p.kind !== "tip" && p.kind !== "subscription");
  const orders = purchases.filter((p) => p.kind === "custom");
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const spent = purchases.reduce((sum, p) => sum + p.amountMXN, 0);

  return (
    <PlatformShell
      title="Mi bóveda"
      eyebrow="Contenido protegido"
      subtitle={`${content.length} piezas desbloqueadas · ${activeSubs.length} membresías activas`}
      actions={
        <Link to="/explorar" className={cn(btn("secondary", "sm"), "hidden sm:inline-flex")}>
          Descubrir más <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div data-tour="boveda-summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Piezas"
          value={formatNumber(content.length)}
          hint="Clips, PPV y bundles."
          icon={<Film className="h-4 w-4" />}
        />
        <StatCard
          label="Membresías"
          value={formatNumber(activeSubs.length)}
          hint="Activas ahora mismo."
          icon={<Sparkles className="h-4 w-4" />}
          tone="signal"
        />
        <StatCard
          label="Encargos"
          value={formatNumber(orders.length)}
          hint="Pedidos personalizados."
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          label="Total DEMO"
          value={formatMoney(spent, state.currency)}
          hint="Sin cargos reales."
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <StudioTabs
          value={tab}
          onChange={(id) => setTab(id as VaultTab)}
          items={[
            {
              id: "biblioteca",
              label: "Biblioteca",
              icon: <BookMarked className="h-3.5 w-3.5" />,
              badge: content.length,
            },
            {
              id: "membresias",
              label: "Membresías",
              icon: <Sparkles className="h-3.5 w-3.5" />,
              badge: subscriptions.length,
            },
            {
              id: "pedidos",
              label: "Encargos",
              icon: <Package className="h-3.5 w-3.5" />,
              badge: orders.length,
            },
            { id: "acceso", label: "Accesos", icon: <KeyRound className="h-3.5 w-3.5" /> },
          ]}
        />
        <DemoBadge>Bóveda DEMO</DemoBadge>
      </div>

      <div className="mt-5">
        {tab === "biblioteca" ? <Biblioteca purchases={content} /> : null}
        {tab === "membresias" ? (
          <Membresias subscriptions={subscriptions} onCancel={cancelSubscription} />
        ) : null}
        {tab === "pedidos" ? <Pedidos orders={orders} /> : null}
        {tab === "acceso" ? <Accesos purchases={content} /> : null}
      </div>

      <div className="mt-8 rounded-xl border border-warning/25 bg-warning/5 p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-warning">
          <ShieldCheck className="h-3.5 w-3.5" /> Acceso personal e intransferible
        </p>
        <p className="mt-1.5 max-w-4xl text-[0.7rem] leading-relaxed text-muted-foreground">
          El acceso al contenido está vinculado a tu cuenta. No implica propiedad intelectual,
          derecho de descarga, redistribución ni autorización para publicar el material fuera de
          Xclusive. Compartir credenciales o revender membresías puede provocar la suspensión. En
          producción, el acceso se protege con tokens efímeros, marcas de agua y límites de
          reproducción.
        </p>
      </div>
    </PlatformShell>
  );
}

function Biblioteca({ purchases }: { purchases: Purchase[] }) {
  const { state } = useApp();
  const [openPurchase, setOpenPurchase] = useState<Purchase | null>(null);
  if (purchases.length === 0) {
    return (
      <EmptyState
        icon={<BookMarked className="h-6 w-6" />}
        title="Tu biblioteca está esperando."
        description="Compra un clip, desbloquea un PPV o entra a una membresía para empezar tu colección."
        action={
          <Link to="/clips" className={btn("primary", "md")}>
            Explorar clips <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {purchases.map((purchase) => {
          const creator = getCreator(state, purchase.creatorId);
          const clip = creator?.clips.find((c) => c.id === purchase.itemId);
          const post = creator?.posts.find((p) => p.id === purchase.itemId);
          const bundle = creator?.bundles.find((b) => b.id === purchase.itemId);
          const cover = clip?.cover ?? post?.cover ?? creator?.cover ?? "cherry";
          const title = clip?.title ?? post?.title ?? bundle?.title ?? purchase.label;
          const description =
            clip?.description ?? post?.excerpt ?? bundle?.description ?? "Contenido desbloqueado.";
          return (
            <article
              key={purchase.id}
              className="overflow-hidden rounded-xl border border-hairline bg-card/50"
            >
              <Cover kind={cover} alt="" className="aspect-[16/9] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Badge tone="success">
                    <Check className="h-3 w-3" /> Desbloqueado
                  </Badge>
                  <Badge tone="dark">{purchase.kind}</Badge>
                </div>
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
                  <Link
                    to="/creadora/$slug"
                    params={{ slug: creator?.slug ?? "" }}
                    className="inline-flex items-center gap-1.5 text-[0.65rem] text-silver hover:text-pearl"
                  >
                    <Avatar
                      name={creator?.name ?? "Creadora"}
                      tint={creator?.avatarTint ?? "#ed315c"}
                      size={20}
                      ring={false}
                    />{" "}
                    {creator?.name ?? "Creadora"}
                  </Link>
                  <span className="text-[0.6rem] text-silver">
                    {formatMoney(purchase.amountMXN, state.currency)}
                  </span>
                </div>
              </Cover>
              <div className="p-4">
                <h3 className="line-clamp-2 font-serif text-xl leading-tight text-pearl">
                  {title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline pt-3">
                  <span className="text-[0.6rem] text-muted-foreground">
                    {formatDate(purchase.createdAt)}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => setOpenPurchase(purchase)}>
                    Abrir <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <VaultViewer purchase={openPurchase} onClose={() => setOpenPurchase(null)} />
    </>
  );
}

function VaultViewer({ purchase, onClose }: { purchase: Purchase | null; onClose: () => void }) {
  const { state, user } = useApp();
  const creator = purchase ? getCreator(state, purchase.creatorId) : null;
  const clip =
    creator && purchase ? creator.clips.find((c) => c.id === purchase.itemId) : undefined;
  const post =
    creator && purchase ? creator.posts.find((p) => p.id === purchase.itemId) : undefined;
  const bundle =
    creator && purchase ? creator.bundles.find((b) => b.id === purchase.itemId) : undefined;
  const cover = clip?.cover ?? post?.cover ?? creator?.cover ?? "cherry";
  const title = clip?.title ?? post?.title ?? bundle?.title ?? purchase?.label ?? "";
  const description =
    clip?.description ??
    post?.excerpt ??
    bundle?.description ??
    "Pieza desbloqueada en tu bóveda personal.";
  const token = purchase ? `xcl_${shortHash(`${user?.id ?? "demo"}:${purchase.id}`)}` : "";

  return (
    <Modal
      open={Boolean(purchase)}
      onClose={onClose}
      title={title}
      description={creator ? `${creator.name} · ${purchase?.kind ?? ""}` : "Contenido desbloqueado"}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {creator ? (
            <Link
              to="/creadora/$slug"
              params={{ slug: creator.slug }}
              className={btn("primary", "md")}
            >
              Ver perfil completo <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      }
    >
      {purchase ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-hairline">
            <Cover kind={cover} alt="" className="aspect-[16/9] w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <Badge tone="success">
                  <Check className="h-3 w-3" /> Desbloqueado
                </Badge>
                <Badge tone="dark">{purchase.kind}</Badge>
              </div>
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-[0.55rem] uppercase tracking-[0.24em] text-silver">
                  Vista editorial · Modo DEMO
                </p>
                <p className="mt-1 font-serif text-2xl text-pearl">{title}</p>
              </div>
            </Cover>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

          <div className="rounded-xl border border-hairline bg-white/[0.02] px-4 py-2">
            <DataRow label="Creadora" value={creator?.name ?? "Creadora"} />
            <DataRow label="Tipo de acceso" value={purchase.kind} />
            <DataRow label="Importe DEMO" value={formatMoney(purchase.amountMXN, state.currency)} />
            <DataRow label="Fecha" value={formatDate(purchase.createdAt)} />
            <DataRow label="Registro" value={purchase.id} mono />
          </div>

          <div className="rounded-xl border border-info/25 bg-info/5 p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-info">
              <ShieldCheck className="h-3.5 w-3.5" /> Reproducción protegida
            </p>
            <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">
              El material permanece editorial y no explícito en este prototipo. La reproducción real
              exige verificación de edad certificada, consentimiento documentado, revisión legal y
              aprobación del proveedor de pagos. El acceso es personal e intransferible.
            </p>
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-hairline bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all font-mono text-[0.65rem] text-silver">{token}</p>
              <CopyButton value={token} label="Copiar token" />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function Membresias({
  subscriptions,
  onCancel,
}: {
  subscriptions: Subscription[];
  onCancel: (id: string) => { ok: boolean; message: string };
}) {
  const { state } = useApp();
  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="Sin membresías todavía."
        description="Una membresía te da acceso al feed, la bóveda y los salones de una creadora."
        action={
          <Link to="/creadoras" className={btn("primary", "md")}>
            Ver creadoras
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {subscriptions.map((subscription) => {
        const creator = getCreator(state, subscription.creatorId);
        const tier = creator?.tiers.find((t) => t.id === subscription.tierId);
        return (
          <SectionCard
            key={subscription.id}
            title={creator?.name ?? "Creadora"}
            description={`${tier?.name ?? "Plan"} · ${subscription.trial ? "Prueba gratuita" : "Membresía"}`}
            action={
              <Badge tone={subscription.status === "active" ? "success" : "outline"}>
                {subscription.status === "active" ? "Activa" : "Cancelada"}
              </Badge>
            }
          >
            <div className="space-y-1">
              <DataRow label="Precio" value={formatMoney(subscription.priceMXN, state.currency)} />
              <DataRow label="Inicio" value={formatDate(subscription.startedAt)} />
              <DataRow label="Renovación" value={formatDate(subscription.renewsAt)} />
              <DataRow label="Renovación automática" value={subscription.autoRenew ? "Sí" : "No"} />
              <DataRow
                label="Acceso"
                value={
                  subscription.status === "active" ? "Hasta el cierre del periodo" : "Finalizado"
                }
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {creator ? (
                <Link
                  to="/creadora/$slug"
                  params={{ slug: creator.slug }}
                  className={btn("secondary", "sm")}
                >
                  Ver perfil
                </Link>
              ) : null}
              {subscription.status === "active" ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const result = onCancel(subscription.id);
                    toast(result.message);
                  }}
                >
                  Cancelar renovación
                </Button>
              ) : null}
            </div>
            <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground">
              Cancelar impide renovaciones futuras, no genera penalización y conserva el acceso
              hasta el cierre del periodo ya pagado. En DEMO no existe cobro real.
            </p>
          </SectionCard>
        );
      })}
    </div>
  );
}

function Pedidos({ orders }: { orders: Purchase[] }) {
  const { state } = useApp();
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="Sin encargos personalizados."
        description="Los encargos se solicitan desde el perfil de cada creadora y aparecen aquí con su estado."
      />
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const creator = getCreator(state, order.creatorId);
        return (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-xl border border-hairline bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <Avatar
                name={creator?.name ?? "Creadora"}
                tint={creator?.avatarTint ?? "#ed315c"}
                size={36}
                ring={false}
              />
              <div>
                <p className="text-sm text-pearl">{order.label}</p>
                <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                  {creator?.name ?? "Creadora"} · {formatDate(order.createdAt)} ·{" "}
                  {formatMoney(order.amountMXN, state.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={order.status === "delivered" ? "success" : "warning"}>
                {order.status === "delivered" ? "Entregado" : "En curso"}
              </Badge>
              {creator ? (
                <Link
                  to="/creadora/$slug"
                  params={{ slug: creator.slug }}
                  className={btn("secondary", "sm")}
                >
                  Ver creadora
                </Link>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Accesos({ purchases }: { purchases: Purchase[] }) {
  const { state, user } = useApp();
  if (purchases.length === 0) {
    return (
      <EmptyState
        icon={<KeyRound className="h-6 w-6" />}
        title="Sin accesos activos."
        description="Cada compra genera un registro de acceso asociado a tu cuenta."
      />
    );
  }
  return (
    <div className="space-y-3">
      {purchases.map((purchase) => {
        const token = `xcl_${shortHash(`${user?.id ?? "demo"}:${purchase.id}`)}`;
        return (
          <div key={purchase.id} className="rounded-xl border border-hairline bg-card/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-pearl">{purchase.label}</p>
                <p className="mt-0.5 text-[0.62rem] text-muted-foreground">
                  Registro {purchase.id}
                </p>
              </div>
              <Badge tone="info">
                <KeyRound className="h-3 w-3" /> Token DEMO
              </Badge>
            </div>
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-hairline bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all font-mono text-[0.65rem] text-silver">{token}</p>
              <CopyButton value={token} label="Copiar" />
            </div>
            <p className="mt-2 text-[0.6rem] leading-relaxed text-muted-foreground">
              Token simulado, sin valor de acceso real. En producción sería efímero, de un solo uso
              parcial, ligado a dispositivo y con registro de reproducciones. Compartirlo puede
              exponer tu acceso.
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CreatorVault({ creatorName }: { creatorName: string }) {
  const { state } = useApp();
  const myCreator = useMyCreator();
  const vaultPosts =
    myCreator?.posts.filter(
      (p) => p.visibility === "vault" || p.visibility === "members" || p.visibility === "tier",
    ) ?? [];
  const clips = myCreator?.clips ?? [];
  const members = myCreator
    ? state.subscriptions.filter((s) => s.creatorId === myCreator.id && s.status === "active")
        .length
    : 0;

  return (
    <PlatformShell
      title="Mi bóveda"
      eyebrow="Creadora"
      subtitle={`${creatorName} · contenido protegido y acceso de tu comunidad`}
      actions={
        <Link to="/estudio" className={cn(btn("secondary", "sm"), "hidden sm:inline-flex")}>
          Ir al estudio <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Piezas protegidas"
          value={formatNumber(vaultPosts.length)}
          hint="Feed de bóveda, miembros y tiers."
          icon={<BookMarked className="h-4 w-4" />}
        />
        <StatCard
          label="Clips"
          value={formatNumber(clips.length)}
          hint="Marketplace individual."
          icon={<Film className="h-4 w-4" />}
        />
        <StatCard
          label="Miembros"
          value={formatNumber(members)}
          hint="Acceso activo a tu bóveda."
          icon={<Sparkles className="h-4 w-4" />}
          tone="signal"
        />
        <StatCard
          label="Modo"
          value="DEMO"
          hint="Sin cargos ni descargas reales."
          icon={<Lock className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Piezas protegidas"
          description="Solo visibles según su audiencia configurada."
        >
          {vaultPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Todavía no hay piezas de bóveda. Puedes crear una desde el estudio.
            </p>
          ) : (
            <div className="space-y-3">
              {vaultPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 rounded-lg border border-hairline bg-white/[0.02] p-3"
                >
                  <Cover kind={post.cover} alt="" className="h-12 w-16 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-pearl">{post.title}</p>
                    <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                      {post.visibility} · {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <Link
                    to="/creadora/$slug"
                    params={{ slug: myCreator?.slug ?? "" }}
                    className="text-silver hover:text-pearl"
                    aria-label="Ver en el perfil"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Accesos y tokens"
          description="Cómo se protege el contenido en producción."
        >
          <div className="space-y-3">
            {[
              {
                icon: <KeyRound className="h-4 w-4" />,
                title: "Tokens efímeros",
                body: "URLs firmadas con caducidad corta y límite de reproducciones.",
              },
              {
                icon: <Download className="h-4 w-4" />,
                title: "Descarga deshabilitada por defecto",
                body: "El acceso no equivale a propiedad ni autoriza redistribución.",
              },
              {
                icon: <ShieldCheck className="h-4 w-4" />,
                title: "Moderación y consentimiento",
                body: "Cada pieza requiere consentimiento documentado y revisión de contenido.",
              },
              {
                icon: <CalendarClock className="h-4 w-4" />,
                title: "Auditoría",
                body: "En producción se registran accesos, dispositivos y eventos relevantes.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-hairline bg-white/[0.02] p-3"
              >
                <span className="mt-0.5 text-signal">{item.icon}</span>
                <div>
                  <p className="text-xs text-pearl">{item.title}</p>
                  <p className="mt-0.5 text-[0.65rem] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 rounded-xl border border-info/25 bg-info/5 p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-info">
          <Ticket className="h-3.5 w-3.5" /> Vista de creadora
        </p>
        <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">
          La bóveda de miembro muestra compras y membresías. Esta vista de creadora muestra tu
          contenido protegido y las reglas de acceso que aplicarían en producción. Puedes publicar
          nuevas piezas desde el estudio.
        </p>
      </div>
    </PlatformShell>
  );
}
