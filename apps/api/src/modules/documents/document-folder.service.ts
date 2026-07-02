import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { documentFolderRepository } from "./document-folder.repository.js";
import { documentRepository } from "./document.repository.js";
import { DocumentFolder as IDocumentFolder } from "./document.types.js";
import { DOCUMENT_ERROR_MESSAGES } from "./document.constants.js";

export class DocumentFolderService {
  async getFoldersByFirm(firmId: string): Promise<IDocumentFolder[]> {
    return documentFolderRepository.findAllByFirm(firmId);
  }

  async createFolder(firmId: string, userId: string, folderData: any): Promise<IDocumentFolder> {
    if (folderData.parentFolderId) {
      const parent = await documentFolderRepository.findById(folderData.parentFolderId, firmId);
      if (!parent) {
        throw AppError.notFound("Parent folder not found");
      }
    }

    return documentFolderRepository.create({
      ...folderData,
      firmId: new Types.ObjectId(firmId),
      createdBy: new Types.ObjectId(userId),
    });
  }

  async updateFolder(firmId: string, folderId: string, folderData: any): Promise<IDocumentFolder> {
    const updated = await documentFolderRepository.update(folderId, firmId, folderData);
    if (!updated) {
      throw AppError.notFound(DOCUMENT_ERROR_MESSAGES.FOLDER_NOT_FOUND);
    }
    return updated;
  }

  async deleteFolder(firmId: string, folderId: string): Promise<void> {
    // Check for children folders
    const childCount = await documentFolderRepository.countChildren(folderId, firmId);
    if (childCount > 0) {
      throw AppError.badRequest("Cannot delete folder containing subfolders.");
    }

    // Check for documents in folder
    const docCount = await documentRepository.countInFolder(folderId, firmId);
    if (docCount > 0) {
      throw AppError.badRequest("Cannot delete folder containing documents. Move or delete them first.");
    }

    const deleted = await documentFolderRepository.delete(folderId, firmId);
    if (!deleted) {
      throw AppError.notFound(DOCUMENT_ERROR_MESSAGES.FOLDER_NOT_FOUND);
    }
  }
}

export const documentFolderService = new DocumentFolderService();
