import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { auditEvent } from "./audit.server";
import { consumeRateLimit, type Bucket } from "./rate-limit";
import type { Claims, ViewerRole } from "./roles";
import { serverClaimsEmail, serverRoleFor } from "./roles.server";

const buckets = new Map<string, Bucket>();

function enforceRateLimit(key: string, limit: number, windowMs: number, action: string): void {
  const result = consumeRateLimit(buckets, key, limit, windowMs);
  if (!result.allowed) {
    auditEvent({ action, actorId: key, outcome: "denied", detail: "rate_limit" });
    throw new Error("Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.");
  }
}

export type Viewer = {
  id: string;
  email: string | null;
  role: ViewerRole;
  displayName: string | null;
  interests: string[];
  interestsNote: string | null;
};

type ProfileRow = {
  display_name: string | null;
  interests: string[];
  interests_note: string | null;
};

function readMetadataString(claims: Claims, key: string): string | null {
  if (!claims) return null;
  const metadata = claims["user_metadata"];
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>)[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 80) : null;
}

/**
 * Identidad verificada del espectador.
 *
 * El rol se resuelve en el servidor con la allowlist y `app_metadata`; el
 * cliente nunca envía su propio rol.
 */
export const getViewer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Viewer> => {
    enforceRateLimit(`viewer:${context.userId}`, 120, 60_000, "viewer.read");

    const claims = (context.claims ?? null) as Claims;
    const email = serverClaimsEmail(claims);

    const { data, error } = await context.supabase
      .from("profiles")
      .select("display_name, interests, interests_note")
      .eq("id", context.userId)
      .maybeSingle<ProfileRow>();

    if (error) {
      auditEvent({
        action: "viewer.read",
        actorId: context.userId,
        outcome: "error",
        detail: error.code ?? "profile_query",
      });
    }

    // `display_name` de `user_metadata` es editable por la persona, pero solo
    // alimenta la presentación. Nunca participa en la autorización del rol.
    const metadataName = readMetadataString(claims, "display_name");

    return {
      id: context.userId,
      email,
      role: serverRoleFor(email, claims),
      displayName: data?.display_name ?? metadataName,
      interests: data?.interests ?? [],
      interestsNote: data?.interests_note ?? null,
    };
  });

function cleanText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as {
      displayName?: unknown;
      interests?: unknown;
      interestsNote?: unknown;
    };

    const displayName = cleanText(raw.displayName, 80);
    const interestsNote = cleanText(raw.interestsNote, 500);
    const interests = Array.isArray(raw.interests)
      ? Array.from(
          new Set(
            raw.interests
              .filter((item): item is string => typeof item === "string")
              .map((item) => item.trim().slice(0, 40))
              .filter(Boolean),
          ),
        ).slice(0, 12)
      : undefined;

    return { displayName, interestsNote, interests };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean; message: string }> => {
    enforceRateLimit(`profile:${context.userId}`, 20, 60_000, "profile.update");

    const patch: {
      updated_at: string;
      display_name?: string;
      interests_note?: string;
      interests?: string[];
    } = { updated_at: new Date().toISOString() };
    if (data.displayName !== undefined) patch.display_name = data.displayName;
    if (data.interestsNote !== undefined) patch.interests_note = data.interestsNote;
    if (data.interests !== undefined) patch.interests = data.interests;

    const { error } = await context.supabase
      .from("profiles")
      // RLS exige que `id` coincida con el token; el servidor no puede escribir
      // otro perfil. `upsert` crea el perfil la primera vez.
      .upsert({ id: context.userId, ...patch }, { onConflict: "id" });

    if (error) {
      auditEvent({ action: "profile.update", actorId: context.userId, outcome: "error" });
      return { ok: false, message: "No pudimos guardar tu perfil. Inténtalo de nuevo." };
    }

    auditEvent({ action: "profile.update", actorId: context.userId, outcome: "ok" });
    return { ok: true, message: "Perfil actualizado." };
  });

export type MembershipRecord = {
  creatorSlug: string;
  tier: string;
  createdAt: string;
};

