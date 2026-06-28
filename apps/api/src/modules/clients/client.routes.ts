import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  createClientSchema,
  updateClientSchema,
  addNoteSchema,
  addAttachmentSchema,
  mergeClientSchema,
  duplicateSearchSchema,
} from "./client.validation.js";
import * as clientController from "./client.controller.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.post(
  "/clients",
  requirePermission("CLIENTS_CREATE"),
  validate(createClientSchema),
  asyncHandler(clientController.createClient)
);

router.get(
  "/clients",
  requirePermission("CLIENTS_VIEW"),
  asyncHandler(clientController.listClients)
);

router.get(
  "/clients/:id",
  requirePermission("CLIENTS_VIEW"),
  asyncHandler(clientController.getClient)
);

router.put(
  "/clients/:id",
  requirePermission("CLIENTS_UPDATE"),
  validate(updateClientSchema),
  asyncHandler(clientController.updateClient)
);

router.patch(
  "/clients/:id/archive",
  requirePermission("CLIENTS_UPDATE"),
  asyncHandler(clientController.archiveClient)
);

router.patch(
  "/clients/:id/reactivate",
  requirePermission("CLIENTS_UPDATE"),
  asyncHandler(clientController.reactivateClient)
);

router.post(
  "/clients/:id/merge",
  requirePermission("CLIENTS_UPDATE"),
  validate(mergeClientSchema),
  asyncHandler(clientController.mergeClients)
);

router.post(
  "/clients/duplicates",
  requirePermission("CLIENTS_VIEW"),
  validate(duplicateSearchSchema),
  asyncHandler(clientController.findDuplicates)
);

// ─── Client Notes Endpoints ─────────────────────────────────

router.post(
  "/clients/:id/notes",
  requirePermission("CLIENTS_UPDATE"),
  validate(addNoteSchema),
  asyncHandler(clientController.addNote)
);

router.put(
  "/clients/:id/notes/:noteId",
  requirePermission("CLIENTS_UPDATE"),
  validate(addNoteSchema),
  asyncHandler(clientController.updateNote)
);

router.delete(
  "/clients/:id/notes/:noteId",
  requirePermission("CLIENTS_UPDATE"),
  asyncHandler(clientController.deleteNote)
);

// ─── Client Attachments Endpoints ───────────────────────────

router.post(
  "/clients/:id/attachments",
  requirePermission("CLIENTS_UPDATE"),
  validate(addAttachmentSchema),
  asyncHandler(clientController.addAttachment)
);

router.delete(
  "/clients/:id/attachments/:attachmentId",
  requirePermission("CLIENTS_UPDATE"),
  asyncHandler(clientController.deleteAttachment)
);

export { router as clientRouter };
export default router;
