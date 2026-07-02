import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  createMatterContactSchema,
  updateMatterContactSchema,
  linkMattersSchema,
  checkDuplicatesSchema,
} from "./matter-contact.validation.js";
import * as matterContactController from "./matter-contact.controller.js";

const router = Router();

router.use(authenticate);

// Contacts CRUD
router.get(
  "/matter-contacts",
  requirePermission("MATTER_CONTACTS_VIEW"),
  asyncHandler(matterContactController.listMatterContacts)
);

router.post(
  "/matter-contacts",
  requirePermission("MATTER_CONTACTS_MANAGE"),
  validate(createMatterContactSchema),
  asyncHandler(matterContactController.createMatterContact)
);

router.post(
  "/matter-contacts/duplicates",
  requirePermission("MATTER_CONTACTS_VIEW"),
  validate(checkDuplicatesSchema),
  asyncHandler(matterContactController.checkDuplicates)
);

router.get(
  "/matter-contacts/:id",
  requirePermission("MATTER_CONTACTS_VIEW"),
  asyncHandler(matterContactController.getMatterContact)
);

router.patch(
  "/matter-contacts/:id",
  requirePermission("MATTER_CONTACTS_MANAGE"),
  validate(updateMatterContactSchema),
  asyncHandler(matterContactController.updateMatterContact)
);

router.delete(
  "/matter-contacts/:id",
  requirePermission("MATTER_CONTACTS_MANAGE"),
  asyncHandler(matterContactController.deleteMatterContact)
);

router.patch(
  "/matter-contacts/:id/archive",
  requirePermission("MATTER_CONTACTS_MANAGE"),
  asyncHandler(matterContactController.archiveMatterContact)
);

router.get(
  "/matter-contacts/:id/matters",
  requirePermission("MATTER_CONTACTS_VIEW"),
  asyncHandler(matterContactController.listContactMatterLinks)
);

// Matter Contact Associations
router.get(
  "/matters/:id/contacts",
  requirePermission("MATTERS_VIEW"),
  asyncHandler(matterContactController.listMatterContactLinks)
);

router.patch(
  "/matters/:id/contacts",
  requirePermission("MATTERS_UPDATE"),
  validate(linkMattersSchema),
  asyncHandler(matterContactController.updateMatterContactLinks)
);

export { router as matterContactRouter };
