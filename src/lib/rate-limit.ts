/**
 * Rate limiter.
 *
 * En production (serverless), la mémoire n'est pas partagée entre instances :
 * définir UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN pour un comptage
 * distribué fiable. Sans ces variables, on retombe sur un compteur en mémoire
 * (utile en local / mono-instance uniquement).
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of attempts) {
      if (now > value.resetAt) attempts.delete(key);
    }
  }, 5 * 60 * 1000);
}

type Result = { success: boolean; retryAfterSeconds?: number };
type Opts = { maxAttempts: number; windowMs: number };

/** Compteur en mémoire (synchrone). Ne partage rien entre instances serverless. */
export function rateLimit(key: string, { maxAttempts, windowMs }: Opts): Result {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= maxAttempts) {
    return { success: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { success: true };
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstash(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(`${UPSTASH_URL}/${command.map((c) => encodeURIComponent(String(c))).join("/")}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const json = (await res.json()) as { result: unknown };
  return json.result;
}

/**
 * Vérifie la limite. Utilise Redis (Upstash REST) si configuré, sinon le
 * compteur en mémoire. À utiliser sur les chemins sensibles (login, inscription,
 * reset, soumission d'avis…).
 */
export async function checkRateLimit(key: string, opts: Opts): Promise<Result> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return rateLimit(key, opts);
  }

  const redisKey = `rl:${key}`;
  try {
    const count = Number(await upstash(["INCR", redisKey]));
    if (count === 1) {
      await upstash(["PEXPIRE", redisKey, opts.windowMs]);
    }
    if (count > opts.maxAttempts) {
      const ttl = Number(await upstash(["PTTL", redisKey]));
      return { success: false, retryAfterSeconds: Math.max(1, Math.ceil(ttl / 1000)) };
    }
    return { success: true };
  } catch (err) {
    console.error("[rate-limit] Upstash error, falling back to memory:", err);
    return rateLimit(key, opts);
  }
}
