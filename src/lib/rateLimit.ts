import { createHash } from "crypto";
import { db } from "@/lib/db";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitRow = {
  attempts: number;
  expires_at: number;
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

const removeExpiredLimits = db.prepare(`
  DELETE FROM rate_limits
  WHERE expires_at <= ?
`);

const findRateLimit = db.prepare(`
  SELECT attempts, expires_at
  FROM rate_limits
  WHERE key = ?
`);

const insertRateLimit = db.prepare(`
  INSERT INTO rate_limits (key, attempts, expires_at)
  VALUES (?, 1, ?)
`);

const incrementAttempts = db.prepare(`
  UPDATE rate_limits
  SET attempts = attempts + 1
  WHERE key = ?
`);

const consumeAttempt = db.transaction(
  (keyHash: string, limit: number, windowMs: number): RateLimitResult => {
    const now = Date.now();

    removeExpiredLimits.run(now);

    const existing = findRateLimit.get(keyHash) as RateLimitRow | undefined;

    if (!existing) {
      insertRateLimit.run(keyHash, now + windowMs);

      return { allowed: true };
    }

    if (existing.attempts >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.expires_at - now) / 1000),
        ),
      };
    }

    incrementAttempts.run(keyHash);

    return { allowed: true };
  },
);

export const consumeRateLimit = ({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult => {
  if (
    !key ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger(windowMs) ||
    windowMs < 1
  ) {
    throw new Error("Invalid rate limit configuration");
  }

  const keyHash = createHash("sha256").update(key).digest("hex");

  return consumeAttempt.immediate(keyHash, limit, windowMs);
};
