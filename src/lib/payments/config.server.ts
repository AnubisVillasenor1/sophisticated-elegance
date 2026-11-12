/**
 * Configuración de cobros.
 *
 * Lectura estricta del entorno. Si falta cualquier pieza, `paymentsConfig()`
 * devuelve `null` y toda compra se rechaza con fallo cerrado: nunca se simula
 * un cobro exitoso en producción.
 */

export type PaymentsConfig = {
  provider: "stripe";
  secretKey: string;
  webhookSecret: string;
  siteUrl: string;
  currency: "mxn";
};

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export function siteUrl(): string {
  const raw = clean(process.env["VITE_SITE_URL"]) || "https://sophisticated-elegance.vercel.app";
  return raw.replace(/\/+$/, "");
}

export function paymentsConfig(): PaymentsConfig | null {
  const provider = clean(process.env["PAYMENT_PROVIDER"]).toLowerCase();
  if (provider !== "stripe") return null;

  const secretKey = clean(process.env["STRIPE_SECRET_KEY"]);
  const webhookSecret = clean(process.env["STRIPE_WEBHOOK_SECRET"]);
  if (!secretKey.startsWith("sk_") || !webhookSecret) return null;

  return { provider: "stripe", secretKey, webhookSecret, siteUrl: siteUrl(), currency: "mxn" };
}

/** Motivo legible para el operador cuando los cobros no están configurados. */
export function paymentsUnavailableReason(): string {
  const provider = clean(process.env["PAYMENT_PROVIDER"]).toLowerCase();
  if (!provider) return "No hay proveedor de pagos configurado (PAYMENT_PROVIDER).";
  if (provider !== "stripe") return `Proveedor de pagos no soportado: ${provider}.`;
  if (!clean(process.env["STRIPE_SECRET_KEY"]).startsWith("sk_"))
    return "Falta STRIPE_SECRET_KEY válida.";
  if (!clean(process.env["STRIPE_WEBHOOK_SECRET"]))
    return "Falta STRIPE_WEBHOOK_SECRET para verificar los webhooks.";
  return "Cobros no disponibles.";
}
