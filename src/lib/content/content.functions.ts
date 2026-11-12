import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { auditEvent } from "@/lib/auth/audit.server";
import { parseCreatorSlugMap, resolveCreatorSlug } from "@/lib/auth/creator-link";
import { consumeRateLimit, type Bucket } from "@/lib/auth/rate-limit";
import type { Claims } from "@/lib/auth/roles";
import { serverClaimsEmail, serverRoleFor } from "@/lib/auth/roles.server";
import { createSeedState } from "@/lib/seed";

/**
 * Contenido real de las creadoras.
 *
 * El navegador nunca decide el precio ni el estado: la server function valida
 * la sesión, comprueba que la cuenta esté vinculada a un perfil de creadora y
 * escribe con la clave de servicio. La portada va al bucket público; la pieza
 * completa al bucket privado `vault` y solo se sirve con acceso vigente.
 */

const buckets = new Map<string, Bucket>();

function limit(key: string, max: number): boolean {
  return consumeRateLimit(buckets, key, max, 60_000).allowed;
}

type QueryResult = {
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
  count: number | null;
};

type Query = {
  select: (columns: string, options?: { count?: "exact"; head?: boolean }) => Query;
  eq: (column: string, value: string) => Query;
  order: (column: string, options: { ascending: boolean }) => Query;
  limit: (n: number) => Promise<QueryResult>;
  insert: (row: Record<string, unknown>) => Query;
  update: (row: Record<string, unknown>) => Query;
  maybeSingle: () => Promise<{
    data: Record<string, unknown> | null;
    error: { message: string; code?: string } | null;
  }>;
};

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as {
    from: (table: string) => Query;
    storage: {
      from: (bucket: string) => {
        createSignedUrl: (
          path: string,
          expiresIn: number,
        ) => Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
      };
    };
  };
}

