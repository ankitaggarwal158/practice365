import mongoose, { Schema } from "mongoose";
import type { AuthSessionDocument } from "../types/auth.types.js";

const authSessionSchema = new Schema<AuthSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    operatingSystem: {
      type: String,
      default: "Unknown",
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "auth_sessions",
  }
);

// Compound index for finding active sessions per user
authSessionSchema.index({ userId: 1, revokedAt: 1 });

export const AuthSession = mongoose.model<AuthSessionDocument>(
  "AuthSession",
  authSessionSchema
);
