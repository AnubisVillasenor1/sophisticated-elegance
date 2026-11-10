import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, Button, Field, Input, Select, Textarea } from "@/components/lux/ui";
import { LegalConsent, type LegalConsentValue } from "@/components/site/LegalConsent";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Xclusive" },
      {
        name: "description",
        content:
          "Registro con aceptación legal registrada, documento por documento, en el prototipo Xclusive.",
      },
    ],
  }),
  component: RegisterPage,
});

const CATEGORIES = [
  "Fotografía",
  "Cosplay",
  "Fitness",
  "Música",
  "Arte",
  "Lifestyle",
  "Editorial",
  "ASMR",
  "Drag",
  "IA",
];

function RegisterPage() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<"fan" | "creator">("fan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [socials, setSocials] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState<string[]>(["Fotografía"]);
  const [legal, setLegal] = useState<LegalConsentValue>({ docIds: [], age: false, lawful: false });
  const [error, setError] = useState("");

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legal.age || !legal.lawful) {
      setError("Debes confirmar mayoría de edad y uso lícito.");
      return;
    }
    const result = signup({
      name,
      email,
      password,
      role,
      city,
      categories,
      socials,
      bio,
      acceptedDocIds: legal.docIds,
    });
    if (!result.ok) {
      setError(result.message);
      toast.error(result.message);
      return;
    }
    setError("");
    toast.success(result.message);
    navigate({ to: role === "creator" ? "/estudio" : "/explorar" });
  };

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-10 lg:py-20">
        <div className="lg:col-span-5">
          <p className="eyebrow">Solicitud de acceso</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.96] text-pearl sm:text-6xl">
            Una cuenta.
            <br />
            <em className="text-silver-sheen">Todas las llaves.</em>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Elige si entras como miembro o como creadora. Si solicitas un perfil de creadora, tu
            cuenta queda activa y tu postulación entra a revisión del equipo de curaduría.
          </p>

          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {[
              ["Miembro", "Membresías, compras, bóveda y mensajes."],
              ["Creadora", "Estudio, contenido, ingresos y retiros DEMO."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-hairline bg-white/[0.02] p-4">
                <p className="text-sm text-pearl">{title}</p>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-xl border border-warning/25 bg-warning/5 p-4">
            <p className="text-xs font-medium text-warning">Verificación declarativa</p>
            <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
              Este prototipo no verifica identidad con proveedor certificado. En producción, la edad
              y la identidad deberán acreditarse antes de publicar o cobrar. El contenido adulto
              permanece deshabilitado.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-hairline pt-6 text-center">
            {[
              ["01", "Cuenta"],
              ["02", "Documentos"],
              ["03", "Entrada"],
            ].map(([step, label]) => (
              <div key={step}>
                <p className="font-serif text-2xl text-pearl">{step}</p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <form onSubmit={submit} className="panel p-5 sm:p-7">
            <div className="flex rounded-full border border-hairline bg-black/20 p-1">
              {(
                [
                  ["fan", "Soy miembro"],
                  ["creator", "Soy creadora"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 text-xs transition-colors",
                    role === value
                      ? "bg-signal text-primary-foreground"
                      : "text-muted-foreground hover:text-pearl",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre o alias" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cómo te llamas"
                  required
                />
              </Field>
              <Field label="Correo" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </Field>
              <Field
                label="Contraseña"
                required
                hint="Mínimo 8 caracteres. Se almacena como hash de demostración."
              >
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field label="Ciudad">
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ciudad de México"
                />
              </Field>
            </div>

            {role === "creator" ? (
              <div className="mt-4 space-y-4 rounded-xl border border-hairline bg-white/[0.02] p-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Categorías
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[0.65rem] transition-colors",
                          categories.includes(category)
                            ? "border-signal bg-signal/15 text-pearl"
                            : "border-hairline text-muted-foreground hover:text-pearl",
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Redes o portafolio">
                  <Input
                    value={socials}
                    onChange={(e) => setSocials(e.target.value)}
                    placeholder="@tu.usuario · sitio.com"
                  />
                </Field>
                <Field label="Breve presentación">
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos qué haces y qué comunidad quieres construir."
                  />
                </Field>
                <div className="flex items-start gap-2 rounded-lg border border-signal/20 bg-signal/5 p-3 text-[0.68rem] leading-relaxed text-silver">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
                  Al enviar tu solicitud aceptas también el Contrato de Servicios para Creadoras y
                  la Política de Comisiones.
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              <LegalConsent role={role} value={legal} onChange={setLegal} />
            </div>

            {error ? (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-200">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="mt-5 w-full" size="lg">
              <Check className="h-4 w-4" />{" "}
              {role === "creator" ? "Crear cuenta y postular perfil" : "Crear cuenta"}
            </Button>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-muted-foreground">
              <span>Registro local con aceptación versionada y hash.</span>
              <Link
                to="/entrar"
                className="inline-flex items-center gap-1 text-pearl underline-offset-4 hover:underline"
              >
                Ya tengo cuenta <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground/80">
              Al registrarte aceptas los{" "}
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
                params={{ doc: "contenido" }}
                className="text-pearl underline-offset-4 hover:underline"
              >
                Política de Contenido
              </Link>
              .
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
