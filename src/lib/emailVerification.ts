import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

const EMAIL_VERIFICATION_TOKEN_DURATION_MS = 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;

type EmailVerificationTokenCreatedRow = {
  created_at: string;
};

export const canResendEmailVerification = (userId: number) => {
  const token = db
    .prepare(
      `
        SELECT created_at
        FROM email_verification_tokens
        WHERE user_id = ?
      `,
    )
    .get(userId) as EmailVerificationTokenCreatedRow | undefined;

  if (!token) {
    return true;
  }

  const createdAt = new Date(`${token.created_at}Z`).getTime();

  return Date.now() - createdAt >= EMAIL_VERIFICATION_RESEND_COOLDOWN_MS;
};

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

type EmailVerificationTokenRow = {
  user_id: number;
  expires_at: string;
  email_verified_at: string | null;
};

type VerifyEmailResult =
  | { success: true }
  | {
      success: false;
      reason: "INVALID_TOKEN" | "EXPIRED_TOKEN";
    };

export const verifyEmailToken = (token: string): VerifyEmailResult => {
  const tokenHash = hashEmailVerificationToken(token);

  const tokenRow = db
    .prepare(
      `
        SELECT
          email_verification_tokens.user_id,
          email_verification_tokens.expires_at,
          users.email_verified_at
        FROM email_verification_tokens
        JOIN users
          ON users.id = email_verification_tokens.user_id
        WHERE email_verification_tokens.token_hash = ?
      `,
    )
    .get(tokenHash) as EmailVerificationTokenRow | undefined;

  if (!tokenRow) {
    return {
      success: false,
      reason: "INVALID_TOKEN",
    };
  }

  if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
    db.prepare(
      `
        DELETE FROM email_verification_tokens
        WHERE token_hash = ?
      `,
    ).run(tokenHash);

    return {
      success: false,
      reason: "EXPIRED_TOKEN",
    };
  }

  const verifyEmail = db.transaction(() => {
    if (!tokenRow.email_verified_at) {
      db.prepare(
        `
          UPDATE users
          SET email_verified_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
      ).run(tokenRow.user_id);
    }

    db.prepare(
      `
        DELETE FROM email_verification_tokens
        WHERE token_hash = ?
      `,
    ).run(tokenHash);
  });

  verifyEmail();

  return {
    success: true,
  };
};
