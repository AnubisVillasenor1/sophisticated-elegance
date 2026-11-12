import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button, Field, Input, btn } from "@/components/lux/ui";
import { BrandLockup } from "@/components/site/brand";
import { SiteLayout } from "@/components/site/SiteLayout";
import { demoMode } from "@/lib/auth/demo-accounts";
import { useSession } from "@/lib/auth/SessionProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar acceso — Xclusive" },
      {
        name: "description",
        content: "Restablece la contraseña de tu cuenta Xclusive con un enlace de un solo uso.",
      },
    ],
  }),
  component: RecoverPage,
});

function RecoverPage() {
  const { mode, requestPasswordReset } = useSession();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message);
        return;
      }
      setMessage(result.message);
      toast.success(result.message);
    } finally {
      setPending(false);
    }
  };

  const unavailable = demoMode || mode === "demo";

  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-6">
          <BrandLockup priority sizes="180px" className="mb-9 w-36 sm:w-40" />
          <p className="eyebrow">Recuperar acceso</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.96] text-pearl sm:text-6xl">
            Una llave nueva,
            <br />
            <em className="text-silver-sheen">sin perder el archivo.</em>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Enviaremos un enlace de un solo uso al correo de tu cuenta. El enlace caduca y no revela
            si el correo está registrado.
          </p>
          <Link to="/entrar" className={cn(btn("ghost", "sm"), "mt-8")}>
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al acceso
          </Link>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <form onSubmit={submit} className="panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl text-pearl">Restablecer</h2>
              <span className="rounded-full border border-hairline p-2 text-silver">
                <Mail className="h-4 w-4" />
              </span>
            </div>

            {unavailable ? (
              <p className="mt-5 rounded-lg border border-warning/25 bg-warning/5 p-3 text-xs leading-relaxed text-muted-foreground">
                Esta compilación usa cuentas de demostración y no envía correos. En un entorno LIVE,
                el enlace se envía con Supabase Auth.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                <Field label="Correo de tu cuenta" required>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tu@correo.com"
                    required
                  />
                </Field>
                {message ? (
                  <p className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs leading-relaxed text-success">
                    {message}
                  </p>
                ) : null}
                {error ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-200"
                  >
                    {error}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Enviando…" : "Enviar enlace"}
                </Button>
              </div>
            )}

            <p className="mt-5 inline-flex items-center gap-1.5 text-[0.62rem] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> El enlace se procesa en Supabase
              Auth; esta aplicación no ve tu contraseña anterior.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
