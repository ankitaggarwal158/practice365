import { config } from "../../../config/index.js";

// ─── Token Expiry ────────────────────────────────────────────

/** Access token TTL in seconds (default: 15 minutes). */
export const ACCESS_TOKEN_EXPIRY = config.jwtAccessExpiry;

/** Refresh token TTL in seconds (default: 7 days). */
export const REFRESH_TOKEN_EXPIRY = config.jwtRefreshExpiry;

/** Password reset token TTL in seconds (default: 1 hour). */
export const PASSWORD_RESET_EXPIRY = config.passwordResetExpiry;

/** Email verification token TTL in seconds (default: 24 hours). */
export const EMAIL_VERIFICATION_EXPIRY = config.emailVerificationExpiry;

// ─── Account Lockout ─────────────────────────────────────────

/** Maximum failed login attempts before lockout. */
export const MAX_LOGIN_ATTEMPTS = config.maxLoginAttempts;

/** Lockout duration in seconds. */
export const LOGIN_LOCKOUT_DURATION = config.loginLockoutDuration;

// ─── Token Byte Length ───────────────────────────────────────

/** Number of random bytes for refresh tokens. */
export const REFRESH_TOKEN_BYTES = 48;

/** Number of random bytes for reset/verification tokens. */
export const SECURE_TOKEN_BYTES = 32;

// ─── Error Messages ──────────────────────────────────────────

/**
 * Generic authentication failure message.
 * Per AUTH-006: never reveal whether email exists or password is incorrect.
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCOUNT_LOCKED: "Account temporarily locked. Please try again later.",
  EMAIL_NOT_VERIFIED: "Email address has not been verified.",
  ACCOUNT_DISABLED: "Account has been disabled.",
  SESSION_EXPIRED: "Session has expired.",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token.",
  INVALID_RESET_TOKEN: "Invalid or expired reset token.",
  INVALID_VERIFICATION_TOKEN: "Invalid or expired verification token.",
  AUTHENTICATION_REQUIRED: "Authentication required.",
  INVALID_TOKEN: "Invalid or expired token.",
  PASSWORD_RESET_SUCCESS: "If an account with that email exists, a password reset link has been sent.",
  EMAIL_VERIFICATION_SUCCESS: "Email verified successfully.",
  LOGOUT_SUCCESS: "Logged out successfully.",
  LOGOUT_ALL_SUCCESS: "All sessions terminated successfully.",
} as const;
