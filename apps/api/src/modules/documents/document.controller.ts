import { Request, Response, NextFunction } from "express";
import { documentUploadService } from "./document-upload.service.js";
import { documentVersionService } from "./document-version.service.js";
import { documentSearchService } from "./document-search.service.js";
import { documentDownloadService } from "./document-download.service.js";
import { documentFolderService } from "./document-folder.service.js";
import { documentFolderSchema, documentMetaUpdateSchema } from "./document.validation.js";
import { AppError } from "../../shared/app-error.js";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/api-response.js";
import * as userService from "../users/service/user.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export class DocumentController {
  // Folders
  async listFolders(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const folders = await documentFolderService.getFoldersByFirm(firmId);
      sendSuccess(res, folders);
    } catch (err) {
      next(err);
    }
  }

  async createFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const data = documentFolderSchema.parse(req.body);
      const folder = await documentFolderService.createFolder(firmId, req.user!.userId, data);
      sendSuccess(res, folder, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const data = documentFolderSchema.parse(req.body);
      const folder = await documentFolderService.updateFolder(firmId, req.params.id as string, data);
      sendSuccess(res, folder);
    } catch (err) {
      next(err);
    }
  }

  async deleteFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      await documentFolderService.deleteFolder(firmId, req.params.id as string);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  // Documents
  async searchDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const { matterId, clientId, folderId, category, search, page = 1, limit = 50 } = req.query;
      const parsedFolderId = folderId === "null" ? null : (folderId as string);

      const result = await documentSearchService.searchDocuments(
        firmId,
        {
          matterId: matterId as string,
          clientId: clientId as string,
          folderId: parsedFolderId,
          category: category as string,
          search: search as string,
        },
        Number(page),
        Number(limit)
      );
      sendPaginatedSuccess(res, result.data, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / Number(limit)),
      });
    } catch (err) {
      next(err);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const doc = await documentSearchService.getDocument(firmId, req.params.id as string);
      sendSuccess(res, doc);
    } catch (err) {
      next(err);
    }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw AppError.badRequest("File is required");
      const firmId = await getRequestingUserFirmId(req);
      const metadata = {
        matterId: req.body.matterId,
        clientId: req.body.clientId,
        folderId: req.body.folderId === "null" ? null : req.body.folderId,
        category: req.body.category,
        description: req.body.description,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      };

      const doc = await documentUploadService.uploadDocument(firmId, req.user!.userId, req.file, metadata);
      sendSuccess(res, doc, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const data = documentMetaUpdateSchema.parse(req.body);
      const doc = await documentSearchService.updateMetadata(firmId, req.params.id as string, data as any);
      sendSuccess(res, doc);
    } catch (err) {
      next(err);
    }
  }

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      await documentSearchService.softDelete(firmId, req.params.id as string, req.user!.userId);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  // Versions
  async getVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const versions = await documentVersionService.getVersions(firmId, req.params.id as string);
      sendSuccess(res, versions);
    } catch (err) {
      next(err);
    }
  }

  async uploadVersion(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw AppError.badRequest("File is required");
      const firmId = await getRequestingUserFirmId(req);
      const notes = req.body.notes || "";
      const doc = await documentVersionService.uploadNewVersion(firmId, req.user!.userId, req.params.id as string, req.file, notes);
      sendSuccess(res, doc, 201);
    } catch (err) {
      next(err);
    }
  }

  // Download
  async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const download = await documentDownloadService.getDownloadStream(firmId, req.params.id as string);
      const disposition = req.query.preview === "true" ? "inline" : "attachment";
      
      res.setHeader("Content-Type", download.mimeType);
      res.setHeader("Content-Disposition", `${disposition}; filename="${download.fileName}"`);
      res.setHeader("Content-Length", download.fileSize);
      download.stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

export const documentController = new DocumentController();
