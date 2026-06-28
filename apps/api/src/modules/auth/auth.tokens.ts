import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import type { JwtAccessPayload } from "./types/auth.types.js";
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_BYTES,
  SECURE_TOKEN_BYTES,
} from "./constants/auth.constants.js";

/**
 * Generates a signed JWT access token.
 * Short-lived (default 15 minutes) per security standards (005 §6).
 */
export function generateAccessToken(payload: JwtAccessPayload): string {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Verifies and decodes a JWT access token.
 * Returns the decoded payload or null if invalid/expired.
 */
export function verifyAccessToken(token: string): JwtAccessPayload | null {
  try {
    return jwt.verify(token, config.jwtAccessSecret) as JwtAccessPayload;
  } catch {
    return null;
  }
}

/**
 * Generates a cryptographically random refresh token.
 * Returns the raw hex string — must be hashed before storage.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

/**
 * Generates a cryptographically random token for password reset or email verification.
 * Returns the raw hex string — must be hashed before storage.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(SECURE_TOKEN_BYTES).toString("hex");
}

/**
 * Hashes a token using SHA-256 for secure storage.
 * Refresh tokens, reset tokens, and verification tokens are never stored in plain text
 * per security standards (005 §6).
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
