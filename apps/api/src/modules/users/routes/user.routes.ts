import { Router } from "express";
import { asyncHandler } from "../../../shared/async-handler.js";
import { authenticate } from "../../auth/middleware/auth.middleware.js";
import { requirePermission } from "../../roles/index.js";
import {
  validate,
  validateQuery,
  validateParams,
  inviteUserSchema,
  updateUserSchema,
  changeStatusSchema,
  updatePreferencesSchema,
  updateOwnProfileSchema,
  acceptInvitationSchema,
  listUsersQuerySchema,
  idParamSchema,
} from "../validation/user.validation.js";
import * as userController from "../controller/user.controller.js";

const router = Router();

// ─── Public Routes ───────────────────────────────────────────

router.post(
  "/accept-invitation",
  validate(acceptInvitationSchema),
  asyncHandler(userController.acceptInvitation)
);

// ─── Protected Routes (Auth Required) ────────────────────────

router.get(
  "/me",
  authenticate,
  asyncHandler(userController.getCurrentUser)
);

router.patch(
  "/me",
  authenticate,
  validate(updateOwnProfileSchema),
  asyncHandler(userController.updateOwnProfile)
);

router.patch(
  "/me/preferences",
  authenticate,
  validate(updatePreferencesSchema),
  asyncHandler(userController.updatePreferences)
);

router.get(
  "/",
  authenticate,
  requirePermission("USERS_VIEW"),
  validateQuery(listUsersQuerySchema),
  asyncHandler(userController.listUsers)
);

router.get(
  "/:id",
  authenticate,
  requirePermission("USERS_VIEW"),
  validateParams(idParamSchema),
  asyncHandler(userController.getUserById)
);

router.post(
  "/",
  authenticate,
  requirePermission("USERS_CREATE"),
  validate(inviteUserSchema),
  asyncHandler(userController.inviteUser)
);

router.patch(
  "/:id",
  authenticate,
  requirePermission("USERS_UPDATE"),
  validateParams(idParamSchema),
  validate(updateUserSchema),
  asyncHandler(userController.updateUser)
);

router.patch(
  "/:id/status",
  authenticate,
  requirePermission("USERS_UPDATE"),
  validateParams(idParamSchema),
  validate(changeStatusSchema),
  asyncHandler(userController.changeUserStatus)
);

export { router as userRouter };
export default router;
