import { Cookie, Settings2 } from "lucide-react";
import { useState } from "react";

import { useApp } from "@/lib/store";
import { Button, Modal, Switch } from "@/components/lux/ui";

export function CookieConsent() {
  const { state, hydrated, setCookieConsent } = useApp();
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(true);

  if (!hydrated || !state.ageVerified || state.cookieConsent) return null;

  return (
    <>
      <div className="fixed inset-x-3 bottom-3 z-[1500] mx-auto max-w-4xl rounded-xl border border-hairline bg-background/95 p-4 shadow-deep backdrop-blur-xl sm:inset-x-6 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full border border-hairline bg-white/5 p-2 text-silver">
              <Cookie className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-pearl">Cookies y preferencias</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Usamos almacenamiento esencial para la sesión y el Modo DEMO. Las analíticas son
                simuladas y puedes rechazarlas sin perder funciones.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <Settings2 className="h-3.5 w-3.5" /> Personalizar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCookieConsent(false, false)}>
              Solo esenciales
            </Button>
            <Button size="sm" onClick={() => setCookieConsent(true, true)}>
              Aceptar todas
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Preferencias de cookies"
        description="Puedes cambiar estas preferencias desde Mi cuenta → Legal y privacidad."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setCookieConsent(false, false)}>
              Solo esenciales
            </Button>
            <Button onClick={() => setCookieConsent(analytics, preferences)}>
              Guardar preferencias
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-hairline bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-pearl">Esenciales</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Sesión, seguridad, preferencia de edad y funcionamiento del Modo DEMO. Siempre
              activas.
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
        </div>
      </Modal>
    </>
  );
}
