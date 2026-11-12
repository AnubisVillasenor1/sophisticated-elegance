import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook del proveedor de pagos.
 *
 * Reglas:
 *  - La firma se verifica con el secreto del webhook antes de leer nada.
 *  - El cuerpo se procesa como texto crudo (no JSON.parse antes de verificar).
 *  - El evento es idempotente: el identificador del proveedor es la clave
 *    primaria de `xclusive_webhook_events`.
 *  - Sin configuración, responde 503 y no toca la base de datos.
 */
export const Route = createFileRoute("/api/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { paymentsConfig } = await import("@/lib/payments/config.server");
        const config = paymentsConfig();
        if (!config) {
          return new Response("payments unavailable", { status: 503 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("missing signature", { status: 400 });
        }

        const raw = await request.text();
        if (!raw) return new Response("empty body", { status: 400 });

        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(config.secretKey);

        let event: { id: string; type: string; data: { object: Record<string, unknown> } };
        try {
          event = stripe.webhooks.constructEvent(
            raw,
            signature,
            config.webhookSecret,
          ) as unknown as {
            id: string;
            type: string;
            data: { object: Record<string, unknown> };
          };
        } catch {
          return new Response("invalid signature", { status: 400 });
        }

        if (event.type !== "checkout.session.completed") {
          return new Response("ignored", { status: 200 });
        }

        const session = event.data.object as {
          id?: string;
          client_reference_id?: string | null;
          payment_intent?: string | null;
          metadata?: Record<string, string> | null;
        };

        const orderId = session.metadata?.["orderId"] ?? session.client_reference_id ?? null;
        if (!orderId) {
          return new Response("missing order", { status: 400 });
        }

        const { createHash } = await import("node:crypto");
        const payloadHash = createHash("sha256").update(raw).digest("hex");

        const { fulfilPaidOrder } = await import("@/lib/payments/orders.server");
        const result = await fulfilPaidOrder({
          orderId,
          provider: "stripe",
          providerPaymentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          eventId: event.id,
          eventType: event.type,
          payloadHash,
        });

        if (!result.ok) {
          // 500 hace que el proveedor reintente el evento.
          return new Response(result.message, { status: 500 });
        }

        return new Response(result.alreadyProcessed ? "duplicate" : "ok", { status: 200 });
      },
    },
  },
});
