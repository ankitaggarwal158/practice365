import mongoose, { Schema } from "mongoose";
import type { EmailVerificationTokenDocument } from "../types/auth.types.js";

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "email_verification_tokens",
  }
);

export const EmailVerificationToken =
  mongoose.model<EmailVerificationTokenDocument>(
    "EmailVerificationToken",
    emailVerificationTokenSchema
  );
