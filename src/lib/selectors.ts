import type {
  AppState,
  Creator,
  Post,
  Purchase,
  Subscription,
  Thread,
  Tier,
  Transaction,
  User,
} from "./types";

export function uid(prefix: string): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rnd}`;
}

export function getCreator(state: AppState, id: string): Creator | null {
  return state.creators.find((c) => c.id === id) ?? null;
}

export function getCreatorBySlug(state: AppState, slug: string): Creator | null {
  return state.creators.find((c) => c.slug === slug) ?? null;
}

export function getUser(state: AppState, id: string): User | null {
  return state.users.find((u) => u.id === id) ?? null;
}

export function currentUser(state: AppState): User | null {
  if (!state.sessionUserId) return null;
  return getUser(state, state.sessionUserId);
}

export function getTier(creator: Creator, tierId: string): Tier | null {
  return creator.tiers.find((t) => t.id === tierId) ?? null;
}

export function activeSubscription(
  state: AppState,
  fanId: string,
  creatorId: string,
): Subscription | null {
  return (
    state.subscriptions.find(
      (s) => s.fanId === fanId && s.creatorId === creatorId && s.status === "active",
    ) ?? null
  );
}

export function subscriptionForTier(
  state: AppState,
  fanId: string,
  creatorId: string,
  tierId: string,
): Subscription | null {
  return (
    state.subscriptions.find(
      (s) => s.fanId === fanId && s.creatorId === creatorId && s.tierId === tierId,
    ) ?? null
  );
}

export function hasPurchased(state: AppState, fanId: string | null, itemId: string): boolean {
  if (!fanId) return false;
  return state.purchases.some((p) => p.fanId === fanId && p.itemId === itemId);
}

export function purchaseFor(
  state: AppState,
  fanId: string | null,
  itemId: string,
): Purchase | null {
  if (!fanId) return null;
  return state.purchases.find((p) => p.fanId === fanId && p.itemId === itemId) ?? null;
}

export function requiredTierLevel(state: AppState, post: Post): number {
  if (post.visibility !== "tier") return 0;
  const creator = getCreator(state, post.creatorId);
  if (!creator) return 0;
  const tier = creator.tiers.find((t) => t.id === post.tierId);
  return tier?.level ?? 1;
}

export function canViewPost(state: AppState, post: Post, fanId: string | null): boolean {
  if (post.visibility === "public") return true;
  if (!fanId) return false;
  if (post.visibility === "ppv") return hasPurchased(state, fanId, post.id);
  const sub = activeSubscription(state, fanId, post.creatorId);
  if (!sub) return false;
  if (post.visibility === "members") return true;
  if (post.visibility === "vault") {
    const creator = getCreator(state, post.creatorId);
    const tier = creator?.tiers.find((t) => t.id === sub.tierId);
    return (tier?.level ?? 0) >= 2;
  }
  if (post.visibility === "tier") {
    const creator = getCreator(state, post.creatorId);
    const current = creator?.tiers.find((t) => t.id === sub.tierId);
    return (current?.level ?? 0) >= requiredTierLevel(state, post);
  }
  return false;
}

export function fanSubscriptions(state: AppState, fanId: string): Subscription[] {
  return state.subscriptions.filter((s) => s.fanId === fanId);
}

export function fanPurchases(state: AppState, fanId: string): Purchase[] {
  return state.purchases.filter((p) => p.fanId === fanId);
}

export function creatorTransactions(state: AppState, creatorId: string): Transaction[] {
  return state.transactions
    .filter((t) => t.creatorId === creatorId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function creatorGross(state: AppState, creatorId: string): number {
  return creatorTransactions(state, creatorId).reduce((sum, t) => sum + t.grossMXN, 0);
}

export function creatorNet(state: AppState, creatorId: string): number {
  return creatorTransactions(state, creatorId).reduce((sum, t) => sum + t.netMXN, 0);
}

export function creatorPaidOut(state: AppState, creatorId: string): number {
  return state.payouts
    .filter((p) => p.creatorId === creatorId && p.status === "paid")
    .reduce((sum, p) => sum + p.amountMXN, 0);
}

export function creatorRequestedOut(state: AppState, creatorId: string): number {
  return state.payouts
    .filter((p) => p.creatorId === creatorId && p.status === "requested")
    .reduce((sum, p) => sum + p.amountMXN, 0);
}

export function creatorAvailable(state: AppState, creatorId: string): number {
  return Math.max(
    0,
    creatorNet(state, creatorId) -
      creatorPaidOut(state, creatorId) -
      creatorRequestedOut(state, creatorId),
  );
}

export function creatorThreads(state: AppState, creatorId: string): Thread[] {
  return state.threads
    .filter((t) => t.creatorId === creatorId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function fanThreads(state: AppState, fanId: string): Thread[] {
  return state.threads
    .filter((t) => t.fanId === fanId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function unreadForUser(state: AppState, user: User): number {
  if (user.role === "creator" && user.creatorSlug) {
    const creator = getCreatorBySlug(state, user.creatorSlug);
    if (!creator) return 0;
    return creatorThreads(state, creator.id).reduce((sum, t) => sum + t.unread, 0);
  }
  if (user.role === "fan") {
    return fanThreads(state, user.id).reduce((sum, t) => sum + t.unread, 0);
  }
  return 0;
}

export function userNotifications(state: AppState, userId: string) {
  return state.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function creatorMembers(state: AppState, creatorId: string): number {
  return state.subscriptions.filter((s) => s.creatorId === creatorId && s.status === "active")
    .length;
}

export function creatorTips(state: AppState, creatorId: string): number {
  return creatorTransactions(state, creatorId)
    .filter((t) => t.kind === "tip")
    .reduce((sum, t) => sum + t.grossMXN, 0);
}

export function creatorRevenueShare(creator: Creator): number {
  return creator.revenueShare;
}

export function creatorFeePct(creator: Creator): number {
  return 100 - creator.revenueShare;
}

export function platformMetrics(state: AppState) {
  const gross = state.transactions.reduce((sum, t) => sum + t.grossMXN, 0);
  const net = state.transactions.reduce((sum, t) => sum + t.netMXN, 0);
  const fee = state.transactions.reduce((sum, t) => sum + t.feeMXN, 0);
  const activeMembers = state.subscriptions.filter((s) => s.status === "active").length;
  const openReports = state.reports.filter((r) => r.status !== "resolved").length;
  const pendingApps = state.applications.filter((a) => a.status === "pending").length;
  const pendingPayouts = state.payouts.filter((p) => p.status === "requested");
  return {
    gross,
    net,
    fee,
    activeMembers,
    openReports,
    pendingApps,
    pendingPayouts,
    creators: state.creators.length,
    users: state.users.length,
    purchases: state.purchases.length,
  };
}

export function monthlySeries(
  state: AppState,
  creatorId: string,
): { label: string; gross: number; net: number }[] {
  const months = ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov"];
  const buckets = months.map((label) => ({ label, gross: 0, net: 0 }));
  creatorTransactions(state, creatorId).forEach((t) => {
    const d = new Date(t.createdAt);
    const month = d.getUTCMonth();
    const bucket = month >= 5 && month <= 10 ? buckets[month - 5] : undefined;
    if (!bucket) return;
    bucket.gross += t.grossMXN;
    bucket.net += t.netMXN;
  });
  return buckets;
}

export function weeklySeries(state: AppState, creatorId: string): number[] {
  const weeks = [0, 0, 0, 0, 0, 0, 0, 0];
  const now = new Date("2026-11-09T18:00:00.000Z").getTime();
  creatorTransactions(state, creatorId).forEach((t) => {
    const diff = Math.floor((now - new Date(t.createdAt).getTime()) / (7 * 86_400_000));
    if (diff >= 0 && diff < weeks.length) {
      const idx = weeks.length - 1 - diff;
      weeks[idx] = (weeks[idx] ?? 0) + t.grossMXN;
    }
  });
  return weeks;
}

export function topCreators(state: AppState, limit = 6): Creator[] {
  return [...state.creators]
    .filter((c) => c.status === "approved")
    .sort((a, b) => b.members - a.members)
    .slice(0, limit);
}

export function creatorsByIds(state: AppState, ids: string[]): Creator[] {
  return ids.map((id) => getCreator(state, id)).filter((c): c is Creator => c !== null);
}

export function liveNow(state: AppState) {
  return state.creators.flatMap((c) =>
    c.rooms.filter((r) => r.status === "live").map((r) => ({ creator: c, room: r })),
  );
}

export function upcomingLive(state: AppState) {
  return state.creators
    .flatMap((c) =>
      c.rooms.filter((r) => r.status === "scheduled").map((r) => ({ creator: c, room: r })),
    )
    .sort((a, b) => (a.room.startsAt > b.room.startsAt ? 1 : -1));
}

export function allClips(state: AppState) {
  return state.creators.flatMap((c) => c.clips.map((clip) => ({ creator: c, clip })));
}

export function allLive(state: AppState) {
  return state.creators.flatMap((c) => c.rooms.map((room) => ({ creator: c, room })));
}

export function hasAcceptedCurrent(
  state: AppState,
  user: User,
  docIds: readonly string[],
): boolean {
  return docIds.every((docId) =>
    user.legalAcceptances.some(
      (a) => a.docId === docId && a.docVersion === state.settings.termsVersion,
    ),
  );
}

export function acceptanceProgress(state: AppState, user: User, docIds: readonly string[]): number {
  if (docIds.length === 0) return 100;
  const done = docIds.filter((docId) =>
    user.legalAcceptances.some(
      (a) => a.docId === docId && a.docVersion === state.settings.termsVersion,
    ),
  ).length;
  return Math.round((done / docIds.length) * 100);
}
