import mongoose, { Schema } from "mongoose";
import { NotificationDeliveryLogDocument } from "../notification.types.js";

const notificationDeliveryLogSchema = new Schema<NotificationDeliveryLogDocument>(
  {
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    deliveryType: {
      type: String,
      enum: ["IN_APP", "EMAIL"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "DELIVERED", "FAILED"],
      default: "PENDING",
      required: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    failureReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: false,
    collection: "notification_delivery_logs",
  }
);

export const NotificationDeliveryLog = mongoose.model<NotificationDeliveryLogDocument>(
  "NotificationDeliveryLog",
  notificationDeliveryLogSchema
);
export default NotificationDeliveryLog;
