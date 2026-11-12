import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { auditEvent } from "@/lib/auth/audit.server";
import { consumeRateLimit, type Bucket } from "@/lib/auth/rate-limit";
import type { PurchaseKind } from "@/lib/types";
import { paymentsConfig, paymentsUnavailableReason } from "./config.server";

const buckets = new Map<string, Bucket>();

const KINDS: PurchaseKind[] = ["ppv", "clip", "bundle", "custom", "ticket", "tip", "subscription"];

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export type CheckoutResult =
  | { ok: true; orderId: string; url: string }
  | {
      ok: false;
      code: "payments_unavailable" | "invalid" | "rate_limited" | "save_failed";
      message: string;
    };

/**
 * Inicia un cobro real.
 *
 * Fallo cerrado: si no hay proveedor configurado, la respuesta es un error
 * explícito y no se crea ningún pedido. El precio lo fija el servidor a partir
 * del catálogo; el navegador solo elige qué quiere.
 */
export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const kind = cleanText(raw["kind"], 20) as PurchaseKind | null;
    return {
      kind: kind && KINDS.includes(kind) ? kind : null,
      creatorId: cleanText(raw["creatorId"], 60) ?? "",
      itemId: cleanText(raw["itemId"], 120) ?? "",
      amountMXN: typeof raw["amountMXN"] === "number" ? raw["amountMXN"] : undefined,
      idempotencyKey: cleanText(raw["idempotencyKey"], 120) ?? "",
    };
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    const limit = consumeRateLimit(buckets, `checkout:${context.userId}`, 20, 60_000);
    if (!limit.allowed) {
      auditEvent({
        action: "checkout.start",
        actorId: context.userId,
        outcome: "denied",
        detail: "rate_limit",
      });
      return { ok: false, code: "rate_limited", message: "Demasiados intentos. Espera un minuto." };
    }

    if (!data.kind || !data.creatorId || !data.itemId || !data.idempotencyKey) {
      return { ok: false, code: "invalid", message: "La solicitud de compra está incompleta." };
    }

    const config = paymentsConfig();
    if (!config) {
      auditEvent({
        action: "checkout.start",
        actorId: context.userId,
        outcome: "denied",
        detail: "payments_unconfigured",
      });
      return { ok: false, code: "payments_unavailable", message: paymentsUnavailableReason() };
    }

    const { createOrder } = await import("./orders.server");
    const order = await createOrder({
      userId: context.userId,
      kind: data.kind,
      creatorId: data.creatorId,
      itemId: data.itemId,
      ...(data.amountMXN === undefined ? {} : { amountMXN: data.amountMXN }),
      idempotencyKey: data.idempotencyKey,
    });

    if (!order.ok) {
      return {
        ok: false,
        code:
          order.code === "invalid"
            ? "invalid"
            : order.code === "unavailable"
              ? "payments_unavailable"
              : "save_failed",
        message: order.message,
      };
    }

    const { createStripeSession } = await import("./stripe.server");
    let session: { id: string; url: string } | null = null;
    try {
      session = await createStripeSession({
        orderId: order.order.id,
        userId: context.userId,
        label: order.order.item_label,
        priceMXN: order.order.gross_mxn,
      });
    } catch (error) {
      auditEvent({
        action: "checkout.start",
        actorId: context.userId,
        outcome: "error",
        detail: error instanceof Error ? error.message.slice(0, 120) : "provider_error",
      });
      return { ok: false, code: "save_failed", message: "El proveedor de pagos no respondió." };
    }

    if (!session) {
      auditEvent({
        action: "checkout.start",
        actorId: context.userId,
        outcome: "error",
        detail: "no_session_url",
      });
      return {
        ok: false,
        code: "payments_unavailable",
        message: "No se pudo abrir la pasarela de pago.",
      };
    }

    const { attachProviderSession } = await import("./orders.server");
    await attachProviderSession(order.order.id, session.id, "stripe");

    auditEvent({
      action: "checkout.start",
      actorId: context.userId,
      outcome: "ok",
      detail: JSON.stringify({ orderId: order.order.id, reused: order.reused }),
    });

    return { ok: true, orderId: order.order.id, url: session.url };
  });

export type MyOrder = {
  id: string;
  itemId: string;
  label: string;
  amountMXN: number;
  status: string;
  createdAt: string;
};

/** Historial de compras del usuario autenticado (lectura propia). */
export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyOrder[]> => {
    const limit = consumeRateLimit(buckets, `orders:${context.userId}`, 60, 60_000);
    if (!limit.allowed) return [];
    try {
      const { listMyOrders: read } = await import("./orders.server");
      const orders = await read(context.userId);
      return orders.map((order) => ({
        id: order.id,
        itemId: order.item_id,
        label: order.item_label,
        amountMXN: order.gross_mxn,
        status: order.status,
        createdAt: order.created_at,
      }));
    } catch {
      return [];
    }
  });