export const listMyMemberships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MembershipRecord[]> => {
    enforceRateLimit(`memberships:${context.userId}`, 60, 60_000, "memberships.read");

    const { data, error } = await context.supabase
      .from("memberships")
      .select("creator_slug, tier, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) {
      auditEvent({ action: "memberships.read", actorId: context.userId, outcome: "error" });
      return [];
    }

    return (data ?? []).map((row) => ({
      creatorSlug: row.creator_slug,
      tier: row.tier,
      createdAt: row.created_at,
    }));
  });

/**
 * Evidencia de aceptación legal emitida al servidor.
 *
 * Queda en el registro de auditoría con versión y hash. La persistencia
 * consultable requiere una tabla `legal_acceptances` (ver documentación).
 */
export const recordLegalAcceptance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { docIds?: unknown; version?: unknown; hash?: unknown };
    const docIds = Array.isArray(raw.docIds)
      ? raw.docIds.filter((item): item is string => typeof item === "string").slice(0, 20)
      : [];
    return {
      docIds,
      version: cleanText(raw.version, 40) ?? "desconocida",
      hash: cleanText(raw.hash, 128) ?? "",
    };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    enforceRateLimit(`legal:${context.userId}`, 10, 60_000, "legal.accept");
    if (data.docIds.length === 0) return { ok: false };
    auditEvent({
      action: "legal.accept",
      actorId: context.userId,
      outcome: "ok",
      detail: JSON.stringify({ version: data.version, hash: data.hash, docs: data.docIds }),
    });
    return { ok: true };
  });

export type AdminOverview = {
  available: boolean;
  reason?: string;
  profiles: number;
  memberships: number;
  latest: { id: string; displayName: string | null; createdAt: string }[];
};

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    enforceRateLimit(`admin:${context.userId}`, 30, 60_000, "admin.overview");

    const claims = (context.claims ?? null) as Claims;
    const role = serverRoleFor(serverClaimsEmail(claims), claims);

    if (role !== "admin") {
      auditEvent({ action: "admin.overview", actorId: context.userId, outcome: "denied" });
      throw new Error("No autorizado.");
    }

    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      auditEvent({
        action: "admin.overview",
        actorId: context.userId,
        outcome: "error",
        detail: "missing_service_role",
      });
      return {
        available: false,
        reason: "Falta la credencial de servicio en el servidor.",
        profiles: 0,
        memberships: 0,
        latest: [],
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profiles, memberships, latest] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("memberships").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("id, display_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    auditEvent({ action: "admin.overview", actorId: context.userId, outcome: "ok" });

    return {
      available: true,
      profiles: profiles.count ?? 0,
      memberships: memberships.count ?? 0,
      latest: (latest.data ?? []).map((row) => ({
        id: row.id,
        displayName: row.display_name,
        createdAt: row.created_at,
      })),
    };
  });

/**
 * Derecho de supresión (ARCO): elimina la cuenta de Auth y, por cascada, su
 * perfil y membresías. Requiere confirmación explícita.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => {
    const raw = (input ?? {}) as { confirmation?: unknown };
    return { confirmation: cleanText(raw.confirmation, 40) ?? "" };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean; message: string }> => {
    enforceRateLimit(`delete:${context.userId}`, 3, 3_600_000, "account.delete");

    if (data.confirmation !== "ELIMINAR MI CUENTA") {
      auditEvent({ action: "account.delete", actorId: context.userId, outcome: "denied" });
      return { ok: false, message: "La confirmación no coincide." };
    }

    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return { ok: false, message: "La eliminación no está disponible en este entorno." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);

    if (error) {
      auditEvent({
        action: "account.delete",
        actorId: context.userId,
        outcome: "error",
        ...(error.status ? { detail: String(error.status) } : {}),
      });
      return { ok: false, message: "No pudimos eliminar la cuenta. Contacta a soporte." };
    }

    auditEvent({ action: "account.delete", actorId: context.userId, outcome: "ok" });
    return { ok: true, message: "Tu cuenta y sus datos fueron eliminados." };
  });
