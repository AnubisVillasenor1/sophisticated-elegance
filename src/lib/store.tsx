import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { autoReplyForFan } from "./ai";
import { addDaysISO, demoHash, slugify } from "./format";
import { REQUIRED_DOCS_CREATOR, REQUIRED_DOCS_FAN, LEGAL_VERSION, legalDoc } from "./legal";
import { createSeedState } from "./seed";
import {
  activeSubscription,
  canViewPost as canViewPostSelector,
  creatorAvailable,
  creatorNet,
  creatorTransactions,
  currentUser,
  getCreator,
  getCreatorBySlug,
  getTier,
  hasAcceptedCurrent,
  hasPurchased,
  purchaseFor,
  uid,
} from "./selectors";
import type {
  ActionResult,
  AppState,
  Application,
  AuthResult,
  Bundle,
  Clip,
  CoverKey,
  Creator,
  Currency,
  CustomOffer,
  DataRequest,
  LegalAcceptance,
  LiveAccess,
  LiveRoom,
  LiveStatus,
  Notification,
  Post,
  PostVisibility,
  Purchase,
  PurchaseKind,
  Role,
  Settings,
  Tier,
  Transaction,
  User,
} from "./types";

const STORAGE_KEY = "xclusive.demo.v1";

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: "fan" | "creator";
  city: string;
  categories: string[];
  socials: string;
  bio: string;
  acceptedDocIds: string[];
};

export type PostInput = {
  title: string;
  body: string;
  visibility: PostVisibility;
  tierId: string | null;
  priceMXN: number;
  cover: CoverKey;
  tags: string[];
  mature: boolean;
};

export type ClipInput = {
  title: string;
  description: string;
  category: string;
  priceMXN: number;
  duration: string;
  cover: CoverKey;
  mature: boolean;
};

export type RoomInput = {
  title: string;
  description: string;
  access: LiveAccess;
  ticketPriceMXN: number;
  startsAt: string;
  durationMin: number;
  capacity: number;
};

export type OfferInput = {
  kind: CustomOffer["kind"];
  title: string;
  description: string;
  priceMXN: number;
  turnaroundDays: number;
  slots: number;
};

export type CreatorPatch = Partial<
  Pick<
    Creator,
    | "headline"
    | "bio"
    | "city"
    | "categories"
    | "tags"
    | "socials"
    | "freeTrial"
    | "welcomeMessage"
    | "aiAssistant"
    | "cover"
    | "avatarTint"
  >
>;

export type ThreadAttachment = {
  clipId: string;
  postId: string;
};

export type AppApi = {
  state: AppState;
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => AuthResult;
  signup: (input: SignupInput) => AuthResult;
  logout: () => void;
  resetDemo: () => void;
  setCurrency: (currency: Currency) => void;
  setAgeVerified: (value: boolean) => void;
  setCookieConsent: (analytics: boolean, preferences: boolean) => void;
  toggleFavorite: (creatorId: string) => ActionResult;
  subscribe: (creatorId: string, tierId: string, trial: boolean) => ActionResult;
  cancelSubscription: (subscriptionId: string) => ActionResult;
  tip: (creatorId: string, amountMXN: number, note: string) => ActionResult;
  unlock: (
    kind: PurchaseKind,
    creatorId: string,
    itemId: string,
    label: string,
    amountMXN: number,
  ) => ActionResult;
  startThread: (creatorId: string) => ActionResult;
  sendMessage: (threadId: string, body: string, attachment?: ThreadAttachment) => ActionResult;
  creatorReply: (threadId: string, body: string, attachment?: ThreadAttachment) => ActionResult;
  markThreadRead: (threadId: string) => void;
  createPost: (creatorId: string, input: PostInput) => ActionResult;
  deletePost: (creatorId: string, postId: string) => ActionResult;
  saveTier: (
    creatorId: string,
    tierId: string,
    patch: Partial<Pick<Tier, "name" | "priceMXN" | "tagline" | "perks" | "featured">>,
  ) => ActionResult;
  updateCreator: (creatorId: string, patch: CreatorPatch) => ActionResult;
  createRoom: (creatorId: string, input: RoomInput) => ActionResult;
  setRoomStatus: (creatorId: string, roomId: string, status: LiveStatus) => ActionResult;
  liveTip: (creatorId: string, roomId: string, amountMXN: number) => ActionResult;
  createClip: (creatorId: string, input: ClipInput) => ActionResult;
  createOffer: (creatorId: string, input: OfferInput) => ActionResult;
  completePurchase: (purchaseId: string) => ActionResult;
  requestPayout: (creatorId: string) => ActionResult;
  submitReport: (input: {
    targetType: "creator" | "post" | "message" | "live";
    targetId: string;
    targetLabel: string;
    reason: string;
    details: string;
  }) => ActionResult;
  submitApplication: (input: {
    name: string;
    email: string;
    city: string;
    categories: string[];
    socials: string;
    bio: string;
  }) => ActionResult;
  approveApplication: (applicationId: string) => ActionResult;
  rejectApplication: (applicationId: string) => ActionResult;
  resolveReport: (reportId: string, resolution: string) => ActionResult;
  markPayoutPaid: (payoutId: string) => ActionResult;
  updateSettings: (patch: Partial<Settings>) => void;
  setCreatorShare: (creatorId: string, share: number) => ActionResult;
  setCreatorStatus: (creatorId: string, status: Creator["status"]) => ActionResult;
  submitDataRequest: (type: DataRequest["type"], details: string) => ActionResult;
  resolveDataRequest: (requestId: string) => void;
  acceptLegal: (docIds: string[]) => ActionResult;
  markNotificationRead: (notificationId: string) => void;
  canViewPost: (post: Post) => boolean;
  hasPurchased: (itemId: string) => boolean;
  purchaseFor: (itemId: string) => Purchase | null;
};

