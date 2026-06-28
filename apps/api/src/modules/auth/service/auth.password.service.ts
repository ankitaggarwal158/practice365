import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { AppError } from "../../../shared/app-error.js";
import * as authRepository from "../repository/auth.repository.js";
import { generateSecureToken, hashToken } from "../auth.tokens.js";
import {
  PASSWORD_RESET_EXPIRY,
  AUTH_ERROR_MESSAGES,
} from "../constants/auth.constants.js";

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

  // In development, log the token since email infrastructure is not yet available.
  // This will be replaced with actual email sending when the Worker module is built.
  console.log(`[AUTH] Password reset token for ${email}: ${tokenRaw}`);
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