function hasServiceRole(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Slug de la creadora autenticada, resuelto solo con fuentes del servidor. */
function currentCreatorSlug(claims: Claims): string | null {
  const role = serverRoleFor(serverClaimsEmail(claims), claims);
  if (role !== "creator") return null;
  return resolveCreatorSlug({
    role,
    email: serverClaimsEmail(claims),
    claims,
    map: parseCreatorSlugMap(process.env["CREATOR_SLUGS"]),
  });
}

export type PublishedContent = {
  id: string;
  creatorSlug: string;
  creatorName: string;
  creatorImage: string | null;
  kind: "post" | "clip";
  title: string;
  description: string;
  category: string;
  priceMXN: number;
  visibility: "public" | "members" | "ppv";
  coverUrl: string | null;
  hasMedia: boolean;
  createdAt: string;
};

type ContentRow = {
  id: string;
  creator_slug: string;
  kind: "post" | "clip";
  title: string;
  description: string;
  category: string;
  price_mxn: number;
  visibility: "public" | "members" | "ppv";
  cover_url: string | null;
  media_path: string | null;
  status: string;
  created_at: string;
};

function toPublished(row: ContentRow): PublishedContent {
  const creator = createSeedState().creators.find((c) => c.slug === row.creator_slug);
  return {
    id: row.id,
    creatorSlug: row.creator_slug,
    creatorName: creator?.name ?? row.creator_slug,
    creatorImage: creator?.image ?? null,
    kind: row.kind,
    title: row.title,
    description: row.description,
    category: row.category,
    priceMXN: row.price_mxn,
    visibility: row.visibility,
    coverUrl: row.cover_url,
    hasMedia: Boolean(row.media_path),
    createdAt: row.created_at,
  };
}

/**
 * Catálogo publicado, legible sin sesión.
 *
 * La tabla permite lectura anónima solo de filas publicadas; aun así se
 * consulta con la clave de servicio desde el servidor para no exponer el
 * esquema al navegador.
 */
export const listPublishedContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublishedContent[]> => {
    if (!hasServiceRole()) return [];
    try {
      const db = await adminClient();
      const { data, error } = await db
        .from("xclusive_content")
        .select(
          "id, creator_slug, kind, title, description, category, price_mxn, visibility, cover_url, media_path, status, created_at",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(48);
      if (error) return [];
      return ((data ?? []) as ContentRow[]).map(toPublished);
    } catch {
      return [];
    }
  },
);

export type MyContent = {
  id: string;
  kind: "post" | "clip";
  title: string;
  category: string;
  priceMXN: number;
  visibility: string;
  status: string;
  coverUrl: string | null;
  hasMedia: boolean;
  createdAt: string;
};

export const listMyContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyContent[]> => {
    if (!limit(`mycontent:${context.userId}`, 30)) return [];
    if (!hasServiceRole()) return [];
    try {
      const db = await adminClient();
      const { data, error } = await db
        .from("xclusive_content")
        .select(
          "id, kind, title, category, price_mxn, visibility, status, cover_url, media_path, created_at",
        )
        .eq("owner_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return [];
      return ((data ?? []) as ContentRow[]).map((row) => ({
        id: row.id,
        kind: row.kind,
        title: row.title,
        category: row.category,
        priceMXN: row.price_mxn,
        visibility: row.visibility,
        status: row.status,
        coverUrl: row.cover_url,
        hasMedia: Boolean(row.media_path),
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  });

export type CreateContentResult =
  { ok: true; id: string; status: "draft" | "published" } | { ok: false; message: string };

const PUBLIC_BUCKET_PREFIX = "/storage/v1/object/public/xclusive-public/";

function validCoverUrl(value: string, userId: string): boolean {
  if (!value) return false;
  if (!value.includes(PUBLIC_BUCKET_PREFIX)) return false;
  return value.includes(`creators/${userId}/`);
}

function validMediaPath(value: string, userId: string): boolean {
  return value === "" || value.startsWith(`creators/${userId}/`);
}

export const createContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    return {
      kind: raw["kind"] === "clip" ? "clip" : "post",
      title: cleanText(raw["title"], 120),
      description: cleanText(raw["description"], 2000),
      category: cleanText(raw["category"], 40) || "Editorial",
      priceMXN: Math.max(0, Math.min(20_000, Math.round(Number(raw["priceMXN"] ?? 0)))),
      visibility:
        raw["visibility"] === "public" || raw["visibility"] === "members"
          ? raw["visibility"]
          : "ppv",
      coverUrl: cleanText(raw["coverUrl"], 500),
      mediaPath: cleanText(raw["mediaPath"], 300),
      publish: raw["publish"] === true,
    };
  })
  .handler(async ({ data, context }): Promise<CreateContentResult> => {
    if (!limit(`content:create:${context.userId}`, 20)) {
      return { ok: false, message: "Demasiadas publicaciones seguidas. Espera un minuto." };
    }
    if (data.title.length < 3) return { ok: false, message: "El título es demasiado corto." };
    if (!validCoverUrl(data.coverUrl, context.userId)) {
      return { ok: false, message: "Sube una portada válida antes de publicar." };
    }
    if (!validMediaPath(data.mediaPath, context.userId)) {
      return { ok: false, message: "La ruta del archivo no es válida." };
    }
    if (data.visibility === "ppv" && data.priceMXN < 10) {
      return { ok: false, message: "El precio mínimo de una pieza de pago es $10 MXN." };
    }
    if (!hasServiceRole()) {
      return { ok: false, message: "La publicación no está configurada en este entorno." };
    }

    const claims = (context.claims ?? null) as Claims;
    const slug = currentCreatorSlug(claims);
    if (!slug) {
      return {
        ok: false,
        message:
          "Esta cuenta no está vinculada a un perfil de creadora. Pide a administración que configure CREATOR_SLUGS.",
      };
    }

    try {
      const db = await adminClient();
      const status = data.publish ? "published" : "draft";
      const { data: row, error } = await db
        .from("xclusive_content")
        .insert({
          owner_id: context.userId,
          creator_slug: slug,
          kind: data.kind,
          title: data.title,
          description: data.description,
          category: data.category,
          price_mxn: data.visibility === "ppv" ? data.priceMXN : 0,
          visibility: data.visibility,
          cover_url: data.coverUrl,
          media_path: data.mediaPath || null,
          status,
        })
        .select("id, status")
        .maybeSingle();

      if (error || !row) {
        auditEvent({
          action: "content.create",
          actorId: context.userId,
          outcome: "error",
          detail: error?.code ?? "insert_failed",
        });
        return { ok: false, message: "No se pudo guardar la publicación." };
      }

      auditEvent({
        action: "content.create",
        actorId: context.userId,
        outcome: "ok",
        detail: JSON.stringify({ id: row["id"], status }),
      });
      return { ok: true, id: String(row["id"]), status: status as "draft" | "published" };
    } catch {
      return { ok: false, message: "No se pudo guardar la publicación." };
    }
  });

export const hideContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { id?: unknown };
    const id = cleanText(raw.id, 40);
    return { id: /^[0-9a-f-]{36}$/i.test(id) ? id : "" };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean; message: string }> => {
    if (!data.id) return { ok: false, message: "Solicitud incompleta." };
    if (!limit(`content:hide:${context.userId}`, 20)) {
      return { ok: false, message: "Demasiadas acciones seguidas." };
    }
    if (!hasServiceRole()) return { ok: false, message: "No configurado." };
    try {
      const db = await adminClient();
      const { error } = await db
        .from("xclusive_content")
        .update({ status: "hidden" })
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .maybeSingle();
      if (error) return { ok: false, message: "No se pudo ocultar la pieza." };
      auditEvent({ action: "content.hide", actorId: context.userId, outcome: "ok" });
      return { ok: true, message: "Pieza oculta." };
    } catch {
      return { ok: false, message: "No se pudo ocultar la pieza." };
    }
  });

/* ------------------------------------------------------------ solicitudes --- */

export type DataRequestKind = "acceso" | "rectificacion" | "cancelacion" | "oposicion";

export const submitDataRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const kind = cleanText(raw["kind"], 20) as DataRequestKind;
    return {
      kind: (["acceso", "rectificacion", "cancelacion", "oposicion"] as const).includes(kind)
        ? kind
        : ("acceso" as DataRequestKind),
      details: cleanText(raw["details"], 2000),
    };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean; message: string }> => {
    if (!limit(`arco:${context.userId}`, 5)) {
      return { ok: false, message: "Demasiadas solicitudes. Espera unos minutos." };
    }
    if (!hasServiceRole()) return { ok: false, message: "No configurado en este entorno." };
    try {
      const db = await adminClient();
      const { error } = await db
        .from("xclusive_data_requests")
        .insert({ user_id: context.userId, kind: data.kind, details: data.details })
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, message: "No se pudo registrar la solicitud." };
      auditEvent({
        action: "arco.submit",
        actorId: context.userId,
        outcome: "ok",
        detail: data.kind,
      });
      return {
        ok: true,
        message:
          "Solicitud registrada. Recibirás respuesta por correo en un plazo máximo de 20 días hábiles.",
      };
    } catch {
      return { ok: false, message: "No se pudo registrar la solicitud." };
    }
  });