const AppContext = createContext<AppApi | null>(null);

function notify(
  state: AppState,
  userId: string,
  title: string,
  body: string,
  href: string | null = null,
): Notification {
  return {
    id: uid("nt"),
    userId,
    title,
    body,
    at: new Date().toISOString(),
    read: false,
    href,
  };
}

function priceTransaction(
  state: AppState,
  creator: Creator,
  kind: PurchaseKind,
  grossMXN: number,
  fanId: string,
): Transaction {
  const fee = Math.round((grossMXN * (100 - creator.revenueShare)) / 100);
  return {
    id: uid("tx"),
    creatorId: creator.id,
    fanId,
    kind,
    grossMXN,
    feeMXN: fee,
    netMXN: grossMXN - fee,
    createdAt: new Date().toISOString(),
    status: "settled",
  };
}

function creatorUser(state: AppState, creatorId: string): User | null {
  return (
    state.users.find(
      (u) => u.role === "creator" && u.creatorSlug === getCreator(state, creatorId)?.slug,
    ) ?? null
  );
}

function defaultTiers(creatorId: string): Tier[] {
  return [
    {
      id: `${creatorId}-t1`,
      name: "Insider",
      level: 1,
      priceMXN: 120,
      tagline: "La primera llave.",
      perks: ["Feed editorial", "Mensajes con moderación", "Avisos de salones"],
      featured: false,
    },
    {
      id: `${creatorId}-t2`,
      name: "VIP Club",
      level: 2,
      priceMXN: 320,
      tagline: "Dentro del círculo.",
      perks: ["Todo lo de Insider", "Bóveda protegida", "Prioridad en salones", "Insignia VIP"],
      featured: true,
    },
    {
      id: `${creatorId}-t3`,
      name: "Xtrime Inner Circle",
      level: 3,
      priceMXN: 820,
      tagline: "Donde casi nadie llega.",
      perks: ["Todo lo de VIP", "Sesión privada", "Piezas firmadas", "Línea XTRIME"],
      featured: false,
    },
  ];
}

