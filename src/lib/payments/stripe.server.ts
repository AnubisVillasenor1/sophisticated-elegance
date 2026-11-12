import { paymentsConfig } from "./config.server";

/**
 * Sesión de pago en Stripe.
 *
 * El SDK solo se carga en el servidor. El importe viaja en pesos enteros
 * (Stripe usa la unidad mínima: centavos), y el pedido se referencia por
 * `metadata.orderId` para que el webhook sepa qué acreditar.
 */
export async function createStripeSession(input: {
  orderId: string;
  userId: string;
  label: string;
  priceMXN: number;
}): Promise<{ id: string; url: string } | null> {
  const config = paymentsConfig();
  if (!config) return null;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(config.secretKey);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: config.currency,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: config.currency,
          unit_amount: Math.max(1, Math.round(input.priceMXN)) * 100,
          product_data: { name: input.label.slice(0, 120) },
        },
      },
    ],
    client_reference_id: input.orderId,
    metadata: { orderId: input.orderId, userId: input.userId },
    success_url: `${config.siteUrl}/cuenta?pago=ok`,
    cancel_url: `${config.siteUrl}/cuenta?pago=cancelado`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  if (!session.url) return null;
  return { id: session.id, url: session.url };
}
