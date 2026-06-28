import { Types, Document } from "mongoose";
import type { UserDocument as FullUserDocument } from "../../users/types/user.types.js";


// ─── Database Document Interfaces ────────────────────────────

export interface AuthSessionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshTokenHash: string;
  deviceName: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  userAgent: string;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetTokenDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

export interface EmailVerificationTokenDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;
}

/**
 * Re-export the full UserDocument type from User Management module (011).
 */
export type UserDocument = FullUserDocument;

// ─── Request Interfaces ──────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// ─── Response Interfaces ─────────────────────────────────────

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: CurrentUserData;
}

export interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CurrentUserData {
  id: string;
  email: string;
  isEmailVerified: boolean;
}

// ─── JWT Payloads ────────────────────────────────────────────

export interface JwtAccessPayload {
  userId: string;
  sessionId: string;
}

// ─── Request Metadata ────────────────────────────────────────

export interface RequestMeta {
  ipAddress: string;
  userAgent: string;
  deviceName: string;
  browser: string;
  operatingSystem: string;
}

// ─── Express Augmentation ────────────────────────────────────

/**
 * Extends Express Request to include authenticated user context.
 */
export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
}
