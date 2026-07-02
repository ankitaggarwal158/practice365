import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { authenticate } from "../auth/middleware/auth.middleware.js";
import { requirePermission } from "../roles/index.js";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../../shared/app-error.js";

function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw AppError.validation("Validation failed.", errors);
    }

    req.body = result.data;
    next();
  };
}
import {
  createPracticeAreaSchema,
  updatePracticeAreaSchema,
  updateStatusSchema,
  reorderPracticeAreasSchema,
} from "./practice-area.validation.js";
import * as practiceAreaController from "./practice-area.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/practice-areas",
  requirePermission("PRACTICE_AREAS_VIEW"),
  asyncHandler(practiceAreaController.listPracticeAreas)
);

router.get(
  "/practice-areas/active",
  requirePermission("PRACTICE_AREAS_VIEW"),
  asyncHandler(practiceAreaController.listActivePracticeAreas)
);

router.post(
  "/practice-areas",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(createPracticeAreaSchema),
  asyncHandler(practiceAreaController.createPracticeArea)
);

router.patch(
  "/practice-areas/reorder",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(reorderPracticeAreasSchema),
  asyncHandler(practiceAreaController.reorderPracticeAreas)
);

router.get(
  "/practice-areas/:id",
  requirePermission("PRACTICE_AREAS_VIEW"),
  asyncHandler(practiceAreaController.getPracticeArea)
);

router.patch(
  "/practice-areas/:id",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(updatePracticeAreaSchema),
  asyncHandler(practiceAreaController.updatePracticeArea)
);

router.patch(
  "/practice-areas/:id/status",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  validate(updateStatusSchema),
  asyncHandler(practiceAreaController.updateStatus)
);

router.delete(
  "/practice-areas/:id",
  requirePermission("PRACTICE_AREAS_MANAGE"),
  asyncHandler(practiceAreaController.deletePracticeArea)
);

export { router as practiceAreaRouter };
