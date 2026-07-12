import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { AppError } from "../../../shared/app-error.js";
import * as authRepository from "../repository/auth.repository.js";
import { generateSecureToken, hashToken } from "../auth.tokens.js";
import {
  PASSWORD_RESET_EXPIRY,
  AUTH_ERROR_MESSAGES,
} from "../constants/auth.constants.js";
import { config } from "../../../config/index.js";
import { enqueue } from "../../jobs/service/queue.service.js";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Request a password reset.
 *
 * Business rules:
 * - §8.2: Only one active reset request per user. New request invalidates previous.
 * - AUTH-006: Response is always generic — never reveal whether email exists.
 */
export async function forgotPassword(email: string): Promise<void> {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    // AUTH-006: Always respond generically — do not reveal account existence
    console.log(
      `[AUTH] Password reset requested for non-existent email: ${email}`
    );
    return;
  }

  // Generate token
  const tokenRaw = generateSecureToken();
  const tokenHash = hashToken(tokenRaw);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY * 1000);

  await authRepository.createPasswordResetToken(
    user._id,
    tokenHash,
    expiresAt
  );

  // Enqueue email sending job
  const resetLink = `${config.corsOrigin}/reset-password?token=${tokenRaw}`;
  await enqueue("send-email", {
    to: email,
    subject: "Reset your Practice365 Password",
    text: `Hello,\n\nYou requested a password reset for your Practice365 account. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request this reset, you can safely ignore this email.`,
    html: `<p>Hello,</p><p>You requested a password reset for your Practice365 account. Click the link below to set a new password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in 1 hour. If you did not request this reset, you can safely ignore this email.</p>`,
  });
}

/**
 * Reset password using a valid reset token.
 *
 * Business rules:
 * - AUTH-004: Password reset invalidates every active session.
 * - §8.2: Reset tokens are single-use.
 */
export async function resetPassword(
  tokenRaw: string,
  newPassword: string
): Promise<void> {
  const tokenHash = hashToken(tokenRaw);

  const resetToken =
    await authRepository.findValidPasswordResetToken(tokenHash);

  if (!resetToken) {
    throw AppError.badRequest(AUTH_ERROR_MESSAGES.INVALID_RESET_TOKEN);
  }

  // Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

  // Update the user's password
  await authRepository.updateUserPassword(resetToken.userId, passwordHash);

  // Consume the reset token (single-use)
  await authRepository.consumePasswordResetToken(resetToken._id);

  // AUTH-004: Invalidate every active session
  await authRepository.revokeAllSessionsByUserId(resetToken.userId);

  // Reset failed login attempts since the user proved identity via email
  await authRepository.resetFailedLoginAttempts(resetToken.userId);
}
