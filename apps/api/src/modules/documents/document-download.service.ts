import { AppError } from "../../shared/app-error.js";
import { documentRepository } from "./document.repository.js";
import { storageService } from "./storage.service.js";
import { DOCUMENT_ERROR_MESSAGES } from "./document.constants.js";
import { Readable } from "stream";

export class DocumentDownloadService {
  async getDownloadStream(firmId: string, documentId: string): Promise<{ stream: Readable; mimeType: string; fileName: string; fileSize: number }> {
    const doc = await documentRepository.findById(documentId, firmId);
    if (!doc) {
      throw AppError.notFound(DOCUMENT_ERROR_MESSAGES.NOT_FOUND);
    }
    
    // The current version holds the storage key
    const version = doc.currentVersionId as any;
    if (!version || !version.storageKey) {
      throw AppError.notFound("Document physical file not found.");
    }

    const stream = storageService.getFileStream(version.storageKey);
    console.log(`[AUDIT] Document Downloaded: ID=${documentId}, VersionID=${version._id}, FirmID=${firmId}`);

    return {
      stream,
      mimeType: doc.mimeType,
      fileName: doc.originalFileName,
      fileSize: doc.fileSize,
    };
  }
}

export const documentDownloadService = new DocumentDownloadService();
