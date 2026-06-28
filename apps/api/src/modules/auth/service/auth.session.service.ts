import { Types } from "mongoose";
import * as authRepository from "../repository/auth.repository.js";
import { AUTH_ERROR_MESSAGES } from "../constants/auth.constants.js";

/**
 * Revoke the current session.
 * AUTH-003: Logging out from one session must not terminate other active sessions.
 */
export async function logout(sessionId: string): Promise<void> {
  const session = await authRepository.revokeSession(sessionId);

  if (!session) {
    // Session may already be revoked or not found — succeed silently
    return;
  }
}

/**
 * Revoke all active sessions for a user.
 */
export async function logoutAll(userId: string): Promise<void> {
  await authRepository.revokeAllSessionsByUserId(new Types.ObjectId(userId));
}
