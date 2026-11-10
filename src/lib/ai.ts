/* Asistente de estudio XCLUSIVE — heurísticas locales, sin modelos externos.
 * Se declara siempre como «IA simulada» para no prometer funciones no conectadas.
 */

import type { Creator } from "./types";
import { formatMoney } from "./format";

const openers = [
  "Hay una luz que solo aparece cuando nadie está mirando.",
  "Esta semana abrí una habitación que llevaba meses cerrada.",
  "No todo lo que publico sale del mismo rollo.",
  "Hay tomas que necesitan silencio para existir.",
  "El archivo creció más de lo que esperaba.",
];

const closers = [
  "El resto queda en la bóveda.",
  "Te dejo la puerta entreabierta.",
  "Si quieres ver el proceso completo, está en el próximo tier.",
  "Mañana subo el audio de la sesión.",
  "Cuéntame qué te provoca esta pieza.",
];

function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % items.length;
  return items[idx] as T;
}

export function suggestCaption(topic: string, creator: Creator): string {
  const t = topic.trim() || creator.categories[0] || "archivo";
  const opener = pick(openers, `${t}${creator.id}`);
  const closer = pick(closers, `${creator.id}${t}`);
  return `${opener}\n\n${t.charAt(0).toUpperCase()}${t.slice(1)}: una pieza que preparé con calma y que hoy por fin ve la luz. ${closer}`;
}

export function suggestPrice(creator: Creator, kind: "ppv" | "clip" | "custom" | "call"): number {
  const base: Record<typeof kind, number> = {
    ppv: 180,
    clip: 150,
    custom: 780,
    call: 450,
  };
  const multiplier = creator.revenueShare >= 85 ? 1.1 : 1;
  return Math.round((base[kind] * multiplier) / 10) * 10;
}

export function suggestReply(message: string, creator: Creator): string {
  const lower = message.toLowerCase();
  if (lower.includes("precio") || lower.includes("cuánto") || lower.includes("cuanto")) {
    return `El acceso está en ${formatMoney(creator.tiers[1]?.priceMXN ?? creator.tiers[0]?.priceMXN ?? 0, "MXN")} al mes, e incluye la bóveda completa. Si prefieres compra única, también tengo PPV. ¿Te comparto el enlace?`;
  }
  if (lower.includes("hola") || lower.includes("hey") || lower.includes("buenas")) {
    return `Hola. Gracias por escribirme. Estoy preparando el próximo set y me encantaría saber qué te gustaría ver. ¿Tienes algún tema en mente?`;
  }
  if (lower.includes("custom") || lower.includes("personaliz") || lower.includes("encargo")) {
    return `Sí, hago piezas personalizadas. Cuéntame la idea, el tono y para cuándo la necesitas; te respondo con una propuesta y un precio cerrado antes de empezar.`;
  }
  if (
    lower.includes("live") ||
    lower.includes("salón") ||
    lower.includes("salon") ||
    lower.includes("en vivo")
  ) {
    return `El próximo salón es ${creator.rooms.find((r) => r.status === "scheduled")?.title ?? "esta semana"}. Te aviso con una hora de anticipación y dejo la puerta abierta para miembros.`;
  }
  if (lower.includes("gracias") || lower.includes("compré") || lower.includes("compre")) {
    return `Gracias a ti. Cada compra me permite seguir haciendo esto con el mismo cuidado. Si algo no coincide con lo que esperabas, dime y lo revisamos.`;
  }
  return `Gracias por escribirme. Leo todo, aunque a veces tarde. Cuéntame un poco más y te respondo con calma. — ${creator.name}`;
}

export function autoReplyForFan(message: string, creator: Creator): string {
  if (creator.aiAssistant) {
    return `Hola, soy el asistente de ${creator.name}. ${suggestReply(message, creator)} Mientras tanto, todo lo que compres queda guardado en tu bóveda.`;
  }
  return `Gracias por tu mensaje. ${creator.name} lo revisará personalmente y te responderá lo antes posible.`;
}

export function monthlyIdeas(creator: Creator): { title: string; body: string; kind: string }[] {
  return [
    {
      title: `Serie ${creator.categories[0] ?? "editorial"} · 3 piezas`,
      body:
        "Un mini set con tres variaciones de luz. Precio sugerido: " +
        formatMoney(suggestPrice(creator, "ppv"), "MXN") +
        ".",
      kind: "PPV",
    },
    {
      title: "Detrás de cámaras en audio",
      body: "Graba 5 minutos de proceso y publícalo como contenido para miembros. Baja producción, alta cercanía.",
      kind: "Miembros",
    },
    {
      title: "Salón de preguntas",
      body: "Un live de 30 minutos con cupo limitado. Precio de entrada simbólico y propinas abiertas.",
      kind: "Live",
    },
    {
      title: "Bundle de temporada",
      body: "Reúne tres piezas antiguas y una nueva. Ancla el precio con un descuento visible del 20–30%.",
      kind: "Bundle",
    },
  ];
}
