import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, Button, Field, Input } from "@/components/lux/ui";
import { BrandLockup } from "@/components/site/brand";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DEMO_ACCOUNTS, demoMode } from "@/lib/auth/demo-accounts";
import { useSession } from "@/lib/auth/SessionProvider";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Xclusive" },
      {
        name: "description",
        content: "Acceso seguro a Xclusive: sesión verificada y roles resueltos en el servidor.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const { mode, signIn, verifyMfa, mfaPending } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState(demoMode ? "fan@xclusive.demo" : "");
  const [password, setPassword] = useState(demoMode ? "demo1234" : "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (mode === "demo") {
      const result = login(email, password);
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      const target =
        result.role === "creator" ? "/estudio" : result.role === "admin" ? "/admin" : "/cuenta";
      navigate({ to: target });
      return;
    }

    setPending(true);
    try {
      const result = mfaPending ? await verifyMfa(code) : await signIn(email, password);
      if (!result.ok) {
        setError(result.message);
        if (!result.needsMfa) toast.error(result.message);
        return;
      }
      toast.success(result.message);
      const target =
        result.role === "creator" ? "/estudio" : result.role === "admin" ? "/admin" : "/cuenta";
      navigate({ to: target });
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <section className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-6">
          <BrandLockup priority sizes="180px" className="mb-9 w-36 sm:w-40" />
          <p className="eyebrow">Acceso al club</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.96] text-pearl sm:text-6xl">
            La llave ya está
            <br />
            <em className="text-silver-sheen">en tu bolsillo.</em>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            {mode === "demo"
              ? "Entra al prototipo completo con una cuenta de demostración. Todas las operaciones son simuladas: sin tarjeta, sin cargos y sin saldos retirables."
              : "Tu identidad y tus permisos se verifican en el servidor. La sesión se puede revocar en cualquier momento y no vive en este navegador."}
          </p>

          {demoMode && mode === "demo" ? (
            <div className="mt-8 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError("");
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] p-3 text-left transition-colors hover:border-signal/30 hover:bg-white/[0.04]"
                >
                  <span>
                    <span className="block text-xs text-pearl">
                      {account.role} · {account.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[0.63rem] text-muted-foreground">
                      {account.email}
                    </span>
                  </span>
                  <Badge tone="outline">{account.password}</Badge>
                </button>
              ))}
            </div>
          ) : (
            <ul className="mt-8 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" /> Sesión emitida y
                validada por el servidor.
              </li>
              <li className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 shrink-0 text-silver" /> Los roles no se pueden
                editar desde el navegador.
              </li>
            </ul>
          )}
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <form onSubmit={submit} className="panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl text-pearl">Iniciar sesión</h2>
              <span className="rounded-full border border-hairline p-2 text-silver">
                <KeyRound className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {mode === "demo"
                ? "Usa una cuenta DEMO o la que creaste en este navegador."
                : "Introduce el correo y la contraseña de tu cuenta."}
            </p>

            <div className="mt-6 space-y-4">
              {mfaPending ? (
                <Field label="Código de verificación" required>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <span className="mt-1.5 block text-[0.62rem] leading-relaxed text-muted-foreground">
                    Abre tu aplicación de autenticación e introduce el código de 6 dígitos.
                  </span>
                </Field>
              ) : (
                <>
                  <Field label="Correo" required>
                    <Input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                    />
                  </Field>
                  <Field label="Contraseña" required>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </Field>
                </>
              )}
              {error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-200"
                >
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Verificando…" : mfaPending ? "Verificar código" : "Entrar"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                {mode === "demo" ? "Sesión local DEMO" : "Sesión verificada"}
              </span>
              <span className="flex flex-wrap items-center gap-3">
                {mode === "live" ? (
                  <Link to="/recuperar" className="text-pearl underline-offset-4 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                ) : null}
                <Link to="/registro" className="text-pearl underline-offset-4 hover:underline">
                  Crear cuenta
                </Link>
              </span>
            </div>
            <p className="mt-4 text-[0.62rem] leading-relaxed text-muted-foreground/80">
              Al entrar aceptas los{" "}
              <Link
                to="/legal/$doc"
                params={{ doc: "terminos" }}
                className="text-pearl underline-offset-4 hover:underline"
              >
                Términos
              </Link>{" "}
              y el{" "}
              <Link
                to="/legal/$doc"
                params={{ doc: "privacidad" }}
                className="text-pearl underline-offset-4 hover:underline"
              >
                Aviso de Privacidad
              </Link>
              .
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
