import mongoose, { Schema } from "mongoose";
import { MessageAttachmentDocument } from "../message-thread.types.js";

const messageAttachmentSchema = new Schema<MessageAttachmentDocument>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "MatterMessage",
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const MessageAttachmentModel = mongoose.model<MessageAttachmentDocument>(
  "MessageAttachment",
  messageAttachmentSchema,
  "message_attachments"
);
export default MessageAttachmentModel;
