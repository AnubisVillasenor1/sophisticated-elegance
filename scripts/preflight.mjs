#!/usr/bin/env node
/**
 * Diagnóstico previo al despliegue.
 *
 * Comprueba, sin imprimir secretos, cada dependencia externa que la plataforma
 * necesita para atender usuarios reales: Supabase Auth, las tablas de comercio
 * y auditoría, el bucket privado de la bóveda y la configuración de pagos.
 *
 * Uso:
 *   node scripts/preflight.mjs
 *   node scripts/preflight.mjs --json
 *
 * Sale con código 1 si hay algún bloqueo duro. Un bloqueo blando (por ejemplo,
 * pagos sin PSP) se informa como WARN porque la plataforma sigue siendo
 * navegable, pero no puede cobrar.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const JSON_OUT = process.argv.includes("--json");

function loadEnv() {
  const file = resolve(ROOT, ".env");
  if (!existsSync(file)) return {};
  const out = {};
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = { ...loadEnv(), ...process.env };
const results = [];

function record(level, area, message) {
  results.push({ level, area, message });
}

function present(key) {
  const value = env[key];
  return typeof value === "string" && value.trim().length > 0;
}

async function request(url, key, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    return { status: response.status, body: await response.text() };
  } catch (error) {
    return { status: 0, body: String(error?.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

const SUPABASE_URL = (env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY ?? "";
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/* ------------------------------------------------------------------ entorno */

if (SUPABASE_URL) record("pass", "entorno", "SUPABASE_URL definida");
else record("fail", "entorno", "Falta SUPABASE_URL: la autenticación no puede iniciar");

if (ANON_KEY) record("pass", "entorno", "Clave publicable definida");
else record("fail", "entorno", "Falta la clave publicable de Supabase");

if (SERVICE_KEY) record("pass", "entorno", "Clave de servicio definida");
else
  record(
    "fail",
    "entorno",
    "Falta SUPABASE_SERVICE_ROLE_KEY: panel admin, borrado ARCO y webhooks quedan deshabilitados",
  );

const demo = (env.VITE_DEMO_MODE ?? "").toLowerCase() === "true";
if (demo)
  record("warn", "entorno", "VITE_DEMO_MODE=true: este build no sirve para usuarios reales");

if (!present("ADMIN_EMAILS"))
  record("warn", "entorno", "ADMIN_EMAILS vacío: nadie puede entrar a administración");
if (!present("CREATOR_SLUGS") && !present("CREATOR_EMAILS"))
  record(
    "warn",
    "entorno",
    "CREATOR_SLUGS/CREATOR_EMAILS vacíos: ninguna cuenta se vincula a un perfil de creadora",
  );

/* ------------------------------------------------------------------ supabase */

if (SUPABASE_URL && ANON_KEY) {
  const health = await request(`${SUPABASE_URL}/auth/v1/health`, ANON_KEY);
  if (health.status === 200) record("pass", "auth", "Supabase Auth responde 200");
  else record("fail", "auth", `Supabase Auth respondió ${health.status || "sin red"}`);
}

const TABLES = [
  "profiles",
  "xclusive_orders",
  "xclusive_ledger_entries",
  "xclusive_entitlements",
  "xclusive_audit_log",
  "xclusive_legal_acceptances",
  "xclusive_webhook_events",
];

async function tableStatus(table, key) {
  const r = await request(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, key);
  if (r.status === 200 || r.status === 206) return { state: "ok", detail: `${r.status}` };
  if (r.status === 401 || r.status === 403) return { state: "denied", detail: `${r.status}` };
  if (r.status === 404) return { state: "missing", detail: "404" };
  return { state: "error", detail: `${r.status || r.body.slice(0, 60)}` };
}

