import { Document, Types } from "mongoose";

export interface DocumentFolder {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  parentFolderId: Types.ObjectId | null;
  folderName: string;
  displayOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentFolderDocument = DocumentFolder & Document;

export interface DocumentVersion {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  versionNumber: number;
  storageKey: string;
  fileHash: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  notes: string;
}

export type DocumentVersionDocument = DocumentVersion & Document;

export interface DocumentMeta {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  matterId: Types.ObjectId | null;
  clientId: Types.ObjectId | null;
  leadId: Types.ObjectId | null;
  intakeId: Types.ObjectId | null;
  folderId: Types.ObjectId | null;
  currentVersionId: Types.ObjectId;
  documentName: string;
  originalFileName: string;
  description: string;
  category: string;
  tags: string[];
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  isLocked: boolean;
  sharedWithPortal: boolean;
  sharedWithPortalAt: Date | null;
  sharedWithPortalBy: Types.ObjectId | null;
  deleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentMetaDocument = DocumentMeta & Document;
