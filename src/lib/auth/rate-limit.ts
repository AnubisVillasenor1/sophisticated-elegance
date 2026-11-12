/**
 * Limitador de tasa en memoria para server functions.
 *
 * Suficiente para una sola instancia (Vercel Serverless: por instancia). No
 * sustituye un limitador distribuido; se documenta como limitación conocida.
 * El limitador real de los endpoints de Supabase Auth lo aplica Supabase.
 */
export type Bucket = { count: number; resetAt: number };

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export function consumeRateLimit(
  buckets: Map<string, Bucket>,
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  if (!Number.isFinite(limit) || limit <= 0) {
    return { allowed: false, remaining: 0, retryAfterMs: windowMs };
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, current.resetAt - now) };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfterMs: 0 };
}
