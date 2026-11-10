import { createFileRoute } from "@tanstack/react-router";
import { Search, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { CreatorCard } from "@/components/lux/cards";
import { Badge, EmptyState, Input } from "@/components/lux/ui";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/creadoras")({
  head: () => ({
    meta: [
      { title: "Directorio de creadoras — Xclusive" },
      {
        name: "description",
        content:
          "Directorio editorial de creadoras del prototipo Xclusive: fotografía, música, arte, fitness y más.",
      },
    ],
  }),
  component: CreatorsPage,
});

function CreatorsPage() {
  const { state } = useApp();
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<"todas" | "mexico" | "internacional">("todas");

  const creators = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.creators
      .filter((c) => c.status === "approved")
      .filter((c) => {
        if (origin === "mexico") return c.country === "México";
        if (origin === "internacional") return c.country !== "México";
        return true;
      })
      .filter((c) =>
        q
          ? [c.name, c.headline, c.city, ...c.categories].join(" ").toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [state.creators, query, origin]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Directorio"
        title={
          <>
            Cada nombre,
            <br />
            <em className="text-silver-sheen">una puerta distinta.</em>
          </>
        }
        description="El elenco completo del prototipo. Todas las creadoras tienen verificación declarativa en esta versión; en producción deberán acreditar identidad, edad y consentimiento."
        aside={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-hairline bg-background/60 p-4 backdrop-blur">
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                Creadoras
              </p>
              <p className="mt-1 font-serif text-3xl text-pearl">{state.creators.length}</p>
            </div>
            <div className="rounded-xl border border-hairline bg-background/60 p-4 backdrop-blur">
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">SFW</p>
              <p className="mt-1 font-serif text-3xl text-pearl">
                {state.creators.filter((c) => !c.adult).length}
              </p>
            </div>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-card/40 p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por nombre, ciudad o categoría…"
              className="pl-9"
              aria-label="Buscar"
            />
          </label>
          <div className="flex gap-1 rounded-full border border-hairline bg-black/20 p-1">
            {(
              [
                ["todas", "Todas"],
                ["mexico", "México"],
                ["internacional", "Internacional"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setOrigin(value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[0.66rem] transition-colors",
                  origin === value
                    ? "bg-signal text-primary-foreground"
                    : "text-muted-foreground hover:text-pearl",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.66rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {creators.length} resultados
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 text-warning" /> Valoración media{" "}
            {(
              creators.reduce((sum, c) => sum + c.rating, 0) / Math.max(1, creators.length)
            ).toFixed(1)}
          </span>
          <Badge tone="signal">Prototipo DEMO</Badge>
        </div>

        {creators.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Sin coincidencias."
              description="Prueba con otro nombre, ciudad o filtro de origen."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} compact />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
