import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bookmark,
  Clock,
  Eye,
  Heart,
  Lock,
  MessageCircle,
  Radio,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Clip, Creator, LiveRoom, Post, Tier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, Badge, Button, Cover, DemoBadge, VerifiedBadge, btn } from "./ui";

export function CreatorCard({ creator, compact = false }: { creator: Creator; compact?: boolean }) {
  const { state, user, toggleFavorite } = useApp();
  const navigate = useNavigate();
  const currency = state.currency;
  const isFavorite = state.favorites.includes(creator.id);
  const live = creator.rooms.find((r) => r.status === "live");
  const minTier = [...creator.tiers].sort((a, b) => a.priceMXN - b.priceMXN)[0];

  return (
    <article className="group relative overflow-hidden rounded-xl border border-hairline bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:border-signal/30 hover:shadow-deep">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pearl/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <Link
        to="/creadora/$slug"
        params={{ slug: creator.slug }}
        className="block"
        aria-label={`Ver perfil de ${creator.name}`}
      >
        <Cover
          kind={creator.cover}
          alt={`Portada de ${creator.name}`}
          className={cn("w-full", compact ? "aspect-[16/10]" : "aspect-[4/5]")}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {live ? (
              <Badge tone="signal">
                <span className="h-1.5 w-1.5 rounded-full bg-pearl animate-pulse-dot" /> En vivo
              </Badge>
            ) : null}
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
          </div>
          {!compact ? (
            <div className="absolute inset-x-4 bottom-4">
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-silver/85">
                {creator.categories.join(" · ")}
              </p>
              <h3 className="mt-1 font-serif text-3xl leading-none text-pearl">{creator.name}</h3>
            </div>
          ) : null}
        </Cover>
      </Link>

      <div className="p-4 sm:p-5">
        {compact ? (
          <div className="flex items-start justify-between gap-3">
            <Link to="/creadora/$slug" params={{ slug: creator.slug }} className="min-w-0">
              <h3 className="font-serif text-2xl leading-tight text-pearl">{creator.name}</h3>
              <p className="mt-0.5 truncate text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                {creator.categories.join(" · ")}
              </p>
            </Link>
            <button
              type="button"
              aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
              onClick={() => {
                if (!user) {
                  navigate({ to: "/entrar" });
                  return;
                }
                const result = toggleFavorite(creator.id);
                toast(result.message);
              }}
              className={cn(
                "rounded-full border p-2 transition-colors",
                isFavorite
                  ? "border-signal/50 bg-signal/15 text-signal"
                  : "border-hairline text-muted-foreground hover:text-pearl",
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
            </button>
          </div>
        ) : null}

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {creator.headline}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.68rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {formatNumber(creator.members)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 text-warning" /> {creator.rating.toFixed(1)}
          </span>
          {creator.verified ? <VerifiedBadge /> : null}
          <span className="ml-auto inline-flex items-center gap-1 text-silver">
            <Clock className="h-3 w-3" /> {creator.responseTime}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-4">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Desde</p>
            <p className="font-serif text-2xl text-pearl">
              {formatMoney(minTier?.priceMXN ?? 0, currency)}
              <span className="ml-1 font-sans text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                / mes
              </span>
            </p>
          </div>
          <Link
            to="/creadora/$slug"
            params={{ slug: creator.slug }}
            className={btn("outline", "sm")}
          >
            Ver perfil <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PostCard({
  post,
  creator,
  onUnlock,
  onSubscribe,
  onReport,
}: {
  post: Post;
  creator: Creator;
  onUnlock: (post: Post) => void;
  onSubscribe: (creator: Creator) => void;
  onReport?: (post: Post) => void;
}) {
  const { state, canViewPost, hasPurchased } = useApp();
  const currency = state.currency;
  const unlocked = canViewPost(post);
  const owned = hasPurchased(post.id);
  const subActive = state.subscriptions.some(
    (s) =>
      s.creatorId === creator.id &&
      s.status === "active" &&
      (s.fanId === state.sessionUserId || false),
  );

  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-card/50">
      <Cover kind={post.cover} alt="" className="aspect-[16/9] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <Badge
            tone={
              post.visibility === "public"
                ? "success"
                : post.visibility === "ppv"
                  ? "warning"
                  : "signal"
            }
          >
            {post.visibility === "public"
              ? "Público"
              : post.visibility === "members"
                ? "Miembros"
                : post.visibility === "tier"
                  ? "Tier"
                  : post.visibility === "ppv"
                    ? "PPV"
                    : "Bóveda"}
          </Badge>
          {post.mature ? <Badge tone="outline">18+</Badge> : null}
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-silver/80">
            {formatDate(post.createdAt)}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[0.62rem] text-silver backdrop-blur">
            <Heart className="h-3 w-3" /> {post.likes}
            <MessageCircle className="ml-2 h-3 w-3" /> {post.comments}
          </span>
        </div>
      </Cover>

      <div className="p-5">
        <h3 className="font-serif text-2xl leading-tight text-pearl">{post.title}</h3>
        {unlocked ? (
          <>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {post.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="chip">
                  #{tag}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="relative mt-3 overflow-hidden rounded-lg border border-hairline bg-black/25 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Lock className="h-4 w-4 text-signal" />
              <p className="text-xs text-silver">
                {post.visibility === "ppv"
                  ? `Compra única · ${formatMoney(post.priceMXN, currency)}`
                  : post.visibility === "tier"
                    ? `Disponible para ${creator.tiers.find((t) => t.id === post.tierId)?.name ?? "un tier superior"}`
                    : "Disponible para miembros activos"}
              </p>
            </div>
            <div className="mt-4">
              {post.visibility === "ppv" ? (
                <Button size="sm" onClick={() => onUnlock(post)}>
                  <ShoppingBag className="h-3.5 w-3.5" /> Desbloquear{" "}
                  {formatMoney(post.priceMXN, currency)}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={subActive ? "secondary" : "primary"}
                  onClick={() => onSubscribe(creator)}
                >
                  {subActive ? "Mejorar plan" : "Suscribirme"}
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
          <p className="text-[0.65rem] text-muted-foreground">
            {owned ? "Acceso vinculado a tu cuenta." : `Por ${creator.name}`}
          </p>
          {onReport ? (
            <button
              type="button"
              onClick={() => onReport(post)}
              className="text-[0.65rem] text-muted-foreground underline-offset-4 hover:text-pearl hover:underline"
            >
              Reportar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ClipCard({
  clip,
  creator,
  onBuy,
}: {
  clip: Clip;
  creator: Creator;
  onBuy: (clip: Clip, creator: Creator) => void;
}) {
  const { state, hasPurchased } = useApp();
  const currency = state.currency;
  const owned = hasPurchased(clip.id);

  return (
    <article className="group overflow-hidden rounded-xl border border-hairline bg-card/50 transition-all duration-500 hover:-translate-y-1 hover:border-signal/25">
      <Cover kind={clip.cover} alt="" className="aspect-[16/9] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone="dark">{clip.category}</Badge>
          {clip.mature ? <Badge tone="outline">18+</Badge> : null}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <Link
            to="/creadora/$slug"
            params={{ slug: creator.slug }}
            className="inline-flex items-center gap-2 text-[0.65rem] text-silver transition-colors hover:text-pearl"
          >
            <Avatar name={creator.name} tint={creator.avatarTint} size={22} ring={false} />{" "}
            {creator.name}
          </Link>
          <span className="rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[0.6rem] text-silver backdrop-blur">
            {clip.duration}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onBuy(clip, creator)}
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-label={`Ver ${clip.title}`}
        >
          <span className="rounded-full border border-white/20 bg-black/60 p-3 backdrop-blur">
            <Eye className="h-5 w-5 text-pearl" />
          </span>
        </button>
      </Cover>
      <div className="p-4">
        <h3 className="line-clamp-2 font-serif text-xl leading-tight text-pearl">{clip.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {clip.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-3">
          <div>
            <p className="font-serif text-xl text-pearl">
              {owned ? "Desbloqueado" : formatMoney(clip.priceMXN, currency)}
            </p>
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
              {formatNumber(clip.sales)} ventas
            </p>
          </div>
          <Button
            size="sm"
            variant={owned ? "secondary" : "primary"}
            onClick={() => onBuy(clip, creator)}
          >
            {owned ? (
              <>
                <Eye className="h-3.5 w-3.5" /> Ver
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Comprar
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function LiveCard({ room, creator }: { room: LiveRoom; creator: Creator }) {
  const { state } = useApp();
  const currency = state.currency;
  return (
    <Link
      to="/salon/$id"
      params={{ id: room.id }}
      className="group block overflow-hidden rounded-xl border border-hairline bg-card/50 transition-all duration-500 hover:-translate-y-1 hover:border-signal/30"
    >
      <Cover kind={room.cover} alt="" className="aspect-[16/9] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {room.status === "live" ? (
            <Badge tone="signal">
              <span className="h-1.5 w-1.5 rounded-full bg-pearl animate-pulse-dot" /> En vivo
            </Badge>
          ) : room.status === "scheduled" ? (
            <Badge tone="info">
              <Clock className="h-3 w-3" /> Programado
            </Badge>
          ) : (
            <Badge tone="outline">Finalizado</Badge>
          )}
          <Badge tone="dark">
            {room.access === "free"
              ? "Abierto"
              : room.access === "members"
                ? "Miembros"
                : `${formatMoney(room.ticketPriceMXN, currency)}`}
          </Badge>
        </div>
        {room.status === "live" ? (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[0.62rem] text-silver backdrop-blur">
            <Eye className="h-3 w-3" /> {formatNumber(room.viewers)}/{room.capacity}
          </div>
        ) : null}
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-silver/85">{creator.name}</p>
          <h3 className="mt-1 font-serif text-2xl leading-tight text-pearl">{room.title}</h3>
        </div>
      </Cover>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="line-clamp-1 text-xs text-muted-foreground">{room.description}</p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.14em] text-silver">
            {room.status === "live" ? (
              <>
                <Radio className="h-3 w-3 text-signal" /> Ahora
              </>
            ) : room.status === "scheduled" ? (
              <>
                <Clock className="h-3 w-3" /> {formatDateTime(room.startsAt)}
              </>
            ) : (
              <>
                <Ticket className="h-3 w-3" /> Archivo
              </>
            )}
          </p>
        </div>
        <span className="rounded-full border border-hairline p-2 text-silver transition-colors group-hover:border-signal/40 group-hover:text-pearl">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function TierCard({
  tier,
  creator,
  active,
  onSubscribe,
}: {
  tier: Tier;
  creator: Creator;
  active: boolean;
  onSubscribe: (tier: Tier, trial: boolean) => void;
}) {
  const { state } = useApp();
  const currency = state.currency;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition-all duration-500 sm:p-6",
        tier.featured
          ? "border-signal/40 bg-gradient-to-b from-cherry/90 to-card shadow-ember"
          : "border-hairline bg-card/50 hover:border-silver/25",
      )}
    >
      <span className="pointer-events-none absolute -right-2 -top-8 font-serif text-[8rem] leading-none text-pearl/[0.045]">
        {tier.level === 1 ? "I" : tier.level === 2 ? "II" : "III"}
      </span>
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">Nivel {tier.level === 1 ? "I" : tier.level === 2 ? "II" : "III"}</p>
        {tier.featured ? <Badge tone="signal">Más elegido</Badge> : null}
      </div>
      <h3 className="mt-4 font-serif text-2xl leading-tight text-pearl">{tier.name}</h3>
      <p className="mt-1 font-serif text-sm italic text-silver/80">{tier.tagline}</p>
      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="font-serif text-4xl text-pearl">
          {formatMoney(tier.priceMXN, currency)}
        </span>
        <span className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
          / mes
        </span>
      </p>
      <ul className="mt-5 flex-1 space-y-2.5 border-t border-hairline pt-5">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex gap-2.5 text-xs leading-relaxed text-foreground/85">
            <span className="mt-1.5 h-1 w-2.5 shrink-0 bg-signal" />
            {perk}
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-2">
        <Button
          variant={tier.featured ? "primary" : "secondary"}
          className="w-full"
          onClick={() => onSubscribe(tier, false)}
          disabled={active}
        >
          {active ? "Plan activo" : "Elegir plan"}
        </Button>
        {creator.freeTrial && !active ? (
          <button
            type="button"
            onClick={() => onSubscribe(tier, true)}
            className="w-full text-center text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 transition-colors hover:text-pearl hover:underline"
          >
            Probar 7 días gratis
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-center text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
        Simulación · sin cargo real
      </p>
    </article>
  );
}

export function CreatorStrip({ creator }: { creator: Creator }) {
  return (
    <Link
      to="/creadora/$slug"
      params={{ slug: creator.slug }}
      className="flex items-center gap-3 rounded-xl border border-hairline bg-white/[0.02] p-3 transition-colors hover:border-signal/30 hover:bg-white/[0.04]"
    >
      <Avatar name={creator.name} tint={creator.avatarTint} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-pearl">{creator.name}</p>
        <p className="truncate text-[0.65rem] text-muted-foreground">
          {creator.categories.join(" · ")}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-silver" />
    </Link>
  );
}

export function LockedOverlay({ children, label }: { children?: React.ReactNode; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-black/30">
      <div className="pointer-events-none select-none p-5 opacity-30 blur-[3px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 p-4 text-center backdrop-blur-[2px]">
        <Lock className="h-5 w-5 text-signal" />
        <p className="text-xs text-silver">{label}</p>
        <DemoBadge />
      </div>
    </div>
  );
}
