import mongoose, { Schema } from "mongoose";
import {
  ClientDocument,
  ClientNoteDocument,
  ClientAttachmentDocument,
} from "../client.types.js";

// Address Subdocument
const addressSchema = new Schema(
  {
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

// Client Parent Collection Schema
const clientSchema = new Schema<ClientDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Firm",
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },
    clientNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    clientType: {
      type: String,
      enum: ["INDIVIDUAL", "ORGANIZATION"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      required: true,
      default: "ACTIVE",
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    customFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    mergedIntoClientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

// Unique clientNumber scoped per firm
clientSchema.index({ firmId: 1, clientNumber: 1 }, { unique: true });
clientSchema.index({ firmId: 1, createdAt: -1 });

// Notes Child Collection Schema
const clientNoteSchema = new Schema<ClientNoteDocument>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Client",
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "client_notes",
  }
);

// Attachments Child Collection Schema
const clientAttachmentSchema = new Schema<ClientAttachmentDocument>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Client",
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "uploadedAt", updatedAt: false },
    collection: "client_attachments",
  }
);

export const Client = mongoose.model<ClientDocument>("Client", clientSchema);
export const ClientNote = mongoose.model<ClientNoteDocument>("ClientNote", clientNoteSchema);
export const ClientAttachment = mongoose.model<ClientAttachmentDocument>(
  "ClientAttachment",
  clientAttachmentSchema
);
