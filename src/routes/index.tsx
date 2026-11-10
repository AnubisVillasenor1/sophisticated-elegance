import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/xclusive-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Xclusive — Un paraíso prohibido" },
      { name: "description", content: "El club privado donde creadoras y miembros VIP se encuentran: membresías, bóveda y salones en vivo." },
      { property: "og:title", content: "Xclusive — Un paraíso prohibido" },
      { property: "og:description", content: "Club privado de creadoras by TAMV Online Network." },
    ],
  }),
  component: Index,
});

const pillars = [
  { n: "I", t: "Membresías", d: "Tres niveles por creadora. Del primer acceso al círculo más íntimo." },
  { n: "II", t: "La Bóveda", d: "Galerías y videos protegidos, visibles solo para quien tiene la llave." },
  { n: "III", t: "Salones en vivo", d: "Transmisiones privadas con luz de cine y una sala que se siente cercana." },
];

function Index() {
  return (
    <main>
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-cherry-haze" />
        <div className="absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow/20 blur-[120px] animate-glow" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="animate-rise">
            <p className="eyebrow">Club privado · by TAMV Online Network</p>
            <h1 className="mt-6 text-6xl leading-[0.95] md:text-8xl">
              <span className="text-silver-gradient">Un paraíso</span>
              <br />
              <em className="text-primary">prohibido.</em>
            </h1>
            <p className="mt-8 max-w-md text-lg font-light text-muted-foreground">
              Donde las creadoras más selectas abren sus puertas solo a quienes son invitados a entrar.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/membresias" className="rounded-full bg-lacquer px-8 py-3.5 text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]">
                Descubrir membresías
              </Link>
              <Link to="/salones" className="rounded-full hairline px-8 py-3.5 text-foreground transition-colors hover:bg-muted">
                Ver salones en vivo
              </Link>
            </div>
          </div>
          <div className="relative animate-rise [animation-delay:200ms]">
            <img src={logo.url} alt="Emblema Xclusive" className="mx-auto w-full max-w-md rounded-3xl object-cover [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_72%)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-32">
        <p className="eyebrow text-center">La experiencia</p>
        <h2 className="mt-4 text-center text-5xl md:text-6xl">Tres puertas. <em className="text-silver-gradient">Una sola llave.</em></h2>
        <div className="mt-20 grid gap-px overflow-hidden rounded-3xl hairline bg-border md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.n} className="bg-background p-10 transition-colors hover:bg-card">
              <span className="font-serif text-4xl italic text-primary">{p.n}</span>
              <h3 className="mt-8 text-3xl">{p.t}</h3>
              <p className="mt-4 font-light leading-relaxed text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border/60 py-32">
        <div className="absolute inset-0 bg-cherry-haze opacity-70" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="font-serif text-4xl italic leading-snug md:text-5xl">
            “La exclusividad no se anuncia. <span className="text-silver-gradient">Se reconoce.”</span>
          </p>
          <p className="eyebrow mt-8">Privacidad absoluta · Pagos simulados en modo demo</p>
        </div>
      </section>
    </main>
  );
}
