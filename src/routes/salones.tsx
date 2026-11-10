import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/salones")({
  head: () => ({
    meta: [
      { title: "Salones en vivo — Xclusive" },
      { name: "description", content: "Transmisiones privadas y eventos cifrados para miembros VIP." },
      { property: "og:title", content: "Salones en vivo — Xclusive" },
      { property: "og:description", content: "Transmisiones privadas para miembros del club Xclusive." },
    ],
  }),
  component: Salones,
});

const rooms = [
  { name: "Salón Carmesí", host: "Valentina R.", live: true, viewers: 128, tier: "VIP Club" },
  { name: "Noche de Obsidiana", host: "Selene M.", live: true, viewers: 64, tier: "Inner Circle" },
  { name: "Jardín Prohibido", host: "Aurora L.", live: false, time: "Hoy · 22:00", tier: "VIP Club" },
  { name: "La Gota de Plata", host: "Isabella D.", live: false, time: "Viernes · 23:00", tier: "Inner Circle" },
];

function Salones() {
  return (
    <main className="relative min-h-screen overflow-hidden pt-36 pb-32">
      <div className="absolute inset-0 bg-cherry-haze" />
      <div className="relative mx-auto max-w-6xl px-6">
        <p className="eyebrow">Transmisiones privadas</p>
        <h1 className="mt-4 text-6xl md:text-7xl">Salones <em className="text-silver-gradient">en vivo.</em></h1>
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {rooms.map((r) => (
            <article key={r.name} className="group relative aspect-[16/10] overflow-hidden rounded-3xl hairline bg-card">
              <div className="absolute inset-0 bg-cherry-haze transition-opacity group-hover:opacity-60" />
              <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-glow/20 blur-3xl animate-glow" />
              <div className="relative flex h-full flex-col justify-between p-8">
                <div className="flex items-center justify-between">
                  {r.live ? (
                    <span className="flex items-center gap-2 rounded-full bg-lacquer px-3 py-1 text-xs text-primary-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" /> EN VIVO · {r.viewers}
                    </span>
                  ) : (
                    <span className="eyebrow">{r.time}</span>
                  )}
                  <span className="eyebrow">{r.tier}</span>
                </div>
                <div>
                  <h2 className="text-4xl">{r.name}</h2>
                  <p className="mt-1 text-sm font-light text-muted-foreground">con {r.host}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/membresias" className="rounded-full bg-lacquer px-8 py-3.5 text-primary-foreground shadow-glow">Desbloquear salones</Link>
        </div>
      </div>
    </main>
  );
}
