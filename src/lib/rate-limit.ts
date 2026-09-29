import { db } from "@/lib/db";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  api: { maxRequests: 100, windowMs: 60 * 1000 },
  report: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  comment: { maxRequests: 30, windowMs: 60 * 1000 },
  upload: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
};

export async function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = "api"
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const config = RATE_LIMITS[type];
  const key = `${type}:${identifier}`;
  const now = new Date();
  const expireAt = new Date(now.getTime() + config.windowMs);

  await db.rateLimit.deleteMany({
    where: { expireAt: { lt: now } },
  });

  const existing = await db.rateLimit.findUnique({ where: { key } });

  if (!existing) {
    await db.rateLimit.create({
      data: { key, points: 1, expireAt },
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: expireAt };
  }

  if (existing.points >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.expireAt };
  }

  await db.rateLimit.update({
    where: { key },
    data: { points: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: config.maxRequests - existing.points - 1,
    resetAt: existing.expireAt,
  };
}

export function rateLimitResponse(resetAt: Date) {
  return new Response(
    JSON.stringify({ error: "Too many requests. Try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(
          Math.ceil((resetAt.getTime() - Date.now()) / 1000)
        ),
      },
    }
  );
}
