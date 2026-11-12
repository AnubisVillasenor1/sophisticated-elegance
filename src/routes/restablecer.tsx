import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button, Field, Input, btn } from "@/components/lux/ui";
import { BrandLockup } from "@/components/site/brand";
import { SiteLayout } from "@/components/site/SiteLayout";
import { demoMode } from "@/lib/auth/demo-accounts";
import { useSession } from "@/lib/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/restablecer")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — Xclusive" },
      {
        name: "description",
        content: "Define una nueva contraseña para tu cuenta Xclusive desde un enlace seguro.",
      },
    ],
  }),
  component: ResetPage,
});

type LinkState = "checking" | "ready" | "invalid";

function ResetPage() {
  const { mode, changePassword } = useSession();
  const navigate = useNavigate();
  const [link, setLink] = useState<LinkState>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (demoMode || mode === "demo") {
      setLink("invalid");
      return;
    }

    let active = true;
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setLink("ready");
      }
    });

    // `detectSessionInUrl` procesa el token del enlace al crear el cliente.
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setLink(data.session ? "ready" : "invalid");
      })
      .catch(() => {
        if (active) setLink("invalid");
      });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [mode]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPending(true);
    try {
      const result = await changePassword(password);
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      navigate({ to: "/cuenta" });
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-6">
          <BrandLockup priority sizes="180px" className="mb-9 w-36 sm:w-40" />
          <p className="eyebrow">Nueva contraseña</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.96] text-pearl sm:text-6xl">
            Cierra la puerta
            <br />
            <em className="text-silver-sheen">a tu manera.</em>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Elige una contraseña de al menos 8 caracteres. Al guardarla, las demás sesiones pueden
            revocarse desde Mi cuenta.
          </p>
          <Link to="/entrar" className={cn(btn("ghost", "sm"), "mt-8")}>
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al acceso
          </Link>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <form onSubmit={submit} className="panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl text-pearl">Definir contraseña</h2>
              <span className="rounded-full border border-hairline p-2 text-silver">
                <KeyRound className="h-4 w-4" />
              </span>
            </div>

            {link === "checking" ? (
              <p className="mt-5 text-xs text-muted-foreground">Validando el enlace…</p>
            ) : link === "invalid" ? (
              <div className="mt-5 space-y-4">
                <p className="rounded-lg border border-warning/25 bg-warning/5 p-3 text-xs leading-relaxed text-muted-foreground">
                  El enlace no es válido, ya se usó o caducó. Solicita uno nuevo desde la página de
                  recuperación.
                </p>
                <Link to="/recuperar" className={cn(btn("primary", "md"), "w-full")}>
                  Solicitar otro enlace
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <Field label="Nueva contraseña" required>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </Field>
                <Field label="Repite la contraseña" required>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Misma contraseña"
                    required
                  />
                </Field>
                {error ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-200"
                  >
                    {error}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Guardando…" : "Guardar contraseña"}
                </Button>
              </div>
            )}

            <p className="mt-5 inline-flex items-center gap-1.5 text-[0.62rem] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> La contraseña viaja cifrada a
              Supabase Auth y no se guarda en este dispositivo.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
