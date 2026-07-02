import { Types } from "mongoose";
import mongoose from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { storageService } from "./storage.service.js";
import { documentRepository } from "./document.repository.js";
import { documentVersionRepository } from "./document-version.repository.js";
import { DOCUMENT_ERROR_MESSAGES } from "./document.constants.js";
import { DocumentVersion as IDocumentVersion, DocumentMeta as IDocumentMeta } from "./document.types.js";

export class DocumentVersionService {
  async uploadNewVersion(
    firmId: string,
    userId: string,
    documentId: string,
    file: Express.Multer.File,
    notes: string = ""
  ): Promise<IDocumentMeta> {
    if (!file) {
      throw new AppError(400, "No file provided");
    }

    const doc = await documentRepository.findById(documentId, firmId);
    if (!doc) {
      throw new AppError(404, DOCUMENT_ERROR_MESSAGES.NOT_FOUND);
    }
    if (doc.isLocked) {
      throw new AppError(400, "Document is locked and cannot be updated.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let storageKey = "";

    try {
      const storageResult = await storageService.saveFile(firmId, file.buffer, file.originalname);
      storageKey = storageResult.storageKey;

      const nextVersionNumber = await documentVersionRepository.getNextVersionNumber(documentId);
      const versionId = new Types.ObjectId();

      await documentVersionRepository.create({
        _id: versionId,
        documentId: new Types.ObjectId(documentId),
        versionNumber: nextVersionNumber,
        storageKey: storageResult.storageKey,
        fileHash: storageResult.fileHash,
        mimeType: file.mimetype,
        fileSize: storageResult.fileSize,
        uploadedBy: new Types.ObjectId(userId),
        notes: notes,
      });

      const updatedDoc = await documentRepository.update(documentId, firmId, {
        currentVersionId: versionId,
        fileSize: storageResult.fileSize,
        mimeType: file.mimetype,
        fileExtension: file.originalname.split(".").pop() || "",
        updatedAt: new Date(),
      });

      await session.commitTransaction();
      return updatedDoc!;
    } catch (error) {
      await session.abortTransaction();
      if (storageKey) {
        await storageService.deleteFile(storageKey).catch(console.error);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getVersions(firmId: string, documentId: string): Promise<IDocumentVersion[]> {
    const doc = await documentRepository.findById(documentId, firmId);
    if (!doc) {
      throw new AppError(404, DOCUMENT_ERROR_MESSAGES.NOT_FOUND);
    }
    return documentVersionRepository.findByDocumentId(documentId);
  }
}

export const documentVersionService = new DocumentVersionService();
