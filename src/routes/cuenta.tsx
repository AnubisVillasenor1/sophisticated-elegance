import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Check,
  Cookie,
  Database,
  Download,
  FileText,
  KeyRound,
  LogOut,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCog,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PlatformShell, SectionCard, StudioTabs } from "@/components/platform/PlatformShell";
import {
  Avatar,
  Badge,
  Button,
  DataRow,
  DemoBadge,
  EmptyState,
  Field,
  Modal,
  Select,
  StatCard,
  Switch,
  Textarea,
  btn,
} from "@/components/lux/ui";
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import {
  LEGAL_BY_ID,
  LEGAL_VERSION,
  REQUIRED_DOCS_CREATOR,
  REQUIRED_DOCS_FAN,
  legalTitle,
} from "@/lib/legal";
import { fanPurchases, fanSubscriptions, getCreator, userNotifications } from "@/lib/selectors";
import { DEMO_ACCOUNTS, hasAcceptedCurrent, useApp } from "@/lib/store";
import type { Currency, DataRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi cuenta — Xclusive" },
      {
        name: "description",
        content:
          "Perfil, membresías, compras, notificaciones, aceptaciones legales, derechos ARCO y preferencias de cookies.",
      },
    ],
  }),
  component: AccountPage,
});

type AccountTab =
  | "perfil"
  | "membresias"
  | "compras"
  | "notificaciones"
  | "legal"
  | "privacidad"
  | "cookies"
  | "datos";

