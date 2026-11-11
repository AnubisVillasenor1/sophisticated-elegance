import type { AppState, Creator, PurchaseKind } from "./types";

/**
 * Comercio del prototipo.
 *
 * Regla de oro: el precio SIEMPRE se resuelve desde el catálogo del servidor de
 * dominio (el estado), nunca desde el valor que envía la interfaz. Así una
 * llamada manipulada no puede alterar el monto de una compra.
 *
 * Ninguna función de este módulo mueve dinero real: solo calcula importes y
 * comisiones para el libro DEMO.
 */

export type PriceResolution =
  { ok: true; priceMXN: number; label: string; creatorId: string } | { ok: false; message: string };

function findPost(creator: Creator, itemId: string) {
  return creator.posts.find((p) => p.id === itemId) ?? null;
}

function findClip(creator: Creator, itemId: string) {
  return creator.clips.find((c) => c.id === itemId) ?? null;
}

function findBundle(creator: Creator, itemId: string) {
  return creator.bundles.find((b) => b.id === itemId) ?? null;
}

function findOffer(creator: Creator, itemId: string) {
  return creator.offers.find((o) => o.id === itemId) ?? null;
}

function findRoom(creator: Creator, itemId: string) {
  return creator.rooms.find((r) => r.id === itemId) ?? null;
}

/** Resuelve el precio y la etiqueta de una pieza a partir de su creadora. */
export function resolveItemPrice(
  state: AppState,
  creatorId: string,
  kind: PurchaseKind,
  itemId: string,
): PriceResolution {
  const creator = state.creators.find((c) => c.id === creatorId);
  if (!creator) return { ok: false, message: "Creadora no encontrada." };
  if (creator.status === "suspended")
    return { ok: false, message: "El perfil está suspendido y no acepta compras." };

  switch (kind) {
    case "ppv": {
      const post = findPost(creator, itemId);
      if (!post) return { ok: false, message: "La publicación ya no está disponible." };
      if (post.visibility !== "ppv")
        return { ok: false, message: "Esa publicación no se vende por separado." };
      return {
        ok: true,
        priceMXN: Math.max(0, Math.round(post.priceMXN)),
        label: post.title,
        creatorId,
      };
    }
    case "clip": {
      const clip = findClip(creator, itemId);
      if (!clip) return { ok: false, message: "El clip ya no está disponible." };
      return {
        ok: true,
        priceMXN: Math.max(0, Math.round(clip.priceMXN)),
        label: clip.title,
        creatorId,
      };
    }
    case "bundle": {
      const bundle = findBundle(creator, itemId);
      if (!bundle) return { ok: false, message: "El paquete ya no está disponible." };
      return {
        ok: true,
        priceMXN: Math.max(0, Math.round(bundle.priceMXN)),
        label: bundle.title,
        creatorId,
      };
    }
    case "custom": {
      const offer = findOffer(creator, itemId);
      if (!offer) return { ok: false, message: "El encargo ya no está disponible." };
      return {
        ok: true,
        priceMXN: Math.max(0, Math.round(offer.priceMXN)),
        label: offer.title,
        creatorId,
      };
    }
    case "ticket": {
      const room = findRoom(creator, itemId);
      if (!room) return { ok: false, message: "El salón ya no está disponible." };
      if (room.access !== "ticket") return { ok: false, message: "Este salón no requiere boleto." };
      return {
        ok: true,
        priceMXN: Math.max(0, Math.round(room.ticketPriceMXN)),
        label: `Boleto · ${room.title}`,
        creatorId,
      };
    }
    case "tip":
    case "subscription":
      // Propinas y membresías se validan en su propia acción.
      return { ok: false, message: "Este tipo de compra se procesa en su flujo específico." };
    default:
      return { ok: false, message: "Tipo de compra no reconocido." };
  }
}

/** Comisión de la plataforma sobre el bruto, según el reparto de la creadora. */
export function platformFeeMXN(grossMXN: number, revenueShare: number): number {
  const share = Math.max(0, Math.min(100, revenueShare));
  return Math.round((Math.max(0, grossMXN) * (100 - share)) / 100);
}

/** Neto que corresponde a la creadora tras la comisión de plataforma. */
export function creatorNetMXN(grossMXN: number, revenueShare: number): number {
  return Math.max(0, grossMXN) - platformFeeMXN(grossMXN, revenueShare);
}

/**
 * Estimación de la comisión del PSP (3.5 % + IVA estimado del 16 % sobre la
 * comisión). Es una referencia de exhibición: el contrato real debe fijarla.
 */
export function pspEstimateMXN(grossMXN: number): number {
  const base = Math.max(0, grossMXN) * 0.035;
  return Math.round(base * 1.16);
}

/** Límites defensivos para importes introducidos a mano (propinas). */
export const MIN_TIP_MXN = 10;
export const MAX_TIP_MXN = 20_000;

export function validateTipAmount(amountMXN: number): string | null {
  if (!Number.isFinite(amountMXN) || amountMXN <= 0) return "Elige un monto válido.";
  if (amountMXN < MIN_TIP_MXN) return `La propina mínima es de $${MIN_TIP_MXN} MXN.`;
  if (amountMXN > MAX_TIP_MXN) return `La propina máxima es de $${MAX_TIP_MXN} MXN.`;
  return null;
}
