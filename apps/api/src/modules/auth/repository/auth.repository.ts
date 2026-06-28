import { Types } from "mongoose";
import { AuthSession } from "../schemas/auth-session.schema.js";
import { PasswordResetToken } from "../schemas/password-reset-token.schema.js";
import { EmailVerificationToken } from "../schemas/email-verification-token.schema.js";
import { User } from "../../users/index.js";
import type {
  AuthSessionDocument,
  PasswordResetTokenDocument,
  EmailVerificationTokenDocument,
  UserDocument,
  RequestMeta,
} from "../types/auth.types.js";

// ─── Session Operations ──────────────────────────────────────

export async function createSession(
  userId: Types.ObjectId,
  refreshTokenHash: string,
  expiresAt: Date,
  meta: RequestMeta
): Promise<AuthSessionDocument> {
  return AuthSession.create({
    userId,
    refreshTokenHash,
    expiresAt,
    deviceName: meta.deviceName,
    browser: meta.browser,
    operatingSystem: meta.operatingSystem,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    lastActivityAt: new Date(),
  });
}

export async function findSessionById(
  sessionId: string
): Promise<AuthSessionDocument | null> {
  return AuthSession.findById(sessionId);
}

export async function findActiveSessionsByUserId(
  userId: Types.ObjectId
): Promise<AuthSessionDocument[]> {
  return AuthSession.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function revokeSession(
  sessionId: string
): Promise<AuthSessionDocument | null> {
  return AuthSession.findByIdAndUpdate(
    sessionId,
    { revokedAt: new Date() },
    { new: true }
  );
}

export async function revokeAllSessionsByUserId(
  userId: Types.ObjectId
): Promise<void> {
  await AuthSession.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
}

export async function updateSessionRefreshToken(
  sessionId: string,
  newRefreshTokenHash: string,
  newExpiresAt: Date
): Promise<AuthSessionDocument | null> {
  return AuthSession.findByIdAndUpdate(
    sessionId,
    {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: newExpiresAt,
      lastActivityAt: new Date(),
    },
    { new: true }
  );
}

/**
 * Find a session by its refresh token hash.
 * Used during token refresh to locate the associated session.
 */
export async function findSessionByRefreshTokenHash(
  refreshTokenHash: string
): Promise<AuthSessionDocument | null> {
  return AuthSession.findOne({ refreshTokenHash });
}

/**
 * Find any session (including revoked) by user that once held this refresh token hash.
 * Used for refresh token reuse detection — if a previously rotated token is presented,
 * the session must be revoked immediately (spec §12 Refresh Token Rotation).
 */
export async function findAnySessionByUserId(
  userId: Types.ObjectId
): Promise<AuthSessionDocument[]> {
  return AuthSession.find({ userId });
}

// ─── Password Reset Token Operations ─────────────────────────

export async function invalidatePreviousResetTokens(
  userId: Types.ObjectId
): Promise<void> {
  await PasswordResetToken.updateMany(
    { userId, consumedAt: null },
    { consumedAt: new Date() }
  );
}

export async function createPasswordResetToken(
  userId: Types.ObjectId,
  tokenHash: string,
  expiresAt: Date
): Promise<PasswordResetTokenDocument> {
  // Invalidate any previous active tokens first (business rule §8.2)
  await invalidatePreviousResetTokens(userId);

  return PasswordResetToken.create({
    userId,
    tokenHash,
    expiresAt,
  });
}

export async function findValidPasswordResetToken(
  tokenHash: string
): Promise<PasswordResetTokenDocument | null> {
  return PasswordResetToken.findOne({
    tokenHash,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function consumePasswordResetToken(
  tokenId: Types.ObjectId
): Promise<void> {
  await PasswordResetToken.findByIdAndUpdate(tokenId, {
    consumedAt: new Date(),
  });
}

// ─── Email Verification Token Operations ─────────────────────

export async function createEmailVerificationToken(
  userId: Types.ObjectId,
  tokenHash: string,
  expiresAt: Date
): Promise<EmailVerificationTokenDocument> {
  return EmailVerificationToken.create({
    userId,
    tokenHash,
    expiresAt,
  });
}

export async function findValidEmailVerificationToken(
  tokenHash: string
): Promise<EmailVerificationTokenDocument | null> {
  return EmailVerificationToken.findOne({
    tokenHash,
    verifiedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function consumeEmailVerificationToken(
  tokenId: Types.ObjectId
): Promise<void> {
  await EmailVerificationToken.findByIdAndUpdate(tokenId, {
    verifiedAt: new Date(),
  });
}

// ─── User Operations (Stub) ─────────────────────────────────

export async function findUserByEmail(
  email: string
): Promise<UserDocument | null> {
  return User.findOne({ email: email.toLowerCase() });
}

export async function findUserById(
  userId: string
): Promise<UserDocument | null> {
  return User.findById(userId);
}

export async function updateUserPassword(
  userId: Types.ObjectId,
  passwordHash: string
): Promise<void> {
  await User.findByIdAndUpdate(userId, { passwordHash });
}

export async function verifyUserEmail(
  userId: Types.ObjectId
): Promise<void> {
  await User.findByIdAndUpdate(userId, { isEmailVerified: true });
}

export async function incrementFailedLoginAttempts(
  userId: Types.ObjectId
): Promise<UserDocument | null> {
  return User.findByIdAndUpdate(
    userId,
    { $inc: { failedLoginAttempts: 1 } },
    { new: true }
  );
}

export async function resetFailedLoginAttempts(
  userId: Types.ObjectId
): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    failedLoginAttempts: 0,
    lockoutUntil: null,
  });
}

export async function lockUserAccount(
  userId: Types.ObjectId,
  lockoutUntil: Date
): Promise<void> {
  await User.findByIdAndUpdate(userId, { lockoutUntil });
}
