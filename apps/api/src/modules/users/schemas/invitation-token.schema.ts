import mongoose, { Schema } from "mongoose";
import { InvitationTokenDocument } from "../types/user.types.js";

const invitationTokenSchema = new Schema<InvitationTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "invitation_tokens",
  }
);

// Add index on expiresAt for TTL/expiration queries or just tokenHash
invitationTokenSchema.index({ tokenHash: 1 });

export const InvitationToken = mongoose.model<InvitationTokenDocument>(
  "InvitationToken",
  invitationTokenSchema
);
export default InvitationToken;
