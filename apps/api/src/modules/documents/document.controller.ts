import { Request, Response, NextFunction } from "express";
import { documentUploadService } from "./document-upload.service.js";
import { documentVersionService } from "./document-version.service.js";
import { documentSearchService } from "./document-search.service.js";
import { documentDownloadService } from "./document-download.service.js";
import { documentFolderService } from "./document-folder.service.js";
import { documentFolderSchema, documentMetaUpdateSchema } from "./document.validation.js";
import { AppError } from "../../shared/app-error.js";
import { SuccessResponse } from "../../shared/api-response.js";

export class DocumentController {
  // Folders
  async listFolders(req: Request, res: Response, next: NextFunction) {
    try {
      const folders = await documentFolderService.getFoldersByFirm(req.user!.firmId);
      res.json(SuccessResponse(folders));
    } catch (err) {
      next(err);
    }
  }

  async createFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = documentFolderSchema.parse(req.body);
      const folder = await documentFolderService.createFolder(req.user!.firmId, req.user!.id, data);
      res.status(201).json(SuccessResponse(folder));
    } catch (err) {
      next(err);
    }
  }

  async updateFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = documentFolderSchema.parse(req.body);
      const folder = await documentFolderService.updateFolder(req.user!.firmId, req.params.id, data);
      res.json(SuccessResponse(folder));
    } catch (err) {
      next(err);
    }
  }

  async deleteFolder(req: Request, res: Response, next: NextFunction) {
    try {
      await documentFolderService.deleteFolder(req.user!.firmId, req.params.id);
      res.json(SuccessResponse({ success: true }));
    } catch (err) {
      next(err);
    }
  }

  // Documents
  async searchDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { matterId, clientId, folderId, category, search, page = 1, limit = 50 } = req.query;
      const parsedFolderId = folderId === "null" ? null : (folderId as string);

      const result = await documentSearchService.searchDocuments(
        req.user!.firmId,
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
      res.json(SuccessResponse(result.data, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      }));
    } catch (err) {
      next(err);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentSearchService.getDocument(req.user!.firmId, req.params.id);
      res.json(SuccessResponse(doc));
    } catch (err) {
      next(err);
    }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError(400, "File is required");
      const metadata = {
        matterId: req.body.matterId,
        clientId: req.body.clientId,
        folderId: req.body.folderId === "null" ? null : req.body.folderId,
        category: req.body.category,
        description: req.body.description,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      };

      const doc = await documentUploadService.uploadDocument(req.user!.firmId, req.user!.id, req.file, metadata);
      res.status(201).json(SuccessResponse(doc));
    } catch (err) {
      next(err);
    }
  }

  async updateMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const data = documentMetaUpdateSchema.parse(req.body);
      const doc = await documentSearchService.updateMetadata(req.user!.firmId, req.params.id, data);
      res.json(SuccessResponse(doc));
    } catch (err) {
      next(err);
    }
  }

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      await documentSearchService.softDelete(req.user!.firmId, req.params.id, req.user!.id);
      res.json(SuccessResponse({ success: true }));
    } catch (err) {
      next(err);
    }
  }

  // Versions
  async getVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const versions = await documentVersionService.getVersions(req.user!.firmId, req.params.id);
      res.json(SuccessResponse(versions));
    } catch (err) {
      next(err);
    }
  }

  async uploadVersion(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError(400, "File is required");
      const notes = req.body.notes || "";
      const doc = await documentVersionService.uploadNewVersion(req.user!.firmId, req.user!.id, req.params.id, req.file, notes);
      res.status(201).json(SuccessResponse(doc));
    } catch (err) {
      next(err);
    }
  }

  // Download
  async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const download = await documentDownloadService.getDownloadStream(req.user!.firmId, req.params.id);
      res.setHeader("Content-Type", download.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${download.fileName}"`);
      res.setHeader("Content-Length", download.fileSize);
      download.stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

export const documentController = new DocumentController();