function makeAcceptance(
  userId: string,
  docId: string,
  channel: LegalAcceptance["channel"],
): LegalAcceptance {
  const acceptedAt = new Date().toISOString();
  return {
    id: uid("la"),
    docId,
    docVersion: LEGAL_VERSION,
    acceptedAt,
    hash: demoHash(`${userId}:${docId}:${LEGAL_VERSION}:${acceptedAt}`),
    channel,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        if (parsed.version === 1 && Array.isArray(parsed.creators) && parsed.creators.length > 0) {
          const seed = createSeedState();
          setState({
            ...seed,
            ...parsed,
            settings: { ...seed.settings, ...(parsed.settings ?? {}) },
            hydrated: true,
          });
        }
      }
    } catch {
      // Un entorno corrupto se reinicia de forma segura.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, hydrated: false }));
    } catch {
      // Sin espacio o modo privado: el prototipo sigue funcionando en memoria.
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--signal", state.settings.accent);
    root.style.setProperty("--primary", state.settings.accent);
    root.style.setProperty("--ring", state.settings.accent);
  }, [state.settings.accent]);

  const user = useMemo(() => currentUser(state), [state]);

  const login = useCallback(
    (email: string, password: string): AuthResult => {
      const clean = email.trim().toLowerCase();
      const found = state.users.find((u) => u.email.toLowerCase() === clean);
      if (!found) return { ok: false, message: "No encontramos una cuenta con ese correo." };
      if (found.password !== demoHash(password))
        return { ok: false, message: "La contraseña no coincide." };
      setState((prev) => ({ ...prev, sessionUserId: found.id }));
      return {
        ok: true,
        message: `Bienvenida, ${found.name.split(" ")[0]}.`,
        role: found.role,
        creatorSlug: found.creatorSlug,
      };
    },
    [state.users],
  );

  const signup = useCallback(
    (input: SignupInput): AuthResult => {
      const email = input.email.trim().toLowerCase();
      if (!input.name.trim()) return { ok: false, message: "Escribe tu nombre." };
      if (!email.includes("@")) return { ok: false, message: "Escribe un correo válido." };
      if (input.password.length < 8)
        return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
      if (state.users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, message: "Ya existe una cuenta con ese correo." };
      }
      const required = input.role === "creator" ? REQUIRED_DOCS_CREATOR : REQUIRED_DOCS_FAN;
      const missing = required.filter((docId) => !input.acceptedDocIds.includes(docId));
      if (missing.length > 0) {
        return { ok: false, message: "Debes aceptar todos los documentos legales obligatorios." };
      }
      const id = uid("u");
      const now = new Date().toISOString();
      const acceptances = required.map((docId) =>
        makeAcceptance(id, docId, input.role === "creator" ? "creadora" : "registro"),
      );
      const newUser: User = {
        id,
        name: input.name.trim(),
        email,
        password: demoHash(input.password),
        role: input.role as Role,
        creatorSlug: null,
        joinedAt: now,
        avatarTint: input.role === "creator" ? "#ed315c" : "#c56c83",
        referralCode: `XCL-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        legalAcceptances: acceptances,
      };
      const application: Application | null =
        input.role === "creator"
          ? {
              id: uid("ap"),
              userId: id,
              name: input.name.trim(),
              email,
              city: input.city.trim() || "Por definir",
              categories: input.categories.length > 0 ? input.categories : ["Editorial"],
              socials: input.socials.trim(),
              bio: input.bio.trim(),
              status: "pending",
              submittedAt: now,
              note: "",
            }
          : null;
      setState((prev) => ({
        ...prev,
        sessionUserId: id,
        users: [...prev.users, newUser],
        applications: application ? [application, ...prev.applications] : prev.applications,
        notifications: application
          ? [
              notify(
                prev,
                "u-admin",
                "Nueva solicitud de creadora",
                `${newUser.name} envió su solicitud.`,
                "/admin",
              ),
              ...prev.notifications,
            ]
          : prev.notifications,
      }));
      return {
        ok: true,
        message:
          input.role === "creator"
            ? "Cuenta creada. Tu solicitud de perfil quedó en revisión."
            : "Cuenta creada. Bienvenida al club.",
        role: newUser.role,
        creatorSlug: null,
      };
    },
    [state.users],
  );

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, sessionUserId: null }));
  }, []);

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
    setState({ ...createSeedState(), hydrated: true, ageVerified: true });
    setHydrated(true);
  }, []);

  const setCurrency = useCallback((currency: Currency) => {
    setState((prev) => ({ ...prev, currency }));
  }, []);

  const setAgeVerified = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, ageVerified: value }));
  }, []);

  const setCookieConsent = useCallback((analytics: boolean, preferences: boolean) => {
    setState((prev) => ({
      ...prev,
      cookieConsent: {
        necessary: true,
        analytics,
        preferences,
        decidedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const toggleFavorite = useCallback(
    (creatorId: string): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para guardar favoritos." };
      setState((prev) => {
        const exists = prev.favorites.includes(creatorId);
        return {
          ...prev,
          favorites: exists
            ? prev.favorites.filter((id) => id !== creatorId)
            : [creatorId, ...prev.favorites],
        };
      });
      return {
        ok: true,
        message: state.favorites.includes(creatorId)
          ? "Perfil guardado."
          : "Perfil eliminado de favoritos.",
      };
    },
    [state.favorites, user],
  );

  const subscribe = useCallback(
    (creatorId: string, tierId: string, trial: boolean): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para suscribirte." };
      const creator = getCreator(state, creatorId);
      const tier = creator ? getTier(creator, tierId) : null;
      if (!creator || !tier) return { ok: false, message: "El plan ya no está disponible." };
      if (trial && !creator.freeTrial)
        return { ok: false, message: "Esta creadora no tiene prueba gratuita." };
      if (
        trial &&
        state.subscriptions.some((s) => s.fanId === user.id && s.creatorId === creatorId && s.trial)
      ) {
        return { ok: false, message: "Ya usaste la prueba gratuita de esta creadora." };
      }
      const existing = activeSubscription(state, user.id, creatorId);
      const now = new Date().toISOString();
      const renewsAt = addDaysISO(now, trial ? 7 : 30);
      const isTrial = trial && creator.freeTrial;
      setState((prev) => {
        const prevCreator = getCreator(prev, creatorId);
        if (!prevCreator) return prev;
        const subscription = existing
          ? prev.subscriptions.map((s) =>
              s.id === existing.id
                ? {
                    ...s,
                    tierId,
                    priceMXN: tier.priceMXN,
                    startedAt: now,
                    renewsAt,
                    trial: isTrial,
                    autoRenew: !isTrial,
                  }
                : s,
            )
          : [
              {
                id: uid("sub"),
                fanId: user.id,
                creatorId,
                tierId,
                status: "active" as const,
                startedAt: now,
                renewsAt,
                priceMXN: tier.priceMXN,
                trial: isTrial,
                autoRenew: !isTrial,
              },
              ...prev.subscriptions,
            ];
        const transaction = isTrial
          ? []
          : [priceTransaction(prev, prevCreator, "subscription", tier.priceMXN, user.id)];
        return {
          ...prev,
          subscriptions: subscription,
          transactions: [...transaction, ...prev.transactions],
          notifications: [
            notify(
              prev,
              creatorUser(prev, creatorId)?.id ?? "u-admin",
              "Nueva membresía",
              `${user.name} eligió ${tier.name}${isTrial ? " (prueba gratuita)" : ""}.`,
              "/estudio",
            ),
            ...prev.notifications,
          ],
        };
      });
      return {
        ok: true,
        message: isTrial
          ? `Prueba de 7 días activada en ${tier.name}.`
          : `Membresía ${tier.name} activada en Modo DEMO.`,
      };
    },
    [state, user],
  );

  const cancelSubscription = useCallback(
    (subscriptionId: string): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión." };
      const sub = state.subscriptions.find((s) => s.id === subscriptionId && s.fanId === user.id);
      if (!sub) return { ok: false, message: "No encontramos esa membresía." };
      setState((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s) =>
          s.id === subscriptionId ? { ...s, status: "cancelled", autoRenew: false } : s,
        ),
      }));
      return {
        ok: true,
        message: "Membresía cancelada. Conservas tu acceso hasta el final del periodo.",
      };
    },
    [state.subscriptions, user],
  );

  const tip = useCallback(
    (creatorId: string, amountMXN: number, note: string): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para enviar una propina." };
      if (amountMXN <= 0) return { ok: false, message: "Elige un monto válido." };
      const creator = getCreator(state, creatorId);
      if (!creator) return { ok: false, message: "Creadora no encontrada." };
      const now = new Date().toISOString();
      const purchase: Purchase = {
        id: uid("pu"),
        fanId: user.id,
        creatorId,
        kind: "tip",
        itemId: uid("tip"),
        label: note.trim() ? `Propina · ${note.trim()}` : "Propina",
        amountMXN,
        createdAt: now,
        status: "delivered",
      };
      setState((prev) => ({
        ...prev,
        purchases: [purchase, ...prev.purchases],
        transactions: [
          priceTransaction(prev, creator, "tip", amountMXN, user.id),
          ...prev.transactions,
        ],
        notifications: [
          notify(
            prev,
            creatorUser(prev, creatorId)?.id ?? "u-admin",
            "Nueva propina",
            `${user.name} envió una propina de demostración.`,
            "/estudio",
          ),
          ...prev.notifications,
        ],
      }));
      return { ok: true, message: "Propina DEMO registrada. Sin cargo real." };
    },
    [state, user],
  );

  const unlock = useCallback(
    (
      kind: PurchaseKind,
      creatorId: string,
      itemId: string,
      label: string,
      amountMXN: number,
    ): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para desbloquear." };
      const creator = getCreator(state, creatorId);
      if (!creator) return { ok: false, message: "Creadora no encontrada." };
      if (hasPurchased(state, user.id, itemId))
        return { ok: false, message: "Ya tienes acceso a esta pieza." };
      const purchase: Purchase = {
        id: uid("pu"),
        fanId: user.id,
        creatorId,
        kind,
        itemId,
        label,
        amountMXN,
        createdAt: new Date().toISOString(),
        status: kind === "custom" ? "in_progress" : "delivered",
      };
      setState((prev) => ({
        ...prev,
        purchases: [purchase, ...prev.purchases],
        transactions:
          amountMXN > 0
            ? [priceTransaction(prev, creator, kind, amountMXN, user.id), ...prev.transactions]
            : prev.transactions,
        notifications: [
          notify(
            prev,
            creatorUser(prev, creatorId)?.id ?? "u-admin",
            kind === "custom" ? "Nuevo encargo" : "Nueva compra",
            `${user.name} · ${label}`,
            "/estudio",
          ),
          ...prev.notifications,
        ],
      }));
      return {
        ok: true,
        message:
          kind === "custom"
            ? "Solicitud enviada. La creadora revisará el brief."
            : "Acceso desbloqueado. Compra DEMO sin cargo real.",
      };
    },
    [state, user],
  );

  const startThread = useCallback(
    (creatorId: string): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para escribir." };
      if (user.role === "creator" && user.creatorSlug === getCreator(state, creatorId)?.slug) {
        return { ok: false, message: "No puedes abrir una conversación contigo misma." };
      }
      const existing = state.threads.find((t) => t.fanId === user.id && t.creatorId === creatorId);
      if (existing) return { ok: true, message: "Conversación abierta.", id: existing.id };
      const creator = getCreator(state, creatorId);
      if (!creator) return { ok: false, message: "Creadora no encontrada." };
      const now = new Date().toISOString();
      const thread = {
        id: uid("th"),
        creatorId,
        fanId: user.id,
        fanName: user.name,
        fanTint: user.avatarTint,
        messages: [
          {
            id: uid("m"),
            from: "creator" as const,
            body: creator.welcomeMessage,
            at: now,
            attachedClipId: null,
            attachedPostId: null,
          },
        ],
        unread: 0,
        updatedAt: now,
        automated: false,
        blocked: false,
      };
      setState((prev) => ({ ...prev, threads: [thread, ...prev.threads] }));
      return { ok: true, message: "Conversación abierta.", id: thread.id };
    },
    [state, user],
  );

  const sendMessage = useCallback(
    (threadId: string, body: string, attachment?: ThreadAttachment): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para enviar mensajes." };
      const clean = body.trim();
      if (!clean && !attachment) return { ok: false, message: "Escribe un mensaje." };
      const thread = state.threads.find((t) => t.id === threadId);
      if (!thread) return { ok: false, message: "Conversación no encontrada." };
      const isCreatorOfThread =
        user.role === "creator" && user.creatorSlug === getCreator(state, thread.creatorId)?.slug;
      if (thread.fanId !== user.id && !isCreatorOfThread)
        return { ok: false, message: "No tienes acceso a esta conversación." };
      const now = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        threads: prev.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                unread: isCreatorOfThread ? 0 : 1,
                updatedAt: now,
                messages: [
                  ...t.messages,
                  {
                    id: uid("m"),
                    from: isCreatorOfThread ? ("creator" as const) : ("fan" as const),
                    body: clean,
                    at: now,
                    attachedClipId: attachment?.clipId ?? null,
                    attachedPostId: attachment?.postId ?? null,
                  },
                ],
              }
            : t,
        ),
      }));
      const creator = getCreator(state, thread.creatorId);
      if (!isCreatorOfThread && creator && creator.aiAssistant && state.settings.aiEnabled) {
        const reply = autoReplyForFan(clean, creator);
        window.setTimeout(() => {
          setState((prev) => ({
            ...prev,
            threads: prev.threads.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    unread: 0,
                    updatedAt: new Date().toISOString(),
                    messages: [
                      ...t.messages,
                      {
                        id: uid("m"),
                        from: "ai" as const,
                        body: reply,
                        at: new Date().toISOString(),
                        attachedClipId: null,
                        attachedPostId: null,
                      },
                    ],
                  }
                : t,
            ),
          }));
        }, 1400);
      }
      return { ok: true, message: "Mensaje enviado." };
    },
    [state, user],
  );

  const creatorReply = useCallback(
    (threadId: string, body: string, attachment?: ThreadAttachment): ActionResult => {
      return sendMessage(threadId, body, attachment);
    },
    [sendMessage],
  );

  const markThreadRead = useCallback((threadId: string) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)),
    }));
  }, []);

  const createPost = useCallback(
    (creatorId: string, input: PostInput): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión." };
      const creator = getCreator(state, creatorId);
      if (!creator) return { ok: false, message: "Creadora no encontrada." };
      if (user.role !== "creator" || user.creatorSlug !== creator.slug) {
        return { ok: false, message: "Solo la creadora puede publicar en su perfil." };
      }
      if (!input.title.trim() || !input.body.trim())
        return { ok: false, message: "Título y contenido son obligatorios." };
      if (input.visibility === "tier" && !input.tierId)
        return { ok: false, message: "Elige el tier que puede verlo." };
      const post: Post = {
        id: uid("p"),
        creatorId,
        title: input.title.trim(),
        excerpt: input.body.trim().slice(0, 140),
        body: input.body.trim(),
        visibility: input.visibility,
        tierId: input.tierId,
        priceMXN: input.priceMXN,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        cover: input.cover,
        tags: input.tags,
        mature: input.mature,
      };
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) =>
          c.id === creatorId ? { ...c, posts: [post, ...c.posts] } : c,
        ),
      }));
      return { ok: true, message: "Publicación creada y visible según su audiencia.", id: post.id };
    },
    [state, user],
  );

  const deletePost = useCallback(
    (creatorId: string, postId: string): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión." };
      const creator = getCreator(state, creatorId);
      if (!creator || user.role !== "creator" || user.creatorSlug !== creator.slug) {
        return { ok: false, message: "No puedes eliminar esta publicación." };
      }
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) =>
          c.id === creatorId ? { ...c, posts: c.posts.filter((p) => p.id !== postId) } : c,
        ),
      }));
      return { ok: true, message: "Publicación archivada." };
    },
    [state, user],
  );

  const saveTier = useCallback(
    (
      creatorId: string,
      tierId: string,
      patch: Partial<Pick<Tier, "name" | "priceMXN" | "tagline" | "perks" | "featured">>,
    ): ActionResult => {
      if (
        !user ||
        user.role !== "creator" ||
        user.creatorSlug !== getCreator(state, creatorId)?.slug
      ) {
        return { ok: false, message: "Solo la creadora puede editar sus planes." };
      }
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) =>
          c.id === creatorId
            ? { ...c, tiers: c.tiers.map((t) => (t.id === tierId ? { ...t, ...patch } : t)) }
            : c,
        ),
      }));
      return { ok: true, message: "Plan actualizado." };
    },
    [state, user],
  );

  const updateCreator = useCallback(
    (creatorId: string, patch: CreatorPatch): ActionResult => {
      if (
        !user ||
        user.role !== "creator" ||
        user.creatorSlug !== getCreator(state, creatorId)?.slug
      ) {
        return { ok: false, message: "Solo la creadora puede editar su perfil." };
      }
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) => (c.id === creatorId ? { ...c, ...patch } : c)),
      }));
      return { ok: true, message: "Perfil actualizado." };
    },
    [state, user],
  );

  const createRoom = useCallback(
    (creatorId: string, input: RoomInput): ActionResult => {
      if (
        !user ||
        user.role !== "creator" ||
        user.creatorSlug !== getCreator(state, creatorId)?.slug
      ) {
        return { ok: false, message: "Solo la creadora puede abrir salones." };
      }
      if (!input.title.trim()) return { ok: false, message: "El salón necesita un título." };
      const room: LiveRoom = {
        id: uid("r"),
        creatorId,
        title: input.title.trim(),
        description: input.description.trim(),
        status: "scheduled",
        access: input.access,
        ticketPriceMXN: input.ticketPriceMXN,
        startsAt: input.startsAt,
        durationMin: input.durationMin,
        viewers: 0,
        capacity: input.capacity,
        cover: "salon",
        tipsMXN: 0,
      };
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) =>
          c.id === creatorId ? { ...c, rooms: [room, ...c.rooms] } : c,
        ),
      }));
      return { ok: true, message: "Salón programado.", id: room.id };
    },
    [state, user],
  );

  const setRoomStatus = useCallback(
    (creatorId: string, roomId: string, status: LiveStatus): ActionResult => {
      if (
        !user ||
        user.role !== "creator" ||
        user.creatorSlug !== getCreator(state, creatorId)?.slug
      ) {
        return { ok: false, message: "No puedes cambiar este salón." };
      }
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) =>
          c.id === creatorId
            ? {
                ...c,
                rooms: c.rooms.map((r) =>
                  r.id === roomId
                    ? {
                        ...r,
                        status,
                        startsAt: status === "live" ? new Date().toISOString() : r.startsAt,
                        viewers: status === "ended" ? 0 : r.viewers,
                      }
                    : r,
                ),
              }
            : c,
        ),
      }));
      return {
        ok: true,
        message:
          status === "live"
            ? "Salón en vivo."
            : status === "ended"
              ? "Salón cerrado."
              : "Salón programado.",
      };
    },
    [state, user],
  );

  const liveTip = useCallback(
    (creatorId: string, roomId: string, amountMXN: number): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para enviar propinas." };
      if (amountMXN <= 0) return { ok: false, message: "Monto inválido." };
      const creator = getCreator(state, creatorId);
      if (!creator) return { ok: false, message: "Creadora no encontrada." };
      const purchase: Purchase = {
        id: uid("pu"),
        fanId: user.id,
        creatorId,
        kind: "tip",
        itemId: roomId,
        label: `Propina en vivo · ${creator.rooms.find((r) => r.id === roomId)?.title ?? "Salón"}`,
        amountMXN,
        createdAt: new Date().toISOString(),
        status: "delivered",
      };
      setState((prev) => ({
        ...prev,
        purchases: [purchase, ...prev.purchases],
        transactions: [
          priceTransaction(prev, creator, "tip", amountMXN, user.id),
          ...prev.transactions,
        ],
        creators: prev.creators.map((c) =>
          c.id === creatorId
            ? {
                ...c,
                rooms: c.rooms.map((r) =>
                  r.id === roomId
                    ? { ...r, tipsMXN: r.tipsMXN + amountMXN, viewers: r.viewers + 1 }
                    : r,
                ),
              }
            : c,
        ),
      }));
      return { ok: true, message: "Propina DEMO registrada. Sin cargo real." };
    },
    [state, user],
  );

  const createClip = useCallback(
    (creatorId: string, input: ClipInput): ActionResult => {
      if (
        !user ||
        user.role !== "creator" ||
        user.creatorSlug !== getCreator(state, creatorId)?.slug
      ) {
        return { ok: false, message: "Solo la creadora puede publicar clips." };
      }
      if (!input.title.trim()) return { ok: false, message: "El clip necesita un título." };
      const clip: Clip = {
        id: uid("c"),
        creatorId,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category.trim() || "Editorial",
        priceMXN: input.priceMXN,
        duration: input.duration.trim() || "00:00",
        cover: input.cover,
        sales: 0,
        createdAt: new Date().toISOString(),
        mature: input.mature,
      };
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) =>
          c.id === creatorId ? { ...c, clips: [clip, ...c.clips] } : c,
        ),
      }));
      return { ok: true, message: "Clip publicado en el marketplace.", id: clip.id };
    },
    [state, user],
  );

  const createOffer = useCallback(
    (creatorId: string, input: OfferInput): ActionResult => {
      if (
        !user ||
        user.role !== "creator" ||
        user.creatorSlug !== getCreator(state, creatorId)?.slug
      ) {
        return { ok: false, message: "Solo la creadora puede crear encargos." };
      }
      if (!input.title.trim()) return { ok: false, message: "El encargo necesita un título." };
      const offer: CustomOffer = {
        id: uid("o"),
        creatorId,
        kind: input.kind,
        title: input.title.trim(),
        description: input.description.trim(),
        priceMXN: input.priceMXN,
        turnaroundDays: input.turnaroundDays,
        slots: input.slots,
      };
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) =>
          c.id === creatorId ? { ...c, offers: [offer, ...c.offers] } : c,
        ),
      }));
      return { ok: true, message: "Oferta personalizada publicada." };
    },
    [state, user],
  );

  const completePurchase = useCallback(
    (purchaseId: string): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión." };
      const purchase = state.purchases.find((p) => p.id === purchaseId);
      if (!purchase) return { ok: false, message: "Compra no encontrada." };
      const creator = getCreator(state, purchase.creatorId);
      if (!creator || user.role !== "creator" || user.creatorSlug !== creator.slug) {
        return { ok: false, message: "Solo la creadora puede marcar el encargo como entregado." };
      }
      setState((prev) => ({
        ...prev,
        purchases: prev.purchases.map((p) =>
          p.id === purchaseId ? { ...p, status: "delivered" } : p,
        ),
        notifications: [
          notify(
            prev,
            purchase.fanId,
            "Encargo entregado",
            `${creator.name} marcó tu encargo como entregado.`,
            "/boveda",
          ),
          ...prev.notifications,
        ],
      }));
      return { ok: true, message: "Encargo marcado como entregado." };
    },
    [state, user],
  );

  const requestPayout = useCallback(
    (creatorId: string): ActionResult => {
      if (
        !user ||
        user.role !== "creator" ||
        user.creatorSlug !== getCreator(state, creatorId)?.slug
      ) {
        return { ok: false, message: "Solo la creadora puede solicitar retiros." };
      }
      const available = creatorAvailable(state, creatorId);
      if (available < 300)
        return { ok: false, message: "El mínimo de retiro DEMO es de $300 MXN." };
      setState((prev) => ({
        ...prev,
        payouts: [
          {
            id: uid("po"),
            creatorId,
            amountMXN: available,
            status: "requested",
            requestedAt: new Date().toISOString(),
            paidAt: null,
          },
          ...prev.payouts,
        ],
        notifications: [
          notify(
            prev,
            "u-admin",
            "Solicitud de retiro",
            `Retiro DEMO por ${available} MXN solicitado.`,
            "/admin",
          ),
          ...prev.notifications,
        ],
      }));
      return { ok: true, message: "Retiro DEMO solicitado. No se transfiere dinero real." };
    },
    [state, user],
  );

  const submitReport = useCallback(
    (input: {
      targetType: "creator" | "post" | "message" | "live";
      targetId: string;
      targetLabel: string;
      reason: string;
      details: string;
    }): ActionResult => {
      const report = {
        id: uid("rp"),
        reporterId: user?.id ?? null,
        reporterName: user?.name ?? "Visitante anónimo",
        targetType: input.targetType,
        targetId: input.targetId,
        targetLabel: input.targetLabel,
        reason: input.reason,
        details: input.details.trim(),
        status: "open" as const,
        resolution: "",
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        reports: [report, ...prev.reports],
        notifications: [
          notify(
            prev,
            "u-admin",
            "Nuevo reporte",
            `${input.reason} · ${input.targetLabel}`,
            "/admin",
          ),
          ...prev.notifications,
        ],
      }));
      return {
        ok: true,
        message: "Reporte recibido. Revisión por el equipo de confianza y seguridad.",
        id: report.id,
      };
    },
    [user],
  );

  const submitApplication = useCallback(
    (input: {
      name: string;
      email: string;
      city: string;
      categories: string[];
      socials: string;
      bio: string;
    }): ActionResult => {
      const app: Application = {
        id: uid("ap"),
        userId: user?.id ?? null,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        city: input.city.trim(),
        categories: input.categories,
        socials: input.socials.trim(),
        bio: input.bio.trim(),
        status: "pending",
        submittedAt: new Date().toISOString(),
        note: "",
      };
      setState((prev) => ({
        ...prev,
        applications: [app, ...prev.applications],
        notifications: [
          notify(
            prev,
            "u-admin",
            "Nueva solicitud de creadora",
            `${app.name} envió su solicitud.`,
            "/admin",
          ),
          ...prev.notifications,
        ],
      }));
      return { ok: true, message: "Solicitud enviada. Revisaremos tu perfil.", id: app.id };
    },
    [user],
  );

  const approveApplication = useCallback(
    (applicationId: string): ActionResult => {
      const app = state.applications.find((a) => a.id === applicationId);
      if (!app) return { ok: false, message: "Solicitud no encontrada." };
      if (app.status === "approved")
        return { ok: false, message: "La solicitud ya está aprobada." };
      let uniqueSlug = slugify(app.name) || uid("creadora");
      if (state.creators.some((c) => c.slug === uniqueSlug))
        uniqueSlug = `${uniqueSlug}-${Math.random().toString(36).slice(2, 5)}`;
      const creatorId = uid("cr");
      const creator: Creator = {
        id: creatorId,
        slug: uniqueSlug,
        name: app.name,
        handle: `@${uniqueSlug}`,
        headline: app.bio.slice(0, 90) || "Nueva creadora en XCLUSIVE.",
        bio: app.bio,
        city: app.city,
        country: "Por definir",
        categories: app.categories,
        tags: app.categories.map((c) => c.toLowerCase()),
        cover: "cherry",
        avatarTint: "#ed315c",
        status: "approved",
        verified: false,
        adult: false,
        aiAssisted: false,
        members: 0,
        followers: 0,
        rating: 5,
        responseTime: "24 h",
        joinedAt: new Date().toISOString(),
        revenueShare: state.settings.platformFeePct >= 20 ? 80 : 85,
        freeTrial: true,
        welcomeMessage: "Bienvenida. Estoy preparando mi primer set; gracias por llegar temprano.",
        aiAssistant: state.settings.aiEnabled,
        affiliateCode: `XCL${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        socials: app.socials ? [{ label: "Redes", value: app.socials }] : [],
        tiers: defaultTiers(creatorId),
        posts: [],
        clips: [],
        rooms: [],
        offers: [],
        bundles: [],
      };
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === applicationId
            ? { ...a, status: "approved", note: "Aprobada. Perfil creado." }
            : a,
        ),
        creators: [creator, ...prev.creators],
        users: prev.users.map((u) => (u.id === app.userId ? { ...u, creatorSlug: uniqueSlug } : u)),
        referrals: [
          {
            id: uid("rf"),
            code: creator.affiliateCode,
            creatorId,
            clicks: 0,
            signups: 0,
            earningsMXN: 0,
          },
          ...prev.referrals,
        ],
        notifications: app.userId
          ? [
              notify(
                prev,
                app.userId,
                "Solicitud aprobada",
                "Tu perfil de creadora ya está activo. Completa tu estudio.",
                "/estudio",
              ),
              ...prev.notifications,
            ]
          : prev.notifications,
      }));
      return { ok: true, message: "Solicitud aprobada y perfil creado.", id: creatorId };
    },
    [state.applications, state.creators, state.settings],
  );

  const rejectApplication = useCallback((applicationId: string): ActionResult => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "rejected",
              note: "Rechazada en revisión DEMO. Puede volver a postular.",
            }
          : a,
      ),
    }));
    return { ok: true, message: "Solicitud rechazada. Se conserva el registro." };
  }, []);

  const resolveReport = useCallback(
    (reportId: string, resolution: string): ActionResult => {
      const report = state.reports.find((r) => r.id === reportId);
      if (!report) return { ok: false, message: "Reporte no encontrado." };
      setState((prev) => ({
        ...prev,
        reports: prev.reports.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: "resolved",
                resolution: resolution.trim() || "Revisado por el equipo de confianza.",
              }
            : r,
        ),
        notifications: report.reporterId
          ? [
              notify(
                prev,
                report.reporterId,
                "Reporte resuelto",
                resolution.trim() || "Revisado por el equipo de confianza.",
                "/cuenta",
              ),
              ...prev.notifications,
            ]
          : prev.notifications,
      }));
      return { ok: true, message: "Reporte resuelto y archivado." };
    },
    [state.reports],
  );

  const markPayoutPaid = useCallback(
    (payoutId: string): ActionResult => {
      const payout = state.payouts.find((p) => p.id === payoutId);
      if (!payout) return { ok: false, message: "Retiro no encontrado." };
      setState((prev) => ({
        ...prev,
        payouts: prev.payouts.map((p) =>
          p.id === payoutId ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p,
        ),
        notifications: [
          notify(
            prev,
            creatorUser(prev, payout.creatorId)?.id ?? "u-admin",
            "Retiro DEMO pagado",
            "El retiro fue marcado como pagado en el libro de demostración.",
            "/estudio",
          ),
          ...prev.notifications,
        ],
      }));
      return { ok: true, message: "Retiro marcado como pagado (DEMO)." };
    },
    [state.payouts],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => {
      const settings = { ...prev.settings, ...patch };
      return {
        ...prev,
        settings,
        currency: patch.defaultCurrency ?? prev.currency,
      };
    });
  }, []);

  const setCreatorShare = useCallback((creatorId: string, share: number): ActionResult => {
    const safe = Math.max(50, Math.min(100, Math.round(share)));
    setState((prev) => ({
      ...prev,
      creators: prev.creators.map((c) => (c.id === creatorId ? { ...c, revenueShare: safe } : c)),
    }));
    return { ok: true, message: `Reparto actualizado a ${safe}% para la creadora.` };
  }, []);

  const setCreatorStatus = useCallback(
    (creatorId: string, status: Creator["status"]): ActionResult => {
      setState((prev) => ({
        ...prev,
        creators: prev.creators.map((c) => (c.id === creatorId ? { ...c, status } : c)),
      }));
      return {
        ok: true,
        message:
          status === "approved"
            ? "Perfil aprobado y visible."
            : status === "suspended"
              ? "Perfil suspendido."
              : "Perfil en revisión.",
      };
    },
    [],
  );

  const submitDataRequest = useCallback(
    (type: DataRequest["type"], details: string): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para ejercer tus derechos ARCO." };
      const now = new Date().toISOString();
      const request: DataRequest = {
        id: uid("dr"),
        userId: user.id,
        userName: user.name,
        email: user.email,
        type,
        details: details.trim() || "Solicitud sin detalle adicional.",
        status: "recibida",
        createdAt: now,
        dueAt: addDaysISO(now, 20),
      };
      setState((prev) => ({
        ...prev,
        dataRequests: [request, ...prev.dataRequests],
        notifications: [
          notify(
            prev,
            "u-admin",
            "Nueva solicitud ARCO",
            `${request.type} · ${request.email}`,
            "/admin",
          ),
          ...prev.notifications,
        ],
      }));
      return {
        ok: true,
        message: "Solicitud ARCO recibida. Plazo de respuesta: hasta 20 días hábiles.",
        id: request.id,
      };
    },
    [user],
  );

  const resolveDataRequest = useCallback((requestId: string) => {
    setState((prev) => ({
      ...prev,
      dataRequests: prev.dataRequests.map((r) =>
        r.id === requestId ? { ...r, status: "resuelta" } : r,
      ),
    }));
  }, []);

  const acceptLegal = useCallback(
    (docIds: string[]): ActionResult => {
      if (!user) return { ok: false, message: "Inicia sesión para registrar tu aceptación." };
      const unique = Array.from(new Set(docIds)).filter((id) => legalDoc(id) !== null);
      if (unique.length === 0) return { ok: false, message: "No hay documentos para aceptar." };
      const missing = unique.filter(
        (docId) =>
          !user.legalAcceptances.some(
            (a) => a.docId === docId && a.docVersion === state.settings.termsVersion,
          ),
      );
      if (missing.length === 0)
        return { ok: true, message: "Tu aceptación ya está registrada para esta versión." };
      const records = missing.map((docId) => makeAcceptance(user.id, docId, "cuenta"));
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === user.id ? { ...u, legalAcceptances: [...records, ...u.legalAcceptances] } : u,
        ),
      }));
      return {
        ok: true,
        message: `Aceptación registrada (${records.length} documento${records.length === 1 ? "" : "s"}).`,
      };
    },
    [state.settings.termsVersion, user],
  );

  const markNotificationRead = useCallback((notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const canViewPost = useCallback(
    (post: Post): boolean => canViewPostSelector(state, post, user?.id ?? null),
    [state, user],
  );

  const hasPurchasedAction = useCallback(
    (itemId: string): boolean => hasPurchased(state, user?.id ?? null, itemId),
    [state, user],
  );

  const purchaseForAction = useCallback(
    (itemId: string): Purchase | null => purchaseFor(state, user?.id ?? null, itemId),
    [state, user],
  );

  const api: AppApi = {
    state,
    user,
    hydrated,
    login,
    signup,
    logout,
    resetDemo,
    setCurrency,
    setAgeVerified,
    setCookieConsent,
    toggleFavorite,
    subscribe,
    cancelSubscription,
    tip,
    unlock,
    startThread,
    sendMessage,
    creatorReply,
    markThreadRead,
    createPost,
    deletePost,
    saveTier,
    updateCreator,
    createRoom,
    setRoomStatus,
    liveTip,
    createClip,
    createOffer,
    completePurchase,
    requestPayout,
    submitReport,
    submitApplication,
    approveApplication,
    rejectApplication,
    resolveReport,
    markPayoutPaid,
    updateSettings,
    setCreatorShare,
    setCreatorStatus,
    submitDataRequest,
    resolveDataRequest,
    acceptLegal,
    markNotificationRead,
    canViewPost,
    hasPurchased: hasPurchasedAction,
    purchaseFor: purchaseForAction,
  };

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp(): AppApi {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>.");
  return ctx;
}

export function useCreatorBySlug(slug: string): Creator | null {
  const { state } = useApp();
  return getCreatorBySlug(state, slug);
}

export function useMyCreator(): Creator | null {
  const { state, user } = useApp();
  if (!user || !user.creatorSlug) return null;
  return getCreatorBySlug(state, user.creatorSlug);
}

export function useDashboardData(creatorId: string | null) {
  const { state } = useApp();
  if (!creatorId) {
    return {
      creator: null,
      transactions: [],
      net: 0,
      available: 0,
    };
  }
  return {
    creator: getCreator(state, creatorId),
    transactions: creatorTransactions(state, creatorId),
    net: creatorNet(state, creatorId),
    available: creatorAvailable(state, creatorId),
  };
}

export const DEMO_ACCOUNTS = [
  {
    role: "Fan",
    name: "Alex Rivera",
    email: "fan@xclusive.demo",
    password: "demo1234",
    description: "Membresías, compras, bóveda y mensajes.",
  },
  {
    role: "Creadora",
    name: "Valentina R.",
    email: "valentina@xclusive.demo",
    password: "demo1234",
    description: "Estudio, contenido, ingresos y retiros.",
  },
  {
    role: "Administración",
    name: "Dirección Xclusive",
    email: "admin@xclusive.demo",
    password: "demo1234",
    description: "Solicitudes, moderación, pagos y white-label.",
  },
] as const;

export { hasAcceptedCurrent };
