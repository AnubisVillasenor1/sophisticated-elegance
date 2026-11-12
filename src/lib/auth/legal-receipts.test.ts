import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LegalAcceptance } from "@/lib/types";

const { recordLegalAcceptance } = vi.hoisted(() => ({ recordLegalAcceptance: vi.fn() }));

vi.mock("./auth.functions", () => ({ recordLegalAcceptance }));

import {
  appendLegalReceipts,
  clearLegalReceipts,
  clearPendingLegalEvidence,
  flushPendingLegalEvidence,
  readLegalReceipts,
  recordLegalEvidence,
  savePendingLegalEvidence,
} from "./legal-receipts";

const USER = "user-1";
const EMAIL = "persona@xclusive.test";

function acceptance(docId: string, docVersion = "2026.11-demo"): LegalAcceptance {
  return {
    id: `${docId}-${docVersion}`,
    docId,
    docVersion,
    acceptedAt: "2026-11-11T10:00:00.000Z",
    hash: "a".repeat(64),
    channel: "cuenta",
  };
}

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => Array.from(data.keys())[index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, String(value));
    },
  };
}

let store: Storage;

beforeEach(() => {
  store = memoryStorage();
  Object.defineProperty(window, "localStorage", { configurable: true, value: store });
  recordLegalAcceptance.mockReset();
});

describe("recibos legales", () => {
  it("guarda y deduplica por documento y versión", () => {
    appendLegalReceipts(USER, [acceptance("terminos"), acceptance("privacidad")]);
    appendLegalReceipts(USER, [acceptance("terminos")]);

    const records = readLegalReceipts(USER);
    expect(records.map((record) => record.docId)).toEqual(["terminos", "privacidad"]);
  });

  it("aísla los recibos por cuenta y los borra", () => {
    appendLegalReceipts(USER, [acceptance("terminos")]);
    expect(readLegalReceipts("otra-cuenta")).toEqual([]);

    clearLegalReceipts(USER);
    expect(readLegalReceipts(USER)).toEqual([]);
  });

  it("descarta un almacenamiento corrupto en lugar de romper la cuenta", () => {
    store.setItem(`xclusive.legal.receipts.${USER}`, "{no-es-json");
    expect(readLegalReceipts(USER)).toEqual([]);
  });

  it("si el servidor falla, no se guarda ningún recibo", async () => {
    recordLegalAcceptance.mockResolvedValue({ ok: false, receiptId: "", acceptedAt: "", hash: "" });

    const result = await recordLegalEvidence({
      userId: USER,
      docIds: ["terminos"],
      version: "2026.11-demo",
      channel: "cuenta",
    });

    expect(result.ok).toBe(false);
    expect(readLegalReceipts(USER)).toEqual([]);
  });

  it("con recibo firmado guarda fecha y hash del servidor", async () => {
    recordLegalAcceptance.mockResolvedValue({
      ok: true,
      receiptId: "receipt-1",
      acceptedAt: "2026-11-11T12:00:00.000Z",
      hash: "b".repeat(64),
    });

    const result = await recordLegalEvidence({
      userId: USER,
      docIds: ["terminos", "privacidad", "terminos"],
      version: "2026.11-demo",
      channel: "registro",
    });

    expect(result.ok).toBe(true);
    expect(recordLegalAcceptance).toHaveBeenCalledWith({
      data: { docIds: ["terminos", "privacidad"], version: "2026.11-demo" },
    });
    const records = readLegalReceipts(USER);
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      id: "receipt-1:terminos",
      acceptedAt: "2026-11-11T12:00:00.000Z",
      hash: "b".repeat(64),
      channel: "registro",
    });
  });
});

describe("evidencia pendiente de confirmación", () => {
  const viewer = {
    id: USER,
    email: EMAIL,
    role: "fan" as const,
    displayName: null,
    interests: [],
    interestsNote: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    creatorSlug: null,
  };

  it("se envía al servidor al iniciar sesión y se elimina después", async () => {
    savePendingLegalEvidence({
      email: EMAIL,
      docIds: ["terminos", "privacidad"],
      version: "2026.11-demo",
    });
    recordLegalAcceptance.mockResolvedValue({
      ok: true,
      receiptId: "receipt-2",
      acceptedAt: "2026-11-11T13:00:00.000Z",
      hash: "c".repeat(64),
    });

    const flushed = await flushPendingLegalEvidence(viewer);

    expect(flushed).toBe(true);
    expect(recordLegalAcceptance).toHaveBeenCalledWith({
      data: { docIds: ["terminos", "privacidad"], version: "2026.11-demo" },
    });
    expect(readLegalReceipts(USER)).toHaveLength(2);

    // El segundo intento no reenvía: la evidencia pendiente ya se consumió.
    recordLegalAcceptance.mockClear();
    await flushPendingLegalEvidence(viewer);
    expect(recordLegalAcceptance).not.toHaveBeenCalled();
  });

  it("no envía evidencia de otro correo", async () => {
    savePendingLegalEvidence({ email: EMAIL, docIds: ["terminos"], version: "2026.11-demo" });

    const flushed = await flushPendingLegalEvidence({ ...viewer, email: "otra@xclusive.test" });

    expect(flushed).toBe(false);
    expect(recordLegalAcceptance).not.toHaveBeenCalled();
  });

  it("clearPendingLegalEvidence respeta el correo indicado", () => {
    savePendingLegalEvidence({ email: EMAIL, docIds: ["terminos"], version: "v1" });
    clearPendingLegalEvidence("otra@xclusive.test");
    expect(store.getItem("xclusive.legal.pending")).not.toBeNull();

    clearPendingLegalEvidence(EMAIL);
    expect(store.getItem("xclusive.legal.pending")).toBeNull();
  });
});
