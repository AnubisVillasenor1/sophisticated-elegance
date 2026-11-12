/**
 * Resolución de roles a partir de fuentes verificadas.
 *
 * Reglas duras:
 * - El correo solo cuenta si viene del token verificado por Supabase.
 * - `app_metadata` lo controla únicamente el servidor (service role), así que
 *   puede otorgar rol.
 * - `user_metadata` lo puede editar el propio usuario: nunca otorga rol.
 * - Si no hay coincidencia, el rol es `fan`. Fallo cerrado.
 */
export type ViewerRole = "fan" | "creator" | "admin";

export type Claims = Record<string, unknown> | null | undefined;

export function parseEmailList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\s,;]+/)
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.includes("@"));
}

function roleFromAppMetadata(claims: Claims): ViewerRole | null {
  if (!claims) return null;
  const appMetadata = claims["app_metadata"];
  if (!appMetadata || typeof appMetadata !== "object") return null;
  const role = (appMetadata as Record<string, unknown>)["role"];
  if (role === "admin" || role === "creator") return role;
  return null;
}

export function resolveRole(input: {
  email?: string | null | undefined;
  claims?: Claims | undefined;
  allowAdmins?: string[] | undefined;
  allowCreators?: string[] | undefined;
}): ViewerRole {
  const email = (input.email ?? "").trim().toLowerCase();
  const admins = input.allowAdmins ?? [];
  const creators = input.allowCreators ?? [];

  // La allowlist de servidor tiene prioridad absoluta.
  if (email && admins.includes(email)) return "admin";
  if (email && creators.includes(email)) return "creator";

  // `app_metadata` solo lo escribe el servidor; es una fuente confiable.
  const fromClaims = roleFromAppMetadata(input.claims);
  if (fromClaims) return fromClaims;

  return "fan";
}
