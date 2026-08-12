import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

const EMAIL_VERIFICATION_TOKEN_DURATION_MS = 24 * 60 * 60 * 1000;

export const hashEmailVerificationToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

export const createEmailVerificationToken = (userId: number) => {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashEmailVerificationToken(token);
  const expiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_TOKEN_DURATION_MS,
  ).toISOString();

  const replaceToken = db.transaction(() => {
    db.prepare(
      `
      DELETE FROM email_verification_tokens
      WHERE user_id = ?
    `,
    ).run(userId);

    db.prepare(
      `
      INSERT INTO email_verification_tokens (
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
