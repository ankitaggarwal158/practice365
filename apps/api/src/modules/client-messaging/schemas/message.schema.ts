import mongoose, { Schema } from "mongoose";
import { MatterMessageDocument } from "../message-thread.types.js";

const matterMessageSchema = new Schema<MatterMessageDocument>(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "MessageThread",
      required: true,
      index: true,
    },
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
    },
    matterId: {
      type: Schema.Types.ObjectId,
      ref: "Matter",
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["FIRM_USER", "CLIENT"],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["DELIVERED", "READ"],
      required: true,
      default: "DELIVERED",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    hasAttachments: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Messages are immutable
  }
);

// Indexes
matterMessageSchema.index({ createdAt: 1 });
matterMessageSchema.index({ threadId: 1, createdAt: 1 });

export const MatterMessageModel = mongoose.model<MatterMessageDocument>(
  "MatterMessage",
  matterMessageSchema,
  "matter_messages"
);
export default MatterMessageModel;
