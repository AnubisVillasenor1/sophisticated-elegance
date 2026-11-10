import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { tiers } from "@/components/tiers";

export const Route = createFileRoute("/membresias")({
  head: () => ({
    meta: [
      { title: "Membresías — Xclusive" },
      { name: "description", content: "Insider, VIP Club y Xtrime Inner Circle: elige tu nivel de acceso." },
      { property: "og:title", content: "Membresías — Xclusive" },
      { property: "og:description", content: "Tres niveles de acceso al club privado Xclusive." },
    ],
  }),
  component: Membresias,
});

function Membresias() {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <main className="relative min-h-screen overflow-hidden pt-36 pb-32">
      <div className="absolute inset-0 bg-cherry-haze" />
      <div className="relative mx-auto max-w-6xl px-6">
        <p className="eyebrow text-center">Niveles de acceso</p>
        <h1 className="mt-4 text-center text-6xl md:text-7xl">Elige tu <em className="text-silver-gradient">círculo.</em></h1>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`flex flex-col rounded-3xl p-10 transition-transform hover:-translate-y-1 ${t.featured ? "bg-lacquer text-primary-foreground shadow-glow" : "hairline bg-card/70 backdrop-blur"}`}>
              <p className={`eyebrow ${t.featured ? "text-primary-foreground/70" : ""}`}>{t.featured ? "El más elegido" : "Nivel"}</p>
              <h2 className="mt-4 text-4xl">{t.name}</h2>
              <p className="mt-6 font-serif text-6xl">${t.price}<span className="font-sans text-sm opacity-70"> /mes</span></p>
              <ul className="mt-8 flex-1 space-y-3 text-sm font-light">
                {t.perks.map((p) => <li key={p} className="border-t border-current/15 pt-3">{p}</li>)}
              </ul>
              <button onClick={() => setChosen(t.name)} className={`mt-10 rounded-full py-3 transition-colors ${t.featured ? "bg-background text-foreground hover:bg-card" : "hairline hover:bg-muted"}`}>
                {chosen === t.name ? "Acceso reservado ✦" : "Unirme"}
              </button>
            </div>
          ))}
        </div>
        <p className="eyebrow mt-12 text-center">Modo demo · no se realizan cargos reales</p>
      </div>
    </main>
  );
}
