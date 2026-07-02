import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import {
  validate,
  createOpposingPartySchema,
  updateOpposingPartySchema,
  linkMatterSchema,
  checkDuplicatesSchema,
} from "./opposing-party.validation.js";
import * as opposingPartyController from "./opposing-party.controller.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Opposing Party CRUD & Actions
router.get(
  "/opposing-parties",
  requirePermission("OPPOSING_PARTIES_VIEW"),
  asyncHandler(opposingPartyController.listOpposingParties)
);

router.post(
  "/opposing-parties",
  requirePermission("OPPOSING_PARTIES_MANAGE"),
  validate(createOpposingPartySchema),
  asyncHandler(opposingPartyController.createOpposingParty)
);

router.post(
  "/opposing-parties/duplicates",
  requirePermission("OPPOSING_PARTIES_VIEW"),
  validate(checkDuplicatesSchema),
  asyncHandler(opposingPartyController.checkDuplicates)
);

router.get(
  "/opposing-parties/:id",
  requirePermission("OPPOSING_PARTIES_VIEW"),
  asyncHandler(opposingPartyController.getOpposingParty)
);

router.patch(
  "/opposing-parties/:id",
  requirePermission("OPPOSING_PARTIES_MANAGE"),
  validate(updateOpposingPartySchema),
  asyncHandler(opposingPartyController.updateOpposingParty)
);

router.delete(
  "/opposing-parties/:id",
  requirePermission("OPPOSING_PARTIES_MANAGE"),
  asyncHandler(opposingPartyController.deleteOpposingParty)
);

router.patch(
  "/opposing-parties/:id/archive",
  requirePermission("OPPOSING_PARTIES_MANAGE"),
  asyncHandler(opposingPartyController.archiveOpposingParty)
);

// Matter Opposing Party Associations
router.get(
  "/matters/:id/opposing-parties",
  requirePermission("MATTERS_VIEW"),
  asyncHandler(opposingPartyController.listMatterAssociations)
);

router.patch(
  "/matters/:id/opposing-parties",
  requirePermission("MATTERS_UPDATE"),
  validate(linkMatterSchema),
  asyncHandler(opposingPartyController.updateMatterAssociations)
);

router.delete(
  "/matters/:id/opposing-parties/:partyId",
  requirePermission("MATTERS_UPDATE"),
  asyncHandler(opposingPartyController.unlinkMatterAssociation)
);

export { router as opposingPartyRouter };
