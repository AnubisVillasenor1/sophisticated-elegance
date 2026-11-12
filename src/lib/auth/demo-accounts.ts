/**
 * Cuentas de demostración.
 *
 * Este módulo solo debe importarse detrás de una guarda de compilación
 * (`import.meta.env.VITE_DEMO_MODE === "true"`), de forma que un build LIVE lo
 * elimine por completo y sus credenciales no lleguen al navegador.
 *
 * Las cuentas existen únicamente en la semilla local (`src/lib/seed.ts`); no
 * existen en Supabase y no permiten iniciar sesión en un entorno real.
 */
export type DemoAccount = {
  role: string;
  name: string;
  email: string;
  password: string;
  description: string;
};

/** `true` solo en builds de demostración explícitos. */
export const demoMode = import.meta.env.VITE_DEMO_MODE === "true";

/**
 * En un build LIVE esta expresión se pliega a `[]` y el minificador elimina las
 * credenciales del bundle, incluso si el módulo llegara a cargarse.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = demoMode
  ? [
      {
        role: "Fan",
        name: "Alex Rivera",
        email: "fan@xclusive.demo",
        password: "demo1234",
        description: "Membresías, compras, bóveda y mensajes.",
      },
      {
        role: "Creadora",
        name: "Valentina R.",
        email: "valentina@xclusive.demo",
        password: "demo1234",
        description: "Estudio, contenido, ingresos y retiros.",
      },
      {
        role: "Administración",
        name: "Dirección Xclusive",
        email: "admin@xclusive.demo",
        password: "demo1234",
        description: "Moderación, solicitudes y operación.",
      },
    ]
  : [];
