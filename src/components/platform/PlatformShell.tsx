import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  BookMarked,
  Compass,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { formatNumber } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Avatar, Badge, Button, DemoBadge } from "@/components/lux/ui";
import { Logo, BrandWatermark } from "@/components/site/brand";

type NavItem = { to: string; label: string; icon: ReactNode; badge?: number };

export function PlatformShell({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { state, user, logout } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const unread = user
    ? state.notifications.filter((n) => n.userId === user.id && !n.read).length
    : 0;
  const msgUnread = user
    ? state.threads
        .filter((t) =>
          user.role === "creator"
            ? t.unread > 0 &&
              state.creators.find((c) => c.slug === user.creatorSlug)?.id === t.creatorId
            : t.fanId === user.id && t.unread > 0,
        )
        .reduce((sum, t) => sum + t.unread, 0)
    : 0;

  const nav: NavItem[] = [
    { to: "/explorar", label: "Explorar", icon: <Compass className="h-4 w-4" /> },
    {
      to: "/estudio",
      label: user?.role === "creator" ? "Mi estudio" : "Estudio",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      to: "/mensajes",
      label: "Mensajes",
      icon: <MessageSquare className="h-4 w-4" />,
      badge: msgUnread,
    },
    { to: "/boveda", label: "Bóveda", icon: <BookMarked className="h-4 w-4" /> },
    { to: "/cuenta", label: "Mi cuenta", icon: <User className="h-4 w-4" /> },
  ];
  if (user?.role === "admin")
    nav.push({ to: "/admin", label: "Administración", icon: <Shield className="h-4 w-4" /> });
  nav.push({ to: "/legal/demo", label: "Estado DEMO", icon: <Sparkles className="h-4 w-4" /> });

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden">
      <BrandWatermark sizes="260px" className="-bottom-20 -left-12 w-60 opacity-[0.06]" />
      <div className="relative flex items-center justify-between px-5 py-5">
        <Logo />
        <button
          type="button"
          className="lg:hidden text-muted-foreground"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3">
        <div className="rounded-xl border border-hairline bg-white/[0.03] p-3">
          <div className="flex items-center gap-2.5">
            <Avatar
              name={user?.name ?? "Invitada"}
              tint={user?.avatarTint ?? "#ed315c"}
              size={34}
              ring={false}
            />
            <div className="min-w-0">
              <p className="truncate text-xs text-pearl">{user?.name ?? "Invitada"}</p>
              <p className="truncate text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                {user?.role === "creator"
                  ? "Creadora"
                  : user?.role === "admin"
                    ? "Administración"
                    : "Miembro"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8rem] transition-colors",
                active
                  ? "bg-signal/15 text-pearl"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-pearl",
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="rounded-full bg-signal px-1.5 py-0.5 text-[0.58rem] text-primary-foreground">
                  {formatNumber(item.badge)}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-hairline p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-pearl"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al sitio
        </Link>
        {user ? (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-pearl"
          >
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
          </button>
        ) : (
          <Link
            to="/entrar"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-pearl"
          >
            <User className="h-3.5 w-3.5" /> Iniciar sesión
          </Link>
        )}
        <div className="flex items-center justify-between px-2 pb-1">
          <DemoBadge>DEMO</DemoBadge>
          <span className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            v {state.settings.termsVersion}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_40%_at_80%_0%,rgba(237,49,92,0.08),transparent_70%)]" />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-hairline bg-background/70 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside className="relative z-10 h-full w-72 border-r border-hairline bg-background">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-hairline bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-pearl lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              {eyebrow ? (
                <p className="text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="truncate font-serif text-xl text-pearl sm:text-2xl">{title}</h1>
              {subtitle ? (
                <p className="hidden truncate text-[0.7rem] text-muted-foreground sm:block">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Link
                to="/cuenta"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground hover:text-pearl"
                aria-label="Notificaciones"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-signal" />
                ) : null}
              </Link>
              <Link
                to="/"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground hover:text-pearl sm:inline-flex"
                aria-label="Inicio"
              >
                <Home className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main
          data-tour="platform-main"
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function StudioTabs({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string; icon?: ReactNode; badge?: number }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs transition-colors",
            value === item.id
              ? "border-signal/40 bg-signal/15 text-pearl"
              : "border-hairline bg-white/[0.02] text-muted-foreground hover:text-pearl",
          )}
        >
          {item.icon}
          {item.label}
          {item.badge && item.badge > 0 ? (
            <span className="rounded-full bg-signal/25 px-1.5 text-[0.58rem]">{item.badge}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function SettingsRow({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-hairline py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5 text-silver">{icon}</span> : null}
        <div>
          <p className="text-sm text-pearl">{title}</p>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-2 border-b border-hairline pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-pearl">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export { Settings as SettingsIcon, User as UserIcon };
