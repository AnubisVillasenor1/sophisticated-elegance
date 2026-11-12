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
import { flushPendingLegalEvidence } from "./legal-receipts";
import { AUTH_MODE, type AuthMode } from "./mode";
import type { ViewerRole } from "./roles";

export { mapAuthError };

export type SessionStatus = "loading" | "signed-in" | "signed-out" | "demo";

export type AuthOutcome = {
  ok: boolean;
  message: string;
  role?: ViewerRole;
  userId?: string;
  needsConfirmation?: boolean;
  /** El segundo factor está pendiente: hay que enviar el código TOTP. */
  needsMfa?: boolean;
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
  /** Hay un reto TOTP pendiente tras validar la contraseña. */
  mfaPending: boolean;
  verifyMfa: (code: string) => Promise<AuthOutcome>;
  requestPasswordReset: (email: string) => Promise<AuthOutcome>;
  changePassword: (password: string) => Promise<AuthOutcome>;
};

const SessionContext = createContext<SessionApi | null>(null);

type MfaChallenge = { factorId: string; challengeId: string };

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>(AUTH_MODE === "demo" ? "demo" : "loading");
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);

  const refresh = useCallback(async () => {
    if (AUTH_MODE === "demo") return;
    try {
      // Con MFA activo, Supabase entrega una sesión AAL1 tras la contraseña.
      // No se publica como sesión completa hasta verificar el segundo factor.
      const level = await supabase.auth.mfa.getAuthenticatorAssuranceLevel().catch(() => null);
      if (level?.data?.nextLevel === "aal2" && level.data.currentLevel !== "aal2") {
        setViewer(null);
        setStatus("signed-out");
        return;
      }
      const next = await getViewer();
      // Si el alta quedó pendiente de confirmación por correo, la evidencia
      // legal se envía ahora, con la sesión ya verificada.
      await flushPendingLegalEvidence(next).catch(() => false);
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

    // Con MFA activo, Supabase entrega una sesión AAL1 tras la contraseña. Hay
    // que completar el reto TOTP antes de publicar la identidad en la UI.
    const level = await supabase.auth.mfa.getAuthenticatorAssuranceLevel().catch(() => null);
    const needsSecondFactor =
      level?.data?.nextLevel === "aal2" && level.data.currentLevel !== "aal2";

    if (needsSecondFactor) {
      const listed = await supabase.auth.mfa.listFactors();
      const factor = (listed.data?.totp ?? []).find((item) => item.status === "verified");
      if (factor) {
        const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
        if (!challenge.error) {
          setMfaChallenge({ factorId: factor.id, challengeId: challenge.data.id });
          return {
            ok: false,
            needsMfa: true,
            message: "Ingresa el código de 6 dígitos de tu aplicación de autenticación.",
          };
        }
      }
      // Fallo cerrado: no se deja entrar con una sesión AAL1 incompleta.
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "Tu cuenta requiere un segundo factor y no pudimos iniciar la verificación.",
      };
    }

    if (!data.session) {
      return { ok: false, message: mapAuthError("Email not confirmed") };
    }

    try {
      const next = await getViewer();
      await flushPendingLegalEvidence(next).catch(() => false);
      setViewer(next);
      setStatus("signed-in");
      const name = next.displayName ?? next.email ?? "";
      return {
        ok: true,
        message: `Bienvenida, ${name.split(" ")[0] || "de nuevo"}.`,
        role: next.role,
        userId: next.id,
      };
    } catch {
      await supabase.auth.signOut();
      setViewer(null);
      setStatus("signed-out");
      return { ok: false, message: "No pudimos verificar tu sesión. Inténtalo de nuevo." };
    }
  }, []);

  const verifyMfa = useCallback(
    async (code: string): Promise<AuthOutcome> => {
      if (AUTH_MODE === "demo") {
        return { ok: false, message: "Esta compilación usa cuentas de demostración." };
      }
      if (!mfaChallenge) {
        return { ok: false, message: "No hay una verificación pendiente. Inicia sesión de nuevo." };
      }
      const clean = code.replace(/\s+/g, "");
      if (!/^\d{6}$/.test(clean)) {
        return { ok: false, message: "El código debe tener 6 dígitos." };
      }

      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaChallenge.factorId,
        challengeId: mfaChallenge.challengeId,
        code: clean,
      });
      if (error) return { ok: false, message: mapAuthError(error.message) };

      try {
        const next = await getViewer();
        await flushPendingLegalEvidence(next).catch(() => false);
        setViewer(next);
        setStatus("signed-in");
        setMfaChallenge(null);
        const name = next.displayName ?? next.email ?? "";
        return {
          ok: true,
          message: `Bienvenida, ${name.split(" ")[0] || "de nuevo"}.`,
          role: next.role,
          userId: next.id,
        };
      } catch {
        await supabase.auth.signOut();
        setViewer(null);
        setStatus("signed-out");
        setMfaChallenge(null);
        return { ok: false, message: "No pudimos verificar tu sesión. Inténtalo de nuevo." };
      }
    },
    [mfaChallenge],
  );

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthOutcome> => {
    if (AUTH_MODE === "demo") {
      return { ok: false, message: "Esta compilación usa cuentas de demostración." };
    }
    const clean = email.trim().toLowerCase();
    if (!clean.includes("@")) {
      return { ok: false, message: "Escribe un correo válido." };
    }

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/restablecer` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(
      clean,
      redirectTo ? { redirectTo } : undefined,
    );
    if (error) return { ok: false, message: mapAuthError(error.message) };
    return {
      ok: true,
      message: "Si el correo existe, enviamos un enlace para restablecer la contraseña.",
    };
  }, []);

  const changePassword = useCallback(async (password: string): Promise<AuthOutcome> => {
    if (AUTH_MODE === "demo") {
      return { ok: false, message: "Esta compilación usa cuentas de demostración." };
    }
    if (password.length < 8) {
      return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, message: mapAuthError(error.message) };
    return { ok: true, message: "Contraseña actualizada. Conserva tu sesión iniciada." };
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
        return {
          ok: true,
          message: "Cuenta creada. Bienvenida al club.",
          role: next.role,
          userId: next.id,
        };
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
      setMfaChallenge(null);
      setStatus("signed-out");
    }
  }, []);

  const value = useMemo<SessionApi>(
    () => ({
      mode: AUTH_MODE,
      status,
      viewer,
      signIn,
      signUp,
      signOut,
      refresh,
      mfaPending: mfaChallenge !== null,
      verifyMfa,
      requestPasswordReset,
      changePassword,
    }),
    [
      status,
      viewer,
      signIn,
      signUp,
      signOut,
      refresh,
      mfaChallenge,
      verifyMfa,
      requestPasswordReset,
      changePassword,
    ],
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
