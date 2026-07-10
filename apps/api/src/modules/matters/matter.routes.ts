import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  createMatterSchema,
  updateMatterSchema,
  updateStatusSchema,
  updateTeamSchema,
  changeAttorneySchema,
  addNoteSchema,
  uploadAttachmentSchema,
} from "./matter.validation.js";
import * as matterController from "./matter.controller.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.post(
  "/matters",
  requirePermission("MATTERS_CREATE"),
  validate(createMatterSchema),
  asyncHandler(matterController.createMatter)
);

router.get(
  "/matters",
  requirePermission("MATTERS_VIEW"),
  asyncHandler(matterController.listMatters)
);

router.get(
  "/matters/practice-areas",
  requirePermission("MATTERS_VIEW"),
  asyncHandler(matterController.listPracticeAreas)
);

router.get(
  "/matters/:id",
  requirePermission("MATTERS_VIEW"),
  asyncHandler(matterController.getMatter)
);

router.patch(
  "/matters/:id",
  requirePermission("MATTERS_UPDATE"),
  validate(updateMatterSchema),
  asyncHandler(matterController.updateMatter)
);

router.patch(
  "/matters/:id/status",
  requirePermission("MATTERS_UPDATE"),
  validate(updateStatusSchema),
  asyncHandler(matterController.updateMatterStatus)
);

router.patch(
  "/matters/:id/team",
  requirePermission("MATTERS_UPDATE"),
  validate(updateTeamSchema),
  asyncHandler(matterController.updateMatterTeam)
);

router.patch(
  "/matters/:id/attorney",
  requirePermission("MATTERS_UPDATE"),
  validate(changeAttorneySchema),
  asyncHandler(matterController.changeResponsibleAttorney)
);

router.patch(
  "/matters/:id/archive",
  requirePermission("MATTERS_UPDATE"),
  asyncHandler(matterController.archiveMatter)
);

router.patch(
  "/matters/:id/reopen",
  requirePermission("MATTERS_UPDATE"),
  asyncHandler(matterController.reopenMatter)
);

router.get(
  "/matters/:id/timeline",
  requirePermission("MATTERS_VIEW"),
  asyncHandler(matterController.getMatterTimeline)
);

router.get(
  "/matters/:id/summary",
  requirePermission("MATTERS_VIEW"),
  asyncHandler(matterController.getMatterSummary)
);

// ─── Matter Notes Endpoints ─────────────────────────────────

router.post(
  "/matters/:id/notes",
  requirePermission("MATTERS_UPDATE"),
  validate(addNoteSchema),
  asyncHandler(matterController.addNote)
);

router.put(
  "/matters/:id/notes/:noteId",
  requirePermission("MATTERS_UPDATE"),
  validate(addNoteSchema),
  asyncHandler(matterController.updateNote)
);

router.delete(
  "/matters/:id/notes/:noteId",
  requirePermission("MATTERS_UPDATE"),
  asyncHandler(matterController.deleteNote)
);

// ─── Matter Attachments Endpoints ───────────────────────────

router.post(
  "/matters/:id/attachments",
  requirePermission("MATTERS_UPDATE"),
  validate(uploadAttachmentSchema),
  asyncHandler(matterController.addAttachment)
);

router.delete(
  "/matters/:id/attachments/:attachmentId",
  requirePermission("MATTERS_UPDATE"),
  asyncHandler(matterController.deleteAttachment)
);

export { router as matterRouter };
export default router;
