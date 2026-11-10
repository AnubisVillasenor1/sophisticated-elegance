import { Check, ExternalLink } from "lucide-react";

import { LEGAL_BY_ID, REQUIRED_DOCS_CREATOR, REQUIRED_DOCS_FAN } from "@/lib/legal";
import { cn } from "@/lib/utils";

export type LegalConsentValue = {
  docIds: string[];
  age: boolean;
  lawful: boolean;
};

export function LegalConsent({
  role,
  value,
  onChange,
}: {
  role: "fan" | "creator";
  value: LegalConsentValue;
  onChange: (next: LegalConsentValue) => void;
}) {
  const required = role === "creator" ? REQUIRED_DOCS_CREATOR : REQUIRED_DOCS_FAN;
  const docs = required.map((id) => LEGAL_BY_ID.get(id)).filter((d) => d !== undefined);

  const toggleDoc = (docId: string) => {
    const exists = value.docIds.includes(docId);
    onChange({
      ...value,
      docIds: exists ? value.docIds.filter((id) => id !== docId) : [...value.docIds, docId],
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-hairline bg-white/[0.02] p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-silver">
          Documentos obligatorios
        </p>
        <div className="mt-3 space-y-2.5">
          {docs.map((doc) => {
            const checked = value.docIds.includes(doc.id);
            return (
              <div key={doc.id} className="flex items-start gap-3">
                <button
                  type="button"
                  aria-pressed={checked}
                  aria-label={`Aceptar ${doc.title}`}
                  onClick={() => toggleDoc(doc.id)}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    checked
                      ? "border-signal bg-signal text-primary-foreground"
                      : "border-hairline bg-black/20 text-transparent hover:border-silver/40",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0">
                  <a
                    href={`/legal/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-pearl underline-offset-4 hover:underline"
                  >
                    {doc.title} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                  <p className="mt-0.5 text-[0.65rem] leading-relaxed text-muted-foreground">
                    Versión {doc.version} · {doc.readingMin} min de lectura.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4">
        <input
          type="checkbox"
          checked={value.age}
          onChange={(e) => onChange({ ...value, age: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[var(--signal)]"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          Confirmo que soy mayor de edad en mi jurisdicción y que entiendo que la verificación de
          este prototipo es declarativa, no certificada.
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4">
        <input
          type="checkbox"
          checked={value.lawful}
          onChange={(e) => onChange({ ...value, lawful: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-[var(--signal)]"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          Confirmo que no usaré la plataforma para fines ilícitos, fraudulentos, abusivos o que
          vulneren derechos de terceros.
        </span>
      </label>

      <p className="text-[0.65rem] leading-relaxed text-muted-foreground/80">
        Registraremos documento, versión, fecha, hora, identificador de cuenta, canal y hash de
        aceptación. En producción se añadirán IP, dispositivo y hash criptográfico con sal del
        servidor.
      </p>
    </div>
  );
}