function AccountPage() {
  const { state, user } = useApp();

  if (!user) {
    return (
      <PlatformShell
        title="Mi cuenta"
        eyebrow="Acceso"
        subtitle="Tu espacio personal dentro del club."
      >
        <EmptyState
          icon={<KeyRound className="h-6 w-6" />}
          title="Entra para ver tu cuenta."
          description="Desde aquí puedes gestionar membresías, compras, notificaciones, aceptaciones legales y derechos ARCO."
          action={
            <Link to="/entrar" className={btn("primary", "md")}>
              Iniciar sesión <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />
      </PlatformShell>
    );
  }

  return <AccountDashboard />;
}

function AccountDashboard() {
  const { state, user } = useApp();
  const [tab, setTab] = useState<AccountTab>("perfil");
  const notifications = useMemo(
    () => (user ? userNotifications(state, user.id) : []),
    [state, user],
  );
  if (!user) return null;

  const required = user.role === "creator" ? REQUIRED_DOCS_CREATOR : REQUIRED_DOCS_FAN;
  const complete = hasAcceptedCurrent(state, user, required);

  return (
    <PlatformShell
      title="Mi cuenta"
      eyebrow={
        user.role === "creator" ? "Creadora" : user.role === "admin" ? "Administración" : "Miembro"
      }
      subtitle={`${user.name} · ${user.email}`}
      actions={
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) ? (
            <Badge tone="signal">{notifications.filter((n) => !n.read).length} sin leer</Badge>
          ) : null}
          <DemoBadge>Cuenta DEMO</DemoBadge>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rol"
          value={user.role === "creator" ? "Creadora" : user.role === "admin" ? "Admin" : "Miembro"}
          hint={`Desde ${formatDate(user.joinedAt)}`}
          icon={<UserCog className="h-4 w-4" />}
        />
        <StatCard
          label="Membresías"
          value={formatNumber(
            state.subscriptions.filter((s) => s.fanId === user.id && s.status === "active").length,
          )}
          hint="Activas en este navegador."
          icon={<Sparkles className="h-4 w-4" />}
          tone="signal"
        />
        <StatCard
          label="Compras"
          value={formatNumber(state.purchases.filter((p) => p.fanId === user.id).length)}
          hint="Registros DEMO."
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          label="Documentos"
          value={complete ? "Al día" : "Pendientes"}
          hint={`Versión ${state.settings.termsVersion}`}
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <StudioTabs
          value={tab}
          onChange={(id) => setTab(id as AccountTab)}
          items={[
            { id: "perfil", label: "Perfil", icon: <UserCog className="h-3.5 w-3.5" /> },
            { id: "membresias", label: "Membresías", icon: <Sparkles className="h-3.5 w-3.5" /> },
            { id: "compras", label: "Compras", icon: <Receipt className="h-3.5 w-3.5" /> },
            {
              id: "notificaciones",
              label: "Notificaciones",
              icon: <Bell className="h-3.5 w-3.5" />,
              badge: notifications.filter((n) => !n.read).length,
            },
            { id: "legal", label: "Legal", icon: <FileText className="h-3.5 w-3.5" /> },
            { id: "privacidad", label: "ARCO", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
            { id: "cookies", label: "Cookies", icon: <Cookie className="h-3.5 w-3.5" /> },
            { id: "datos", label: "Datos", icon: <Database className="h-3.5 w-3.5" /> },
          ]}
        />
        <Badge tone={complete ? "success" : "warning"}>
          <ShieldCheck className="h-3 w-3" />{" "}
          {complete ? "Aceptación al día" : "Aceptación pendiente"}
        </Badge>
      </div>

      <div className="mt-5">
        {tab === "perfil" ? <PerfilTab /> : null}
        {tab === "membresias" ? <MembresiasTab /> : null}
        {tab === "compras" ? <ComprasTab /> : null}
        {tab === "notificaciones" ? <NotificacionesTab notifications={notifications} /> : null}
        {tab === "legal" ? <LegalTab /> : null}
        {tab === "privacidad" ? <ArcoTab /> : null}
        {tab === "cookies" ? <CookiesTab /> : null}
        {tab === "datos" ? <DatosTab /> : null}
      </div>
    </PlatformShell>
  );
}

function PerfilTab() {
  const { state, user, setCurrency, logout } = useApp();
  if (!user) return null;

  const dashboard =
    user.role === "creator" ? state.creators.find((c) => c.slug === user.creatorSlug) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Identidad"
        description="Datos de tu cuenta en este prototipo."
        className="lg:col-span-7"
      >
        <div className="flex items-center gap-4 rounded-xl border border-hairline bg-white/[0.02] p-4">
          <Avatar name={user.name} tint={user.avatarTint} size={58} />
          <div className="min-w-0">
            <p className="font-serif text-2xl text-pearl">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge tone="outline">
                {user.role === "creator"
                  ? "Creadora"
                  : user.role === "admin"
                    ? "Administración"
                    : "Miembro"}
              </Badge>
              <Badge tone="success">
                <ShieldCheck className="h-3 w-3" /> 18+ declarado
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <DataRow label="ID de cuenta" value={user.id} mono />
          <DataRow label="Código de referida" value={user.referralCode} mono />
          <DataRow label="Miembro desde" value={formatDate(user.joinedAt)} />
          <DataRow label="Moneda de exhibición" value={state.currency} />
          <DataRow label="Modo" value="DEMO · sin cargos reales" />
        </div>

        <div className="mt-4 rounded-xl border border-hairline bg-white/[0.02] p-4">
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Exportar, cerrar o reiniciar
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/legal/$doc"
              params={{ doc: "privacidad" }}
              className={btn("secondary", "sm")}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Aviso de privacidad
            </Link>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </SectionCard>

      <div className="space-y-5 lg:col-span-5">
        <SectionCard title="Preferencias" description="Se guardan en este navegador.">
          <div className="space-y-3">
            <Field label="Moneda">
              <Select
                value={state.currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <option value="MXN">MXN · Peso mexicano</option>
                <option value="USD">USD · Dólar estimado</option>
                <option value="EUR">EUR · Euro estimado</option>
              </Select>
            </Field>
            <p className="text-[0.62rem] leading-relaxed text-muted-foreground">
              Los importes se convierten solo para exhibición. La moneda de cobro y los impuestos
              definitivos deben definirse antes de habilitar pagos reales.
            </p>
          </div>
        </SectionCard>

        {dashboard ? (
          <SectionCard
            title="Tu perfil público"
            description="Como creadora, tu estudio concentra la edición."
          >
            <div className="space-y-2">
              <Link
                to="/creadora/$slug"
                params={{ slug: dashboard.slug }}
                className={cn(btn("secondary", "md"), "w-full")}
              >
                Ver perfil público
              </Link>
              <Link to="/estudio" className={cn(btn("primary", "md"), "w-full")}>
                Ir a mi estudio
              </Link>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Sé creadora"
            description="Si quieres publicar y monetizar tu trabajo."
          >
            <p className="text-xs leading-relaxed text-muted-foreground">
              La postulación revisa identidad, categorías y aceptación del contrato de creadoras. El
              contenido adulto permanece deshabilitado hasta completar verificación certificada y
              revisión legal.
            </p>
            <Link to="/registro" className={cn(btn("secondary", "sm"), "mt-3")}>
              Solicitar perfil
            </Link>
          </SectionCard>
        )}

        <SectionCard title="Cuentas de demostración" description="Para probar cada rol.">
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <div
                key={account.email}
                className="rounded-lg border border-hairline bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-pearl">{account.role}</p>
                  <Badge tone="outline">{account.password}</Badge>
                </div>
                <p className="mt-1 truncate font-mono text-[0.63rem] text-muted-foreground">
                  {account.email}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function MembresiasTab() {
  const { state, user, cancelSubscription } = useApp();
  if (!user) return null;

  if (user.role !== "fan") {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="Esta sección es de miembros."
        description={
          user.role === "creator"
            ? "Tus ingresos y membresías recibidas se gestionan desde el estudio."
            : "La administración revisa membresías agregadas desde el panel de administración."
        }
        action={
          <Link
            to={user.role === "creator" ? "/estudio" : "/admin"}
            className={btn("primary", "md")}
          >
            {user.role === "creator" ? "Ir al estudio" : "Ir a administración"}
          </Link>
        }
      />
    );
  }

  const subscriptions = fanSubscriptions(state, user.id);

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="Sin membresías."
        description="Cuando te suscribas a una creadora, el estado y la renovación aparecerán aquí."
        action={
          <Link to="/creadoras" className={btn("primary", "md")}>
            Ver creadoras
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {subscriptions.map((subscription) => {
        const creator = getCreator(state, subscription.creatorId);
        const tier = creator?.tiers.find((t) => t.id === subscription.tierId);
        return (
          <SectionCard
            key={subscription.id}
            title={creator?.name ?? "Creadora"}
            description={`${tier?.name ?? "Plan"} · ${subscription.trial ? "prueba" : "membresía"}`}
            action={
              <Badge tone={subscription.status === "active" ? "success" : "outline"}>
                {subscription.status === "active" ? "Activa" : "Cancelada"}
              </Badge>
            }
          >
            <div className="space-y-1">
              <DataRow label="Precio" value={formatMoney(subscription.priceMXN, state.currency)} />
              <DataRow label="Renueva" value={formatDate(subscription.renewsAt)} />
              <DataRow label="Renovación automática" value={subscription.autoRenew ? "Sí" : "No"} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {creator ? (
                <Link
                  to="/creadora/$slug"
                  params={{ slug: creator.slug }}
                  className={btn("secondary", "sm")}
                >
                  Ver perfil
                </Link>
              ) : null}
              {subscription.status === "active" ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const result = cancelSubscription(subscription.id);
                    toast(result.message);
                  }}
                >
                  Cancelar renovación
                </Button>
              ) : null}
            </div>
            <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground">
              Sin penalización. Conservas acceso hasta el cierre del periodo. Si no puedes cancelar,
              puedes acudir a PROFECO.
            </p>
          </SectionCard>
        );
      })}
    </div>
  );
}

