import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/use-session";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso de miembros — Xclusive" },
      { name: "description", content: "Inicia sesión o solicita tu acceso al club privado Xclusive." },
      { property: "og:title", content: "Acceso de miembros — Xclusive" },
      { property: "og:description", content: "Entra a tu cuenta de Xclusive." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { if (session) navigate({ to: "/cuenta" }); }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("Correo o contraseña incorrectos.");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/cuenta", data: { display_name: name } },
      });
      if (error) toast.error(error.message); else setSent(true);
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("No se pudo continuar con Google.");
  }

  const input = "w-full rounded-xl hairline bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-primary";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      <div className="absolute inset-0 bg-cherry-haze" />
      <div className="relative w-full max-w-md rounded-3xl hairline bg-card/70 p-10 backdrop-blur-xl animate-rise">
        <p className="eyebrow text-center">{mode === "in" ? "Bienvenida de vuelta" : "Solicitud de acceso"}</p>
        <h1 className="mt-3 text-center text-5xl">{mode === "in" ? "Entrar" : <em className="text-silver-gradient">Únete</em>}</h1>
        {sent ? (
          <p className="mt-8 text-center font-light text-muted-foreground">Te enviamos un enlace a <span className="text-foreground">{email}</span>. Confírmalo para entrar al club.</p>
        ) : (
          <>
            <button type="button" onClick={google} className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-xl hairline bg-card px-4 py-3 text-sm transition-colors hover:bg-muted">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
              Continuar con Google
            </button>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o con tu correo<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-3">
              {mode === "up" && <input className={input} placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />}
              <input className={input} type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className={input} type="password" placeholder="Contraseña" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button disabled={busy} className="w-full rounded-full bg-lacquer py-3 text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60">
                {busy ? "Un momento…" : mode === "in" ? "Entrar" : "Crear cuenta"}
              </button>
            </form>
            <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground">
              {mode === "in" ? "¿Aún no eres miembro? Solicita acceso" : "¿Ya eres miembro? Entra"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
