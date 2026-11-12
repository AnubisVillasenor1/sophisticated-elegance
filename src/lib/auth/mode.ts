/**
 * Modo de autenticación de la compilación.
 *
 * `live` (por defecto): las cuentas viven en Supabase Auth y la identidad la
 * resuelve el servidor. `demo`: cuentas locales de demostración, solo para
 * desarrollo y para builds explícitamente etiquetados.
 *
 * El modo se fija en tiempo de compilación para que un build de producción no
 * pueda activar credenciales de demostración desde el navegador.
 */
export type AuthMode = "live" | "demo";

const BUILD_FLAG: string | undefined = import.meta.env.VITE_DEMO_MODE;

export function resolveAuthMode(buildFlag: string | undefined): AuthMode {
  return buildFlag === "true" ? "demo" : "live";
}

export const AUTH_MODE: AuthMode = resolveAuthMode(BUILD_FLAG);

/** `true` solo en builds de demostración. Permite eliminar el código demo. */
export const IS_DEMO_BUILD = AUTH_MODE === "demo";
