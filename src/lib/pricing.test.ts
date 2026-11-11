import { describe, expect, it } from "vitest";

import {
  BASE_TIER_PRICES_MXN,
  TIER_PRICES_MXN,
  subscriptionPrice,
  tierPriceLabel,
} from "./pricing";
import { createSeedState } from "./seed";
import { normalizeStoredState } from "./store";

describe("precios de suscripción", () => {
  it("aplica el ajuste del 15% a las tres llaves", () => {
    expect(TIER_PRICES_MXN).toEqual([138, 368, 943]);
    expect(subscriptionPrice(120)).toBe(138);
    expect(subscriptionPrice(320)).toBe(368);
    expect(subscriptionPrice(820)).toBe(943);
  });

  it("redondea al peso y tolera tarifas impares", () => {
    expect(subscriptionPrice(149)).toBe(171);
    expect(subscriptionPrice(650)).toBe(748);
    expect(tierPriceLabel(BASE_TIER_PRICES_MXN[0])).toBe("Desde $138 MXN");
  });

  it("siembra las creadoras con la tarifa vigente", () => {
    const renata = createSeedState().creators.find((creator) => creator.id === "renata");
    expect(renata?.tiers.map((tier) => tier.priceMXN)).toEqual([138, 322, 748]);
  });

  it("actualiza las tarifas guardadas de una sesión anterior", () => {
    const stale = JSON.parse(JSON.stringify(createSeedState())) as ReturnType<
      typeof createSeedState
    >;
    const renata = stale.creators.find((creator) => creator.id === "renata");
    renata?.tiers.forEach((tier, index) => {
      tier.priceMXN = [120, 280, 650][index] ?? tier.priceMXN;
    });

    const normalized = normalizeStoredState(stale);
    const migrated = normalized?.creators.find((creator) => creator.id === "renata");
    expect(migrated?.tiers.map((tier) => tier.priceMXN)).toEqual([138, 322, 748]);
  });
});
