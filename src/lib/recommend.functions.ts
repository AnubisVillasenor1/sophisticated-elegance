import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { creators } from "./creators";

export type Recommendation = {
  summary: string;
  creators: { slug: string; reason: string }[];
  rooms: { name: string; reason: string }[];
};

export const getRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Recommendation | { error: string }> => {
    const { data: profile } = await context.supabase
      .from("profiles").select("interests, interests_note").eq("id", context.userId).maybeSingle();
    const interests = profile?.interests ?? [];
    if (!interests.length && !profile?.interests_note) return { error: "Primero indica tus intereses." };

    const catalog = creators.map((c) => ({
      slug: c.slug, name: c.name, title: c.title, bio: c.bio, tags: c.tags,
      rooms: c.rooms.map((r) => ({ name: r.name, theme: r.theme, tier: r.tier, live: r.live })),
    }));

    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "Eres el concierge de Xclusive, un club privado elegante. Recomienda creadoras y salones del catálogo según los intereses del miembro. Responde en español, con tono sofisticado y breve. Usa solo slugs y nombres de salón del catálogo.",
        input: [{
          role: "user",
          content: `Intereses: ${interests.join(", ")}\nNota del miembro: ${profile?.interests_note ?? ""}\nCatálogo: ${JSON.stringify(catalog)}`,
        }],
        text: {
          format: {
            type: "json_schema",
            name: "recommendations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["summary", "creators", "rooms"],
              properties: {
                summary: { type: "string" },
                creators: { type: "array", items: { type: "object", additionalProperties: false, required: ["slug", "reason"], properties: { slug: { type: "string" }, reason: { type: "string" } } } },
                rooms: { type: "array", items: { type: "object", additionalProperties: false, required: ["name", "reason"], properties: { name: { type: "string" }, reason: { type: "string" } } } },
              },
            },
          },
        },
      });
      let text = "";
      for (const item of (res as { output?: { type: string; content?: { type: string; text?: string }[] }[] }).output ?? []) {
        if (item.type === "message") for (const c of item.content ?? []) if (c.type === "output_text") text += c.text ?? "";
      }
      const parsed = JSON.parse(text) as Recommendation;
      const slugs = new Set(creators.map((c) => c.slug));
      parsed.creators = parsed.creators.filter((c) => slugs.has(c.slug));
      return parsed;
    } catch (e) {
      console.error("recommendations failed", e);
      if (e instanceof GatewayError && e.httpStatus === 402) return { error: "El servicio de recomendaciones no tiene créditos disponibles." };
      if (e instanceof GatewayError && e.httpStatus === 429) return { error: "Demasiadas solicitudes, intenta en un momento." };
      return { error: "No pudimos generar tus recomendaciones. Intenta de nuevo." };
    }
  });
