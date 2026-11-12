import { parseEmailList, resolveRole, type Claims, type ViewerRole } from "./roles";

/**
 * Rol del espectador resuelto en el servidor.
 *
 * Solo se puede importar desde código de servidor. La allowlist vive en
 * variables de entorno (`ADMIN_EMAILS`, `CREATOR_EMAILS`) y nunca en el
 * navegador.
 */
export function serverRoleFor(email: string | null | undefined, claims: Claims): ViewerRole {
  return resolveRole({
    email,
    claims,
    allowAdmins: parseEmailList(process.env["ADMIN_EMAILS"]),
    allowCreators: parseEmailList(process.env["CREATOR_EMAILS"]),
  });
}

export function serverClaimsEmail(claims: Claims): string | null {
  if (!claims) return null;
  const email = claims["email"];
  return typeof email === "string" ? email : null;
}
