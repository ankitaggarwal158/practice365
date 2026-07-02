import { Router } from "express";
import multer from "multer";
import { documentController } from "./document.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermissions } from "../../middleware/rbac.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Folders
router.get("/folders", requireAuth, requirePermissions(["DOCUMENTS_VIEW"]), documentController.listFolders);
router.post("/folders", requireAuth, requirePermissions(["DOCUMENTS_MANAGE"]), documentController.createFolder);
router.patch("/folders/:id", requireAuth, requirePermissions(["DOCUMENTS_MANAGE"]), documentController.updateFolder);
router.delete("/folders/:id", requireAuth, requirePermissions(["DOCUMENTS_MANAGE"]), documentController.deleteFolder);

// Documents
router.get("/", requireAuth, requirePermissions(["DOCUMENTS_VIEW"]), documentController.searchDocuments);
router.get("/:id", requireAuth, requirePermissions(["DOCUMENTS_VIEW"]), documentController.getDocument);
router.post("/", requireAuth, requirePermissions(["DOCUMENTS_MANAGE"]), upload.single("file"), documentController.uploadDocument);
router.patch("/:id", requireAuth, requirePermissions(["DOCUMENTS_MANAGE"]), documentController.updateMetadata);
router.delete("/:id", requireAuth, requirePermissions(["DOCUMENTS_MANAGE"]), documentController.softDelete);
router.get("/:id/download", requireAuth, requirePermissions(["DOCUMENTS_VIEW"]), documentController.downloadDocument);

// Versions
router.get("/:id/versions", requireAuth, requirePermissions(["DOCUMENTS_VIEW"]), documentController.getVersions);
router.post("/:id/version", requireAuth, requirePermissions(["DOCUMENTS_MANAGE"]), upload.single("file"), documentController.uploadVersion);

export default router;
