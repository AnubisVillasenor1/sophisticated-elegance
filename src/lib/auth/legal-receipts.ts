import type { LegalAcceptance } from "@/lib/types";

import { recordLegalAcceptance, type Viewer } from "./auth.functions";

/**
 * Recibos de aceptación legal emitidos por el servidor.
 *
 * La autoridad es el evento de auditoría del servidor. Este módulo conserva el
 * recibo firmado (id, hash, fecha) en el navegador para poder mostrarlo y para
 * reintentar el envío cuando el alta requiere confirmación por correo. Nunca
 * concede permisos: solo evidencia.
 */

const RECEIPTS_PREFIX = "xclusive.legal.receipts.";
const PENDING_KEY = "xclusive.legal.pending";
export const LEGAL_RECEIPTS_EVENT = "xclusive:legal-receipts";

type Channel = LegalAcceptance["channel"];

export type PendingLegalEvidence = {
  email: string;
  docIds: string[];
  version: string;
  savedAt: string;
};

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function notify() {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(LEGAL_RECEIPTS_EVENT));
    }
  } catch {
    // Sin ventana (SSR) o evento bloqueado: el estado se refresca al navegar.
  }
}

function receiptsKey(userId: string): string {
  return `${RECEIPTS_PREFIX}${userId}`;
}

function isAcceptance(value: unknown): value is LegalAcceptance {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["id"] === "string" &&
    typeof record["docId"] === "string" &&
    typeof record["docVersion"] === "string" &&
    typeof record["acceptedAt"] === "string" &&
    typeof record["hash"] === "string" &&
    (record["channel"] === "registro" ||
      record["channel"] === "cuenta" ||
      record["channel"] === "creadora")
  );
}

export function readLegalReceipts(userId: string | null | undefined): LegalAcceptance[] {
  if (!userId) return [];
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(receiptsKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAcceptance);
  } catch {
    return [];
  }
}

export function appendLegalReceipts(
  userId: string,
  incoming: LegalAcceptance[],
): LegalAcceptance[] {
  if (!userId || incoming.length === 0) return readLegalReceipts(userId);
  const current = readLegalReceipts(userId);
  const seen = new Set(current.map((record) => `${record.docId}@${record.docVersion}`));
  const merged = [...current];
  for (const record of incoming) {
    const key = `${record.docId}@${record.docVersion}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(record);
  }
  const store = storage();
  if (store) {
    try {
      store.setItem(receiptsKey(userId), JSON.stringify(merged));
    } catch {
      // Cuota o almacenamiento bloqueado: el recibo sigue en el log del servidor.
    }
  }
  notify();
  return merged;
}

export function clearLegalReceipts(userId: string | null | undefined): void {
  if (!userId) return;
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(receiptsKey(userId));
  } catch {
    // Nada que limpiar.
  }
  notify();
}

export type LegalEvidenceResult = {
  ok: boolean;
  message: string;
  records: LegalAcceptance[];
};

/** Envía la evidencia al servidor y guarda el recibo firmado en el navegador. */
export async function recordLegalEvidence(input: {
  userId: string;
  docIds: string[];
  version: string;
  channel: Channel;
}): Promise<LegalEvidenceResult> {
  const docIds = Array.from(new Set(input.docIds.filter(Boolean)));
  if (!input.userId || docIds.length === 0) {
    return { ok: false, message: "No hay documentos para registrar.", records: [] };
  }

  try {
    const receipt = await recordLegalAcceptance({
      data: { docIds, version: input.version },
    });
    if (!receipt.ok) {
      return {
        ok: false,
        message: "No pudimos registrar tu aceptación. Inténtalo de nuevo.",
        records: [],
      };
    }
    const records: LegalAcceptance[] = docIds.map((docId) => ({
      id: `${receipt.receiptId}:${docId}`,
      docId,
      docVersion: input.version,
      acceptedAt: receipt.acceptedAt,
      hash: receipt.hash,
      channel: input.channel,
    }));
    appendLegalReceipts(input.userId, records);
    return {
      ok: true,
      message: `Aceptación registrada (${records.length} documento${records.length === 1 ? "" : "s"}).`,
      records,
    };
  } catch {
    return {
      ok: false,
      message: "No pudimos registrar tu aceptación. Revisa tu conexión e inténtalo de nuevo.",
      records: [],
    };
  }
}

/* ------------------------------------------------------------------ */
/* Evidencia pendiente (alta con confirmación de correo)               */
/* ------------------------------------------------------------------ */

function readPending(): PendingLegalEvidence | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    const docIds = Array.isArray(record["docIds"])
      ? record["docIds"].filter((item): item is string => typeof item === "string")
      : [];
    if (typeof record["email"] !== "string" || docIds.length === 0) return null;
    return {
      email: record["email"].trim().toLowerCase(),
      docIds,
      version: typeof record["version"] === "string" ? record["version"] : "",
      savedAt: typeof record["savedAt"] === "string" ? record["savedAt"] : "",
    };
  } catch {
    return null;
  }
}

export function savePendingLegalEvidence(input: {
  email: string;
  docIds: string[];
  version: string;
}): void {
  const store = storage();
  const email = input.email.trim().toLowerCase();
  const docIds = Array.from(new Set(input.docIds.filter(Boolean)));
  if (!store || !email.includes("@") || docIds.length === 0) return;
  try {
    store.setItem(
      PENDING_KEY,
      JSON.stringify({
        email,
        docIds,
        version: input.version,
        savedAt: new Date().toISOString(),
      } satisfies PendingLegalEvidence),
    );
  } catch {
    // Sin almacenamiento no se puede diferir; la UI lo indicará al entrar.
  }
}

export function clearPendingLegalEvidence(email?: string): void {
  const store = storage();
  if (!store) return;
  try {
    if (email) {
      const pending = readPending();
      if (pending && pending.email !== email.trim().toLowerCase()) return;
    }
    store.removeItem(PENDING_KEY);
  } catch {
    // Nada que limpiar.
  }
}

/**
 * Reenvía la evidencia guardada al confirmar el correo e iniciar sesión.
 * Se ejecuta en la sesión ya verificada; si falla, se conserva para el próximo
 * inicio de sesión. Devuelve `true` si registró algo.
 */
export async function flushPendingLegalEvidence(viewer: Viewer): Promise<boolean> {
  const pending = readPending();
  const email = viewer.email?.trim().toLowerCase() ?? "";
  if (!pending || !email || pending.email !== email) return false;

  const result = await recordLegalEvidence({
    userId: viewer.id,
    docIds: pending.docIds,
    version: pending.version || "desconocida",
    channel: "registro",
  });
  if (!result.ok) return false;
  clearPendingLegalEvidence(pending.email);
  return true;
}
