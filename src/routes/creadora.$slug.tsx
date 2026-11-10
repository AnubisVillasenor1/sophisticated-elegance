import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Clock,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Radio,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ClipCard, PostCard, TierCard } from "@/components/lux/cards";
import {
  CheckoutDialog,
  ReportDialog,
  SubscribeDialog,
  TipDialog,
  type CheckoutState,
} from "@/components/lux/checkout";
import {
  Avatar,
  Badge,
  Button,
  Cover,
  DemoBadge,
  EmptyState,
  VerifiedBadge,
  btn,
} from "@/components/lux/ui";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { activeSubscription, getCreatorBySlug } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { Creator } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/creadora/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Xclusive` },
      {
        name: "description",
        content: "Perfil editorial, membresías y archivo protegido en el prototipo Xclusive.",
      },
    ],
  }),
  component: CreatorProfilePage,
});

type Tab = "feed" | "planes" | "clips" | "salones" | "encargos";

function CreatorProfilePage() {
  const { slug } = Route.useParams();
  const { state, user, startThread } = useApp();
  const navigate = useNavigate();
  const creator = getCreatorBySlug(state, slug);
  const [tab, setTab] = useState<Tab>("feed");
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: "creator" | "post";
    id: string;
    label: string;
  } | null>(null);
  const [checkout, setCheckout] = useState<CheckoutState>(null);

  if (!creator) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="eyebrow">Perfil no disponible</p>
          <h1 className="mt-4 font-serif text-5xl text-pearl">Esta creadora no está en el club.</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            El perfil pudo cambiar de dirección o estar en revisión.
          </p>
          <Link to="/explorar" className={cn(btn("primary", "md"), "mt-8")}>
            <ArrowLeft className="h-4 w-4" /> Volver a explorar
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const subscription = user ? activeSubscription(state, user.id, creator.id) : null;
  const live = creator.rooms.find((r) => r.status === "live");
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "feed", label: "Feed", count: creator.posts.length },
    { id: "planes", label: "Planes", count: creator.tiers.length },
    { id: "clips", label: "Clips", count: creator.clips.length },
    { id: "salones", label: "Salones", count: creator.rooms.length },
    { id: "encargos", label: "Encargos", count: creator.offers.length + creator.bundles.length },
  ];

  return (
    <SiteLayout>
      {/* Cover */}
      <section className="relative">
        <Cover
          kind={creator.cover}
          alt={`Portada de ${creator.name}`}
          className="h-64 w-full sm:h-80 lg:h-96"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 lg:left-10">
            <Link to="/explorar" className={cn(btn("secondary", "sm"), "backdrop-blur")}>
              <ArrowLeft className="h-3.5 w-3.5" /> Explorar
            </Link>
            {live ? (
              <Link to="/salon/$id" params={{ id: live.id }} className={btn("primary", "sm")}>
                <Radio className="h-3.5 w-3.5" /> En vivo
              </Link>
            ) : null}
          </div>
        </Cover>

        <div className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-10">
          <div className="-mt-16 flex flex-col gap-5 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                name={creator.name}
                tint={creator.avatarTint}
                size={92}
                className="ring-4 ring-background"
              />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-4xl leading-none text-pearl sm:text-5xl">
                    {creator.name}
                  </h1>
                  {creator.verified ? <VerifiedBadge /> : null}
                </div>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {creator.handle}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setTipOpen(true)}>
                <Heart className="h-3.5 w-3.5" /> Propina
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setReportTarget({ type: "creator", id: creator.id, label: creator.name })
                }
              >
                <Flag className="h-3.5 w-3.5" /> Reportar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!user) {
                    navigate({ to: "/entrar" });
                    return;
                  }
                  const result = startThread(creator.id);
                  if (result.ok) navigate({ to: "/mensajes" });
                  else toast(result.message);
                }}
              >
                <MessageCircle className="h-3.5 w-3.5" /> Mensaje
              </Button>
              <Button size="sm" onClick={() => setSubscribeOpen(true)}>
                {subscription ? "Cambiar plan" : "Suscribirme"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="max-w-2xl text-sm leading-relaxed text-silver">{creator.headline}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {creator.bio}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="outline">
                  <MapPin className="h-3 w-3" /> {creator.city}, {creator.country}
                </Badge>
                {creator.categories.map((category) => (
                  <Badge key={category} tone="default">
                    {category}
                  </Badge>
                ))}
                {creator.aiAssisted ? (
                  <Badge tone="info">
                    <Sparkles className="h-3 w-3" /> IA declarada
                  </Badge>
                ) : null}
                {!creator.adult ? (
                  <Badge tone="success">SFW</Badge>
                ) : (
                  <Badge tone="outline">18+ editorial</Badge>
                )}
                <DemoBadge />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {creator.tags.map((tag) => (
                  <span key={tag} className="chip">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="panel p-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Miembros", formatNumber(creator.members)],
                    ["Seguidoras", formatNumber(creator.followers)],
                    ["Valoración", `${creator.rating.toFixed(1)} / 5`],
                    ["Respuesta", creator.responseTime],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 font-serif text-xl text-pearl">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-hairline pt-4">
                  <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Membresía desde
                  </p>
                  <p className="mt-1 font-serif text-3xl text-pearl">
                    {formatMoney(Math.min(...creator.tiers.map((t) => t.priceMXN)), state.currency)}
                    <span className="ml-1 font-sans text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                      / mes
                    </span>
                  </p>
                  {subscription ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[0.68rem] text-success">
                      <Check className="h-3.5 w-3.5" /> Miembro activo
                    </p>
                  ) : null}
                </div>
                <div className="mt-4 space-y-1.5 text-[0.68rem] text-muted-foreground">
                  <p className="flex items-center justify-between gap-2">
                    <span>Unión</span>{" "}
                    <span className="text-silver">{formatDate(creator.joinedAt)}</span>
                  </p>
                  <p className="flex items-center justify-between gap-2">
                    <span>Reparto creadora</span>{" "}
                    <span className="text-silver">{creator.revenueShare}%</span>
                  </p>
                  <p className="flex items-center justify-between gap-2">
                    <span>Prueba gratuita</span>{" "}
                    <span className="text-silver">{creator.freeTrial ? "Sí, 7 días" : "No"}</span>
                  </p>
                </div>
                <Button className="mt-4 w-full" onClick={() => setSubscribeOpen(true)}>
                  <Sparkles className="h-4 w-4" />{" "}
                  {subscription ? "Gestionar plan" : "Entrar al círculo"}
                </Button>
                <p className="mt-2 text-center text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Simulación · sin cargo real
                </p>
              </div>
            </aside>
          </div>

          {/* Tabs */}
          <div className="no-scrollbar mt-8 flex gap-1 overflow-x-auto border-b border-hairline pb-px">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-3 text-xs uppercase tracking-[0.14em] transition-colors",
                  tab === item.id
                    ? "border-signal text-pearl"
                    : "border-transparent text-muted-foreground hover:text-pearl",
                )}
              >
                {item.label}{" "}
                <span className="ml-1 text-[0.6rem] text-muted-foreground">{item.count}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            {tab === "feed" ? (
              creator.posts.length === 0 ? (
                <EmptyState
                  title="Feed en preparación."
                  description="Esta creadora todavía no publica contenido en el prototipo."
                  icon={<Sparkles className="h-6 w-6" />}
                />
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {creator.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      creator={creator}
                      onUnlock={(p) =>
                        setCheckout({
                          kind: "ppv",
                          creator,
                          itemId: p.id,
                          label: p.title,
                          amountMXN: p.priceMXN,
                          description: p.excerpt,
                        })
                      }
                      onSubscribe={() => setSubscribeOpen(true)}
                      onReport={(p) => setReportTarget({ type: "post", id: p.id, label: p.title })}
                    />
                  ))}
                </div>
              )
            ) : null}

            {tab === "planes" ? (
              <div className="grid gap-5 lg:grid-cols-3">
                {creator.tiers.map((tier) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    creator={creator}
                    active={subscription?.tierId === tier.id}
                    onSubscribe={() => setSubscribeOpen(true)}
                  />
                ))}
              </div>
            ) : null}

            {tab === "clips" ? (
              creator.clips.length === 0 ? (
                <EmptyState
                  title="Sin clips todavía."
                  description="El marketplace de esta creadora está en preparación."
                  icon={<ShoppingBag className="h-6 w-6" />}
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {creator.clips.map((clip) => (
                    <ClipCard
                      key={clip.id}
                      clip={clip}
                      creator={creator}
                      onBuy={(c) =>
                        setCheckout({
                          kind: "clip",
                          creator,
                          itemId: c.id,
                          label: c.title,
                          amountMXN: c.priceMXN,
                          description: c.description,
                        })
                      }
                    />
                  ))}
                </div>
              )
            ) : null}

            {tab === "salones" ? (
              creator.rooms.length === 0 ? (
                <EmptyState
                  title="Sin salones programados."
                  description="Cuando abra una sala, aparecerá aquí con su control de acceso."
                  icon={<Radio className="h-6 w-6" />}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {creator.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="overflow-hidden rounded-xl border border-hairline bg-card/50"
                    >
                      <Cover kind={room.cover} alt="" className="aspect-[16/9] w-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute left-3 top-3 flex gap-1.5">
                          {room.status === "live" ? (
                            <Badge tone="signal">En vivo</Badge>
                          ) : (
                            <Badge tone="info">Programado</Badge>
                          )}
                          <Badge tone="dark">
                            {room.access === "free"
                              ? "Abierto"
                              : room.access === "members"
                                ? "Miembros"
                                : formatMoney(room.ticketPriceMXN, state.currency)}
                          </Badge>
                        </div>
                        <div className="absolute inset-x-4 bottom-3">
                          <p className="font-serif text-2xl text-pearl">{room.title}</p>
                        </div>
                      </Cover>
                      <div className="p-4">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {room.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1 text-[0.65rem] text-silver">
                            <CalendarClock className="h-3.5 w-3.5" /> {formatDate(room.startsAt)}
                          </span>
                          <Link
                            to="/salon/$id"
                            params={{ id: room.id }}
                            className={btn("secondary", "sm")}
                          >
                            Entrar
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}

            {tab === "encargos" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {creator.offers.length === 0 && creator.bundles.length === 0 ? (
                  <div className="lg:col-span-2">
                    <EmptyState
                      title="Sin encargos abiertos."
                      description="Las piezas personalizadas se abrirán por temporada."
                      icon={<Clock className="h-6 w-6" />}
                    />
                  </div>
                ) : null}
                {creator.offers.map((offer) => (
                  <div key={offer.id} className="rounded-xl border border-hairline bg-card/50 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="outline">
                        {offer.kind === "custom"
                          ? "Encargo"
                          : offer.kind === "call"
                            ? "Llamada"
                            : "Audio"}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[0.62rem] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {offer.turnaroundDays} días
                      </span>
                    </div>
                    <h3 className="mt-3 font-serif text-2xl text-pearl">{offer.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {offer.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-4">
                      <div>
                        <p className="font-serif text-2xl text-pearl">
                          {formatMoney(offer.priceMXN, state.currency)}
                        </p>
                        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                          {offer.slots} lugares
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCheckout({
                            kind: "custom",
                            creator,
                            itemId: offer.id,
                            label: offer.title,
                            amountMXN: offer.priceMXN,
                            description: offer.description,
                          })
                        }
                      >
                        Solicitar
                      </Button>
                    </div>
                  </div>
                ))}
                {creator.bundles.map((bundle) => (
                  <div key={bundle.id} className="rounded-xl border border-hairline bg-card/50 p-5">
                    <Badge tone="warning">Bundle</Badge>
                    <h3 className="mt-3 font-serif text-2xl text-pearl">{bundle.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {bundle.description}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {bundle.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-[0.7rem] text-silver"
                        >
                          <Check className="h-3 w-3 text-signal" /> {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-4">
                      <div>
                        <p className="font-serif text-2xl text-pearl">
                          {formatMoney(bundle.priceMXN, state.currency)}
                        </p>
                        <p className="text-[0.62rem] text-muted-foreground line-through">
                          {formatMoney(bundle.originalPriceMXN, state.currency)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCheckout({
                            kind: "bundle",
                            creator,
                            itemId: bundle.id,
                            label: bundle.title,
                            amountMXN: bundle.priceMXN,
                            description: bundle.description,
                          })
                        }
                      >
                        <Wallet className="h-3.5 w-3.5" /> Comprar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4">
            <p className="inline-flex items-center gap-2 text-[0.68rem] text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Acceso personal e intransferible. El contenido puede
              estar protegido con marcas y tokens.
            </p>
            <Link to="/legal/$doc" params={{ doc: "contenido" }} className={btn("ghost", "sm")}>
              Política de contenido
            </Link>
          </div>
        </div>
      </section>

      <SubscribeDialog
        creator={creator}
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
      <TipDialog creator={creator} open={tipOpen} onClose={() => setTipOpen(false)} />
      {reportTarget ? (
        <ReportDialog
          target={reportTarget}
          open={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
        />
      ) : null}
      <CheckoutDialog state={checkout} onClose={() => setCheckout(null)} />
    </SiteLayout>
  );
}
