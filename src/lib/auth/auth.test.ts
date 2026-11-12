import { describe, expect, it } from "vitest";

import { parseCreatorSlugMap, resolveCreatorSlug } from "./creator-link";
import { mapAuthError } from "./errors";
import { resolveAuthMode } from "./mode";
import { consumeRateLimit, type Bucket } from "./rate-limit";
import { parseEmailList, resolveRole } from "./roles";

describe("resolveAuthMode", () => {
  it("solo activa DEMO con el literal exacto", () => {
    expect(resolveAuthMode("true")).toBe("demo");
    expect(resolveAuthMode("false")).toBe("live");
    expect(resolveAuthMode(undefined)).toBe("live");
    expect(resolveAuthMode("1")).toBe("live");
    expect(resolveAuthMode("TRUE")).toBe("live");
  });
});

describe("parseEmailList", () => {
  it("separa por comas, espacios y punto y coma, y descarta basura", () => {
    expect(parseEmailList("A@x.com, b@x.com;c@x.com  no-es-correo")).toEqual([
      "a@x.com",
      "b@x.com",
      "c@x.com",
    ]);
    expect(parseEmailList("")).toEqual([]);
    expect(parseEmailList(null)).toEqual([]);
  });
});

describe("resolveRole", () => {
  const allowAdmins = ["admin@xclusive.mx"];
  const allowCreators = ["creadora@xclusive.mx"];

  it("la allowlist de servidor concede el rol", () => {
    expect(resolveRole({ email: "ADMIN@xclusive.mx", allowAdmins })).toBe("admin");
    expect(resolveRole({ email: "creadora@xclusive.mx", allowCreators })).toBe("creator");
  });

  it("la allowlist de administración tiene prioridad sobre la de creadoras", () => {
    expect(
      resolveRole({
        email: "admin@xclusive.mx",
        allowAdmins,
        allowCreators: ["admin@xclusive.mx"],
      }),
    ).toBe("admin");
  });

  it("app_metadata.role lo escribe el servidor y sí concede rol", () => {
    expect(
      resolveRole({
        email: "alguien@xclusive.mx",
        claims: { app_metadata: { role: "admin" } },
      }),
    ).toBe("admin");
    expect(
      resolveRole({
        email: "alguien@xclusive.mx",
        claims: { app_metadata: { role: "creator" } },
      }),
    ).toBe("creator");
  });

  it("user_metadata nunca concede rol", () => {
    expect(
      resolveRole({
        email: "fan@xclusive.mx",
        claims: { user_metadata: { role: "admin" }, app_metadata: {} },
      }),
    ).toBe("fan");
  });

  it("sin coincidencia el rol es fan (fallo cerrado)", () => {
    expect(resolveRole({ email: "nadie@xclusive.mx", allowAdmins, allowCreators })).toBe("fan");
    expect(resolveRole({ email: null, claims: null })).toBe("fan");
    expect(resolveRole({})).toBe("fan");
  });

  it("ignora roles de app_metadata que no existen en el dominio", () => {
    expect(
      resolveRole({ email: "x@x.com", claims: { app_metadata: { role: "superadmin" } } }),
    ).toBe("fan");
  });
});

describe("vínculo creadora → slug", () => {
  it("solo se resuelve para el rol creator", () => {
    const map = parseCreatorSlugMap("creadora@x.test=valentina-r");
    expect(resolveCreatorSlug({ role: "fan", email: "creadora@x.test", map })).toBeNull();
    expect(resolveCreatorSlug({ role: "admin", email: "creadora@x.test", map })).toBeNull();
    expect(resolveCreatorSlug({ role: "creator", email: "creadora@x.test", map })).toBe(
      "valentina-r",
    );
  });

  it("app_metadata.creator_slug tiene prioridad sobre el mapa de entorno", () => {
    expect(
      resolveCreatorSlug({
        role: "creator",
        email: "creadora@x.test",
        claims: { app_metadata: { creator_slug: "marea" } },
        map: { "creadora@x.test": "valentina-r" },
      }),
    ).toBe("marea");
  });

  it("user_metadata.creator_slug no vincula nada", () => {
    expect(
      resolveCreatorSlug({
        role: "creator",
        email: "creadora@x.test",
        claims: { user_metadata: { creator_slug: "valentina-r" }, app_metadata: {} },
      }),
    ).toBeNull();
  });

  it("descarta slugs y entradas inválidas", () => {
    expect(parseCreatorSlugMap("sin-arroba=valentina; a@x.test=../etc/passwd")).toEqual({});
    expect(
      resolveCreatorSlug({
        role: "creator",
        email: "a@x.test",
        claims: { app_metadata: { creator_slug: "../../admin" } },
      }),
    ).toBeNull();
  });
});

describe("consumeRateLimit", () => {
  it("permite hasta el límite dentro de la ventana y después bloquea", () => {
    const buckets = new Map<string, Bucket>();
    const limit = 3;
    const windowMs = 1000;
    const now = 10_000;

    const first = consumeRateLimit(buckets, "user", limit, windowMs, now);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);

    consumeRateLimit(buckets, "user", limit, windowMs, now);
    const third = consumeRateLimit(buckets, "user", limit, windowMs, now);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const blocked = consumeRateLimit(buckets, "user", limit, windowMs, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBe(windowMs);
  });

  it("reinicia la ventana al expirar", () => {
    const buckets = new Map<string, Bucket>();
    consumeRateLimit(buckets, "user", 1, 1000, 0);
    expect(consumeRateLimit(buckets, "user", 1, 1000, 500).allowed).toBe(false);
    expect(consumeRateLimit(buckets, "user", 1, 1000, 1000).allowed).toBe(true);
  });

  it("aísla las claves entre sí", () => {
    const buckets = new Map<string, Bucket>();
    consumeRateLimit(buckets, "a", 1, 1000, 0);
    expect(consumeRateLimit(buckets, "b", 1, 1000, 0).allowed).toBe(true);
  });

  it("un límite inválido falla cerrado", () => {
    const buckets = new Map<string, Bucket>();
    expect(consumeRateLimit(buckets, "user", 0, 1000, 0).allowed).toBe(false);
    expect(consumeRateLimit(buckets, "user", Number.NaN, 1000, 0).allowed).toBe(false);
  });
});

describe("mapAuthError", () => {
  it("traduce los errores frecuentes y no filtra detalles internos", () => {
    expect(mapAuthError("Invalid login credentials")).toBe("Correo o contraseña incorrectos.");
    expect(mapAuthError("Email not confirmed")).toContain("Confirma tu correo");
    expect(mapAuthError("User already registered")).toContain("Ya existe una cuenta");
    expect(mapAuthError("Password should be at least 6 characters")).toContain("al menos 8");
    expect(mapAuthError("Too many requests")).toContain("Demasiados intentos");
    expect(mapAuthError("signup is disabled")).toContain("registro está cerrado");
    expect(mapAuthError("algo raro del backend")).toBe(
      "No pudimos completar la operación. Inténtalo de nuevo.",
    );
  });
});
