import { Link } from "@tanstack/react-router";
import logo from "@/assets/xclusive-logo.png.asset.json";

const nav = [
  { to: "/membresias", label: "Membresías" },
  { to: "/salones", label: "Salones en vivo" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo.url} alt="" className="h-9 w-9 rounded-full object-cover object-[50%_35%]" />
          <span className="font-serif text-2xl text-silver-gradient">Xclusive</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm text-muted-foreground">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="hidden transition-colors hover:text-foreground sm:block" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/membresias" className="rounded-full bg-lacquer px-5 py-2 text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]">
            Solicitar acceso
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground sm:flex-row">
        <span className="font-serif text-lg italic text-silver-gradient">“Un paraíso prohibido”</span>
        <span className="eyebrow">Xclusive by TAMV Online Network · Modo demo, sin cargos reales</span>
      </div>
    </footer>
  );
}
