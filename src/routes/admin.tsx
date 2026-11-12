import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  BarChart3,
  Check,
  Clock,
  CreditCard,
  FileSearch,
  Flag,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  Palette,
  Receipt,
  ScrollText,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  PlatformShell,
  SectionCard,
  SettingsRow,
  StudioTabs,
} from "@/components/platform/PlatformShell";
import {
  Avatar,
  Badge,
  Button,
  DataRow,
  DemoBadge,
  EmptyState,
  Field,
  Input,
  Select,
  StatCard,
  Switch,
  Textarea,
  btn,
} from "@/components/lux/ui";
import { demoMode } from "@/lib/auth/demo-accounts";
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { platformMetrics } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { Application, Creator, DataRequest, Payout, Report, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administración — Xclusive" },
      {
        name: "description",
        content:
          "Panel de administración: solicitudes, moderación, ARCO, pagos, creadoras y white-label del prototipo Xclusive.",
      },
    ],
  }),
  component: AdminPage,
});

type AdminTab =
  "resumen" | "solicitudes" | "moderacion" | "arco" | "pagos" | "creadoras" | "ajustes";

function AdminPage() {
  const { state, user } = useApp();

  if (!user) {
    return (
      <PlatformShell
        title="Administración"
        eyebrow="Acceso"
        subtitle="Área reservada al equipo de dirección."
      >
        <EmptyState
          icon={<Lock className="h-6 w-6" />}
          title="Área restringida."
          description="Inicia sesión con la cuenta de administración de demostración para revisar solicitudes, moderación, ARCO y pagos."
          action={
            <Link to="/entrar" className={btn("primary", "md")}>
              Iniciar sesión <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />
      </PlatformShell>
    );
  }

  if (user.role !== "admin") {
    return (
      <PlatformShell
        title="Administración"
        eyebrow="Acceso restringido"
        subtitle="Solo el equipo de dirección puede entrar."
      >
        <EmptyState
          icon={<Shield className="h-6 w-6" />}
          title="Esta puerta no es para tu rol."
          description={
            demoMode
              ? "Tu cuenta es de miembro o creadora. Usa la cuenta admin@xclusive.demo para probar las herramientas de administración."
              : "Tu cuenta es de miembro o creadora. El acceso de administración se concede desde el servidor con la allowlist de correos."
          }
          action={
            <Link
              to={user.role === "creator" ? "/estudio" : "/cuenta"}
              className={btn("primary", "md")}
            >
              {user.role === "creator" ? "Ir al estudio" : "Ir a Mi cuenta"}
            </Link>
          }
        />
      </PlatformShell>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { state } = useApp();
  const [tab, setTab] = useState<AdminTab>("resumen");
  const metrics = platformMetrics(state);

  return (
    <PlatformShell
      title="Administración"
      eyebrow="Dirección · Xclusive"
      subtitle={`${formatNumber(metrics.users)} cuentas · ${formatNumber(metrics.creators)} creadoras · ${state.settings.whiteLabel ? "white-label activo" : "marca Xclusive"}`}
      actions={<DemoBadge>Consola DEMO</DemoBadge>}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bruto DEMO"
          value={formatMoney(metrics.gross, state.currency)}
          hint="Libro de demostración."
          icon={<Wallet className="h-4 w-4" />}
          tone="signal"
        />
        <StatCard
          label="Comisión plataforma"
          value={formatMoney(metrics.fee, state.currency)}
          hint="Antes de PSP e impuestos."
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          label="Solicitudes"
          value={formatNumber(metrics.pendingApps)}
          hint="Postulaciones de creadoras pendientes."
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Reportes abiertos"
          value={formatNumber(metrics.openReports)}
          hint="Moderación y confianza."
          icon={<Flag className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <StudioTabs
          value={tab}
          onChange={(id) => setTab(id as AdminTab)}
          items={[
            { id: "resumen", label: "Resumen", icon: <BarChart3 className="h-3.5 w-3.5" /> },
            {
              id: "solicitudes",
              label: "Solicitudes",
              icon: <UserCheck className="h-3.5 w-3.5" />,
              badge: metrics.pendingApps,
            },
            {
              id: "moderacion",
              label: "Moderación",
              icon: <Flag className="h-3.5 w-3.5" />,
              badge: metrics.openReports,
            },
            {
              id: "arco",
              label: "ARCO",
              icon: <ShieldCheck className="h-3.5 w-3.5" />,
              badge: state.dataRequests.filter((r) => r.status !== "resuelta").length,
            },
            {
              id: "pagos",
              label: "Pagos",
              icon: <CreditCard className="h-3.5 w-3.5" />,
              badge: metrics.pendingPayouts.length,
            },
            { id: "creadoras", label: "Creadoras", icon: <Users className="h-3.5 w-3.5" /> },
            { id: "ajustes", label: "Ajustes", icon: <Settings2 className="h-3.5 w-3.5" /> },
          ]}
        />
        <Badge tone="info">
          <Shield className="h-3 w-3" /> Admin verificado por sesión
        </Badge>
      </div>

      <div className="mt-5">
        {tab === "resumen" ? <ResumenTab /> : null}
        {tab === "solicitudes" ? <SolicitudesTab /> : null}
        {tab === "moderacion" ? <ModeracionTab /> : null}
        {tab === "arco" ? <ArcoAdminTab /> : null}
        {tab === "pagos" ? <PagosTab /> : null}
        {tab === "creadoras" ? <CreadorasTab /> : null}
        {tab === "ajustes" ? <AjustesAdminTab /> : null}
      </div>

      <div className="mt-8 rounded-xl border border-warning/25 bg-warning/5 p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-warning">
          <AlertTriangle className="h-3.5 w-3.5" /> Consola de demostración
        </p>
        <p className="mt-1.5 max-w-4xl text-[0.7rem] leading-relaxed text-muted-foreground">
          Las acciones de esta consola modifican solo el estado local del prototipo. Ningún pago,
          retiro, sanción o cambio de configuración se aplica a un sistema real. En producción, cada
          acción requerirá autenticación fuerte, permisos por rol, registro de auditoría y
          confirmación de dos pasos.
        </p>
      </div>
    </PlatformShell>
  );
}

function ResumenTab() {
  const { state } = useApp();
  const metrics = platformMetrics(state);
  const transactions = [...state.transactions]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);
  const pendingApps = state.applications.filter((a) => a.status === "pending");
  const openReports = state.reports.filter((r) => r.status !== "resolved");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Miembros activos"
          value={formatNumber(metrics.activeMembers)}
          hint="Membresías activas."
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Compras"
          value={formatNumber(metrics.purchases)}
          hint="Registros de compra DEMO."
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          label="Neto creadoras"
          value={formatMoney(metrics.net, state.currency)}
          hint="Después de comisión."
        />
        <StatCard
          label="Retiros pendientes"
          value={formatNumber(metrics.pendingPayouts.length)}
          hint="Solicitudes por revisar."
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Cola de trabajo"
          description="Lo que requiere decisión humana."
          className="lg:col-span-2"
        >
          <div className="divide-y divide-hairline">
            <SettingsRow
              icon={<UserCheck className="h-4 w-4" />}
              title="Solicitudes de creadora"
              description={
                pendingApps.length > 0
                  ? `${pendingApps.length} postulación${pendingApps.length === 1 ? "" : "es"} pendiente${pendingApps.length === 1 ? "" : "s"}.`
                  : "Sin solicitudes pendientes."
              }
              action={
                <Badge tone={pendingApps.length > 0 ? "warning" : "success"}>
                  {pendingApps.length}
                </Badge>
              }
            />
            <SettingsRow
              icon={<Flag className="h-4 w-4" />}
              title="Reportes de moderación"
              description={
                openReports.length > 0
                  ? `${openReports.length} caso${openReports.length === 1 ? "" : "s"} abierto${openReports.length === 1 ? "" : "s"}.`
                  : "Sin reportes abiertos."
              }
              action={
                <Badge tone={openReports.length > 0 ? "warning" : "success"}>
                  {openReports.length}
                </Badge>
              }
            />
            <SettingsRow
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Solicitudes ARCO"
              description={`${state.dataRequests.filter((r) => r.status !== "resuelta").length} solicitudes de datos por atender.`}
              action={
                <Badge tone="info">
                  {state.dataRequests.filter((r) => r.status !== "resuelta").length}
                </Badge>
              }
            />
            <SettingsRow
              icon={<CreditCard className="h-4 w-4" />}
              title="Retiros DEMO"
              description={`${metrics.pendingPayouts.length} solicitud${metrics.pendingPayouts.length === 1 ? "" : "es"} de retiro pendiente${metrics.pendingPayouts.length === 1 ? "" : "s"}.`}
              action={
                <Badge tone={metrics.pendingPayouts.length > 0 ? "warning" : "success"}>
                  {metrics.pendingPayouts.length}
                </Badge>
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="Últimos movimientos" description="Transacciones del libro DEMO.">
          {transactions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin movimientos.</p>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-2 border-b border-hairline pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs text-pearl">{tx.kind}</p>
                    <p className="text-[0.6rem] text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs text-silver">{formatMoney(tx.grossMXN, state.currency)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: <UserCheck className="h-4 w-4" />,
            label: "Revisar solicitudes",
            value: pendingApps.length,
            tab: "solicitudes",
          },
          {
            icon: <Flag className="h-4 w-4" />,
            label: "Moderar reportes",
            value: openReports.length,
            tab: "moderacion",
          },
          {
            icon: <ShieldCheck className="h-4 w-4" />,
            label: "Atender ARCO",
            value: state.dataRequests.filter((r) => r.status !== "resuelta").length,
            tab: "arco",
          },
          {
            icon: <CreditCard className="h-4 w-4" />,
            label: "Revisar retiros",
            value: metrics.pendingPayouts.length,
            tab: "pagos",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-hairline bg-white/[0.02] p-4">
            <span className="text-signal">{item.icon}</span>
            <p className="mt-2.5 font-serif text-2xl text-pearl">{item.value}</p>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SolicitudesTab() {
  const { state, approveApplication, rejectApplication } = useApp();
  const applications = [...state.applications].sort((a, b) =>
    a.submittedAt < b.submittedAt ? 1 : -1,
  );

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<UserCheck className="h-6 w-6" />}
        title="Sin solicitudes."
        description="Las postulaciones de creadoras aparecerán aquí."
      />
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationRow
          key={application.id}
          application={application}
          onApprove={() => {
            const result = approveApplication(application.id);
            toast(result.message);
          }}
          onReject={() => {
            const result = rejectApplication(application.id);
            toast(result.message);
          }}
        />
      ))}
    </div>
  );
}

function ApplicationRow({
  application,
  onApprove,
  onReject,
}: {
  application: Application;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-xl border border-hairline bg-card/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Avatar name={application.name} tint="#ed315c" size={42} ring={false} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-pearl">{application.name}</p>
              <Badge
                tone={
                  application.status === "approved"
                    ? "success"
                    : application.status === "rejected"
                      ? "outline"
                      : "warning"
                }
              >
                {application.status}
              </Badge>
            </div>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
              {application.email} · {application.city} · {formatDate(application.submittedAt)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {application.categories.map((category) => (
                <span key={category} className="chip">
                  {category}
                </span>
              ))}
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              {application.bio}
            </p>
            {application.socials ? (
              <p className="mt-1 text-[0.62rem] text-silver">Redes: {application.socials}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {application.status !== "approved" ? (
            <Button size="sm" onClick={onApprove}>
              <Check className="h-3.5 w-3.5" /> Aprobar
            </Button>
          ) : null}
          {application.status !== "rejected" ? (
            <Button variant="danger" size="sm" onClick={onReject}>
              <X className="h-3.5 w-3.5" /> Rechazar
            </Button>
          ) : null}
        </div>
      </div>
      {application.note ? (
        <p className="mt-3 border-t border-hairline pt-3 text-[0.65rem] text-muted-foreground">
          {application.note}
        </p>
      ) : null}
    </article>
  );
}

function ModeracionTab() {
  const { state } = useApp();
  const reports = [...state.reports].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<Flag className="h-6 w-6" />}
        title="Sin reportes."
        description="La cola de moderación está vacía en este prototipo."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportRow key={report.id} report={report} />
      ))}
    </div>
  );
}