if (SUPABASE_URL && ANON_KEY) {
  const profiles = await tableStatus("profiles", ANON_KEY);
  if (profiles.state === "ok")
    record("pass", "datos", "tabla profiles accesible con la clave publicable");
  else if (profiles.state === "denied")
    record("pass", "datos", "tabla profiles protegida por RLS (esperado sin sesión)");
  else record("fail", "datos", `tabla profiles no responde como se espera (${profiles.detail})`);
}

if (SUPABASE_URL && SERVICE_KEY) {
  const service = await request(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, SERVICE_KEY);
  if (service.status === 200 || service.status === 206) {
    record("pass", "servicio", "clave de servicio aceptada por PostgREST");
  } else if (service.status === 401) {
    record(
      "fail",
      "servicio",
      "la clave de servicio es rechazada (401): panel admin y ARCO no disponibles",
    );
  } else {
    record("warn", "servicio", `respuesta inesperada de la clave de servicio (${service.status})`);
  }

  for (const table of TABLES) {
    const status = await tableStatus(table, SERVICE_KEY);
    if (status.state === "ok") record("pass", "datos", `tabla ${table} existe`);
    else if (status.state === "missing")
      record(
        ["orders", "ledger_entries", "entitlements", "audit_log", "legal_acceptances"].includes(
          table,
        )
          ? "fail"
          : "warn",
        "datos",
        `tabla ${table} no existe: aplica db/0001_comercio_auditoria.sql`,
      );
    else if (status.state === "denied")
      record("warn", "datos", `tabla ${table} no accesible con la clave de servicio`);
    else record("warn", "datos", `tabla ${table}: ${status.detail}`);
  }

  const buckets = await request(`${SUPABASE_URL}/storage/v1/bucket`, SERVICE_KEY);
  if (buckets.status === 200) {
    let names = [];
    try {
      names = JSON.parse(buckets.body).map((b) => b.name ?? b.id);
    } catch {
      names = [];
    }
    if (names.includes("vault")) record("pass", "bóveda", "bucket privado 'vault' presente");
    else record("warn", "bóveda", "bucket privado 'vault' ausente: URLs firmadas no disponibles");
  } else if (buckets.status === 401) {
    record("warn", "bóveda", "storage rechazó la clave de servicio; no se puede verificar 'vault'");
  }
}

/* -------------------------------------------------------------------- pagos */

const provider = (env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
if (!provider) {
  record("warn", "pagos", "PAYMENT_PROVIDER vacío: las compras se rechazan con fallo cerrado");
} else if (!present("PAYMENT_SECRET_KEY")) {
  record("fail", "pagos", `PAYMENT_PROVIDER=${provider} sin PAYMENT_SECRET_KEY`);
} else if (!present("PAYMENT_WEBHOOK_SECRET")) {
  record("fail", "pagos", `PAYMENT_PROVIDER=${provider} sin PAYMENT_WEBHOOK_SECRET`);
} else {
  record("pass", "pagos", `proveedor '${provider}' configurado con secreto de webhook`);
}

/* ------------------------------------------------------------------ informe */

const icon = { pass: "OK  ", warn: "WARN", fail: "FAIL" };
const hardFailures = results.filter((r) => r.level === "fail").length;

if (JSON_OUT) {
  console.log(JSON.stringify({ results, hardFailures }, null, 2));
} else {
  console.log("\nXclusive · preflight\n");
  for (const r of results) console.log(`${icon[r.level]}  ${r.area.padEnd(9)} ${r.message}`);
  const warn = results.filter((r) => r.level === "warn").length;
  console.log(`\n${results.length} comprobaciones · ${hardFailures} bloqueos · ${warn} avisos\n`);
  if (hardFailures > 0) {
    console.log("Bloqueos duros pendientes. La plataforma puede navegarse, pero no está lista");
    console.log("para usuarios reales hasta resolverlos. Ver db/README.md.\n");
  } else {
    console.log("Sin bloqueos duros detectados en este entorno.\n");
  }
}

process.exit(hardFailures > 0 ? 1 : 0);
