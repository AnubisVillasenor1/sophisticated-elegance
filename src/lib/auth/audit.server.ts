/**
 * Registro de auditoría estructurado.
 *
 * Cada evento se emite como una línea JSON en stdout, que la plataforma de
 * despliegue retiene e indexa, y además se persiste en `xclusive_audit_log`
 * cuando la clave de servicio está disponible. Si la tabla o la credencial
 * fallan, el evento sigue existiendo en el log: la auditoría nunca se pierde en
 * silencio y nunca bloquea la operación que la origina.
 *
 * No incluye secretos ni contenido privado: solo identificadores, acción,
 * resultado y metadatos mínimos.
 */
export type AuditOutcome = "ok" | "denied" | "error";

type AuditEvent = {
  action: string;
  actorId?: string | null;
  outcome: AuditOutcome;
  detail?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function persist(event: AuditEvent): Promise<void> {
  if (typeof process === "undefined") return;
  if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) return;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const client = supabaseAdmin as unknown as {
      from: (table: "xclusive_audit_log") => {
        insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      };
    };
    const actor = event.actorId && UUID.test(event.actorId) ? event.actorId : null;
    await client.from("xclusive_audit_log").insert({
      action: event.action.slice(0, 120),
      actor_id: actor,
      outcome: event.outcome,
      detail: event.detail ? event.detail.slice(0, 2000) : null,
    });
  } catch {
    // El log estructurado en stdout sigue siendo la fuente de verdad.
  }
}

export function auditEvent(event: AuditEvent): void {
  const line = JSON.stringify({
    kind: "xclusive.audit",
    ts: new Date().toISOString(),
    action: event.action,
    actorId: event.actorId ?? null,
    outcome: event.outcome,
    ...(event.detail ? { detail: event.detail } : {}),
  });
  console.info(line);
  void persist(event);
}
