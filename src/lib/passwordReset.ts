import { createHash, randomBytes } from "crypto";

import { db } from "@/lib/db";

const PASSWORD_RESET_TOKEN_DURATION_MS = 60 * 60 * 1000;

export const hashPasswordResetToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

export const createPasswordResetToken = (userId: number) => {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_TOKEN_DURATION_MS,
  ).toISOString();

  const replaceToken = db.transaction(() => {
    db.prepare(
      `
        DELETE FROM password_reset_tokens
        WHERE user_id = ?
      `,
    ).run(userId);

    db.prepare(
      `
        INSERT INTO password_reset_tokens (
          user_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?)
      `,
    ).run(userId, tokenHash, expiresAt);
  });

  replaceToken();

  return {
    token,
    expiresAt,
  };
};
