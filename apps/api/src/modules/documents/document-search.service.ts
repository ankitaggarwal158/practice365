import { documentRepository, DocumentSearchFilters } from "./document.repository.js";
import { DocumentMeta as IDocumentMeta } from "./document.types.js";
import { AppError } from "../../shared/app-error.js";
import { DOCUMENT_ERROR_MESSAGES } from "./document.constants.js";

export class DocumentSearchService {
  async getDocument(firmId: string, documentId: string): Promise<IDocumentMeta> {
    const doc = await documentRepository.findById(documentId, firmId);
    if (!doc) {
      throw AppError.notFound(DOCUMENT_ERROR_MESSAGES.NOT_FOUND);
    }
    return doc;
  }

  async searchDocuments(
    firmId: string,
    filters: DocumentSearchFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: IDocumentMeta[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const result = await documentRepository.search(firmId, filters, skip, limit);
    return {
      data: result.data,
      total: result.total,
      page,
      limit,
    };
  }

  async updateMetadata(firmId: string, documentId: string, data: Partial<IDocumentMeta>): Promise<IDocumentMeta> {
    const updated = await documentRepository.update(documentId, firmId, data);
    if (!updated) {
      throw AppError.notFound(DOCUMENT_ERROR_MESSAGES.NOT_FOUND);
    }
    return updated;
  }

  async softDelete(firmId: string, documentId: string, userId: string): Promise<void> {
    const deleted = await documentRepository.softDelete(documentId, firmId, userId);
    if (!deleted) {
      throw AppError.notFound(DOCUMENT_ERROR_MESSAGES.NOT_FOUND);
    }
  }
}

export const documentSearchService = new DocumentSearchService();