function ReportRow({ report }: { report: Report }) {
  const { resolveReport } = useApp();
  const [resolution, setResolution] = useState("");

  return (
    <article className="rounded-xl border border-hairline bg-card/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                report.status === "resolved"
                  ? "success"
                  : report.status === "reviewing"
                    ? "info"
                    : "warning"
              }
            >
              {report.status}
            </Badge>
            <Badge tone="outline">{report.targetType}</Badge>
            <p className="text-sm text-pearl">{report.targetLabel}</p>
          </div>
          <p className="mt-1.5 text-xs text-silver">{report.reason}</p>
          <p className="mt-1 text-[0.65rem] leading-relaxed text-muted-foreground">
            {report.details || "Sin detalle adicional."}
          </p>
          <p className="mt-1.5 text-[0.6rem] text-muted-foreground">
            {report.reporterName} · {formatDateTime(report.createdAt)} · ID {report.id}
          </p>
        </div>
        <Badge tone="dark">Evidencia conservada</Badge>
      </div>
      {report.status !== "resolved" ? (
        <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4 sm:flex-row">
          <Input
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Resolución, medida aplicada o motivo de archivo…"
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => {
              const result = resolveReport(report.id, resolution);
              toast(result.message);
            }}
          >
            <Check className="h-3.5 w-3.5" /> Resolver
          </Button>
        </div>
      ) : (
        <p className="mt-3 border-t border-hairline pt-3 text-[0.65rem] text-muted-foreground">
          Resolución: {report.resolution}
        </p>
      )}
    </article>
  );
}

