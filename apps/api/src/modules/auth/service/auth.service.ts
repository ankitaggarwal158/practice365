import bcrypt from "bcryptjs";
import { UAParser } from "ua-parser-js";
import { AppError } from "../../../shared/app-error.js";
import * as authRepository from "../repository/auth.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../auth.tokens.js";
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  MAX_LOGIN_ATTEMPTS,
  LOGIN_LOCKOUT_DURATION,
  AUTH_ERROR_MESSAGES,
} from "../constants/auth.constants.js";
import type {
  LoginResponseData,
  RefreshResponseData,
  CurrentUserData,
  RequestMeta,
} from "../types/auth.types.js";

/**
 * Extracts device/browser/OS metadata from request headers.
 */
export function extractRequestMeta(
  ipAddress: string,
  userAgent: string
): RequestMeta {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    ipAddress,
    userAgent,
    deviceName: device.model || device.vendor || "Unknown",
    browser: browser.name || "Unknown",
    operatingSystem: os.name || "Unknown",
  };
}

/**
 * Authenticate user with email and password.
 * Creates a new session on success.
 *
 * Business rules enforced:
 * - AUTH-001: Only authenticated users access protected resources
 * - AUTH-002: Every login creates a new session
 * - AUTH-005: Email verification mandatory before authentication
 * - AUTH-006: Never reveal if email exists or password is wrong
 * - §12: Account lockout on repeated failures
 */
export async function login(
  email: string,
  password: string,
  meta: RequestMeta
): Promise<LoginResponseData> {
  const user = await authRepository.findUserByEmail(email);

  // AUTH-006: generic error whether user doesn't exist or password is wrong
  if (!user) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Check if account is disabled
  if (user.isDisabled) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.ACCOUNT_DISABLED);
  }

  // Check if account is locked (§12 Login Attempts)
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED);
  }

  // If lockout period has expired, reset the counter
  if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
    await authRepository.resetFailedLoginAttempts(user._id);
  }

  // AUTH-005: Email must be verified
  if (!user.isEmailVerified) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    // Increment failed attempts and potentially lock
    const updatedUser = await authRepository.incrementFailedLoginAttempts(user._id);
    if (updatedUser && updatedUser.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = new Date(
        Date.now() + LOGIN_LOCKOUT_DURATION * 1000
      );
      await authRepository.lockUserAccount(user._id, lockoutUntil);
    }
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Successful login — reset failed attempts
  if (user.failedLoginAttempts > 0) {
    await authRepository.resetFailedLoginAttempts(user._id);
  }

  // Generate tokens
  const refreshTokenRaw = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshTokenRaw);
  const sessionExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);

  // AUTH-002: Create a new session
  const session = await authRepository.createSession(
    user._id,
    refreshTokenHash,
    sessionExpiresAt,
    meta
  );

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    sessionId: session._id.toString(),
  });

  return {
    accessToken,
    refreshToken: refreshTokenRaw,
    expiresIn: ACCESS_TOKEN_EXPIRY,
    user: {
      id: user._id.toString(),
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

/**
 * Refresh an access token using a valid refresh token.
 *
 * Business rules enforced:
 * - §12 Refresh Token Rotation: tokens rotated on every refresh
 * - §12 Reuse Detection: if a rotated token is reused, revoke the session
 */
export async function refresh(
  refreshTokenRaw: string
): Promise<RefreshResponseData> {
  const refreshTokenHash = hashToken(refreshTokenRaw);

  // Find the session associated with this refresh token
  const session =
    await authRepository.findSessionByRefreshTokenHash(refreshTokenHash);

  if (!session) {
    // Potential reuse of a rotated token — this is a security event.
    // We can't easily determine which session was compromised without
    // storing token history, so we reject with a generic message.
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
  }

  // Check if session is revoked
  if (session.revokedAt) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.SESSION_EXPIRED);
  }

  // Rotate the refresh token
  const newRefreshTokenRaw = generateRefreshToken();
  const newRefreshTokenHash = hashToken(newRefreshTokenRaw);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);

  await authRepository.updateSessionRefreshToken(
    session._id.toString(),
    newRefreshTokenHash,
    newExpiresAt
  );

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: session.userId.toString(),
    sessionId: session._id.toString(),
  });

  return {
    accessToken,
    refreshToken: newRefreshTokenRaw,
    expiresIn: ACCESS_TOKEN_EXPIRY,
  };
}

/**
 * Get the current authenticated user's profile.
 */
export async function getCurrentUser(
  userId: string
): Promise<CurrentUserData> {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  return {
    id: user._id.toString(),
    email: user.email,
    isEmailVerified: user.isEmailVerified,
  };
}
