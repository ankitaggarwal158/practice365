import mongoose, { Schema } from "mongoose";
import { NotificationPreferenceDocument } from "../notification.types.js";

const notificationPreferenceSchema = new Schema<NotificationPreferenceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
      required: true,
    },
    inAppNotifications: {
      type: Boolean,
      default: true,
      required: true,
    },
    calendarReminders: {
      type: Boolean,
      default: true,
      required: true,
    },
    billingNotifications: {
      type: Boolean,
      default: true,
      required: true,
    },
    taskNotifications: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "notification_preferences",
  }
);

export const NotificationPreference = mongoose.model<NotificationPreferenceDocument>(
  "NotificationPreference",
  notificationPreferenceSchema
);
export default NotificationPreference;