function ArcoAdminTab() {
  const { state, resolveDataRequest } = useApp();
  const requests = [...state.dataRequests].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-6 w-6" />}
        title="Sin solicitudes ARCO."
        description="Las solicitudes de acceso, rectificación, cancelación u oposición aparecerán aquí."
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <DataRequestRow
          key={request.id}
          request={request}
          onResolve={() => resolveDataRequest(request.id)}
        />
      ))}
    </div>
  );
}

function DataRequestRow({ request, onResolve }: { request: DataRequest; onResolve: () => void }) {
  return (
    <article className="rounded-xl border border-hairline bg-card/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
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
            <p className="text-sm text-pearl">{request.type}</p>
          </div>
          <p className="mt-1.5 text-[0.65rem] text-muted-foreground">
            {request.userName} · {request.email} · creada {formatDate(request.createdAt)} · vence{" "}
            {formatDate(request.dueAt)}
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {request.details}
          </p>
        </div>
        {request.status !== "resuelta" ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onResolve();
              toast.success("Solicitud ARCO marcada como resuelta.");
            }}
          >
            <Check className="h-3.5 w-3.5" /> Marcar resuelta
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function PagosTab() {
  const { state, markPayoutPaid } = useApp();
  const payouts = [...state.payouts].sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));

  if (payouts.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className="h-6 w-6" />}
        title="Sin retiros."
        description="Las solicitudes de retiro DEMO de las creadoras aparecerán aquí."
      />
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((payout) => (
        <PayoutRow
          key={payout.id}
          payout={payout}
          creator={state.creators.find((c) => c.id === payout.creatorId) ?? null}
          onPay={() => {
            const result = markPayoutPaid(payout.id);
            toast(result.message);
          }}
        />
      ))}
    </div>
  );
}

