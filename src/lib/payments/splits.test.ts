import { describe, expect, it } from "vitest";

import { entitlementFor, estimatePspFeeMXN, ledgerBalance, splitOrder } from "./splits";

describe("splitOrder", () => {
  it("reparte el bruto sin perder pesos", () => {
    for (const gross of [100, 199, 1000, 2499, 20_000]) {
      const split = splitOrder(gross, 80);
      expect(split.platformFeeMXN + split.creatorNetMXN).toBe(gross);
      expect(split.grossMXN).toBe(gross);
    }
  });

  it("respeta el porcentaje de la creadora", () => {
    const split = splitOrder(1000, 80);
    expect(split.creatorNetMXN).toBe(800);
    expect(split.platformFeeMXN).toBe(200);
  });

  it("el asiento siempre cuadra al peso", () => {
    for (const gross of [10, 99, 150, 1000, 7777, 20_000]) {
      for (const share of [0, 50, 70, 80, 100]) {
        const split = splitOrder(gross, share);
        const balance = ledgerBalance(split.lines);
        expect(balance.balanced).toBe(true);
        expect(balance.debit).toBe(balance.credit);
      }
    }
  });

  it("calcula el margen de la plataforma tras el PSP", () => {
    const split = splitOrder(1000, 80);
    expect(split.pspFeeMXN).toBe(estimatePspFeeMXN(1000));
    expect(split.platformMarginMXN).toBe(split.platformFeeMXN - split.pspFeeMXN);
  });

  it("un bruto de cero no genera asientos", () => {
    const split = splitOrder(0, 80);
    expect(split.lines).toHaveLength(0);
    expect(ledgerBalance(split.lines).balanced).toBe(true);
  });

  it("descarta un asiento descuadrado", () => {
    const balance = ledgerBalance([
      { account: "psp_clearing", direction: "debit", amountMXN: 100 },
      { account: "creator_payable", direction: "credit", amountMXN: 99 },
    ]);
    expect(balance.balanced).toBe(false);
  });
});

describe("estimatePspFeeMXN", () => {
  it("aplica 3.5 % + IVA y redondea a pesos", () => {
    expect(estimatePspFeeMXN(1000)).toBe(41);
    expect(estimatePspFeeMXN(0)).toBe(0);
  });
});

describe("entitlementFor", () => {
  it("concede acceso solo a las compras que lo justifican", () => {
    expect(entitlementFor("ppv")).toBe("post");
    expect(entitlementFor("clip")).toBe("clip");
    expect(entitlementFor("bundle")).toBe("bundle");
    expect(entitlementFor("ticket")).toBe("ticket");
    expect(entitlementFor("subscription")).toBe("membership");
    expect(entitlementFor("tip")).toBeNull();
    expect(entitlementFor("custom")).toBeNull();
    expect(entitlementFor("desconocido")).toBeNull();
  });
});
