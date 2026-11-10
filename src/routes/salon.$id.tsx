import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Eye,
  Flag,
  Heart,
  Lock,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ReportDialog, TipDialog } from "@/components/lux/checkout";
import {
  Avatar,
  Badge,
  Button,
  Cover,
  DemoBadge,
  EmptyState,
  Input,
  btn,
} from "@/components/lux/ui";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatDateTime, formatMoney, formatNumber, formatTime } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Creator, LiveRoom } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/salon/$id")({
  head: () => ({
    meta: [
      { title: "Salón en vivo — Xclusive" },
      {
        name: "description",
        content:
          "Sala en vivo editorial con cupo limitado. Simulación en Modo DEMO sin cargos reales.",
      },
    ],
  }),
  component: SalonPage,
});

type ChatMessage = { id: string; author: string; body: string; tint: string; self?: boolean };

const SEED_CHAT: ChatMessage[] = [
  {
    id: "c1",
    author: "Andrea V.",
    body: "Llegué justo a tiempo. La luz de hoy está increíble.",
    tint: "#c98a4b",
  },
  {
    id: "c2",
    author: "Diego M.",
    body: "¿La grabación queda en la bóveda después?",
    tint: "#5f7fa8",
  },
  {
    id: "c3",
    author: "Valentina R.",
    body: "La sesión completa sí. El audio también.",
    tint: "#ed315c",
  },
  {
    id: "c4",
    author: "Renata",
    body: "El detalle de la lámpara es mi parte favorita.",
    tint: "#c56c83",
  },
];

function findRoom(
  state: ReturnType<typeof useApp>["state"],
  id: string,
): { creator: Creator; room: LiveRoom } | null {
  for (const creator of state.creators) {
    const room = creator.rooms.find((r) => r.id === id);
    if (room) return { creator, room };
  }
  return null;
}

