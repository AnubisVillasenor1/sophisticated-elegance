import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Radio, Ticket } from "lucide-react";
import { useMemo, useState } from "react";

import { LiveCard } from "@/components/lux/cards";
import { Badge, EmptyState, SectionHeading } from "@/components/lux/ui";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { upcomingLive } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/salones")({
  head: () => ({
    meta: [
      { title: "Salones en vivo — Xclusive" },
      {
        name: "description",
        content:
          "Salas en vivo, tertulias y sesiones privadas con cupo limitado. Simulación editorial en Modo DEMO.",
      },
    ],
  }),
  component: SalonesPage,
});

function SalonesPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<"live" | "scheduled" | "ended">("live");
  const liveEnabled = state.settings.liveEnabled;

  const lives = useMemo(
    () =>
      liveEnabled
        ? state.creators.flatMap((c) =>
            c.rooms.filter((r) => r.status === "live").map((room) => ({ creator: c, room })),
          )
        : [],
    [state.creators, liveEnabled],
  );
  const scheduled = useMemo(() => upcomingLive(state), [state]);
  const ended = useMemo(
    () =>
      state.creators.flatMap((c) =>
        c.rooms.filter((r) => r.status === "ended").map((room) => ({ creator: c, room })),
      ),
    [state.creators],
  );

  const current = tab === "live" ? lives : tab === "scheduled" ? scheduled : ended;

  return (
    <SiteLayout>
      <PageHero
        cover="atrio"
        eyebrow="Salones"
        title={
          <>
            El club ocurre
            <br />
            <em className="text-silver-sheen">en tiempo real.</em>
          </>
        }
        description="Salones abiertos, sesiones para miembros y tertulias con boleto. En este prototipo la audiencia, las propinas y la transmisión son simuladas."
        aside={
          <div className="grid grid-cols-3 gap-2">
            {[
              ["En vivo", lives.length],
              ["Programados", scheduled.length],
              ["Archivo", ended.length],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl border border-hairline bg-background/60 p-3 text-center backdrop-blur"
              >
                <p className="font-serif text-2xl text-pearl">{value}</p>
                <p className="mt-1 text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        }
      />

      <section
        data-tour="salones-grid"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14"
      >
        {!liveEnabled ? (
          <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-warning">Transmisión en vivo pausada.</span> La
            administración desactivó los salones en vivo. Puedes consultar los programados y el
            archivo; las salas no transmiten hasta que se reactive la función.
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-full border border-hairline bg-black/20 p-1">
            {(
              [
                ["live", "Ahora", <Radio key="i" className="h-3.5 w-3.5" />],
                ["scheduled", "Programados", <CalendarClock key="i" className="h-3.5 w-3.5" />],
                ["ended", "Archivo", <Ticket key="i" className="h-3.5 w-3.5" />],
              ] as const
            ).map(([value, label, icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs transition-colors",
                  tab === value
                    ? "bg-signal text-primary-foreground"
                    : "text-muted-foreground hover:text-pearl",
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <Badge tone="signal">Todos los salones son DEMO</Badge>
        </div>

        {current.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title={
                tab === "live"
                  ? "No hay salones en vivo ahora."
                  : tab === "scheduled"
                    ? "No hay salones programados."
                    : "El archivo está vacío."
              }
              description="Vuelve más tarde o revisa los otros horarios. Puedes seguir a una creadora para recibir avisos."
              icon={<Radio className="h-6 w-6" />}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {current.map(({ creator, room }) => (
              <LiveCard key={room.id} room={room} creator={creator} />
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Acceso por nivel",
              body: "Un salón puede ser abierto, exclusivo para miembros o requerir boleto. El acceso se valida contra tu membresía activa.",
            },
            {
              title: "Propinas en vivo",
              body: "Las propinas se registran con su comisión visible. En DEMO no generan saldo retirable ni obligación de pago.",
            },
            {
              title: "Moderación presente",
              body: "Puedes reportar un salón o un mensaje. Los reportes reciben identificador y estado, y se conserva evidencia.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-hairline bg-card/40 p-5">
              <p className="text-sm text-pearl">{item.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