function PayoutRow({
  payout,
  creator,
  onPay,
}: {
  payout: Payout;
  creator: Creator | null;
  onPay: () => void;
}) {
  const { state } = useApp();
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-hairline bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Avatar
          name={creator?.name ?? "Creadora"}
          tint={creator?.avatarTint ?? "#ed315c"}
          size={38}
          ring={false}
        />
        <div>
          <p className="text-sm text-pearl">{creator?.name ?? "Creadora"}</p>
          <p className="text-[0.65rem] text-muted-foreground">
            Solicitado {formatDate(payout.requestedAt)} ·{" "}
            {formatMoney(payout.amountMXN, state.currency)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={payout.status === "paid" ? "success" : "warning"}>
          {payout.status === "paid" ? "Pagado" : "Solicitado"}
        </Badge>
        {payout.status !== "paid" ? (
          <Button variant="secondary" size="sm" onClick={onPay}>
            <Check className="h-3.5 w-3.5" /> Marcar pagado
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function CreadorasTab() {
  const { state } = useApp();
  const creators = [...state.creators].sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <div className="space-y-3">
      {creators.map((creator) => (
        <CreatorAdminRow key={creator.id} creator={creator} />
      ))}
    </div>
  );
}

function CreatorAdminRow({ creator }: { creator: Creator }) {
  const { state, setCreatorShare, setCreatorStatus } = useApp();
  const [share, setShare] = useState(creator.revenueShare);

  return (
    <article className="rounded-xl border border-hairline bg-card/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Avatar name={creator.name} tint={creator.avatarTint} size={42} ring={false} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-pearl">{creator.name}</p>
              <Badge
                tone={
                  creator.status === "approved"
                    ? "success"
                    : creator.status === "pending"
                      ? "warning"
                      : "outline"
                }
              >
                {creator.status}
              </Badge>
              {creator.verified ? <Badge tone="info">Verificada</Badge> : null}
            </div>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
              {creator.city} · {formatNumber(creator.members)} miembros ·{" "}
              {creator.categories.join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            Reparto
            <Input
              type="number"
              min={50}
              max={100}
              value={share}
              onChange={(e) => setShare(Number(e.target.value))}
              className="mt-1 w-20"
            />
          </label>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const result = setCreatorShare(creator.id, share);
              toast(result.message);
            }}
          >
            <Check className="h-3.5 w-3.5" /> Guardar
          </Button>
          <Button
            variant={creator.status === "suspended" ? "secondary" : "danger"}
            size="sm"
            onClick={() => {
              const result = setCreatorStatus(
                creator.id,
                creator.status === "suspended" ? "approved" : "suspended",
              );
              toast(result.message);
            }}
          >
            {creator.status === "suspended" ? (
              <BadgeCheck className="h-3.5 w-3.5" />
            ) : (
              <Ban className="h-3.5 w-3.5" />
            )}
            {creator.status === "suspended" ? "Reactivar" : "Suspender"}
          </Button>
          <Link
            to="/creadora/$slug"
            params={{ slug: creator.slug }}
            className={btn("secondary", "sm")}
          >
            Ver
          </Link>
        </div>
      </div>
      <div className="mt-3 grid gap-2 border-t border-hairline pt-3 text-[0.62rem] text-muted-foreground sm:grid-cols-3">
        <span>
          Ingreso neto:{" "}
          {formatMoney(
            state.transactions
              .filter((t) => t.creatorId === creator.id)
              .reduce((sum, t) => sum + t.netMXN, 0),
            state.currency,
          )}
        </span>
        <span>Miembros: {formatNumber(creator.members)}</span>
        <span>Desde {formatDate(creator.joinedAt)}</span>
      </div>
    </article>
  );
}

function AjustesAdminTab() {
  const { state, updateSettings } = useApp();
  const [form, setForm] = useState<Settings>(state.settings);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Identidad y contacto"
        description="Marca, dominio y correos operativos."
        className="lg:col-span-7"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre de marca">
            <Input value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
          </Field>
          <Field label="Dominio">
            <Input value={form.domain} onChange={(e) => set("domain", e.target.value)} />
          </Field>
          <Field label="Lema" hint="Se muestra en el pie de página.">
            <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Correo de soporte">
            <Input
              type="email"
              value={form.supportEmail}
              onChange={(e) => set("supportEmail", e.target.value)}
            />
          </Field>
          <Field label="Correo de privacidad">
            <Input
              type="email"
              value={form.privacyEmail}
              onChange={(e) => set("privacyEmail", e.target.value)}
            />
          </Field>
          <Field label="Correo legal">
            <Input
              type="email"
              value={form.legalEmail}
              onChange={(e) => set("legalEmail", e.target.value)}
            />
          </Field>
          <Field label="Color de acento" hint="Valor CSS, por ejemplo #ed315c.">
            <Input value={form.accent} onChange={(e) => set("accent", e.target.value)} />
          </Field>
          <Field label="Moneda por defecto">
            <Select
              value={form.defaultCurrency}
              onChange={(e) =>
                set("defaultCurrency", e.target.value as Settings["defaultCurrency"])
              }
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <Switch
            checked={form.whiteLabel}
            onChange={(value) => set("whiteLabel", value)}
            label="White-label"
            description="Permite personalizar marca y dominio. En producción requiere configuración por inquilino."
          />
          <Switch
            checked={form.aiEnabled}
            onChange={(value) => set("aiEnabled", value)}
            label="Asistente de IA"
            description="Respuestas automáticas declaradas como simuladas."
          />
          <Switch
            checked={form.liveEnabled}
            onChange={(value) => set("liveEnabled", value)}
            label="Salones en vivo"
            description="Habilita la agenda y el acceso a salas."
          />
          <Switch
            checked={form.maintenance}
            onChange={(value) => set("maintenance", value)}
            label="Mantenimiento"
            description="Muestra un aviso de mantenimiento. No bloquea el prototipo."
          />
        </div>

        <Button
          className="mt-4"
          size="sm"
          onClick={() => {
            const result = updateSettings(form);
            if (result.ok) toast.success(result.message);
            else toast.error(result.message);
          }}
        >
          <Check className="h-3.5 w-3.5" /> Guardar configuración
        </Button>
      </SectionCard>

      <div className="space-y-5 lg:col-span-5">
        <SectionCard title="Contenido adulto" description="Bloqueado por cumplimiento.">
          <div className="rounded-xl border border-warning/25 bg-warning/5 p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-warning">
              <Lock className="h-3.5 w-3.5" /> Deshabilitado
            </p>
            <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
              No puede habilitarse desde la consola. Requiere verificación de edad con proveedor
              especializado, consentimiento documentado, moderación con apelación, revisión legal y
              aprobación del PSP. El prototipo mantiene contenido editorial no explícito.
            </p>
          </div>
          <div className="mt-3 space-y-1">
            <DataRow
              label="Estado actual"
              value={state.settings.adultEnabled ? "Habilitado" : "Deshabilitado"}
            />
            <DataRow label="Versión legal" value={state.settings.termsVersion} />
            <DataRow label="Comisión plataforma" value={`${state.settings.platformFeePct}%`} />
            <DataRow label="Modo" value="DEMO" />
          </div>
        </SectionCard>

        <SectionCard title="Riesgos y límites" description="Lo que no debe prometerse.">
          <ul className="space-y-2.5">
            {[
              "No hay pasarela de pagos conectada.",
              "No hay verificación de identidad certificada.",
              "No hay saldos retirables ni obligación de pago.",
              "No se aloja contenido explícito.",
              "La IA es una simulación local declarada.",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" /> {item}
              </li>
            ))}
          </ul>
          <Link
            to="/legal/$doc"
            params={{ doc: "demo" }}
            className={cn(btn("secondary", "sm"), "mt-4 w-full")}
          >
            Leer estado DEMO
          </Link>
        </SectionCard>

        <SectionCard title="Métricas del prototipo" description="Lectura rápida.">
          <DataRow label="Usuarios" value={formatNumber(state.users.length)} />
          <DataRow label="Creadoras" value={formatNumber(state.creators.length)} />
          <DataRow
            label="Publicaciones"
            value={formatNumber(state.creators.reduce((sum, c) => sum + c.posts.length, 0))}
          />
          <DataRow
            label="Clips"
            value={formatNumber(state.creators.reduce((sum, c) => sum + c.clips.length, 0))}
          />
          <DataRow
            label="Mensajes"
            value={formatNumber(state.threads.reduce((sum, t) => sum + t.messages.length, 0))}
          />
          <DataRow
            label="Aceptaciones legales"
            value={formatNumber(state.users.reduce((sum, u) => sum + u.legalAcceptances.length, 0))}
          />
        </SectionCard>
      </div>
    </div>
  );
}
