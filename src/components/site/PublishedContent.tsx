import { Lock, Play } from "lucide-react";
import { useEffect, useState } from "react";

import { CheckoutDialog, type CheckoutState } from "@/components/lux/checkout";
import { Badge, SectionHeading } from "@/components/lux/ui";
import {
  listPublishedContent,
  type PublishedContent as Item,
} from "@/lib/content/content.functions";
import { formatMoney } from "@/lib/format";
import { useApp } from "@/lib/store";

/**
 * Piezas publicadas por creadoras reales (tabla `xclusive_content`).
 *
 * La portada es pública; el archivo completo sigue en la bóveda privada y solo
 * se entrega con un acceso vigente. El precio que se muestra es informativo:
 * la pasarela vuelve a resolverlo en el servidor.
 */
export function PublishedContent() {
  const { state } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [checkout, setCheckout] = useState<CheckoutState>(null);

  useEffect(() => {
    let alive = true;
    listPublishedContent()
      .then((rows) => {
        if (alive) setItems(rows);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <SectionHeading
        eyebrow="Publicado por creadoras"
        title={
          <>
            Piezas nuevas, <em className="text-silver-sheen">subidas desde el estudio.</em>
          </>
        }
        description="Portadas públicas y archivo protegido en la bóveda. El precio y el acceso se confirman en el servidor al comprar."
        action={<Badge tone="success">{items.length} publicadas</Badge>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const creator = state.creators.find((c) => c.slug === item.creatorSlug);
          const purchasable = item.visibility === "ppv" && item.priceMXN > 0 && creator;
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-hairline bg-card/50"
            >
              <div className="relative aspect-[4/3] bg-black/40">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Badge tone={item.kind === "clip" ? "signal" : "info"}>{item.kind}</Badge>
                  {item.visibility === "ppv" ? (
                    <Badge tone="warning">
                      <Lock className="h-3 w-3" /> {formatMoney(item.priceMXN, state.currency)}
                    </Badge>
                  ) : (
                    <Badge tone="outline">{item.visibility}</Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {item.creatorName} · {item.category}
                </p>
                <h3 className="mt-1 font-serif text-xl leading-tight text-pearl">{item.title}</h3>
                {item.description ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-3">
                  {purchasable && creator ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-xs text-signal transition-colors hover:text-pearl"
                      onClick={() =>
                        setCheckout({
                          creator,
                          kind: item.kind === "clip" ? "clip" : "ppv",
                          itemId: item.id,
                          label: item.title,
                          amountMXN: item.priceMXN,
                          description: item.description,
                        })
                      }
                    >
                      <Lock className="h-3.5 w-3.5" /> Comprar acceso
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Play className="h-3.5 w-3.5" /> Incluido en el perfil
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <CheckoutDialog state={checkout} onClose={() => setCheckout(null)} />
    </section>
  );
}
