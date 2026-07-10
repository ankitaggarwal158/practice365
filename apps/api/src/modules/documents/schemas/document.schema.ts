import mongoose, { Schema } from "mongoose";
import { DocumentMetaDocument } from "../document.types.js";

const documentMetaSchema = new Schema<DocumentMetaDocument>(
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
      default: null,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    intakeId: {
      type: Schema.Types.ObjectId,
      ref: "Intake",
      default: null,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentFolder",
      default: null,
      index: true,
    },
    currentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentVersion",
      required: true,
    },
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Uncategorized",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileExtension: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    sharedWithPortal: {
      type: Boolean,
      default: false,
    },
    sharedWithPortalAt: {
      type: Date,
      default: null,
    },
    sharedWithPortalBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "documents",
  }
);

documentMetaSchema.index({ firmId: 1, matterId: 1 });
documentMetaSchema.index({ firmId: 1, clientId: 1 });
documentMetaSchema.index({ firmId: 1, folderId: 1 });
documentMetaSchema.index({ firmId: 1, deleted: 1 });
documentMetaSchema.index({ createdAt: -1 });

export const DocumentMeta = mongoose.model<DocumentMetaDocument>("DocumentMeta", documentMetaSchema);
export default DocumentMeta;