function ComprasTab() {
  const { state, user } = useApp();
  if (!user) return null;

  if (user.role === "creator") {
    const transactions = state.transactions.filter(
      (t) => t.creatorId === state.creators.find((c) => c.slug === user.creatorSlug)?.id,
    );
    return (
      <SectionCard title="Ventas recibidas" description="Libro DEMO de tu estudio.">
        {transactions.length === 0 ? (
          <p className="text-xs text-muted-foreground">Todavía no hay ventas registradas.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-white/[0.02] p-3"
              >
                <div>
                  <p className="text-xs text-pearl">{tx.kind}</p>
                  <p className="text-[0.6rem] text-muted-foreground">{formatDate(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-pearl">{formatMoney(tx.grossMXN, state.currency)}</p>
                  <p className="text-[0.6rem] text-muted-foreground">
                    Neto {formatMoney(tx.netMXN, state.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    );
  }

  if (user.role === "admin") {
    return (
      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title="Compras globales."
        description="Revisa métricas agregadas y movimientos desde el panel de administración."
        action={
          <Link to="/admin" className={btn("primary", "md")}>
            Ir a administración
          </Link>
        }
      />
    );
  }

  const purchases = fanPurchases(state, user.id).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  if (purchases.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title="Sin compras."
        description="Tus clips, PPV, bundles, propinas y encargos aparecerán aquí."
        action={
          <Link to="/clips" className={btn("primary", "md")}>
            Explorar clips
          </Link>
        }
      />
    );
  }

  return (
    <SectionCard title="Historial de compras" description="Todos los importes son simulados.">
      <div className="space-y-2">
        {purchases.map((purchase) => {
          const creator = getCreator(state, purchase.creatorId);
          return (
            <div
              key={purchase.id}
              className="flex flex-col gap-2 rounded-lg border border-hairline bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-xs text-pearl">{purchase.label}</p>
                <p className="mt-0.5 text-[0.62rem] text-muted-foreground">
                  {creator?.name ?? "Creadora"} · {formatDateTime(purchase.createdAt)} ·{" "}
                  {purchase.kind}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={purchase.status === "delivered" ? "success" : "warning"}>
                  {purchase.status === "delivered" ? "Entregado" : "En curso"}
                </Badge>
                <p className="text-xs text-silver">
                  {formatMoney(purchase.amountMXN, state.currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function NotificacionesTab({
  notifications,
}: {
  notifications: ReturnType<typeof userNotifications>;
}) {
  const { markNotificationRead } = useApp();

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-6 w-6" />}
        title="Sin notificaciones."
        description="Los avisos de membresías, mensajes, reportes y pagos aparecerán aquí."
      />
    );
  }

  return (
    <SectionCard title="Notificaciones" description="Avisos de tu cuenta y del sistema.">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
              notification.read
                ? "border-hairline bg-white/[0.015]"
                : "border-signal/25 bg-signal/[0.06]",
            )}
          >
            <div className="min-w-0">
              <p className="text-xs text-pearl">{notification.title}</p>
              <p className="mt-0.5 text-[0.65rem] leading-relaxed text-muted-foreground">
                {notification.body}
              </p>
              <p className="mt-1 text-[0.58rem] text-muted-foreground">
                {formatDateTime(notification.at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {notification.href ? (
                <a href={notification.href} className={btn("secondary", "sm")}>
                  Abrir
                </a>
              ) : null}
              {!notification.read ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markNotificationRead(notification.id)}
                >
                  Marcar leída
                </Button>
              ) : (
                <Badge tone="outline">Leída</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function LegalTab() {
  const { state, user, acceptLegal } = useApp();
  if (!user) return null;
  const required = user.role === "creator" ? REQUIRED_DOCS_CREATOR : REQUIRED_DOCS_FAN;
  const missing = required.filter(
    (docId) =>
      !user.legalAcceptances.some(
        (a) => a.docId === docId && a.docVersion === state.settings.termsVersion,
      ),
  );

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Aceptaciones registradas"
        description="Documento, versión, fecha, canal y hash."
        className="lg:col-span-7"
      >
        {user.legalAcceptances.length === 0 ? (
          <p className="text-xs text-muted-foreground">Todavía no hay aceptaciones registradas.</p>
        ) : (
          <div className="space-y-2">
            {user.legalAcceptances.map((acceptance) => (
              <div
                key={acceptance.id}
                className="rounded-lg border border-hairline bg-white/[0.02] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-pearl">{legalTitle(acceptance.docId)}</p>
                  <Badge
                    tone={
                      acceptance.docVersion === state.settings.termsVersion ? "success" : "warning"
                    }
                  >
                    v {acceptance.docVersion}
                  </Badge>
                </div>
                <p className="mt-1 text-[0.62rem] text-muted-foreground">
                  {formatDateTime(acceptance.acceptedAt)} · canal {acceptance.channel}
                </p>
                <p className="mt-1 break-all font-mono text-[0.58rem] text-muted-foreground/80">
                  hash {acceptance.hash}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="space-y-5 lg:col-span-5">
        <SectionCard
          title="Documentos obligatorios"
          description={`Versión vigente ${LEGAL_VERSION}`}
        >
          <div className="space-y-2">
            {required.map((docId) => {
              const doc = LEGAL_BY_ID.get(docId);
              const accepted = user.legalAcceptances.some(
                (a) => a.docId === docId && a.docVersion === state.settings.termsVersion,
              );
              return (
                <div
                  key={docId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-white/[0.02] p-3"
                >
                  <Link
                    to="/legal/$doc"
                    params={{ doc: docId }}
                    className="min-w-0 text-xs text-pearl underline-offset-4 hover:underline"
                  >
                    {doc?.title ?? docId}
                  </Link>
                  <Badge tone={accepted ? "success" : "warning"}>
                    {accepted ? "Aceptado" : "Pendiente"}
                  </Badge>
                </div>
              );
            })}
          </div>
          {missing.length > 0 ? (
            <Button
              className="mt-4 w-full"
              size="sm"
              onClick={() => {
                const result = acceptLegal(missing);
                toast(result.message);
              }}
            >
              <Check className="h-3.5 w-3.5" /> Aceptar documentos pendientes
            </Button>
          ) : (
            <p className="mt-4 inline-flex items-center gap-1.5 text-[0.68rem] text-success">
              <Check className="h-3.5 w-3.5" /> Todos los documentos vigentes están aceptados.
            </p>
          )}
          <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground">
            La aceptación se guarda solo en este navegador. En producción se almacenará en servidor
            con hash criptográfico, IP, dispositivo y versión del documento.
          </p>
        </SectionCard>

        <SectionCard title="Centro legal" description="Todos los documentos, imprimibles.">
          <Link to="/legal" className={cn(btn("secondary", "md"), "w-full")}>
            <FileText className="h-4 w-4" /> Abrir centro legal
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}

function ArcoTab() {
  const { state, user, submitDataRequest } = useApp();
  const [type, setType] = useState<DataRequest["type"]>("acceso");
  const [details, setDetails] = useState("");
  if (!user) return null;

  const requests = state.dataRequests.filter((r) => r.userId === user.id);

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Ejercer derechos ARCO"
        description="Acceso, Rectificación, Cancelación u Oposición."
        className="lg:col-span-6"
      >
        <div className="space-y-4">
          <Field label="Derecho">
            <Select value={type} onChange={(e) => setType(e.target.value as DataRequest["type"])}>
              <option value="acceso">Acceso a mis datos</option>
              <option value="rectificacion">Rectificación</option>
              <option value="cancelacion">Cancelación</option>
              <option value="oposicion">Oposición</option>
            </Select>
          </Field>
          <Field
            label="Detalle"
            hint="Describe qué dato quieres consultar, corregir, eliminar o limitar."
          >
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Mi solicitud…"
              className="min-h-28"
            />
          </Field>
          <Button
            size="sm"
            onClick={() => {
              const result = submitDataRequest(type, details);
              toast(result.message);
              if (result.ok) setDetails("");
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Enviar solicitud
          </Button>
          <div className="rounded-xl border border-info/25 bg-info/5 p-4 text-[0.68rem] leading-relaxed text-muted-foreground">
            <p className="font-medium text-info">Plazos</p>
            <p className="mt-1.5">
              Recibirás respuesta sobre la procedencia en un máximo de 20 días hábiles. Si procede,
              se hará efectiva en 15 días hábiles. También puedes escribir a{" "}
              {state.settings.privacyEmail}. En producción se verificará identidad antes de ejecutar
              la solicitud.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Mis solicitudes"
        description="Seguimiento de cada derecho ejercido."
        className="lg:col-span-6"
      >
        {requests.length === 0 ? (
          <p className="text-xs text-muted-foreground">No has enviado solicitudes ARCO.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-hairline bg-white/[0.02] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-pearl">{request.type}</p>
                  <Badge
                    tone={
                      request.status === "resuelta"
                        ? "success"
                        : request.status === "en_revision"
                          ? "info"
                          : "warning"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
                <p className="mt-1 text-[0.65rem] leading-relaxed text-muted-foreground">
                  {request.details}
                </p>
                <p className="mt-1.5 text-[0.58rem] text-muted-foreground">
                  Creada {formatDate(request.createdAt)} · vence {formatDate(request.dueAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="lg:col-span-12">
        <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
          El responsable del tratamiento es TAMV ONLINE NETWORK. Consulta el{" "}
          <Link
            to="/legal/$doc"
            params={{ doc: "privacidad" }}
            className="text-pearl underline-offset-4 hover:underline"
          >
            Aviso de Privacidad
          </Link>{" "}
          para conocer datos tratados, finalidades, transferencias y mecanismos de revocación. Si
          consideras que tus derechos fueron vulnerados, puedes acudir a la autoridad competente en
          materia de protección de datos.
        </p>
      </div>
    </div>
  );
}

function CookiesTab() {
  const { state, setCookieConsent } = useApp();
  const [analytics, setAnalytics] = useState(state.cookieConsent?.analytics ?? false);
  const [preferences, setPreferences] = useState(state.cookieConsent?.preferences ?? true);

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Preferencias de cookies"
        description="Puedes cambiarlas cuando quieras."
        className="lg:col-span-7"
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-hairline bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-pearl">Esenciales</p>
              <Badge tone="success">Siempre activas</Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Sesión, seguridad, verificación de edad y funcionamiento del Modo DEMO. Sin ellas el
              prototipo no puede operar.
            </p>
          </div>
          <Switch
            checked={analytics}
            onChange={setAnalytics}
            label="Analíticas (simuladas)"
            description="Métricas agregadas de uso. En este prototipo no se envía información a terceros."
          />
          <Switch
            checked={preferences}
            onChange={setPreferences}
            label="Preferencias"
            description="Moneda, filtros, tema y última sección visitada."
          />
          <Button
            size="sm"
            onClick={() => {
              setCookieConsent(analytics, preferences);
              toast.success("Preferencias de cookies guardadas.");
            }}
          >
            <Check className="h-3.5 w-3.5" /> Guardar preferencias
          </Button>
          {state.cookieConsent ? (
            <p className="text-[0.62rem] text-muted-foreground">
              Última decisión: {formatDateTime(state.cookieConsent.decidedAt)}.
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Cómo lo tratamos"
        description="Transparencia sobre el almacenamiento local."
        className="lg:col-span-5"
      >
        <div className="space-y-3 text-[0.68rem] leading-relaxed text-muted-foreground">
          <p>
            Este prototipo usa <span className="text-silver">localStorage</span> para conservar la
            sesión, la edad declarada, la moneda y el estado de demostración. No usa cookies de
            rastreo de terceros ni píxeles publicitarios.
          </p>
          <p>
            Puedes borrar todo desde la pestaña Datos. La baja de cookies no esenciales no elimina
            tu acceso ni el contenido desbloqueado.
          </p>
          <Link
            to="/legal/$doc"
            params={{ doc: "cookies" }}
            className={cn(btn("secondary", "sm"), "w-full")}
          >
            Leer política de cookies
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}

function DatosTab() {
  const { state, user, resetDemo, logout, setCookieConsent } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!user) return null;

  const userData = {
    account: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinedAt: user.joinedAt,
      referralCode: user.referralCode,
    },
    legalAcceptances: user.legalAcceptances,
    subscriptions: state.subscriptions.filter((s) => s.fanId === user.id),
    purchases: state.purchases.filter((p) => p.fanId === user.id),
    dataRequests: state.dataRequests.filter((r) => r.userId === user.id),
    favorites: state.favorites,
    notifications: state.notifications.filter((n) => n.userId === user.id),
    cookieConsent: state.cookieConsent,
    generatedAt: new Date().toISOString(),
    mode: "DEMO",
  };

  const download = () => {
    try {
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `xclusive-demo-${user.id}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Copia de tus datos descargada.");
    } catch {
      toast.error("No se pudo generar la descarga.");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Tus datos"
        description="Copia portable de tu actividad en este navegador."
        className="lg:col-span-7"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={download}>
            <Download className="h-3.5 w-3.5" /> Descargar JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar DEMO
          </Button>
        </div>
        <div className="mt-4 space-y-1">
          <DataRow label="Almacenamiento" value="localStorage del navegador" />
          <DataRow label="Servidor" value="Sin backend conectado en este prototipo" />
          <DataRow label="Hash de aceptaciones" value="Demostración, no criptográfico" />
          <DataRow label="Solicitudes ARCO" value={String(userData.dataRequests.length)} />
          <DataRow label="Compras" value={String(userData.purchases.length)} />
        </div>
        <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground">
          La descarga excluye credenciales y datos de otras cuentas. En producción, el derecho de
          acceso se ejercerá mediante el procedimiento ARCO con verificación de identidad.
        </p>
      </SectionCard>

      <SectionCard
        title="Privacidad por diseño"
        description="Lo que este prototipo no hace."
        className="lg:col-span-5"
      >
        <ul className="space-y-3">
          {[
            "No solicita tarjeta ni datos bancarios.",
            "No envía tu información a un servidor.",
            "No usa rastreadores publicitarios.",
            "No habilita contenido adulto ni cobros reales.",
            "Puedes borrar todo el estado DEMO en un clic.",
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {item}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl border border-warning/25 bg-warning/5 p-3 text-[0.65rem] leading-relaxed text-muted-foreground">
          Reiniciar DEMO elimina la sesión, las compras, las aceptaciones y las preferencias
          guardadas en este navegador. Esta acción no se puede deshacer.
        </div>
      </SectionCard>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reiniciar el Modo DEMO"
        description="Se borrarán los datos locales y volverás al estado inicial."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(false);
                setCookieConsent(false, false);
                resetDemo();
                toast.success("Modo DEMO reiniciado.");
              }}
            >
              <Trash2 className="h-4 w-4" /> Borrar y reiniciar
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Se eliminarán la sesión, la verificación de edad, las membresías, compras, mensajes,
          aceptaciones legales y preferencias guardadas en este navegador. Si quieres conservar una
          copia, descarga el JSON antes de continuar.
        </p>
      </Modal>
    </div>
  );
}
