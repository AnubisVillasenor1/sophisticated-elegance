import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";

import portrait from "@/assets/editorial_portrait.jpg";
import salon from "@/assets/private_salon.jpg";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CoverKey } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Botones                                                             */
/* ------------------------------------------------------------------ */

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "btn-lux text-primary-foreground disabled:opacity-50",
  secondary:
    "border border-hairline bg-card/70 text-pearl hover:border-silver/30 hover:bg-card active:translate-y-px disabled:opacity-50",
  ghost: "text-muted-foreground hover:bg-white/5 hover:text-pearl disabled:opacity-50",
  outline:
    "border border-signal/50 bg-signal/5 text-pearl hover:bg-signal/15 hover:border-signal/70 disabled:opacity-50",
  danger:
    "border border-red-500/30 bg-red-500/5 text-red-200 hover:bg-red-500/10 disabled:opacity-50",
  subtle: "bg-white/[0.055] text-pearl hover:bg-white/10 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "h-9 w-9",
};

export function btn(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    extra,
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button type={type} className={btn(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Superficies y etiquetas                                             */
/* ------------------------------------------------------------------ */

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel", className)}>{children}</div>;
}

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "signal" | "success" | "warning" | "info" | "outline" | "dark";
  className?: string;
}) {
  const tones = {
    default: "border-hairline bg-white/[0.04] text-silver",
    signal: "border-signal/40 bg-signal/12 text-pearl",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    info: "border-info/30 bg-info/10 text-info",
    outline: "border-hairline text-muted-foreground",
    dark: "border-white/10 bg-black/40 text-silver backdrop-blur",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge({ children = "Demo · sin cargo real" }: { children?: ReactNode }) {
  return (
    <Badge tone="signal">
      <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" />
      {children}
    </Badge>
  );
}

export function VerifiedBadge({ label = "Verificada" }: { label?: string }) {
  return (
    <Badge tone="info">
      <Check className="h-3 w-3" /> {label}
    </Badge>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p
            className={cn(
              "eyebrow flex items-center gap-3",
              align === "center" && "justify-center",
            )}
          >
            <span aria-hidden className="h-px w-8 bg-gradient-to-r from-signal/80 to-transparent" />
            {eyebrow}
            {align === "center" ? (
              <span
                aria-hidden
                className="h-px w-8 rotate-180 bg-gradient-to-r from-signal/80 to-transparent"
              />
            ) : null}
          </p>
        ) : null}
        <h2 className="mt-4 text-balance font-serif text-3xl leading-[1.04] tracking-[-0.01em] text-pearl sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Avatar({
  name,
  tint = "#ed315c",
  size = 40,
  className,
  ring = true,
}: {
  name: string;
  tint?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-serif text-pearl",
        ring && "ring-1 ring-white/15 ring-offset-2 ring-offset-background",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, size * 0.36),
        background: `linear-gradient(145deg, ${tint} 0%, #2a0d18 58%, #10070b 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.22)`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  tone = "signal",
}: {
  value: number;
  label?: string;
  tone?: "signal" | "success" | "warning";
}) {
  const colors = {
    signal: "from-candy via-signal to-pearl/80",
    success: "from-success/70 to-success",
    warning: "from-warning/70 to-warning",
  } as const;
  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      ) : null}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700",
            colors[tone],
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "signal";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        tone === "signal"
          ? "border-signal/30 bg-signal/[0.06]"
          : "border-hairline bg-white/[0.025]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.64rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        {icon ? <span className="text-silver/70">{icon}</span> : null}
      </div>
      <p className="mt-3 font-serif text-2xl text-pearl sm:text-3xl">{value}</p>
      {hint ? (
        <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-hairline", className)} />;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline px-6 py-14 text-center">
      {icon ? <div className="mb-4 text-silver/60">{icon}</div> : null}
      <p className="font-serif text-2xl text-pearl">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-hairline bg-white/[0.02] p-4">
      <span>
        <span className="block text-sm font-medium text-pearl">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-signal/60 bg-signal/80" : "border-hairline bg-white/10",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 rounded-full bg-pearl transition-transform duration-300",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Formularios                                                         */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
        {required ? <span className="text-signal">*</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[0.68rem] leading-relaxed text-muted-foreground/80">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("field", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("field min-h-28 resize-y", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("field select-field", props.className)} />;
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: T; label: string; icon?: ReactNode; badge?: ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-hairline bg-black/20 p-1",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-300",
            value === item.id
              ? "bg-signal text-primary-foreground shadow-ember"
              : "text-muted-foreground hover:bg-white/5 hover:text-pearl",
          )}
        >
          {item.icon}
          {item.label}
          {item.badge ? (
            <span className="rounded-full bg-black/25 px-1.5 py-0.5 text-[0.58rem]">
              {item.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cover y media                                                       */
/* ------------------------------------------------------------------ */

export function Cover({
  kind,
  src,
  alt = "",
  className,
  children,
}: {
  kind: CoverKey;
  /** Retrato propio de la creadora. Tiene prioridad sobre la portada temática. */
  src?: string | undefined;
  alt?: string;
  className?: string;
  children?: ReactNode;
}) {
  const photo = src ?? (kind === "portrait" ? portrait : kind === "salon" ? salon : null);
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card",
        !photo && "cover-base",
        !photo && `cover-${kind}`,
        className,
      )}
    >
      {photo ? (
        <img
          src={photo}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : null}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" } as const;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-hairline bg-background shadow-deep scroll-lux sm:rounded-2xl",
          widths[size],
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline bg-background/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <h3 className="font-serif text-2xl text-pearl">{title}</h3>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-hairline p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-pearl"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 border-t border-hairline bg-background/95 px-5 py-4 backdrop-blur sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

export function CopyButton({
  value,
  label = "Copiar",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copiado al portapapeles.");
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("No se pudo copiar. Selecciona el texto manualmente.");
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado" : label}
    </Button>
  );
}

export function DataRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-right text-xs text-pearl", mono && "font-mono text-[0.68rem]")}>
        {value}
      </span>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-signal",
        className,
      )}
      aria-hidden
    />
  );
}

export function AuthGate({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <span className="font-serif text-5xl text-silver-sheen">X</span>
      <h1 className="mt-6 font-serif text-4xl text-pearl">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-8">{action}</div>
    </div>
  );
}
