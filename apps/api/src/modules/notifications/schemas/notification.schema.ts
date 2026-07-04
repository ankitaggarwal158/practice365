import mongoose, { Schema } from "mongoose";
import { NotificationDocument } from "../notification.types.js";

const notificationSchema = new Schema<NotificationDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceModule: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "ERROR"],
      default: "INFO",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

// Indexes
notificationSchema.index({ firmId: 1, userId: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>(
  "Notification",
  notificationSchema
);
export default Notification;
