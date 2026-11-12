import type { Claims, ViewerRole } from "./roles";

/**
 * Vínculo cuenta → perfil de creadora.
 *
 * Solo se aceptan fuentes que el servidor controla:
 * - `app_metadata.creator_slug` (lo escribe el service role).
 * - La variable de entorno `CREATOR_SLUGS` con pares `email=slug`.
 *
 * `user_metadata` se ignora: la persona podría reescribirlo y apropiarse de un
 * perfil ajeno.
 */

const SLUG_PATTERN = /^[a-z0-9-]{2,60}$/;

export function parseCreatorSlugMap(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  const entries = raw
    .split(/[\s,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const map: Record<string, string> = {};
  for (const entry of entries) {
    const separator = entry.includes("=") ? "=" : ":";
    const index = entry.indexOf(separator);
    if (index <= 0) continue;
    const email = entry.slice(0, index).trim().toLowerCase();
    const slug = entry
      .slice(index + 1)
      .trim()
      .toLowerCase();
    if (!email.includes("@") || !SLUG_PATTERN.test(slug)) continue;
    map[email] = slug;
  }
  return map;
}

export function readAppMetadataString(claims: Claims, key: string): string | null {
  if (!claims) return null;
  const metadata = claims["app_metadata"];
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>)[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 80) : null;
}

export function resolveCreatorSlug(input: {
  role: ViewerRole;
  email: string | null | undefined;
  claims?: Claims;
  map?: Record<string, string>;
}): string | null {
  if (input.role !== "creator") return null;

  const fromMetadata = readAppMetadataString(input.claims ?? null, "creator_slug")?.toLowerCase();
  if (fromMetadata && SLUG_PATTERN.test(fromMetadata)) return fromMetadata;

  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) return null;
  const fromMap = input.map?.[email];
  return fromMap && SLUG_PATTERN.test(fromMap) ? fromMap : null;
}
