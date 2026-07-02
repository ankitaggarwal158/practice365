import { Types, ClientSession } from "mongoose";
import mongoose from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { storageService } from "./storage.service.js";
import { documentRepository } from "./document.repository.js";
import { documentVersionRepository } from "./document-version.repository.js";
import { DocumentMeta as IDocumentMeta } from "./document.types.js";

export class DocumentUploadService {
  async uploadDocument(
    firmId: string,
    userId: string,
    file: Express.Multer.File,
    metadata: { matterId?: string; clientId?: string; folderId?: string; category?: string; description?: string; tags?: string[] }
  ): Promise<IDocumentMeta> {
    if (!file) {
      throw AppError.badRequest("No file provided");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let storageKey = "";

    try {
      // 1. Save file to storage
      const storageResult = await storageService.saveFile(firmId, file.buffer, file.originalname);
      storageKey = storageResult.storageKey;

      // 2. Create placeholder Document Meta to get ID
      const docId = new Types.ObjectId();
      const versionId = new Types.ObjectId();

      // 3. Create Version 1
      await documentVersionRepository.create({
        _id: versionId,
        documentId: docId,
        versionNumber: 1,
        storageKey: storageResult.storageKey,
        fileHash: storageResult.fileHash,
        mimeType: file.mimetype,
        fileSize: storageResult.fileSize,
        uploadedBy: new Types.ObjectId(userId),
        notes: "Initial upload",
      });

      // 4. Create Document Meta
      const docMeta = await documentRepository.create({
        _id: docId,
        firmId: new Types.ObjectId(firmId),
        matterId: metadata.matterId ? new Types.ObjectId(metadata.matterId) : null,
        clientId: metadata.clientId ? new Types.ObjectId(metadata.clientId) : null,
        folderId: metadata.folderId ? new Types.ObjectId(metadata.folderId) : null,
        currentVersionId: versionId,
        documentName: file.originalname,
        originalFileName: file.originalname,
        description: metadata.description || "",
        category: metadata.category || "Uncategorized",
        tags: metadata.tags || [],
        mimeType: file.mimetype,
        fileExtension: file.originalname.split(".").pop() || "",
        fileSize: storageResult.fileSize,
        createdBy: new Types.ObjectId(userId),
      });

      await session.commitTransaction();
      return docMeta;
    } catch (error) {
      await session.abortTransaction();
      // Clean up file if storage succeeded but db failed
      if (storageKey) {
        await storageService.deleteFile(storageKey).catch(console.error);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const documentUploadService = new DocumentUploadService();
