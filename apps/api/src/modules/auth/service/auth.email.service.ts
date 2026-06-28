import { AppError } from "../../../shared/app-error.js";
import * as authRepository from "../repository/auth.repository.js";
import { hashToken } from "../auth.tokens.js";
import { AUTH_ERROR_MESSAGES } from "../constants/auth.constants.js";

/**
 * Verify a user's email address using a verification token.
 *
 * Business rules:
 * - §8.3: Verification tokens are single-use.
 * - §8.3: Verification tokens expire automatically.
 * - AUTH-005: Users must verify email before authenticating.
 */
export async function verifyEmail(tokenRaw: string): Promise<void> {
  const tokenHash = hashToken(tokenRaw);

  const verificationToken =
    await authRepository.findValidEmailVerificationToken(tokenHash);

  if (!verificationToken) {
    throw AppError.badRequest(AUTH_ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN);
  }

  // Mark token as consumed (single-use)
  await authRepository.consumeEmailVerificationToken(verificationToken._id);

  // Mark user's email as verified
  await authRepository.verifyUserEmail(verificationToken.userId);
}
