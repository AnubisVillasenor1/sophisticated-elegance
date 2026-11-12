import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveItemPrice } from "@/lib/commerce";
import { createSeedState } from "@/lib/seed";
import type { PurchaseKind } from "@/lib/types";
import { auditEvent } from "@/lib/auth/audit.server";
import { entitlementFor, ledgerBalance, splitOrder, type LedgerLine } from "./splits";

/**
 * Pedidos, libro mayor y accesos.
 *
 * Solo se ejecuta en el servidor con la clave de servicio. El precio se resuelve
 * desde el catálogo del servidor: el cuerpo de la petición nunca decide cuánto
 * se cobra. Si la tabla no existe o la credencial falla, se devuelve un error
 * explícito en lugar de simular una compra.
 */

type OrderRow = {
  id: string;
  user_id: string;
  creator_id: string;
  kind: string;
  item_id: string;
  item_label: string;
  gross_mxn: number;
  platform_fee_mxn: number;
  creator_net_mxn: number;
  psp_fee_mxn: number;
  currency: string;
  status: "requires_payment" | "paid" | "failed" | "refunded" | "canceled" | "expired";
  provider: string | null;
  provider_session_id: string | null;
  provider_payment_id: string | null;
  idempotency_key: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

type LedgerRow = {
  id: string;
  order_id: string;
  account: LedgerLine["account"];
  direction: LedgerLine["direction"];
  amount_mxn: number;
  currency: string;
  created_at: string;
};

type EntitlementRow = {
  id: string;
  user_id: string;
  creator_id: string;
  kind: "post" | "clip" | "bundle" | "ticket" | "membership";
  item_id: string;
  granted_by_order: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

type WebhookRow = {
  id: string;
  provider: string;
  type: string;
  payload_hash: string;
  processed_at: string | null;
  created_at: string;
};

export type XclusiveDatabase = {
  public: {
    Tables: {
      xclusive_orders: {
        Row: OrderRow;
        Insert: Partial<OrderRow> & {
          user_id: string;
          creator_id: string;
          kind: string;
          item_id: string;
          item_label: string;
          gross_mxn: number;
          idempotency_key: string;
        };
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      xclusive_ledger_entries: {
        Row: LedgerRow;
        Insert: Omit<LedgerRow, "id" | "created_at">;
        Update: Partial<LedgerRow>;
        Relationships: [];
      };
      xclusive_entitlements: {
        Row: EntitlementRow;
        Insert: Partial<EntitlementRow> & {
          user_id: string;
          creator_id: string;
          kind: EntitlementRow["kind"];
          item_id: string;
        };
        Update: Partial<EntitlementRow>;
        Relationships: [];
      };
      xclusive_webhook_events: {
        Row: WebhookRow;
        Insert: Omit<WebhookRow, "created_at" | "processed_at"> & { processed_at?: string | null };
        Update: Partial<WebhookRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

async function admin(): Promise<SupabaseClient<XclusiveDatabase>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as SupabaseClient<XclusiveDatabase>;
}

export type OrderErrorCode = "unavailable" | "invalid" | "save_failed";

export type CreateOrderInput = {
  userId: string;
  kind: PurchaseKind;
  itemId: string;
  creatorId: string;
  /** Solo para propinas: importe elegido por quien la envía. */
  amountMXN?: number;
  idempotencyKey: string;
};

export type CreateOrderResult =
  | { ok: true; order: OrderRow; reused: boolean }
  | { ok: false; code: OrderErrorCode; message: string };

const MIN_TIP_MXN = 10;
const MAX_TIP_MXN = 20_000;

/** Precio y etiqueta resueltos en el servidor, nunca recibidos del cliente. */
export function resolveServerPrice(
  input: CreateOrderInput,
):
  | { ok: true; priceMXN: number; label: string; revenueShare: number }
  | { ok: false; message: string } {
  const state = createSeedState();
  const creator = state.creators.find((c) => c.id === input.creatorId);
  if (!creator) return { ok: false, message: "Creadora no encontrada." };
  if (creator.status === "suspended")
    return { ok: false, message: "El perfil está suspendido y no acepta compras." };

  if (input.kind === "tip") {
    const amount = Math.round(Number(input.amountMXN ?? 0));
    if (!Number.isFinite(amount) || amount < MIN_TIP_MXN || amount > MAX_TIP_MXN)
      return {
        ok: false,
        message: `La propina debe estar entre $${MIN_TIP_MXN} y $${MAX_TIP_MXN} MXN.`,
      };
    return {
      ok: true,
      priceMXN: amount,
      label: `Propina · ${creator.name}`,
      revenueShare: creator.revenueShare,
    };
  }

  if (input.kind === "subscription") {
    const tier = creator.tiers.find((t) => t.id === input.itemId);
    if (!tier) return { ok: false, message: "La membresía ya no está disponible." };
    return {
      ok: true,
      priceMXN: Math.max(0, Math.round(tier.priceMXN)),
      label: `${tier.name} · ${creator.name}`,
      revenueShare: creator.revenueShare,
    };
  }

  const resolved = resolveItemPrice(state, input.creatorId, input.kind, input.itemId);
  if (!resolved.ok) return { ok: false, message: resolved.message };
  return {
    ok: true,
    priceMXN: resolved.priceMXN,
    label: resolved.label,
    revenueShare: creator.revenueShare,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const resolved = resolveServerPrice(input);
  if (!resolved.ok) return { ok: false, code: "invalid", message: resolved.message };
  if (resolved.priceMXN <= 0)
    return { ok: false, code: "invalid", message: "Este artículo no se cobra en línea." };

  const split = splitOrder(resolved.priceMXN, resolved.revenueShare);
  const balance = ledgerBalance(split.lines);
  if (!balance.balanced) {
    auditEvent({
      action: "order.create",
      actorId: input.userId,
      outcome: "error",
      detail: "ledger_unbalanced",
    });
    return { ok: false, code: "save_failed", message: "No se pudo construir el asiento contable." };
  }

  let db: SupabaseClient<XclusiveDatabase>;
  try {
    db = await admin();
  } catch {
    return {
      ok: false,
      code: "unavailable",
      message: "El registro de pedidos no está configurado.",
    };
  }

  const { data, error } = await db
    .from("xclusive_orders")
    .insert({
      user_id: input.userId,
      creator_id: input.creatorId,
      kind: input.kind,
      item_id: input.itemId,
      item_label: resolved.label,
      gross_mxn: split.grossMXN,
      platform_fee_mxn: split.platformFeeMXN,
      creator_net_mxn: split.creatorNetMXN,
      psp_fee_mxn: split.pspFeeMXN,
      status: "requires_payment",
      idempotency_key: input.idempotencyKey,
      metadata: { revenueShare: resolved.revenueShare },
    })
    .select("*")
    .single();

  if (error) {
    // Reintento con la misma clave: se devuelve el pedido ya creado.
    if (error.code === "23505") {
      const existing = await db
        .from("xclusive_orders")
        .select("*")
        .eq("user_id", input.userId)
        .eq("idempotency_key", input.idempotencyKey)
        .maybeSingle();
      if (existing.data) {
        return { ok: true, order: existing.data, reused: true };
      }
    }
    auditEvent({
      action: "order.create",
      actorId: input.userId,
      outcome: "error",
      detail: error.code ?? "insert_failed",
    });
    return { ok: false, code: "save_failed", message: "No se pudo registrar el pedido." };
  }

  auditEvent({
    action: "order.create",
    actorId: input.userId,
    outcome: "ok",
    detail: JSON.stringify({ orderId: data.id, grossMXN: split.grossMXN }),
  });

  return { ok: true, order: data, reused: false };
}

export async function attachProviderSession(
  orderId: string,
  sessionId: string,
  provider: string,
): Promise<void> {
  const db = await admin();
  const { error } = await db
    .from("xclusive_orders")
    .update({ provider, provider_session_id: sessionId })
    .eq("id", orderId);
  if (error) {
    auditEvent({
      action: "order.session",
      actorId: null,
      outcome: "error",
      detail: error.code ?? "update_failed",
    });
  }
}

export type FulfilResult = { ok: true; alreadyProcessed: boolean } | { ok: false; message: string };

/**
 * Convierte un pedido en pagado, escribe el libro mayor y concede el acceso.
 *
 * Idempotente por `eventId`: un reintento del proveedor no duplica ni el cobro
 * ni el acceso. Solo un webhook verificado puede llamar a esta función.
 */
export async function fulfilPaidOrder(args: {
  orderId: string;
  provider: string;
  providerPaymentId: string | null;
  eventId: string;
  eventType: string;
  payloadHash: string;
}): Promise<FulfilResult> {
  const db = await admin();

  const claim = await db
    .from("xclusive_webhook_events")
    .insert({
      id: args.eventId,
      provider: args.provider,
      type: args.eventType,
      payload_hash: args.payloadHash,
    })
    .select("id")
    .maybeSingle();

  if (claim.error) {
    if (claim.error.code === "23505") return { ok: true, alreadyProcessed: true };
    return { ok: false, message: "No se pudo registrar el evento." };
  }

  const { data: order, error: orderError } = await db
    .from("xclusive_orders")
    .select("*")
    .eq("id", args.orderId)
    .maybeSingle();

  if (orderError || !order) return { ok: false, message: "Pedido no encontrado." };
  if (order.status === "paid") {
    await db
      .from("xclusive_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", args.eventId);
    return { ok: true, alreadyProcessed: true };
  }
  if (order.status !== "requires_payment")
    return { ok: false, message: `El pedido está en estado ${order.status}.` };

  const split = splitOrder(
    order.gross_mxn,
    Number(order.metadata?.["revenueShare"] ?? 100),
    order.psp_fee_mxn,
  );

  const { error: paidError } = await db
    .from("xclusive_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      provider_payment_id: args.providerPaymentId,
      platform_fee_mxn: split.platformFeeMXN,
      creator_net_mxn: split.creatorNetMXN,
      psp_fee_mxn: split.pspFeeMXN,
    })
    .eq("id", order.id);

  if (paidError) return { ok: false, message: "No se pudo marcar el pedido como pagado." };

  const { error: ledgerError } = await db.from("xclusive_ledger_entries").insert(
    split.lines.map((line) => ({
      order_id: order.id,
      account: line.account,
      direction: line.direction,
      amount_mxn: line.amountMXN,
      currency: order.currency,
    })),
  );
  if (ledgerError) {
    auditEvent({
      action: "order.fulfil",
      actorId: order.user_id,
      outcome: "error",
      detail: "ledger_insert",
    });
  }

  const entitlementKind = entitlementFor(order.kind);
  if (entitlementKind) {
    const expiresAt =
      entitlementKind === "membership"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;
    const { error: grantError } = await db.from("xclusive_entitlements").upsert(
      {
        user_id: order.user_id,
        creator_id: order.creator_id,
        kind: entitlementKind,
        item_id: order.item_id,
        granted_by_order: order.id,
        expires_at: expiresAt,
      },
      { onConflict: "user_id,kind,item_id" },
    );
    if (grantError) {
      auditEvent({
        action: "order.fulfil",
        actorId: order.user_id,
        outcome: "error",
        detail: "grant_failed",
      });
      return { ok: false, message: "El pago se registró pero el acceso no pudo concederse." };
    }
  }

  await db
    .from("xclusive_webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", args.eventId);

  auditEvent({
    action: "order.fulfil",
    actorId: order.user_id,
    outcome: "ok",
    detail: JSON.stringify({ orderId: order.id, grossMXN: order.gross_mxn }),
  });

  return { ok: true, alreadyProcessed: false };
}

export async function listMyOrders(userId: string): Promise<OrderRow[]> {
  const db = await admin();
  const { data, error } = await db
    .from("xclusive_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return data ?? [];
}
