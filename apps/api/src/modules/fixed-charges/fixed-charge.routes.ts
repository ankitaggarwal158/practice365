import { Router } from "express";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/middleware/authorization.middleware.js";
import { fixedChargeController } from "./fixed-charge.controller.js";
import {
  createFixedChargeSchema,
  updateFixedChargeSchema,
  listFixedChargeQuerySchema,
  validate,
  validateQuery,
} from "./fixed-charge.validation.js";

const router = Router();

// Apply authenticate globally to all fixed charges routes
router.use(authenticate);

router.post(
  "/",
  requirePermission("FIXED_CHARGES_CREATE"),
  validate(createFixedChargeSchema),
  fixedChargeController.create
);

router.get(
  "/",
  requirePermission("FIXED_CHARGES_VIEW"),
  validateQuery(listFixedChargeQuerySchema),
  fixedChargeController.list
);

router.get(
  "/:id",
  requirePermission("FIXED_CHARGES_VIEW"),
  fixedChargeController.get
);

router.patch(
  "/:id",
  requirePermission("FIXED_CHARGES_UPDATE"),
  validate(updateFixedChargeSchema),
  fixedChargeController.update
);

router.delete(
  "/:id",
  requirePermission("FIXED_CHARGES_DELETE"),
  fixedChargeController.delete
);

export { router as fixedChargeRouter };
export default router;
