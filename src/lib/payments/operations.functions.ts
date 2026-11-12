import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { auditEvent } from "@/lib/auth/audit.server";
import { parseCreatorSlugMap, resolveCreatorSlug } from "@/lib/auth/creator-link";
import { consumeRateLimit, type Bucket } from "@/lib/auth/rate-limit";
import { serverClaimsEmail, serverRoleFor } from "@/lib/auth/roles.server";
import type { Claims } from "@/lib/auth/roles";
import { createSeedState } from "@/lib/seed";

const buckets = new Map<string, Bucket>();

function limit(key: string, max: number): boolean {
  return consumeRateLimit(buckets, key, max, 60_000).allowed;
}

type QueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
  count: number | null;
};

type Query = {
  select: (columns: string, options?: { count?: "exact"; head?: boolean }) => Query;
  eq: (column: string, value: string) => Query;
  order: (column: string, options: { ascending: boolean }) => Query;
  limit: (n: number) => Promise<QueryResult>;
};

/** Cliente de servicio tipado de forma laxa: solo se usan lecturas y storage. */
async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as {
    from: (table: string) => Query;
    storage: {
      from: (bucket: string) => {
        list: (
          path: string,
          options?: { limit?: number },
        ) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
        createSignedUrl: (
          path: string,
          expiresIn: number,
        ) => Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
      };
    };
  };
}

export type CreatorEarnings = {
  available: boolean;
  reason?: string;
  slug: string | null;
  orders: number;
  grossMXN: number;
  platformFeeMXN: number;
  netMXN: number;
};

type PaidOrder = {
  gross_mxn: number;
  platform_fee_mxn: number;
  creator_net_mxn: number;
};

/** Saldo devengado por la creadora, calculado desde los pedidos pagados. */
export const getCreatorEarnings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CreatorEarnings> => {
    const empty: CreatorEarnings = {
      available: false,
      slug: null,
      orders: 0,
      grossMXN: 0,
      platformFeeMXN: 0,
      netMXN: 0,
    };

    if (!limit(`earnings:${context.userId}`, 30))
      return { ...empty, reason: "Demasiadas consultas." };

    const claims = (context.claims ?? null) as Claims;
    const role = serverRoleFor(serverClaimsEmail(claims), claims);
    if (role !== "creator") {
      return { ...empty, reason: "Esta cuenta no está vinculada a un perfil de creadora." };
    }

    const slug = resolveCreatorSlug({
      role,
      email: serverClaimsEmail(claims),
      claims,
      map: parseCreatorSlugMap(process.env["CREATOR_SLUGS"]),
    });
    if (!slug) return { ...empty, reason: "Perfil sin vincular." };

    const creator = createSeedState().creators.find((c) => c.slug === slug);
    if (!creator) return { ...empty, slug, reason: "El perfil no existe en el catálogo." };

    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return { ...empty, slug, reason: "La credencial de servicio no está configurada." };
    }

    try {
      const db = await adminClient();
      const { data, error } = await db
        .from("xclusive_orders")
        .select("gross_mxn, platform_fee_mxn, creator_net_mxn")
        .eq("creator_id", creator.id)
        .eq("status", "paid")
        .limit(5000);

      if (error) return { ...empty, slug, reason: "No se pudo leer el libro de ventas." };

      const rows = (data ?? []) as PaidOrder[];
      const totals = rows.reduce(
        (acc, row) => ({
          gross: acc.gross + Number(row.gross_mxn ?? 0),
          fee: acc.fee + Number(row.platform_fee_mxn ?? 0),
          net: acc.net + Number(row.creator_net_mxn ?? 0),
        }),
        { gross: 0, fee: 0, net: 0 },
      );

      return {
        available: true,
        slug,
        orders: rows.length,
        grossMXN: totals.gross,
        platformFeeMXN: totals.fee,
        netMXN: totals.net,
      };
    } catch {
      return { ...empty, slug, reason: "No se pudo consultar el libro de ventas." };
    }
  });

export type OperationsOverview = {
  available: boolean;
  reason?: string;
  profiles: number;
  orders: { total: number; paid: number; pending: number };
  gmvMXN: number;
  platformRevenueMXN: number;
  creatorPayableMXN: number;
  receipts: number;
  entitlements: number;
  vaultObjects: number | null;
  audit: { action: string; outcome: string; createdAt: string }[];
  latestOrders: {
    id: string;
    label: string;
    amountMXN: number;
    status: string;
    createdAt: string;
  }[];
};

const EMPTY_OVERVIEW: OperationsOverview = {
  available: false,
  profiles: 0,
  orders: { total: 0, paid: 0, pending: 0 },
  gmvMXN: 0,
  platformRevenueMXN: 0,
  creatorPayableMXN: 0,
  receipts: 0,
  entitlements: 0,
  vaultObjects: null,
  audit: [],
  latestOrders: [],
};

