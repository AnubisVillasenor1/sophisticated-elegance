#!/usr/bin/env node
/**
 * Aplica un archivo SQL a la base de datos del proyecto.
 *
 * Usa la cadena de conexión Postgres que el proveedor entrega al proyecto
 * (`POSTGRES_URL`). No depende de ninguna herramienta propietaria: es el mismo
 * cliente `postgres` que ya usa la aplicación.
 *
 * Uso:
 *   node scripts/apply-db.mjs db/0001_comercio_auditoria.sql
 *   node scripts/apply-db.mjs db/0001_comercio_auditoria.sql --dry-run
 *
 * Las credenciales se leen de `.env` o del entorno. Nunca se imprimen.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const ROOT = resolve(import.meta.dirname, "..");

function loadEnv() {
  const out = {};
  for (const file of [".env", ".env.local"]) {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) continue;
    for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (out[key]) continue;
      out[key] = line
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

const env = { ...loadEnv(), ...process.env };
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const target = args.find((a) => !a.startsWith("--"));

if (!target) {
  console.error(
    "Falta la ruta del archivo SQL.\n  node scripts/apply-db.mjs db/0001_comercio_auditoria.sql",
  );
  process.exit(2);
}

const url = env.POSTGRES_URL ?? env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.error("Falta POSTGRES_URL en el entorno o en .env.");
  process.exit(2);
}

const file = resolve(ROOT, target);
if (!existsSync(file)) {
  console.error(`No existe el archivo: ${target}`);
  process.exit(2);
}

const body = readFileSync(file, "utf8");
if (dryRun) {
  console.log(body);
  process.exit(0);
}

const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 20, ssl: "require" });

try {
  await sql.unsafe(body);
  console.log(`Aplicado: ${target}`);
  const tables = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_name like 'xclusive_%'
    order by table_name`;
  console.log(
    `Tablas Xclusive presentes: ${tables.map((t) => t.table_name).join(", ") || "ninguna"}`,
  );
} catch (error) {
  console.error(`Error al aplicar ${target}: ${error.message}`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
