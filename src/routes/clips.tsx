import { createFileRoute } from "@tanstack/react-router";
import { Film, Search, ShoppingBag, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { ClipCard } from "@/components/lux/cards";
import { CheckoutDialog, type CheckoutState } from "@/components/lux/checkout";
import { Badge, Divider, EmptyState, Input, Select, SectionHeading } from "@/components/lux/ui";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { PublishedContent } from "@/components/site/PublishedContent";
import { VideoReel } from "@/components/site/VideoReel";
import { allClips } from "@/lib/selectors";
import { ROOM_PHOTOS } from "@/lib/site-media";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clips")({
  head: () => ({
    meta: [
      { title: "Marketplace de clips — Xclusive" },
      {
        name: "description",
        content:
          "Compra clips individuales sin suscripción. Catálogo editorial en Modo DEMO sin cargos reales.",
      },
    ],
  }),
  component: ClipsPage,
});

function ClipsPage() {
  const { state } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [checkout, setCheckout] = useState<CheckoutState>(null);

  const clips = useMemo(() => allClips(state), [state]);
  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(clips.map(({ clip }) => clip.category)))],
    [clips],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clips
      .filter(({ clip, creator }) => {
        if (category !== "Todas" && clip.category !== category) return false;
        if (!q) return true;
        return [clip.title, clip.description, clip.category, creator.name]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => b.clip.sales - a.clip.sales);
  }, [clips, query, category]);

  const totalSpent = state.purchases
    .filter((p) => p.kind === "clip")
    .reduce((sum, p) => sum + p.amountMXN, 0);

  return (
    <SiteLayout>
      <PageHero
        image={ROOM_PHOTOS.lounge}
        eyebrow="Marketplace"
        title={
          <>
            Clips sueltos.
            <br />
            <em className="text-silver-sheen">Sin membresía obligatoria.</em>
          </>
        }
        description="Compra acceso individual a una pieza. El acceso queda vinculado a tu cuenta y no implica derecho de descarga o redistribución."
        aside={
          <div className="rounded-xl border border-hairline bg-background/60 p-4 backdrop-blur">
            <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              <ShoppingBag className="h-3.5 w-3.5" /> Tu historial de clips
            </p>
            <p className="mt-2 font-serif text-3xl text-pearl">
              {state.purchases.filter((p) => p.kind === "clip").length}
            </p>
            <p className="mt-1 text-[0.68rem] text-muted-foreground">
              {totalSpent > 0
                ? `Total DEMO: $${totalSpent.toLocaleString("es-MX")} MXN`
                : "Sin compras todavía."}
            </p>
          </div>
        }
      />

      <PublishedContent />

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <SectionHeading
          eyebrow="Sala de proyección"
          title={
            <>
              Piezas <em className="text-silver-sheen">en movimiento.</em>
            </>
          }
          description="Clips silenciosos que se reproducen al pasar el cursor o al tocar. Son la muestra editorial de la plataforma; el acceso completo se compra por pieza."
          action={<Badge tone="signal">3 piezas</Badge>}
        />
        <div className="mt-6">
          <VideoReel />
        </div>
        <Divider className="mt-10" />
      </section>

      <section
        data-tour="clips-search"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14"
      >
        <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-card/40 p-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca un clip, una categoría o una creadora…"
              className="pl-9"
              aria-label="Buscar clips"
            />
          </label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Categoría"
            className="lg:w-56"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Badge tone="signal">
            <Sparkles className="h-3 w-3" /> {filtered.length} clips
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {categories.slice(0, 8).map((item) => (
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
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No hay clips con ese filtro."
              description="Prueba otra categoría o limpia la búsqueda."
              icon={<Film className="h-6 w-6" />}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ clip, creator }) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                creator={creator}
                onBuy={(c, cr) =>
                  setCheckout({
                    kind: "clip",
                    creator: cr,
                    itemId: c.id,
                    label: c.title,
                    amountMXN: c.priceMXN,
                    description: c.description,
                  })
                }
              />
            ))}
          </div>
        )}

        <div className="mt-10 rounded-xl border border-hairline bg-white/[0.02] p-5">
          <p className="text-sm text-pearl">Sobre la compra de clips</p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            El acceso a contenido protegido puede incluir URLs temporales, tokens efímeros, límites
            de reproducción y marcas de agua. No implica propiedad intelectual, derecho de descarga,
            redistribución ni autorización para publicar el material fuera de Xclusive. Las compras
            de este prototipo son simulaciones sin cargo real.
          </p>
        </div>
      </section>

      <CheckoutDialog state={checkout} onClose={() => setCheckout(null)} />
    </SiteLayout>
  );
}