function SalonPage() {
  const { id } = Route.useParams();
  const { state, user, liveTip } = useApp();
  const found = findRoom(state, id);
  const [entered, setEntered] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_CHAT);
  const [draft, setDraft] = useState("");
  const [tipAmount, setTipAmount] = useState(50);
  const scrollRef = useRef<HTMLDivElement>(null);

  const subscription = useMemo(() => {
    if (!found || !user) return null;
    return state.subscriptions.find(
      (s) => s.creatorId === found.creator.id && s.fanId === user.id && s.status === "active",
    );
  }, [found, state.subscriptions, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!found) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="eyebrow">Salón no disponible</p>
          <h1 className="mt-4 font-serif text-5xl text-pearl">Esta sala ya cerró.</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Puede haber terminado o haberse movido a otro horario.
          </p>
          <Link to="/salones" className={cn(btn("primary", "md"), "mt-8")}>
            <ArrowLeft className="h-4 w-4" /> Ver salones
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { creator, room } = found;
  const needsTicket = room.access === "ticket";
  const needsMembership = room.access === "members";
  const isLive = room.status === "live";
  const canEnter = !isLive || room.access === "free" || Boolean(subscription) || entered;

  const sendMessage = () => {
    const body = draft.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        author: user?.name ?? "Invitada",
        body,
        tint: user?.avatarTint ?? "#c56c83",
        self: true,
      },
    ]);
    setDraft("");
    window.setTimeout(() => {
      const replies = [
        "Gracias por estar aquí. Lo leo todo.",
        "Esa pregunta la respondo al final, no me dejo nada.",
        "El próximo salón será más íntimo. Te aviso.",
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-r`,
          author: creator.name,
          body: replies[Math.floor(Math.random() * replies.length)] ?? "Gracias por acompañarme.",
          tint: creator.avatarTint,
        },
      ]);
    }, 1600);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/salones" className={btn("ghost", "sm")}>
            <ArrowLeft className="h-3.5 w-3.5" /> Salones
          </Link>
          <div className="flex items-center gap-2">
            {isLive ? (
              <Badge tone="signal">En vivo</Badge>
            ) : room.status === "scheduled" ? (
              <Badge tone="info">Programado</Badge>
            ) : (
              <Badge tone="outline">Archivo</Badge>
            )}
            <Badge tone="dark">
              {room.access === "free"
                ? "Abierto"
                : room.access === "members"
                  ? "Miembros"
                  : `Boleto ${formatMoney(room.ticketPriceMXN, state.currency)}`}
            </Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Stage */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-hairline bg-card/50">
              <Cover kind={room.cover} alt="" className="relative aspect-video w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
                {isLive ? (
                  <>
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal/20 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-pearl backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-pearl animate-pulse-dot" /> En
                        vivo
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[0.6rem] text-silver backdrop-blur">
                        <Eye className="h-3 w-3" /> {formatNumber(room.viewers)} /{" "}
                        {formatNumber(room.capacity)}
                      </span>
                    </div>

                    {!canEnter ? (
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="max-w-sm rounded-xl border border-hairline bg-background/85 p-6 text-center backdrop-blur-xl">
                          <Lock className="mx-auto h-6 w-6 text-signal" />
                          <p className="mt-3 font-serif text-2xl text-pearl">
                            {needsMembership
                              ? "Sala para miembros."
                              : needsTicket
                                ? "Este salón requiere boleto."
                                : "Acceso restringido."}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {needsMembership
                              ? `Activa una membresía de ${creator.name} para entrar. En DEMO puedes simular el acceso.`
                              : needsTicket
                                ? "El boleto es una simulación. No se realizará cargo real."
                                : "Inicia sesión para continuar."}
                          </p>
                          <div className="mt-4 flex flex-col gap-2">
                            <Button
                              onClick={() => {
                                if (needsTicket) {
                                  liveTip(creator.id, room.id, 0);
                                  toast("Boleto DEMO registrado. Sin cargo real.");
                                }
                                setEntered(true);
                              }}
                            >
                              <Ticket className="h-4 w-4" /> Entrar en Modo DEMO
                            </Button>
                            <Link
                              to="/creadora/$slug"
                              params={{ slug: creator.slug }}
                              className={btn("secondary", "md")}
                            >
                              Ver perfil
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-silver/80">
                              {creator.name}
                            </p>
                            <h1 className="mt-1 font-serif text-3xl leading-tight text-pearl sm:text-4xl">
                              {room.title}
                            </h1>
                            <p className="mt-1 max-w-lg text-xs leading-relaxed text-silver/80">
                              {room.description}
                            </p>
                          </div>
                          <span className="hidden shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[0.65rem] text-silver backdrop-blur sm:flex">
                            <Sparkles className="h-3.5 w-3.5 text-signal" /> Transmisión simulada
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <CalendarClock className="h-7 w-7 text-silver" />
                    <p className="mt-3 font-serif text-3xl text-pearl">{room.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDateTime(room.startsAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Duración estimada: {room.durationMin} min · Cupo {room.capacity}
                    </p>
                  </div>
                )}
              </Cover>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline p-4">
                <div className="flex items-center gap-2">
                  <Avatar name={creator.name} tint={creator.avatarTint} size={34} />
                  <div>
                    <p className="text-xs text-pearl">{creator.name}</p>
                    <p className="text-[0.6rem] text-muted-foreground">
                      {creator.categories.join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setReportOpen(true)}>
                    <Flag className="h-3.5 w-3.5" /> Reportar
                  </Button>
                  <Button size="sm" onClick={() => setTipOpen(true)}>
                    <Heart className="h-3.5 w-3.5" /> Propina
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Propinas DEMO",
                  value: formatMoney(room.tipsMXN, state.currency),
                  icon: <Heart className="h-3.5 w-3.5" />,
                },
                {
                  label: "Audiencia",
                  value: `${formatNumber(room.viewers)} / ${formatNumber(room.capacity)}`,
                  icon: <Users className="h-3.5 w-3.5" />,
                },
                {
                  label: "Duración",
                  value: `${room.durationMin} min`,
                  icon: <Clock className="h-3.5 w-3.5" />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-hairline bg-white/[0.02] p-4"
                >
                  <p className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.icon} {item.label}
                  </p>
                  <p className="mt-1.5 font-serif text-2xl text-pearl">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-hairline bg-white/[0.02] p-4">
              <div className="flex items-start gap-2 text-[0.68rem] leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <p>
                  En producción, el acceso al salón se valida con token efímero, control de sesiones
                  y registro de eventos. La grabación solo se conserva si la creadora lo autoriza.
                  Reporta cualquier conducta que vulnere la{" "}
                  <Link
                    to="/legal/$doc"
                    params={{ doc: "contenido" }}
                    className="text-pearl underline-offset-4 hover:underline"
                  >
                    Política de contenido
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <aside className="lg:col-span-4">
            <div className="flex h-full flex-col rounded-xl border border-hairline bg-card/50">
              <div className="flex items-center justify-between gap-2 border-b border-hairline p-4">
                <p className="inline-flex items-center gap-2 text-sm text-pearl">
                  <Radio className="h-4 w-4 text-signal" /> Chat del salón
                </p>
                <DemoBadge>Simulado</DemoBadge>
              </div>

              <div
                ref={scrollRef}
                className="max-h-[26rem] flex-1 space-y-3 overflow-y-auto p-4 scroll-lux lg:max-h-none"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-2.5", message.self && "flex-row-reverse text-right")}
                  >
                    <Avatar name={message.author} tint={message.tint} size={26} ring={false} />
                    <div
                      className={cn("min-w-0 flex-1", message.self && "flex flex-col items-end")}
                    >
                      <p className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                        {message.author}
                      </p>
                      <p
                        className={cn(
                          "mt-1 inline-block rounded-lg px-3 py-2 text-xs leading-relaxed",
                          message.self ? "bg-signal/20 text-pearl" : "bg-white/[0.05] text-silver",
                        )}
                      >
                        {message.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-hairline p-3">
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Escribe al salón…"
                    aria-label="Mensaje del salón"
                  />
                  <Button size="icon" onClick={sendMessage} aria-label="Enviar">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-[0.58rem] leading-relaxed text-muted-foreground">
                  Chat de demostración. No se envía a un servidor ni se conserva al cerrar la
                  sesión.
                </p>
              </div>

              <div className="border-t border-hairline p-3">
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Propina rápida
                </p>
                <div className="mt-2 flex gap-1.5">
                  {[20, 50, 100, 200].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setTipAmount(amount);
                        setTipOpen(true);
                      }}
                      className="flex-1 rounded-lg border border-hairline py-2 text-[0.68rem] text-silver transition-colors hover:border-signal/40 hover:text-pearl"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {room.status === "ended" ? (
          <div className="mt-6">
            <EmptyState
              title="El salón terminó."
              description="La grabación puede estar disponible en la bóveda si la creadora lo autorizó."
            />
          </div>
        ) : null}
      </div>

      <TipDialog
        creator={creator}
        roomId={room.id}
        open={tipOpen}
        onClose={() => setTipOpen(false)}
      />
      <ReportDialog
        target={{ type: "live", id: room.id, label: room.title }}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
      <span className="hidden">{tipAmount}</span>
    </SiteLayout>
  );
}
