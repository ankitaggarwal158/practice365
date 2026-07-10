import { Router } from "express";
import multer from "multer";
import { documentController } from "./document.controller.js";
import { authenticate as requireAuth } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Folders
router.get("/folders", requireAuth, requirePermission("DOCUMENTS_VIEW"), documentController.listFolders);
router.post("/folders", requireAuth, requirePermission("DOCUMENTS_MANAGE"), documentController.createFolder);
router.patch("/folders/:id", requireAuth, requirePermission("DOCUMENTS_MANAGE"), documentController.updateFolder);
router.delete("/folders/:id", requireAuth, requirePermission("DOCUMENTS_MANAGE"), documentController.deleteFolder);

// Documents
router.get("/", requireAuth, requirePermission("DOCUMENTS_VIEW"), documentController.searchDocuments);
router.get("/:id", requireAuth, requirePermission("DOCUMENTS_VIEW"), documentController.getDocument);
router.post("/", requireAuth, requirePermission("DOCUMENTS_MANAGE"), upload.single("file"), documentController.uploadDocument);
router.patch("/:id", requireAuth, requirePermission("DOCUMENTS_MANAGE"), documentController.updateMetadata);
router.delete("/:id", requireAuth, requirePermission("DOCUMENTS_MANAGE"), documentController.softDelete);
router.patch("/:id/portal-sharing", requireAuth, requirePermission("DOCUMENTS_MANAGE"), documentController.updatePortalSharing);
router.get("/:id/download", requireAuth, requirePermission("DOCUMENTS_VIEW"), documentController.downloadDocument);

// Versions
router.get("/:id/versions", requireAuth, requirePermission("DOCUMENTS_VIEW"), documentController.getVersions);
router.post("/:id/version", requireAuth, requirePermission("DOCUMENTS_MANAGE"), upload.single("file"), documentController.uploadVersion);

export default router;
