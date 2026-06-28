import mongoose, { Schema } from "mongoose";
import { UserDocument, UserStatus, TimeFormat } from "../types/user.types.js";

const userSchema = new Schema<UserDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING_INVITATION,
      required: true,
      index: true,
    },
    
    // Preferences
    timezone: {
      type: String,
      default: "UTC",
      required: true,
    },
    language: {
      type: String,
      default: "en",
      required: true,
    },
    dateFormat: {
      type: String,
      default: "YYYY-MM-DD",
      required: true,
    },
    timeFormat: {
      type: String,
      enum: Object.values(TimeFormat),
      default: TimeFormat.TWENTY_FOUR,
      required: true,
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
        required: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },

    // Authentication Fields
    passwordHash: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      required: true,
    },
    lockoutUntil: {
      type: Date,
      default: null,
    },

    // Invitation Fields
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    invitationSentAt: {
      type: Date,
      default: null,
    },
    invitationAcceptedAt: {
      type: Date,
      default: null,
    },

    // Audit Info
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Fallback index checks or compound indexes if needed in the future,
// but the simple single indexes are covered by index: true on fields.

export const User = mongoose.model<UserDocument>("User", userSchema);
export default User;
