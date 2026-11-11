import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, Button, Field, Input } from "@/components/lux/ui";
import { BrandLockup } from "@/components/site/brand";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DEMO_ACCOUNTS, useApp } from "@/lib/store";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Xclusive" },
      {
        name: "description",
        content: "Inicia sesión en el prototipo Xclusive con una cuenta de demostración.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("fan@xclusive.demo");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.message);
      toast.error(result.message);
      return;
    }
    setError("");
    toast.success(result.message);
    const target =
      result.role === "creator" ? "/estudio" : result.role === "admin" ? "/admin" : "/cuenta";
    navigate({ to: target });
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
            Entra al prototipo completo con una cuenta de demostración. Todas las operaciones son
            simuladas: sin tarjeta, sin cargos y sin saldos retirables.
          </p>

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
              Usa una cuenta DEMO o la que creaste en este navegador.
            </p>

            <div className="mt-6 space-y-4">
              <Field label="Correo" required>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </Field>
              <Field label="Contraseña" required>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </Field>
              {error ? (
                <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-200">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full">
                Entrar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 flex items-center justify-between text-[0.7rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Sesión local
              </span>
              <Link to="/registro" className="text-pearl underline-offset-4 hover:underline">
                Crear cuenta
              </Link>
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
