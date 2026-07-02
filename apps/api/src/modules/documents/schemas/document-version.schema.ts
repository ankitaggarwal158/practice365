import mongoose, { Schema } from "mongoose";
import { DocumentVersionDocument } from "../document.types.js";

const documentVersionSchema = new Schema<DocumentVersionDocument>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentMeta",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: false,
    collection: "document_versions",
  }
);

documentVersionSchema.index({ documentId: 1, versionNumber: 1 }, { unique: true });

export const DocumentVersion = mongoose.model<DocumentVersionDocument>("DocumentVersion", documentVersionSchema);
export default DocumentVersion;
