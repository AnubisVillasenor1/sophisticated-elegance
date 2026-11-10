import { Link } from "@tanstack/react-router";
import { Check, DoorClosed, ShieldCheck, Sparkles } from "lucide-react";

import salon from "@/assets/private_salon.jpg";
import { useApp } from "@/lib/store";
import { Button, DemoBadge } from "@/components/lux/ui";
import { Logo } from "./brand";

export function AgeGate() {
  const { state, hydrated, setAgeVerified } = useApp();
  if (!hydrated || state.ageVerified) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-background px-4 py-10">
      <img
        src={salon}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
      <div className="absolute inset-0 grain opacity-60" />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-hairline bg-background/85 p-6 shadow-deep backdrop-blur-xl sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <DemoBadge>Acceso DEMO</DemoBadge>
        </div>

        <p className="eyebrow mt-8">Puerta de acceso</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.02] text-pearl sm:text-5xl">
          Un club privado.
          <br />
          <em className="text-silver-sheen">Una puerta clara.</em>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Xclusive es un prototipo editorial para personas adultas. Antes de entrar, confirma que
          tienes al menos 18 años y que entiendes que todas las transacciones son simulaciones sin
          cargo real.
        </p>

        <ul className="mt-6 space-y-3">
          {[
            "Contenido editorial y sugerente; no se aloja material explícito.",
            "Modo DEMO: suscripciones, propinas y compras no generan cobros.",
            "Puedes salir y borrar tus datos locales en cualquier momento.",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-xs leading-relaxed text-silver">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" /> {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => setAgeVerified(true)}>
            <ShieldCheck className="h-4 w-4" /> Sí, soy mayor de 18
          </Button>
          <a
            href="https://www.google.com"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-hairline px-5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-pearl"
          >
            <DoorClosed className="h-4 w-4" /> No, salir
          </a>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          <span>18+ · Solo adultos</span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Verificación declarativa DEMO
          </span>
          <Link
            to="/legal/$doc"
            params={{ doc: "terminos" }}
            className="underline-offset-4 hover:text-pearl hover:underline"
          >
            Términos
          </Link>
        </div>
        <p className="mt-4 text-[0.62rem] leading-relaxed text-muted-foreground/70">
          En producción, la edad debe verificarse con un proveedor especializado que no se limite a
          la autodeclaración. Este prototipo no constituye evidencia de verificación.
        </p>
      </div>
    </div>
  );
}
