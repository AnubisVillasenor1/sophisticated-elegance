/**
 * Precios de membresía (suscripciones).
 *
 * El ajuste de tarifas se aplica en un único lugar para que la portada, la
 * semilla de creadoras y el store local nunca se desincronicen. Los precios de
 * piezas individuales, eventos y propinas no pasan por aquí: solo las llaves
 * de suscripción.
 */

/** Ajuste aplicado a las suscripciones sobre la tarifa base. */
export const SUBSCRIPTION_INCREASE = 1.15;

/** Convierte una tarifa base en pesos a la tarifa vigente, redondeada a peso. */
export function subscriptionPrice(baseMXN: number): number {
  // Se multiplica por 115 y se divide entre 100 para evitar el error de coma
  // flotante de 1.15 (650 × 1.15 daría 747.4999… en vez de 747.5).
  return Math.round((baseMXN * 115) / 100);
}

/** Tarifas base de las tres llaves, antes del ajuste. */
export const BASE_TIER_PRICES_MXN = [120, 320, 820] as const;

/** Tarifas vigentes de las tres llaves: Insider, VIP Club e Inner Circle. */
export const TIER_PRICES_MXN = BASE_TIER_PRICES_MXN.map(subscriptionPrice) as [
  number,
  number,
  number,
];

/** Formato corto usado en la portada: "Desde $138 MXN". */
export function tierPriceLabel(baseMXN: number): string {
  return `Desde $${subscriptionPrice(baseMXN).toLocaleString("es-MX")} MXN`;
}
