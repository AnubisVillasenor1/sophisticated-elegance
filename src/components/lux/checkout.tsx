import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Info, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { creatorNetMXN, platformFeeMXN, pspEstimateMXN, validateTipAmount } from "@/lib/commerce";
import { demoMode } from "@/lib/auth/demo-accounts";
import { AUTH_MODE } from "@/lib/auth/mode";
import { useSession } from "@/lib/auth/SessionProvider";
import { submitReport as submitReportRemote } from "@/lib/content/content.functions";
import { formatMoney } from "@/lib/format";
import { startCheckout } from "@/lib/payments/payment.functions";
import { useApp } from "@/lib/store";
import type { Creator, PurchaseKind, ReportTarget, Tier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge, Button, Field, Input, Modal, Select, Textarea } from "./ui";

/* ------------------------------------------------------------------ */
/* Desglose transparente de comisiones                                 */
/* ------------------------------------------------------------------ */

export function CommissionBreakdown({
  amountMXN,
  revenueShare,
  className,
}: {
  amountMXN: number;
  revenueShare: number;
  className?: string;
}) {
  const { state } = useApp();
  const gross = Math.max(0, Math.round(amountMXN));
  const platformPct = 100 - Math.max(0, Math.min(100, revenueShare));
  const platformFee = platformFeeMXN(gross, revenueShare);
  const pspFee = pspEstimateMXN(gross);
  const net = Math.max(0, creatorNetMXN(gross, revenueShare) - pspFee);

  return (
    <div className={cn("rounded-xl border border-hairline bg-black/25 p-4", className)}>
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
        Desglose antes de confirmar
      </p>
      <div className="mt-3 space-y-2 text-xs">
        <Row label="Precio bruto" value={formatMoney(gross, state.currency)} />
        <Row
          label={`Comisión Xclusive (${platformPct}%)`}
          value={`− ${formatMoney(platformFee, state.currency)}`}
        />
        <Row
          label={`Comisión PSP estimada (3.5% + IVA)`}
          value={`− ${formatMoney(pspFee, state.currency)}`}
        />
        <Row label="Impuestos aplicables" value="Variable" muted />
        <div className="mt-2 flex items-center justify-between border-t border-hairline pt-2">
          <span className="text-silver">Neto estimado para la creadora</span>
          <span className="font-serif text-lg text-pearl">{formatMoney(net, state.currency)}</span>
        </div>
      </div>
      <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground/80">
        Cifras referenciales en Modo DEMO. No se realiza ningún cargo real. Las comisiones
        definitivas deben constar en el contrato y en el proveedor de pagos.
      </p>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-pearl", muted && "text-muted-foreground")}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compra / desbloqueo                                                 */
/* ------------------------------------------------------------------ */

export type CheckoutState = {
  kind: PurchaseKind;
  creator: Creator;
  itemId: string;
  label: string;
  amountMXN: number;
  description?: string;
} | null;

export function CheckoutDialog({ state, onClose }: { state: CheckoutState; onClose: () => void }) {
  const { user, unlock } = useApp();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => {
    const random =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    return `co_${random}`;
  });

  const close = () => {
    setAccepted(false);
    setError(null);
    onClose();
  };

  if (!state) return null;
  const { creator, kind, itemId, label, amountMXN, description } = state;

  const confirm = async () => {
    if (!user) {
      toast.error("Inicia sesión para continuar.");
      return;
    }

    // Un acceso gratuito no pasa por la pasarela.
    if (amountMXN <= 0) {
      const result = unlock(kind, creator.id, itemId, label, amountMXN);
      toast(result.message);
      if (result.ok) close();
      return;
    }

    if (demoMode) {
      const result = unlock(kind, creator.id, itemId, label, amountMXN);
      toast(result.message);
      if (result.ok) close();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await startCheckout({
        data: {
          kind,
          creatorId: creator.id,
          itemId,
          idempotencyKey,
          ...(kind === "tip" ? { amountMXN } : {}),
        },
      });
      if (!result.ok) {
        setError(result.message);
        setBusy(false);
        return;
      }
      // El cobro ocurre en el proveedor; el acceso se concede cuando llega el
      // webhook firmado, no al volver a esta página.
      window.location.assign(result.url);
    } catch {
      setError("No se pudo abrir la pasarela de pago. Inténtalo de nuevo.");
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(state)}
      onClose={close}
      title={kind === "custom" ? "Solicitar encargo" : "Confirmar acceso"}
      description={`${creator.name} · ${label}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button disabled={!accepted || busy} onClick={() => void confirm()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{" "}
            {kind === "custom"
              ? "Enviar solicitud"
              : busy
                ? "Abriendo pasarela…"
                : `Confirmar ${formatMoney(amountMXN)}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}

        {amountMXN > 0 ? (
          <CommissionBreakdown amountMXN={amountMXN} revenueShare={creator.revenueShare} />
        ) : (
          <div className="rounded-xl border border-success/25 bg-success/5 p-4 text-xs leading-relaxed text-success">
            Acceso sin costo en este prototipo. No se solicita método de pago.
          </div>
        )}

        {demoMode ? (
          <div className="rounded-xl border border-warning/25 bg-warning/5 p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> Modo DEMO
            </p>
            <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">
              Esta operación se registra en el libro de demostración. No se realiza cargo real, no
              genera saldo retirable y no crea obligación de pago.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-success/25 bg-success/5 p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Pago protegido
            </p>
            <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">
              El cobro se procesa en la pasarela del proveedor. Tu acceso se activa en cuanto el
              pago queda confirmado, no al volver a esta página. El importe y la comisión los fija
              el servidor.
            </p>
          </div>
        )}

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs leading-relaxed text-destructive"
          >
            {error}
          </p>
        ) : null}

        <label className="flex items-start gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--signal)]"
          />
          <span className="text-[0.7rem] leading-relaxed text-muted-foreground">
            Entiendo que es una simulación, que el acceso es personal e intransferible y que se rige
            por los{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "terminos" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              Términos
            </Link>{" "}
            y la{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "cancelacion" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              Política de cancelación
            </Link>
            .
          </span>
        </label>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Suscripción                                                         */
/* ------------------------------------------------------------------ */

export function SubscribeDialog({
  creator,
  initialTierId,
  open,
  onClose,
}: {
  creator: Creator;
  initialTierId?: string;
  open: boolean;
  onClose: () => void;
}) {
  const { subscribe } = useApp();
  const [tierId, setTierId] = useState(
    initialTierId ?? creator.tiers[1]?.id ?? creator.tiers[0]?.id ?? "",
  );
  const [trial, setTrial] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const tier = useMemo(
    () => creator.tiers.find((t) => t.id === tierId) ?? creator.tiers[0],
    [creator.tiers, tierId],
  );

  if (!tier) return null;

  const close = () => {
    setAccepted(false);
    setTrial(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Elegir membresía"
      description={`${creator.name} · Modo DEMO sin cargo real`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            disabled={!accepted}
            onClick={() => {
              const result = subscribe(creator.id, tier.id, trial);
              toast(result.message);
              if (result.ok) close();
            }}
          >
            <Sparkles className="h-4 w-4" />{" "}
            {trial ? "Activar prueba de 7 días" : "Confirmar membresía"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          {creator.tiers.map((item) => (
            <TierOption
              key={item.id}
              tier={item}
              selected={item.id === tier.id}
              onSelect={() => setTierId(item.id)}
            />
          ))}
        </div>

        {creator.freeTrial ? (
          <label className="flex items-start gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4">
            <input
              type="checkbox"
              checked={trial}
              onChange={(e) => setTrial(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--signal)]"
            />
            <span className="text-[0.7rem] leading-relaxed text-muted-foreground">
              Probar 7 días gratis. La prueba es simulada, no solicita tarjeta y no se convierte en
              cobro real.
            </span>
          </label>
        ) : null}

        {!trial ? (
          <CommissionBreakdown amountMXN={tier.priceMXN} revenueShare={creator.revenueShare} />
        ) : null}

        <div className="rounded-xl border border-info/25 bg-info/5 p-4 text-[0.7rem] leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-2 text-xs font-medium text-info">
            <Info className="h-3.5 w-3.5" /> Renovación y cancelación
          </p>
          <p className="mt-1.5">
            La renovación automática requiere consentimiento expreso. Puedes cancelar en cualquier
            momento desde Mi cuenta. La cancelación impide renovaciones futuras, no genera
            penalización y conserva el acceso hasta el cierre del periodo ya pagado.
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--signal)]"
          />
          <span className="text-[0.7rem] leading-relaxed text-muted-foreground">
            Acepto los{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "terminos" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              Términos
            </Link>
            , el{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "privacidad" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              Aviso de Privacidad
            </Link>{" "}
            y la{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "cancelacion" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              Política de cancelación
            </Link>
            . Entiendo que esta membresía es una simulación DEMO.
          </span>
        </label>
      </div>
    </Modal>
  );
}

function TierOption({
  tier,
  selected,
  onSelect,
}: {
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
}) {
  const { state } = useApp();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-signal/50 bg-signal/10"
          : "border-hairline bg-white/[0.02] hover:border-silver/30",
      )}
    >
      <span>
        <span className="block text-sm text-pearl">{tier.name}</span>
        <span className="mt-0.5 block text-[0.68rem] text-muted-foreground">{tier.tagline}</span>
      </span>
      <span className="text-right">
        <span className="block font-serif text-xl text-pearl">
          {formatMoney(tier.priceMXN, state.currency)}
        </span>
        <span className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
          / mes
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Propina                                                             */
/* ------------------------------------------------------------------ */

export function TipDialog({
  creator,
  roomId,
  initialAmount,
  open,
  onClose,
}: {
  creator: Creator;
  roomId?: string;
  initialAmount?: number;
  open: boolean;
  onClose: () => void;
}) {
  const { tip, liveTip } = useApp();
  const [amount, setAmount] = useState(initialAmount && initialAmount > 0 ? initialAmount : 100);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && initialAmount && initialAmount > 0) setAmount(initialAmount);
  }, [open, initialAmount]);

  const send = () => {
    const invalid = validateTipAmount(amount);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    const result = roomId ? liveTip(creator.id, roomId, amount) : tip(creator.id, amount, note);
    toast(result.message);
    if (result.ok) {
      setNote("");
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enviar propina"
      description={`${creator.name} · Simulación sin cargo real`}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={send}>Enviar propina DEMO</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 200, 500].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className={cn(
                "rounded-lg border py-2 text-sm transition-colors",
                amount === value
                  ? "border-signal bg-signal/15 text-pearl"
                  : "border-hairline text-muted-foreground hover:text-pearl",
              )}
            >
              ${value}
            </button>
          ))}
        </div>
        <Field label="Monto (MXN)">
          <Input
            type="number"
            min={10}
            step={10}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </Field>
        {!roomId ? (
          <Field label="Mensaje (opcional)">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Unas palabras para acompañar la propina."
              className="min-h-20"
            />
          </Field>
        ) : null}
        <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
          Las propinas DEMO no generan saldo retirable ni obligación de pago. Se registran en el
          libro de demostración con su comisión correspondiente.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Reporte / denuncia                                                  */
/* ------------------------------------------------------------------ */

const REPORT_REASONS = [
  "Contenido sexual o explotación de menores",
  "Material íntimo sin consentimiento",
  "Violencia, odio o acoso",
  "Suplantación de identidad o fraude",
  "Infracción de derechos de autor o imagen",
  "Spam, malware o esquema engañoso",
  "Contenido no coincidente con la descripción",
  "Otro",
];

export function ReportDialog({
  target,
  open,
  onClose,
}: {
  target: { type: ReportTarget; id: string; label: string };
  open: boolean;
  onClose: () => void;
}) {
  const { submitReport } = useApp();
  const session = useSession();
  const live = AUTH_MODE === "live";
  const [reason, setReason] = useState(REPORT_REASONS[0] ?? "Otro");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  /**
   * En LIVE la denuncia se persiste en `xclusive_reports` desde una server
   * function (requiere sesión). En DEMO se mantiene el registro local.
   */
  const send = async () => {
    if (busy) return;
    if (!live) {
      const result = submitReport({
        targetType: target.type,
        targetId: target.id,
        targetLabel: target.label,
        reason,
        details,
      });
      toast(result.message);
      if (result.ok) {
        setDetails("");
        onClose();
      }
      return;
    }
    if (session.status !== "signed-in") {
      toast.error("Inicia sesión para enviar una denuncia.");
      return;
    }
    setBusy(true);
    try {
      const result = await submitReportRemote({
        data: {
          targetType: target.type,
          targetId: target.id,
          targetLabel: target.label,
          reason,
          details,
        },
      });
      toast(result.message);
      if (result.ok) {
        setDetails("");
        onClose();
      }
    } catch {
      toast.error("No se pudo registrar la denuncia.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reportar contenido"
      description="Revisión por el equipo de confianza y seguridad."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={busy} onClick={() => void send()}>
            <ShieldCheck className="h-4 w-4" /> {busy ? "Enviando…" : "Enviar reporte"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Motivo" required>
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REPORT_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Detalle"
          hint="Incluye enlaces, fechas o capturas que ayuden a revisar el caso."
        >
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe lo ocurrido con la mayor precisión posible."
          />
        </Field>
        <div className="rounded-xl border border-hairline bg-white/[0.02] p-4 text-[0.68rem] leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-2 text-xs text-pearl">
            <Badge tone="warning">Importante</Badge> Conservación de evidencia
          </p>
          <p className="mt-2">
            Los reportes reciben un identificador y estado. Si el caso involucra a una persona menor
            de edad o riesgo inmediato, contacta también a las autoridades locales. Consulta la{" "}
            <Link
              to="/legal/$doc"
              params={{ doc: "contenido" }}
              className="text-pearl underline-offset-4 hover:underline"
            >
              Política de contenido
            </Link>
            .
          </p>
        </div>
      </div>
    </Modal>
  );
}
