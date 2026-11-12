import { platformFeeMXN } from "@/lib/commerce";

/**
 * Reparto de un cobro y partida doble del libro mayor.
 *
 * Todo se calcula en pesos enteros para que no existan céntimos perdidos por
 * redondeo. La suma de débitos y la de créditos siempre coincide.
 */

export type LedgerAccount =
  "psp_clearing" | "platform_revenue" | "creator_payable" | "psp_fee" | "tax_payable" | "refund";

export type LedgerLine = {
  account: LedgerAccount;
  direction: "debit" | "credit";
  amountMXN: number;
};

export type OrderSplit = {
  grossMXN: number;
  platformFeeMXN: number;
  creatorNetMXN: number;
  /** Coste estimado del proveedor de pagos. Lo asume la plataforma. */
  pspFeeMXN: number;
  /** Margen que le queda a la plataforma tras el PSP. Puede ser negativo. */
  platformMarginMXN: number;
  lines: LedgerLine[];
};

/** Comisión estimada del PSP: 3.5 % + IVA 16 % sobre la comisión. */
export function estimatePspFeeMXN(grossMXN: number): number {
  const base = Math.max(0, Math.round(grossMXN)) * 0.035;
  return Math.round(base * 1.16);
}

export function splitOrder(grossMXN: number, revenueShare: number, pspFeeMXN?: number): OrderSplit {
  const gross = Math.max(0, Math.round(grossMXN));
  const platformFee = platformFeeMXN(gross, revenueShare);
  const creatorNet = gross - platformFee;
  const pspFee =
    pspFeeMXN === undefined ? estimatePspFeeMXN(gross) : Math.max(0, Math.round(pspFeeMXN));

  const entries: LedgerLine[] = [
    // El PSP retiene el bruto a nombre de la plataforma.
    { account: "psp_clearing", direction: "debit", amountMXN: gross },
    // Obligación con la creadora.
    { account: "creator_payable", direction: "credit", amountMXN: creatorNet },
    // Ingreso propio de la plataforma.
    { account: "platform_revenue", direction: "credit", amountMXN: platformFee },
    // Comisión que cobra el PSP: gasto de la plataforma.
    { account: "psp_fee", direction: "debit", amountMXN: pspFee },
    { account: "psp_clearing", direction: "credit", amountMXN: pspFee },
  ];

  const lines = entries.filter((line) => line.amountMXN > 0);

  return {
    grossMXN: gross,
    platformFeeMXN: platformFee,
    creatorNetMXN: creatorNet,
    pspFeeMXN: pspFee,
    platformMarginMXN: platformFee - pspFee,
    lines,
  };
}

/** Débitos y créditos de un asiento. Deben coincidir al peso. */
export function ledgerBalance(lines: LedgerLine[]): {
  debit: number;
  credit: number;
  balanced: boolean;
} {
  let debit = 0;
  let credit = 0;
  for (const line of lines) {
    if (line.direction === "debit") debit += line.amountMXN;
    else credit += line.amountMXN;
  }
  return { debit, credit, balanced: debit === credit };
}

/** Tipo de acceso que concede cada clase de compra. `null` = no concede. */
export function entitlementFor(
  kind: string,
): "post" | "clip" | "bundle" | "ticket" | "membership" | null {
  switch (kind) {
    case "ppv":
      return "post";
    case "clip":
      return "clip";
    case "bundle":
      return "bundle";
    case "ticket":
      return "ticket";
    case "subscription":
      return "membership";
    default:
      // `custom` es un encargo y `tip` es una propina: no desbloquean piezas.
      return null;
  }
}