export type MyDataRequest = {
  id: string;
  kind: string;
  status: string;
  details: string;
  resolution: string | null;
  createdAt: string;
};

export const listMyDataRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyDataRequest[]> => {
    if (!hasServiceRole()) return [];
    try {
      const db = await adminClient();
      const { data } = await db
        .from("xclusive_data_requests")
        .select("id, kind, status, details, resolution, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(20);
      return (
        (data ?? []) as {
          id: string;
          kind: string;
          status: string;
          details: string;
          resolution: string | null;
          created_at: string;
        }[]
      ).map((row) => ({
        id: row.id,
        kind: row.kind,
        status: row.status,
        details: row.details,
        resolution: row.resolution,
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  });

export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const targetType = cleanText(raw["targetType"], 20);
    return {
      targetType: (["live", "post", "clip", "creator", "message"] as const).includes(
        targetType as "live",
      )
        ? (targetType as "live" | "post" | "clip" | "creator" | "message")
        : ("clip" as const),
      targetId: cleanText(raw["targetId"], 120),
      targetLabel: cleanText(raw["targetLabel"], 160) || "Pieza sin título",
      reason: cleanText(raw["reason"], 80) || "Otro",
      details: cleanText(raw["details"], 2000),
    };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean; message: string }> => {
    if (!limit(`report:${context.userId}`, 5)) {
      return { ok: false, message: "Demasiadas denuncias seguidas." };
    }
    if (!hasServiceRole()) return { ok: false, message: "No configurado en este entorno." };
    try {
      const db = await adminClient();
      const { error } = await db
        .from("xclusive_reports")
        .insert({
          reporter_id: context.userId,
          target_type: data.targetType,
          target_id: data.targetId,
          target_label: data.targetLabel,
          reason: data.reason,
          details: data.details,
        })
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, message: "No se pudo registrar la denuncia." };
      auditEvent({ action: "report.submit", actorId: context.userId, outcome: "ok" });
      return { ok: true, message: "Denuncia registrada. Moderación la revisará." };
    } catch {
      return { ok: false, message: "No se pudo registrar la denuncia." };
    }
  });

/**
 * Solicitud de retiro.
 *
 * Se registra la intención, pero queda en estado `blocked`: sin PSP, KYC y
 * cuenta bancaria validada no se transfiere dinero. Registrar la solicitud no
 * crea una promesa de pago.
 */
export const requestPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { amountMXN?: unknown };
    return { amountMXN: Math.max(0, Math.min(500_000, Math.round(Number(raw.amountMXN ?? 0)))) };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean; message: string }> => {
    if (!limit(`payout:${context.userId}`, 3)) {
      return { ok: false, message: "Demasiadas solicitudes. Espera un minuto." };
    }
    if (data.amountMXN < 300) {
      return { ok: false, message: "El mínimo de retiro es $300 MXN." };
    }
    const claims = (context.claims ?? null) as Claims;
    const slug = currentCreatorSlug(claims);
    if (!slug) return { ok: false, message: "Esta cuenta no está vinculada a una creadora." };
    if (!hasServiceRole()) return { ok: false, message: "No configurado en este entorno." };

    try {
      const db = await adminClient();
      const { error } = await db
        .from("xclusive_payout_requests")
        .insert({
          user_id: context.userId,
          creator_slug: slug,
          amount_mxn: data.amountMXN,
          status: "blocked",
          blocked_reason:
            "Retenido: faltan PSP, verificación de identidad (KYC) y cuenta bancaria validada.",
        })
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, message: "No se pudo registrar la solicitud." };
      auditEvent({ action: "payout.request", actorId: context.userId, outcome: "ok" });
      return {
        ok: true,
        message:
          "Solicitud registrada y retenida: todavía no hay PSP, KYC ni cuenta bancaria validada.",
      };
    } catch {
      return { ok: false, message: "No se pudo registrar la solicitud." };
    }
  });

export type MyPayout = {
  id: string;
  creatorSlug: string;
  amountMXN: number;
  status: string;
  blockedReason: string | null;
  createdAt: string;
};

/** Historial de retiros solicitados por la creadora autenticada. */
export const listMyPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyPayout[]> => {
    if (!hasServiceRole()) return [];
    try {
      const db = await adminClient();
      const { data } = await db
        .from("xclusive_payout_requests")
        .select("id, creator_slug, amount_mxn, status, blocked_reason, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(20);
      return (
        (data ?? []) as {
          id: string;
          creator_slug: string;
          amount_mxn: number;
          status: string;
          blocked_reason: string | null;
          created_at: string;
        }[]
      ).map((row) => ({
        id: row.id,
        creatorSlug: row.creator_slug,
        amountMXN: row.amount_mxn,
        status: row.status,
        blockedReason: row.blocked_reason,
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  });
