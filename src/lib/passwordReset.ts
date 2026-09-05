import { createHash, randomBytes } from "crypto";

import { db } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/password";
import { deleteUserSessions } from "@/lib/session";

const PASSWORD_RESET_TOKEN_DURATION_MS = 60 * 60 * 1000;
const PASSWORD_RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

export const hashPasswordResetToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

type PasswordResetTokenCreatedRow = {
  created_at: string;
};

export const canRequestPasswordReset = (userId: number) => {
  const token = db
    .prepare(
      `
        SELECT created_at
        FROM password_reset_tokens
        WHERE user_id = ?
      `,
    )
    .get(userId) as PasswordResetTokenCreatedRow | undefined;

  if (!token) {
    return true;
  }

  const createdAt = new Date(`${token.created_at}Z`).getTime();

  return Date.now() - createdAt >= PASSWORD_RESET_REQUEST_COOLDOWN_MS;
};

export const deletePasswordResetTokensForUser = (userId: number) => {
  db.prepare(
    `
      DELETE FROM password_reset_tokens
      WHERE user_id = ?
    `,
  ).run(userId);
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

type PasswordResetTokenRow = {
  user_id: number;
  expires_at: string;
};

export type ValidatePasswordResetTokenResult =
  | {
      success: true;
      userId: number;
    }
  | {
      success: false;
      reason: "INVALID_TOKEN" | "EXPIRED_TOKEN";
    };

export const validatePasswordResetToken = (
  token: string,
): ValidatePasswordResetTokenResult => {
  const tokenHash = hashPasswordResetToken(token);

  const tokenRow = db
    .prepare(
      `
        SELECT user_id, expires_at
        FROM password_reset_tokens
        WHERE token_hash = ?
      `,
    )
    .get(tokenHash) as PasswordResetTokenRow | undefined;

  if (!tokenRow) {
    return {
      success: false,
      reason: "INVALID_TOKEN",
    };
  }

  if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
    db.prepare(
      `
        DELETE FROM password_reset_tokens
        WHERE token_hash = ?
      `,
    ).run(tokenHash);

    return {
      success: false,
      reason: "EXPIRED_TOKEN",
    };
  }

  return {
    success: true,
    userId: tokenRow.user_id,
  };
};

export type ResetPasswordWithTokenResult =
  | {
      success: true;
    }
  | {
      success: false;
      reason: "INVALID_PASSWORD" | "INVALID_TOKEN" | "EXPIRED_TOKEN";
    };

export const resetPasswordWithToken = async (
  token: string,
  newPassword: string,
): Promise<ResetPasswordWithTokenResult> => {
  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    return {
      success: false,
      reason: "INVALID_PASSWORD",
    };
  }

  const initialTokenValidation = validatePasswordResetToken(token);

  if (!initialTokenValidation.success) {
    return {
      success: false,
      reason: initialTokenValidation.reason,
    };
  }

  const newPasswordHash = await hashPassword(newPassword);
  const tokenHash = hashPasswordResetToken(token);

  const resetPassword = db.transaction((): ResetPasswordWithTokenResult => {
    const tokenValidation = validatePasswordResetToken(token);

    if (!tokenValidation.success) {
      return {
        success: false,
        reason: tokenValidation.reason,
      };
    }

    const updateResult = db
      .prepare(
        `
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
          `,
      )
      .run(newPasswordHash, tokenValidation.userId);

    if (updateResult.changes !== 1) {
      throw new Error("Password reset user not found");
    }

    deleteUserSessions(tokenValidation.userId);

    const deleteTokenResult = db
      .prepare(
        `
            DELETE FROM password_reset_tokens
            WHERE token_hash = ?
          `,
      )
      .run(tokenHash);

    if (deleteTokenResult.changes !== 1) {
      throw new Error("Password reset token could not be consumed");
    }

    return {
      success: true,
    };
  });

  return resetPassword();
};