/** Métricas reales de operación. Solo para administración. */
export const getOperationsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OperationsOverview> => {
    if (!limit(`ops:${context.userId}`, 20)) {
      return { ...EMPTY_OVERVIEW, reason: "Demasiadas consultas. Espera un minuto." };
    }

    const claims = (context.claims ?? null) as Claims;
    const role = serverRoleFor(serverClaimsEmail(claims), claims);
    if (role !== "admin") {
      auditEvent({ action: "admin.operations", actorId: context.userId, outcome: "denied" });
      return { ...EMPTY_OVERVIEW, reason: "No autorizado." };
    }

    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return { ...EMPTY_OVERVIEW, reason: "Falta la credencial de servicio." };
    }

    try {
      const db = await adminClient();

      const [profiles, ordersHead, paidRows, receipts, entitlements, audit, latest, vault] =
        await Promise.all([
          db.from("profiles").select("*", { count: "exact", head: true }).limit(1),
          db.from("xclusive_orders").select("*", { count: "exact", head: true }).limit(1),
          db
            .from("xclusive_orders")
            .select("gross_mxn, platform_fee_mxn, creator_net_mxn")
            .eq("status", "paid")
            .limit(5000),
          db
            .from("xclusive_legal_acceptances")
            .select("*", { count: "exact", head: true })
            .limit(1),
          db.from("xclusive_entitlements").select("*", { count: "exact", head: true }).limit(1),
          db
            .from("xclusive_audit_log")
            .select("action, outcome, created_at")
            .order("created_at", { ascending: false })
            .limit(8),
          db
            .from("xclusive_orders")
            .select("id, item_label, gross_mxn, status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
          db.storage.from("vault").list("", { limit: 100 }),
        ]);

      const rows = (paidRows.data ?? []) as PaidOrder[];
      const totals = rows.reduce(
        (acc, row) => ({
          gmv: acc.gmv + Number(row.gross_mxn ?? 0),
          fee: acc.fee + Number(row.platform_fee_mxn ?? 0),
          net: acc.net + Number(row.creator_net_mxn ?? 0),
        }),
        { gmv: 0, fee: 0, net: 0 },
      );

      const total = ordersHead.count ?? 0;
      const paid = rows.length;

      auditEvent({ action: "admin.operations", actorId: context.userId, outcome: "ok" });

      return {
        available: true,
        profiles: profiles.count ?? 0,
        orders: { total, paid, pending: Math.max(0, total - paid) },
        gmvMXN: totals.gmv,
        platformRevenueMXN: totals.fee,
        creatorPayableMXN: totals.net,
        receipts: receipts.count ?? 0,
        entitlements: entitlements.count ?? 0,
        vaultObjects: Array.isArray(vault.data) ? vault.data.length : null,
        audit: (
          (audit.data ?? []) as { action: string; outcome: string; created_at: string }[]
        ).map((row) => ({ action: row.action, outcome: row.outcome, createdAt: row.created_at })),
        latestOrders: (
          (latest.data ?? []) as {
            id: string;
            item_label: string;
            gross_mxn: number;
            status: string;
            created_at: string;
          }[]
        ).map((row) => ({
          id: row.id,
          label: row.item_label,
          amountMXN: row.gross_mxn,
          status: row.status,
          createdAt: row.created_at,
        })),
      };
    } catch {
      return { ...EMPTY_OVERVIEW, reason: "No se pudieron leer las métricas." };
    }
  });

export type VaultAccess = { ok: true; url: string } | { ok: false; message: string };

/**
 * URL firmada y efímera para una pieza de la bóveda.
 *
 * Requiere sesión y un acceso vigente (`xclusive_entitlements`) que cubra la
 * ruta solicitada. Sin acceso, no hay URL: no se sirve el bucket privado.
 */
export const getVaultDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { path?: unknown; itemId?: unknown };
    const clean = (value: unknown) =>
      typeof value === "string" && /^[a-zA-Z0-9/_.-]{1,200}$/.test(value.trim())
        ? value.trim()
        : "";
    return { path: clean(raw["path"]), itemId: clean(raw["itemId"]) };
  })
  .handler(async ({ data, context }): Promise<VaultAccess> => {
    if (!limit(`vault:${context.userId}`, 30)) {
      return { ok: false, message: "Demasiadas solicitudes." };
    }
    if (!data.path || !data.itemId) return { ok: false, message: "Solicitud incompleta." };

    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return { ok: false, message: "La bóveda no está configurada en este entorno." };
    }

    try {
      const db = await adminClient();
      const { data: grants, error } = await db
        .from("xclusive_entitlements")
        .select("id")
        .eq("user_id", context.userId)
        .eq("item_id", data.itemId)
        .limit(1);

      if (error) return { ok: false, message: "No se pudo comprobar tu acceso." };
      if (!grants || grants.length === 0) {
        auditEvent({ action: "vault.download", actorId: context.userId, outcome: "denied" });
        return { ok: false, message: "No tienes acceso a esta pieza." };
      }

      const signed = await db.storage.from("vault").createSignedUrl(data.path, 60);
      if (signed.error || !signed.data) {
        return { ok: false, message: "La pieza no está disponible." };
      }

      auditEvent({
        action: "vault.download",
        actorId: context.userId,
        outcome: "ok",
        detail: data.itemId.slice(0, 60),
      });
      return { ok: true, url: signed.data.signedUrl };
    } catch {
      return { ok: false, message: "No se pudo abrir la bóveda." };
    }
  });
