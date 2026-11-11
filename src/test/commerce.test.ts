import { describe, expect, it } from "vitest";

import {
  creatorNetMXN,
  MAX_TIP_MXN,
  MIN_TIP_MXN,
  platformFeeMXN,
  pspEstimateMXN,
  resolveItemPrice,
  validateTipAmount,
} from "@/lib/commerce";
import { LEGAL_BY_ID, LEGAL_VERSION, REQUIRED_DOCS_CREATOR, REQUIRED_DOCS_FAN } from "@/lib/legal";
import { canViewPost } from "@/lib/selectors";
import { createSeedState } from "@/lib/seed";

function state() {
  return createSeedState();
}

describe("commerce: precios resueltos desde el catálogo", () => {
  it("resuelve el precio real de un PPV y no confía en el cliente", () => {
    const app = state();
    const creator = app.creators.find((c) => c.id === "valentina")!;
    const ppv = creator.posts.find((p) => p.visibility === "ppv")!;

    const result = resolveItemPrice(app, creator.id, "ppv", ppv.id);
    expect(result).toEqual({
      ok: true,
      priceMXN: ppv.priceMXN,
      label: ppv.title,
      creatorId: creator.id,
    });
  });

  it("rechaza publicaciones que no se venden por separado", () => {
    const app = state();
    const creator = app.creators.find((c) => c.id === "valentina")!;
    const publicPost = creator.posts.find((p) => p.visibility === "public")!;
    const result = resolveItemPrice(app, creator.id, "ppv", publicPost.id);
    expect(result.ok).toBe(false);
  });

  it("resuelve clips, paquetes, encargos y boletos", () => {
    const app = state();
    const creator = app.creators.find((c) => c.id === "valentina")!;
    const clip = creator.clips[0]!;
    const bundle = creator.bundles[0]!;
    const offer = creator.offers[0]!;
    const room = creator.rooms.find((r) => r.access === "ticket")!;

    expect(resolveItemPrice(app, creator.id, "clip", clip.id)).toMatchObject({
      ok: true,
      priceMXN: clip.priceMXN,
    });
    expect(resolveItemPrice(app, creator.id, "bundle", bundle.id)).toMatchObject({
      ok: true,
      priceMXN: bundle.priceMXN,
    });
    expect(resolveItemPrice(app, creator.id, "custom", offer.id)).toMatchObject({
      ok: true,
      priceMXN: offer.priceMXN,
    });
    expect(resolveItemPrice(app, creator.id, "ticket", room.id)).toMatchObject({
      ok: true,
      priceMXN: room.ticketPriceMXN,
    });
  });

  it("rechaza piezas inexistentes y perfiles suspendidos", () => {
    const app = state();
    expect(resolveItemPrice(app, "valentina", "clip", "no-existe").ok).toBe(false);
    expect(resolveItemPrice(app, "no-existe", "clip", "x").ok).toBe(false);

    const suspended = {
      ...app,
      creators: app.creators.map((c) =>
        c.id === "valentina" ? { ...c, status: "suspended" as const } : c,
      ),
    };
    expect(resolveItemPrice(suspended, "valentina", "clip", app.creators[0]!.clips[0]!.id).ok).toBe(
      false,
    );
  });
});

describe("commerce: comisiones y propinas", () => {
  it("calcula la comisión de plataforma según el reparto", () => {
    expect(platformFeeMXN(1000, 80)).toBe(200);
    expect(creatorNetMXN(1000, 80)).toBe(800);
    expect(platformFeeMXN(1000, 100)).toBe(0);
    expect(platformFeeMXN(0, 80)).toBe(0);
    expect(platformFeeMXN(-50, 80)).toBe(0);
    expect(creatorNetMXN(-50, 80)).toBe(0);
  });

  it("estima la comisión del PSP con IVA y redondeo", () => {
    expect(pspEstimateMXN(1000)).toBe(41);
    expect(pspEstimateMXN(0)).toBe(0);
  });

  it("valida los límites de propina", () => {
    expect(validateTipAmount(0)).not.toBeNull();
    expect(validateTipAmount(Number.NaN)).not.toBeNull();
    expect(validateTipAmount(MIN_TIP_MXN - 1)).not.toBeNull();
    expect(validateTipAmount(MAX_TIP_MXN + 1)).not.toBeNull();
    expect(validateTipAmount(MIN_TIP_MXN)).toBeNull();
    expect(validateTipAmount(150)).toBeNull();
  });
});

describe("permisos de contenido", () => {
  it("solo muestra contenido público sin sesión", () => {
    const app = state();
    const creator = app.creators.find((c) => c.id === "valentina")!;
    const publicPost = creator.posts.find((p) => p.visibility === "public")!;
    const membersPost = creator.posts.find((p) => p.visibility === "members")!;

    expect(canViewPost(app, publicPost, null)).toBe(true);
    expect(canViewPost(app, membersPost, null)).toBe(false);
  });

  it("exige compra para PPV y membresía activa para miembros", () => {
    const app = state();
    const creator = app.creators.find((c) => c.id === "valentina")!;
    const membersPost = creator.posts.find((p) => p.visibility === "members")!;
    const ppvPost = creator.posts.find((p) => p.visibility === "ppv")!;
    const subscription = app.subscriptions.find(
      (s) => s.creatorId === creator.id && s.status === "active",
    )!;

    expect(canViewPost(app, membersPost, subscription.fanId)).toBe(true);
    expect(canViewPost(app, ppvPost, "u-sin-compras")).toBe(false);
  });
});

describe("marco legal", () => {
  it("publica todos los documentos obligatorios con versión", () => {
    expect(LEGAL_VERSION).toMatch(/^\d{4}\.\d+/);
    for (const id of [...REQUIRED_DOCS_FAN, ...REQUIRED_DOCS_CREATOR]) {
      expect(LEGAL_BY_ID.has(id), `falta el documento ${id}`).toBe(true);
    }
  });

  it("mantiene el modo DEMO y el contenido adulto deshabilitado", () => {
    const app = state();
    expect(app.settings.adultEnabled).toBe(false);
    expect(app.settings.termsVersion).toBe(LEGAL_VERSION);
    const demo = LEGAL_BY_ID.get("demo");
    expect(demo?.sections.length).toBeGreaterThan(0);
    expect(JSON.stringify(demo)).toMatch(/DEMO/i);
  });
});
