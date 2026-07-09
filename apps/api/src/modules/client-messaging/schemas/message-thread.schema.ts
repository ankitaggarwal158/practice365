import mongoose, { Schema } from "mongoose";
import { MessageThreadDocument } from "../message-thread.types.js";

const messageThreadSchema = new Schema<MessageThreadDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    matterId: {
      type: Schema.Types.ObjectId,
      ref: "Matter",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "MatterMessage",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastMessageBy: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    unreadClientCount: {
      type: Number,
      default: 0,
      required: true,
    },
    unreadFirmCount: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes
messageThreadSchema.index({ firmId: 1, matterId: 1 }, { unique: true });
messageThreadSchema.index({ firmId: 1, clientId: 1 });

export const MessageThreadModel = mongoose.model<MessageThreadDocument>(
  "MessageThread",
  messageThreadSchema,
  "matter_message_threads"
);
export default MessageThreadModel;
