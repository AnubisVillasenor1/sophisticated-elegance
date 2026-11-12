import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";
import { getViewer, type Viewer } from "./auth.functions";
import { mapAuthError } from "./errors";
import { AUTH_MODE, type AuthMode } from "./mode";
import type { ViewerRole } from "./roles";

export { mapAuthError };

export type SessionStatus = "loading" | "signed-in" | "signed-out" | "demo";

export type AuthOutcome = {
  ok: boolean;
  message: string;
  role?: ViewerRole;
  needsConfirmation?: boolean;
};

export type SignUpPayload = {
  email: string;
  password: string;
  displayName: string;
  requestedRole: "fan" | "creator";
};

type SessionApi = {
  mode: AuthMode;
  status: SessionStatus;
  viewer: Viewer | null;
  signIn: (email: string, password: string) => Promise<AuthOutcome>;
  signUp: (input: SignUpPayload) => Promise<AuthOutcome>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>(AUTH_MODE === "demo" ? "demo" : "loading");
  const [viewer, setViewer] = useState<Viewer | null>(null);

  const refresh = useCallback(async () => {
    if (AUTH_MODE === "demo") return;
    try {
      const next = await getViewer();
      setViewer(next);
      setStatus("signed-in");
    } catch {
      setViewer(null);
      setStatus("signed-out");
    }
  }, []);

  useEffect(() => {
    if (AUTH_MODE === "demo") return;
    let active = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        if (data.session) {
          void refresh();
        } else {
          setStatus("signed-out");
        }
      })
      .catch(() => {
        if (active) setStatus("signed-out");
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setViewer(null);
        setStatus("signed-out");
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        void refresh();
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthOutcome> => {
    if (AUTH_MODE === "demo") {
      return { ok: false, message: "Esta compilación usa cuentas de demostración." };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, message: mapAuthError(error.message) };
    if (!data.session) {
      return { ok: false, message: mapAuthError("Email not confirmed") };
    }

    try {
      const next = await getViewer();
      setViewer(next);
      setStatus("signed-in");
      const name = next.displayName ?? next.email ?? "";
      return {
        ok: true,
        message: `Bienvenida, ${name.split(" ")[0] || "de nuevo"}.`,
        role: next.role,
      };
    } catch {
      await supabase.auth.signOut();
      setViewer(null);
      setStatus("signed-out");
      return { ok: false, message: "No pudimos verificar tu sesión. Inténtalo de nuevo." };
    }
  }, []);

  const signUp = useCallback(async (input: SignUpPayload): Promise<AuthOutcome> => {
    if (AUTH_MODE === "demo") {
      return { ok: false, message: "Esta compilación usa cuentas de demostración." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          display_name: input.displayName.trim(),
          // Solo es una solicitud. El rol real lo resuelve el servidor.
          requested_role: input.requestedRole,
        },
      },
    });

    if (error) return { ok: false, message: mapAuthError(error.message) };

    if (data.session) {
      try {
        const next = await getViewer();
        setViewer(next);
        setStatus("signed-in");
        return { ok: true, message: "Cuenta creada. Bienvenida al club.", role: next.role };
      } catch {
        setStatus("signed-out");
      }
    }

    return {
      ok: true,
      message: "Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión.",
      needsConfirmation: true,
    };
  }, []);

  const signOut = useCallback(async () => {
    if (AUTH_MODE === "demo") return;
    try {
      await supabase.auth.signOut();
    } finally {
      setViewer(null);
      setStatus("signed-out");
    }
  }, []);

  const value = useMemo<SessionApi>(
    () => ({ mode: AUTH_MODE, status, viewer, signIn, signUp, signOut, refresh }),
    [status, viewer, signIn, signUp, signOut, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return context;
}
