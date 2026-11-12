/**
 * Registro de auditoría estructurado.
 *
 * Cada evento se emite como una línea JSON en stdout, que la plataforma de
 * despliegue retiene e indexa. No incluye secretos ni contenido privado: solo
 * identificadores, acción, resultado y metadatos mínimos.
 *
 * Limitación conocida: sin una tabla `audit_log` no hay retención propia ni
 * consulta desde la aplicación. La migración necesaria está documentada en
 * `docs/AUDITORIA-REMEDIACION.md`.
 */
export type AuditOutcome = "ok" | "denied" | "error";

export function auditEvent(event: {
  action: string;
  actorId?: string | null;
  outcome: AuditOutcome;
  detail?: string;
}): void {
  const line = JSON.stringify({
    kind: "xclusive.audit",
    ts: new Date().toISOString(),
    action: event.action,
    actorId: event.actorId ?? null,
    outcome: event.outcome,
    ...(event.detail ? { detail: event.detail } : {}),
  });
  console.info(line);
}
