import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../shared/async-handler.js";
import { validateRequest } from "../../shared/validate.js";
import { authenticate as requireAuth } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import { portalAuthenticate } from "../client-portal/portal-auth.middleware.js";
import * as validation from "./message-thread.validation.js";
import * as controller from "./message-thread.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

const staffRouter = Router();
const portalRouter = Router();

// ─── Firm Staff Routes ──────────────────────────────────────────

staffRouter.get(
  "/message-threads",
  requireAuth,
  requirePermission("MATTERS_VIEW"),
  validateRequest(validation.listThreadsSchema),
  asyncHandler(controller.listThreads)
);

staffRouter.get(
  "/message-threads/:matterId",
  requireAuth,
  requirePermission("MATTERS_VIEW"),
  validateRequest(validation.getThreadSchema),
  asyncHandler(controller.getThreadDetails)
);

staffRouter.get(
  "/message-threads/:matterId/messages",
  requireAuth,
  requirePermission("MATTERS_VIEW"),
  validateRequest(validation.listMessagesSchema),
  asyncHandler(controller.listMessages)
);

staffRouter.post(
  "/message-threads/:matterId/messages",
  requireAuth,
  requirePermission("MATTERS_UPDATE"),
  validateRequest(validation.sendMessageSchema),
  asyncHandler(controller.sendMessage)
);

staffRouter.post(
  "/message-threads/:matterId/attachments",
  requireAuth,
  requirePermission("MATTERS_UPDATE"),
  upload.single("file"),
  asyncHandler(controller.uploadAttachment)
);

// Staff Patch read receipt
staffRouter.patch(
  "/messages/:id/read",
  requireAuth,
  requirePermission("MATTERS_VIEW"),
  validateRequest(validation.markReadSchema),
  asyncHandler(controller.markMessageRead)
);

// ─── Portal Client Routes ───────────────────────────────────────

portalRouter.get(
  "/message-threads",
  portalAuthenticate,
  validateRequest(validation.listThreadsSchema),
  asyncHandler(controller.listPortalThreads)
);

portalRouter.get(
  "/message-threads/:matterId",
  portalAuthenticate,
  validateRequest(validation.getThreadSchema),
  asyncHandler(controller.getPortalThreadDetails)
);

portalRouter.get(
  "/message-threads/:matterId/messages",
  portalAuthenticate,
  validateRequest(validation.listMessagesSchema),
  asyncHandler(controller.listPortalMessages)
);

portalRouter.post(
  "/message-threads/:matterId/messages",
  portalAuthenticate,
  validateRequest(validation.sendMessageSchema),
  asyncHandler(controller.sendPortalMessage)
);

portalRouter.post(
  "/message-threads/:matterId/attachments",
  portalAuthenticate,
  upload.single("file"),
  asyncHandler(controller.uploadPortalAttachment)
);

// Client Patch read receipt
portalRouter.patch(
  "/messages/:id/read",
  portalAuthenticate,
  validateRequest(validation.markReadSchema),
  asyncHandler(controller.markMessageRead)
);

// Get message attachments
staffRouter.get(
  "/messages/:id/attachments",
  requireAuth,
  requirePermission("MATTERS_VIEW"),
  validateRequest(validation.markReadSchema),
  asyncHandler(controller.getMessageAttachments)
);

portalRouter.get(
  "/messages/:id/attachments",
  portalAuthenticate,
  validateRequest(validation.markReadSchema),
  asyncHandler(controller.getPortalMessageAttachments)
);

export { staffRouter as messageThreadRouter, portalRouter as portalMessageThreadRouter };
