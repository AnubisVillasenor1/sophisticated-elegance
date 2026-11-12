/* XCLUSIVE — modelo de dominio del prototipo funcional (Modo DEMO).
 * Todos los importes están expresados en MXN y se convierten para exhibición.
 * Ninguna operación de este prototipo genera cargos, saldos ni transferencias reales.
 */

export type Role = "fan" | "creator" | "admin";
export type Currency = "MXN" | "USD" | "EUR";
export type CreatorStatus = "approved" | "pending" | "suspended";

export type CoverKey =
  | "portrait"
  | "salon"
  | "noir"
  | "sol"
  | "mystic"
  | "vinyl"
  | "vale"
  | "art"
  | "marea"
  | "jade"
  | "ai"
  | "obsidian"
  | "cherry"
  | "amber"
  | "rose"
  | "atrio"
  | "boveda";

export type Tier = {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  priceMXN: number;
  tagline: string;
  perks: string[];
  featured: boolean;
};

export type PostVisibility = "public" | "members" | "tier" | "ppv" | "vault";

export type Post = {
  id: string;
  creatorId: string;
  title: string;
  excerpt: string;
  body: string;
  visibility: PostVisibility;
  tierId: string | null;
  priceMXN: number;
  createdAt: string;
  likes: number;
  comments: number;
  cover: CoverKey;
  tags: string[];
  mature: boolean;
};

export type Clip = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  priceMXN: number;
  duration: string;
  cover: CoverKey;
  sales: number;
  createdAt: string;
  mature: boolean;
};

export type LiveStatus = "live" | "scheduled" | "ended";
export type LiveAccess = "free" | "members" | "ticket";

export type LiveRoom = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  status: LiveStatus;
  access: LiveAccess;
  ticketPriceMXN: number;
  startsAt: string;
  durationMin: number;
  viewers: number;
  capacity: number;
  cover: CoverKey;
  tipsMXN: number;
};

export type OfferKind = "custom" | "call" | "audio";

export type CustomOffer = {
  id: string;
  creatorId: string;
  kind: OfferKind;
  title: string;
  description: string;
  priceMXN: number;
  turnaroundDays: number;
  slots: number;
};

export type Bundle = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  items: string[];
  priceMXN: number;
  originalPriceMXN: number;
};

export type Creator = {
  id: string;
  slug: string;
  name: string;
  handle: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  categories: string[];
  tags: string[];
  cover: CoverKey;
  /** Retrato editorial opcional. Si falta, la portada usa el Cover procedural. */
  image?: string;
  avatarTint: string;
  status: CreatorStatus;
  verified: boolean;
  adult: boolean;
  aiAssisted: boolean;
  members: number;
  followers: number;
  rating: number;
  responseTime: string;
  joinedAt: string;
  revenueShare: number;
  freeTrial: boolean;
  welcomeMessage: string;
  aiAssistant: boolean;
  affiliateCode: string;
  socials: { label: string; value: string }[];
  tiers: Tier[];
  posts: Post[];
  clips: Clip[];
  rooms: LiveRoom[];
  offers: CustomOffer[];
  bundles: Bundle[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  creatorSlug: string | null;
  joinedAt: string;
  avatarTint: string;
  referralCode: string;
  referredByCode?: string | null;
  legalAcceptances: LegalAcceptance[];
};

export type LegalAcceptance = {
  id: string;
  docId: string;
  docVersion: string;
  acceptedAt: string;
  hash: string;
  channel: "registro" | "cuenta" | "creadora";
};

export type DataRequestType = "acceso" | "rectificacion" | "cancelacion" | "oposicion";

export type DataRequest = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  type: DataRequestType;
  details: string;
  status: "recibida" | "en_revision" | "resuelta";
  createdAt: string;
  dueAt: string;
};

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  decidedAt: string;
};

export type Subscription = {
  id: string;
  fanId: string;
  creatorId: string;
  tierId: string;
  status: "active" | "cancelled";
  startedAt: string;
  renewsAt: string;
  priceMXN: number;
  trial: boolean;
  autoRenew: boolean;
};

export type PurchaseKind = "ppv" | "clip" | "bundle" | "custom" | "ticket" | "tip" | "subscription";

export type Purchase = {
  id: string;
  fanId: string;
  creatorId: string;
  kind: PurchaseKind;
  itemId: string;
  label: string;
  amountMXN: number;
  createdAt: string;
  status: "paid" | "in_progress" | "delivered";
};

export type Transaction = {
  id: string;
  creatorId: string;
  fanId: string | null;
  kind: PurchaseKind;
  grossMXN: number;
  feeMXN: number;
  netMXN: number;
  createdAt: string;
  status: "settled" | "pending";
};

export type Payout = {
  id: string;
  creatorId: string;
  amountMXN: number;
  status: "requested" | "paid";
  requestedAt: string;
  paidAt: string | null;
};

export type Message = {
  id: string;
  from: "fan" | "creator" | "ai";
  body: string;
  at: string;
  attachedClipId: string | null;
  attachedPostId: string | null;
};

export type Thread = {
  id: string;
  creatorId: string;
  fanId: string | null;
  fanName: string;
  fanTint: string;
  messages: Message[];
  unread: number;
  updatedAt: string;
  automated: boolean;
  blocked: boolean;
};

export type ReportTarget = "creator" | "post" | "message" | "live";

export type Report = {
  id: string;
  reporterId: string | null;
  reporterName: string;
  targetType: ReportTarget;
  targetId: string;
  targetLabel: string;
  reason: string;
  details: string;
  status: "open" | "reviewing" | "resolved";
  resolution: string;
  createdAt: string;
};

export type Application = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  city: string;
  categories: string[];
  socials: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  note: string;
};

export type Referral = {
  id: string;
  code: string;
  creatorId: string;
  clicks: number;
  signups: number;
  earningsMXN: number;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string | null;
};

export type Settings = {
  brandName: string;
  tagline: string;
  supportEmail: string;
  privacyEmail: string;
  legalEmail: string;
  domain: string;
  accent: string;
  defaultCurrency: Currency;
  platformFeePct: number;
  whiteLabel: boolean;
  aiEnabled: boolean;
  liveEnabled: boolean;
  adultEnabled: boolean;
  maintenance: boolean;
  termsVersion: string;
};

export type AppState = {
  version: number;
  hydrated: boolean;
  sessionUserId: string | null;
  users: User[];
  creators: Creator[];
  subscriptions: Subscription[];
  purchases: Purchase[];
  transactions: Transaction[];
  payouts: Payout[];
  threads: Thread[];
  reports: Report[];
  applications: Application[];
  referrals: Referral[];
  notifications: Notification[];
  dataRequests: DataRequest[];
  favorites: string[];
  cookieConsent: CookieConsent | null;
  ageVerified: boolean;
  currency: Currency;
  settings: Settings;
};

export type ActionResult = {
  ok: boolean;
  message: string;
  id?: string;
};

export type AuthResult = ActionResult & {
  role?: Role;
  creatorSlug?: string | null;
};
