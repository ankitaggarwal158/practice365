import mongoose, { Schema } from "mongoose";
import { DocumentFolderDocument } from "../document.types.js";

const documentFolderSchema = new Schema<DocumentFolderDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    parentFolderId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentFolder",
      default: null,
      index: true,
    },
    folderName: {
      type: String,
      required: true,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "document_folders",
  }
);

documentFolderSchema.index({ firmId: 1, parentFolderId: 1 });

export const DocumentFolder = mongoose.model<DocumentFolderDocument>("DocumentFolder", documentFolderSchema);
export default DocumentFolder;
