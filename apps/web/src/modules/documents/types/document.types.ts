export interface DocumentFolder {
  _id: string;
  firmId: string;
  parentFolderId: string | null;
  folderName: string;
  displayOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  _id: string;
  documentId: string;
  versionNumber: number;
  storageKey: string;
  fileHash: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  notes: string;
}

export interface DocumentMeta {
  _id: string;
  firmId: string;
  matterId: string | null;
  clientId: string | null;
  leadId: string | null;
  intakeId: string | null;
  folderId: string | null;
  currentVersionId: string | DocumentVersion;
  documentName: string;
  originalFileName: string;
  description: string;
  category: string;
  tags: string[];
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  isLocked: boolean;
  deleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdBy: { _id: string; firstName: string; lastName: string; displayName: string };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSearchFilters {
  matterId?: string;
  clientId?: string;
  folderId?: string | null;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
