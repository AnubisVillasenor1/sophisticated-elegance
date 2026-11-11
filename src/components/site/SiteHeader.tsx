import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, Menu, Search, Shield, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { formatNumber } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Avatar, Badge, btn } from "@/components/lux/ui";
import { Logo } from "./brand";

const NAV = [
  { to: "/explorar", label: "Explorar" },
  { to: "/clips", label: "Clips" },
  { to: "/salones", label: "Salones" },
  { to: "/ecosistema", label: "Ecosistema" },
  { to: "/creadoras", label: "Creadoras" },
] as const;

export function SiteHeader() {
  const { state, user, setCurrency } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const unread = user
    ? state.notifications.filter((n) => n.userId === user.id && !n.read).length
    : 0;
  const home = pathname === "/";
  const dashboard =
    user?.role === "creator" ? "/estudio" : user?.role === "admin" ? "/admin" : "/cuenta";
  const nav = NAV.filter((item) => item.to !== "/salones" || state.settings.liveEnabled);

  return (
    <header
      className={cn(
        "sticky top-0 z-[900] transition-all duration-500",
        scrolled || !home
          ? "border-b border-hairline bg-background/85 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      {state.settings.maintenance ? (
        <div className="border-b border-warning/30 bg-warning/15 px-4 py-1.5 text-center text-[0.58rem] uppercase tracking-[0.2em] text-warning">
          Mantenimiento programado · algunas funciones pueden estar limitadas
        </div>
      ) : null}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-18 lg:px-10">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[0.78rem] tracking-wide transition-colors",
                  active
                    ? "bg-white/[0.06] text-pearl"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-pearl",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/explorar"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors hover:text-pearl sm:inline-flex"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </Link>

          <label className="hidden items-center gap-1 rounded-full border border-hairline bg-black/20 px-2.5 py-1.5 text-[0.65rem] text-silver md:flex">
            <span className="uppercase tracking-[0.16em] text-muted-foreground">Moneda</span>
            <select
              value={state.currency}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "MXN" || value === "USD" || value === "EUR") setCurrency(value);
              }}
              className="appearance-none bg-transparent pr-1 text-pearl outline-none"
              aria-label="Moneda"
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </label>

          {user ? (
            <>
              <Link
                to="/cuenta"
                className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors hover:text-pearl sm:inline-flex"
                aria-label="Notificaciones"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 text-[0.55rem] font-semibold text-primary-foreground">
                    {formatNumber(unread)}
                  </span>
                ) : null}
              </Link>
              <Link
                to={dashboard}
                className="hidden items-center gap-2 rounded-full border border-hairline bg-white/[0.03] py-1 pl-1 pr-3 transition-colors hover:border-silver/30 sm:flex"
              >
                <Avatar name={user.name} tint={user.avatarTint} size={28} ring={false} />
                <span className="max-w-24 truncate text-xs text-pearl">
                  {user.name.split(" ")[0]}
                </span>
                {user.role === "creator" ? (
                  <Badge tone="signal">Studio</Badge>
                ) : user.role === "admin" ? (
                  <Badge tone="info">Admin</Badge>
                ) : null}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/entrar"
                className="hidden text-xs text-muted-foreground transition-colors hover:text-pearl sm:block"
              >
                Entrar
              </Link>
              <Link to="/registro" className={cn(btn("primary", "sm"), "hidden sm:inline-flex")}>
                Solicitar acceso
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-pearl lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-hairline bg-background/95 px-4 pb-6 pt-3 backdrop-blur-xl lg:hidden">
          <div className="grid gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-3 text-sm",
                  pathname === item.to ? "bg-white/[0.06] text-pearl" : "text-muted-foreground",
                )}
              >
                {item.label}
                <span className="text-silver/50">→</span>
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={dashboard}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm text-pearl"
                >
                  {user.role === "creator"
                    ? "Mi estudio"
                    : user.role === "admin"
                      ? "Administración"
                      : "Mi cuenta"}
                  <span className="text-silver/50">→</span>
                </Link>
                <Link
                  to="/mensajes"
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm text-muted-foreground"
                >
                  Mensajes
                  <span className="text-silver/50">→</span>
                </Link>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/entrar" className={btn("secondary", "md")}>
                  Entrar
                </Link>
                <Link to="/registro" className={btn("primary", "md")}>
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
            <Badge tone="success">
              <Shield className="h-3 w-3" /> 18+
            </Badge>
            <Badge tone="signal">
              <Sparkles className="h-3 w-3" /> Modo DEMO
            </Badge>
          </div>
        </div>
      ) : null}
    </header>
  );
}
