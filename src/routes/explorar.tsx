import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Radio, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import { CreatorCard, LiveCard } from "@/components/lux/cards";
import { Badge, Button, EmptyState, Input, SectionHeading, Select, btn } from "@/components/lux/ui";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { useApp } from "@/lib/store";
import { liveNow } from "@/lib/selectors";
import { BRAND_BANNERS } from "@/lib/site-media";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar creadoras — Xclusive" },
      {
        name: "description",
        content:
          "Descubre creadoras por categoría, disponibilidad y tipo de contenido en el prototipo Xclusive.",
      },
    ],
  }),
  component: ExplorePage,
});

const CATEGORIES = [
  "Todas",
  "Fotografía",
  "Cosplay",
  "Fitness",
  "Música",
  "Arte",
  "Lifestyle",
  "Editorial",
  "ASMR",
  "Drag",
  "IA",
];

function ExplorePage() {
  const { state } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState<"members" | "rating" | "recent">("members");
  const [sfwOnly, setSfwOnly] = useState(false);
  const [liveOnly, setLiveOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = state.creators.filter((c) => c.status === "approved");
    if (sfwOnly) list = list.filter((c) => !c.adult);
    if (liveOnly) list = list.filter((c) => c.rooms.some((r) => r.status === "live"));
    if (category !== "Todas") list = list.filter((c) => c.categories.includes(category));
    if (q) {
      list = list.filter((c) =>
        [c.name, c.headline, c.bio, c.city, ...c.categories, ...c.tags]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort === "members") list = [...list].sort((a, b) => b.members - a.members);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "recent") list = [...list].sort((a, b) => (a.joinedAt < b.joinedAt ? 1 : -1));
    return list;
  }, [state.creators, query, category, sort, sfwOnly, liveOnly]);

  const lives = liveNow(state);

  return (
    <SiteLayout>
      <PageHero
        image={BRAND_BANNERS.sections}
        eyebrow="Descubrimiento editorial"
        title={
          <>
            Encuentra la puerta
            <br />
            <em className="text-silver-sheen">que ya estaba abierta.</em>
          </>
        }
        description="Busca por nombre, ciudad, categoría o etiqueta. Filtra por contenido editorial seguro (SFW) o por salones en vivo. Todo el catálogo pertenece al prototipo DEMO."
        aside={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-hairline bg-background/60 p-4 backdrop-blur">
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                Creadoras
              </p>
              <p className="mt-1 font-serif text-3xl text-pearl">{state.creators.length}</p>
            </div>
            <div className="rounded-xl border border-hairline bg-background/60 p-4 backdrop-blur">
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                En vivo
              </p>
              <p className="mt-1 font-serif text-3xl text-pearl">{lives.length}</p>
            </div>
          </div>
        }
      />

      {lives.length > 0 ? (
        <section className="border-b border-hairline bg-black/15">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 font-serif text-2xl text-pearl">
                <Radio className="h-4 w-4 text-signal" /> En vivo ahora
              </h2>
              <Link to="/salones" className={btn("ghost", "sm")}>
                Todos los salones
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lives.slice(0, 3).map(({ creator, room }) => (
                <LiveCard key={room.id} room={room} creator={creator} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        data-tour="explore-search"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14"
      >
        <div className="rounded-xl border border-hairline bg-card/40 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por nombre, ciudad, etiqueta…"
                className="pl-9"
                aria-label="Buscar creadoras"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Ordenar"
                className="w-auto"
              >
                <option value="members">Más miembros</option>
                <option value="rating">Mejor valoradas</option>
                <option value="recent">Más recientes</option>
              </Select>
              <button
                type="button"
                onClick={() => setSfwOnly((v) => !v)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-xs transition-colors",
                  sfwOnly
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-hairline text-muted-foreground hover:text-pearl",
                )}
              >
                <Filter className="h-3.5 w-3.5" /> Solo SFW
              </button>
              <button
                type="button"
                onClick={() => setLiveOnly((v) => !v)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-xs transition-colors",
                  liveOnly
                    ? "border-signal/40 bg-signal/10 text-pearl"
                    : "border-hairline text-muted-foreground hover:text-pearl",
                )}
              >
                <Radio className="h-3.5 w-3.5" /> En vivo
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.66rem] transition-colors",
                  category === item
                    ? "border-signal bg-signal/15 text-pearl"
                    : "border-hairline text-muted-foreground hover:text-pearl",
                )}
              >
                {item}
              </button>
            ))}
            {query || category !== "Todas" || sfwOnly || liveOnly ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("Todas");
                  setSfwOnly(false);
                  setLiveOnly(false);
                }}
                className="ml-auto inline-flex items-center gap-1 text-[0.66rem] text-muted-foreground hover:text-pearl"
              >
                <X className="h-3 w-3" /> Limpiar
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
          </p>
          <Badge tone="signal">
            <Sparkles className="h-3 w-3" /> Modo DEMO
          </Badge>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Ninguna puerta coincide."
              description="Prueba con otra categoría, desactiva los filtros o busca un nombre distinto."
              icon={<SlidersHorizontal className="h-6 w-6" />}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("Todas");
                    setSfwOnly(false);
                    setLiveOnly(false);
                  }}
                >
                  Limpiar filtros
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
