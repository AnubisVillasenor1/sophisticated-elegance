import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock,
  ImageIcon,
  Lock,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PlatformShell } from "@/components/platform/PlatformShell";
import {
  Avatar,
  Badge,
  Button,
  DemoBadge,
  EmptyState,
  Input,
  Select,
  btn,
} from "@/components/lux/ui";
import { suggestReply } from "@/lib/ai";
import { formatTime } from "@/lib/format";
import { creatorThreads, fanThreads, getCreator } from "@/lib/selectors";
import { useApp, useMyCreator } from "@/lib/store";
import type { Thread } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mensajes")({
  head: () => ({
    meta: [
      { title: "Mensajes — Xclusive" },
      {
        name: "description",
        content:
          "Bandeja de mensajes entre miembros y creadoras, con adjuntos y asistente de IA simulado.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { state, user, sendMessage, markThreadRead } = useApp();
  const myCreator = useMyCreator();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState("");
  const [query, setQuery] = useState("");

  const threads = useMemo(() => {
    if (!user) return [];
    if (user.role === "creator" && myCreator) return creatorThreads(state, myCreator.id);
    if (user.role === "fan") return fanThreads(state, user.id);
    return [...state.threads].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [state, user, myCreator]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => {
      const creator = getCreator(state, thread.creatorId);
      return [thread.fanName, creator?.name ?? "", ...thread.messages.map((m) => m.body)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [threads, query, state]);

  const selected = threads.find((t) => t.id === selectedId) ?? threads[0] ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const thread = state.threads.find((t) => t.id === selectedId);
    if (thread && thread.unread > 0) markThreadRead(thread.id);
  }, [selectedId, state.threads, markThreadRead]);

  if (!user) {
    return (
      <PlatformShell title="Mensajes" eyebrow="Bandeja" subtitle="Inicia sesión para conversar.">
        <EmptyState
          icon={<Lock className="h-6 w-6" />}
          title="Tu bandeja está cerrada."
          description="Entra con una cuenta de demostración para ver conversaciones, adjuntos y respuestas del asistente."
          action={
            <Link to="/entrar" className={btn("primary", "md")}>
              Iniciar sesión <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />
      </PlatformShell>
    );
  }

  const openThread = (thread: Thread) => {
    setSelectedId(thread.id);
    setMobileOpen(true);
    setDraft("");
    setAttachment("");
    if (thread.unread > 0) markThreadRead(thread.id);
  };

  const other = (thread: Thread) => {
    const creator = getCreator(state, thread.creatorId);
    if (user.role === "fan") {
      return {
        name: creator?.name ?? "Creadora",
        tint: creator?.avatarTint ?? "#ed315c",
        subtitle: creator?.handle ?? "",
      };
    }
    return { name: thread.fanName, tint: thread.fanTint, subtitle: "Miembro" };
  };

  const send = () => {
    if (!selected) return;
    const body = draft.trim();
    if (!body && !attachment) {
      toast.error("Escribe un mensaje o adjunta una pieza.");
      return;
    }
    const attach = attachment
      ? attachment.startsWith("clip:")
        ? { clipId: attachment.slice(5), postId: "" }
        : { clipId: "", postId: attachment.slice(5) }
      : undefined;
    const result = sendMessage(selected.id, body, attach);
    toast(result.message);
    if (result.ok) {
      setDraft("");
      setAttachment("");
    }
  };

  const lastFanMessage = selected
    ? [...selected.messages].reverse().find((m) => m.from === "fan")
    : null;
  const creatorForSelected = selected ? getCreator(state, selected.creatorId) : null;

  return (
    <PlatformShell
      title="Mensajes"
      eyebrow={
        user.role === "creator"
          ? "Bandeja de creadora"
          : user.role === "admin"
            ? "Bandeja global"
            : "Bandeja de miembro"
      }
      subtitle={`${threads.length} conversación${threads.length === 1 ? "" : "es"} · moderación activa`}
      actions={<DemoBadge>Mensajería DEMO</DemoBadge>}
    >
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Lista */}
        <aside className={cn("lg:col-span-4", mobileOpen && "hidden lg:block")}>
          <div className="overflow-hidden rounded-xl border border-hairline bg-card/40">
            <div className="border-b border-hairline p-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conversación…"
                aria-label="Buscar conversación"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-xs text-muted-foreground">
                  {threads.length === 0
                    ? "Todavía no tienes conversaciones."
                    : "Nada coincide con tu búsqueda."}
                </p>
                {threads.length === 0 && user.role === "fan" ? (
                  <Link to="/explorar" className={cn(btn("secondary", "sm"), "mt-3")}>
                    Encontrar una creadora
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="max-h-[65vh] overflow-y-auto scroll-lux">
                {filtered.map((thread) => {
                  const person = other(thread);
                  const last = thread.messages[thread.messages.length - 1];
                  const active = selected?.id === thread.id;
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => openThread(thread)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-hairline p-3.5 text-left transition-colors last:border-0",
                        active ? "bg-signal/10" : "hover:bg-white/[0.03]",
                      )}
                    >
                      <Avatar name={person.name} tint={person.tint} size={34} ring={false} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-pearl">{person.name}</span>
                          <span className="shrink-0 text-[0.58rem] text-muted-foreground">
                            {last ? formatTime(last.at) : ""}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[0.65rem] text-muted-foreground">
                          {last?.body ?? "Sin mensajes"}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5">
                          {thread.unread > 0 ? (
                            <Badge tone="signal">{thread.unread} nuevo</Badge>
                          ) : null}
                          {thread.automated ? <Badge tone="info">IA</Badge> : null}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-3 rounded-xl border border-hairline bg-white/[0.02] p-3">
            <p className="flex items-center gap-1.5 text-[0.62rem] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> No compartas datos sensibles. Los
              mensajes del prototipo se guardan solo en tu navegador.
            </p>
          </div>
        </aside>

        {/* Conversación */}
        <section className={cn("lg:col-span-8", !mobileOpen && "hidden lg:block")}>
          {!selected ? (
            <EmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="Elige una conversación."
              description="Abre un hilo para leer el historial, responder o adjuntar una pieza."
            />
          ) : (
            <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border border-hairline bg-card/50 lg:h-[72vh]">
              <div className="flex items-center gap-3 border-b border-hairline p-3.5">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-muted-foreground lg:hidden"
                  aria-label="Volver a la bandeja"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Avatar
                  name={other(selected).name}
                  tint={other(selected).tint}
                  size={34}
                  ring={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-pearl">{other(selected).name}</p>
                  <p className="truncate text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {other(selected).subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {selected.automated ? (
                    <Badge tone="info">IA simulada</Badge>
                  ) : (
                    <Badge tone="outline">Humana</Badge>
                  )}
                  {user.role !== "fan" && creatorForSelected ? (
                    <Link
                      to="/creadora/$slug"
                      params={{ slug: creatorForSelected.slug }}
                      className="hidden text-[0.62rem] text-muted-foreground hover:text-pearl sm:block"
                    >
                      Ver perfil
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 scroll-lux">
                {selected.messages.map((message) => {
                  const mine =
                    user.role === "creator" ? message.from === "creator" : message.from === "fan";
                  return (
                    <div
                      key={message.id}
                      className={cn("flex gap-2.5", mine && "flex-row-reverse text-right")}
                    >
                      <Avatar
                        name={
                          message.from === "fan"
                            ? selected.fanName
                            : message.from === "creator"
                              ? (creatorForSelected?.name ?? "Creadora")
                              : "Asistente IA"
                        }
                        tint={
                          message.from === "fan"
                            ? selected.fanTint
                            : (creatorForSelected?.avatarTint ?? "#ed315c")
                        }
                        size={26}
                        ring={false}
                      />
                      <div className={cn("max-w-[82%]", mine && "flex flex-col items-end")}>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {message.from === "ai"
                              ? "Asistente IA"
                              : message.from === "creator"
                                ? (creatorForSelected?.name ?? "Creadora")
                                : selected.fanName}
                          </p>
                          {message.from === "ai" ? <Badge tone="info">Automático</Badge> : null}
                        </div>
                        <p
                          className={cn(
                            "mt-1 inline-block whitespace-pre-line rounded-xl px-3.5 py-2.5 text-xs leading-relaxed",
                            mine ? "bg-signal/20 text-pearl" : "bg-white/[0.05] text-silver",
                          )}
                        >
                          {message.body}
                        </p>
                        {message.attachedClipId ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-1 text-[0.6rem] text-silver">
                            <Paperclip className="h-3 w-3" /> Clip adjunto
                          </span>
                        ) : null}
                        {message.attachedPostId ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-1 text-[0.6rem] text-silver">
                            <Paperclip className="h-3 w-3" /> Publicación adjunta
                          </span>
                        ) : null}
                        <p className="mt-1 text-[0.55rem] text-muted-foreground">
                          {formatTime(message.at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-hairline p-3">
                {user.role !== "fan" && myCreator ? (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Select
                      value={attachment}
                      onChange={(e) => setAttachment(e.target.value)}
                      className="w-auto max-w-[15rem] text-xs"
                      aria-label="Adjuntar pieza"
                    >
                      <option value="">Sin adjunto</option>
                      {myCreator.clips.map((clip) => (
                        <option key={clip.id} value={`clip:${clip.id}`}>
                          Clip · {clip.title}
                        </option>
                      ))}
                      {myCreator.posts.map((post) => (
                        <option key={post.id} value={`post:${post.id}`}>
                          Publicación · {post.title}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (!lastFanMessage) {
                          toast("No hay un mensaje previo del miembro para responder.");
                          return;
                        }
                        setDraft(suggestReply(lastFanMessage.body, myCreator));
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Sugerir respuesta
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setDraft(
                          "Te dejo una pieza de la bóveda. El acceso es personal y no implica derecho de redistribución. Si quieres ver el proceso completo, puedo compartirte el enlace del próximo salón.",
                        );
                      }}
                    >
                      <Wand2 className="h-3.5 w-3.5" /> Plantilla PPV
                    </Button>
                  </div>
                ) : null}

                <div className="flex items-end gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Escribe un mensaje…"
                    aria-label="Mensaje"
                    className="flex-1"
                  />
                  <Button size="icon" onClick={send} aria-label="Enviar">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[0.58rem] leading-relaxed text-muted-foreground">
                  <Clock className="h-3 w-3" /> Mensajería local de demostración. No se envía a un
                  servidor. La IA es una simulación declarada.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          {
            icon: <ShieldCheck className="h-4 w-4" />,
            title: "Moderación y reportes",
            body: "Puedes reportar un mensaje desde el perfil o la sala. Los reportes reciben identificador y estado.",
          },
          {
            icon: <ImageIcon className="h-4 w-4" />,
            title: "Adjuntos con control",
            body: "Los clips y publicaciones se comparten como referencias; el acceso real se valida contra tu cuenta.",
          },
          {
            icon: <Sparkles className="h-4 w-4" />,
            title: "IA declarada",
            body: "Las respuestas del asistente se identifican como automáticas. Nunca se presentan como una persona real.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-hairline bg-white/[0.02] p-4">
            <span className="text-signal">{item.icon}</span>
            <p className="mt-2.5 text-sm text-pearl">{item.title}</p>
            <p className="mt-1 text-[0.68rem] leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-[0.62rem] text-muted-foreground">
        <Check className="h-3 w-3 text-success" /> Conversaciones guardadas en localStorage ·{" "}
        {threads.length} {threads.length === 1 ? "hilo" : "hilos"}
      </p>
    </PlatformShell>
  );
}
