import { Router } from "express";
import { asyncHandler } from "../../../shared/async-handler.js";
import { authenticate } from "../../auth/middleware/auth.middleware.js";
import { requirePermission } from "../middleware/authorization.middleware.js";
import {
  validate,
  validateParams,
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
  assignRolesSchema,
  idParamSchema,
} from "../validation/role.validation.js";
import * as roleController from "../controller/role.controller.js";
import { AppError } from "../../../shared/app-error.js";
import { Types } from "mongoose";
import * as permissionService from "../service/permission.service.js";

const router = Router();

// Apply authenticate to all routes
router.use(authenticate);

// ─── Roles CRUD ──────────────────────────────────────────────

router.get(
  "/roles",
  requirePermission("ROLES_VIEW"),
  asyncHandler(roleController.listRoles)
);

router.get(
  "/roles/:id",
  requirePermission("ROLES_VIEW"),
  validateParams(idParamSchema),
  asyncHandler(roleController.getRoleById)
);

router.post(
  "/roles",
  requirePermission("ROLES_CREATE"),
  validate(createRoleSchema),
  asyncHandler(roleController.createRole)
);

router.patch(
  "/roles/:id",
  requirePermission("ROLES_UPDATE"),
  validateParams(idParamSchema),
  validate(updateRoleSchema),
  asyncHandler(roleController.updateRole)
);

router.delete(
  "/roles/:id",
  requirePermission("ROLES_DELETE"),
  validateParams(idParamSchema),
  asyncHandler(roleController.deleteRole)
);

// ─── Permissions ─────────────────────────────────────────────

router.get(
  "/permissions",
  requirePermission("ROLES_VIEW"),
  asyncHandler(roleController.listPermissions)
);

router.patch(
  "/roles/:id/permissions",
  requirePermission("PERMISSIONS_ASSIGN"),
  validateParams(idParamSchema),
  validate(assignPermissionsSchema),
  asyncHandler(roleController.assignRolePermissions)
);

// ─── User Roles ──────────────────────────────────────────────

router.patch(
  "/users/:id/roles",
  requirePermission("ROLES_ASSIGN"),
  validate(assignRolesSchema), // We validate params manually in the controller since 'id' could be 'me'
  asyncHandler(roleController.assignUserRoles)
);

router.get(
  "/users/:id/roles",
  asyncHandler(async (req, res) => {
    let id = req.params.id as string;
    if (id === "me") {
      id = req.user!.userId;
    } else {
      if (!Types.ObjectId.isValid(id)) {
        throw AppError.badRequest("Invalid User ID format.");
      }
      // Require ROLES_VIEW to access other users' roles
      const allowed = await permissionService.hasPermission(req.user!.userId, "ROLES_VIEW");
      if (!allowed) {
        throw AppError.forbidden("Access denied. Requires ROLES_VIEW permission.");
      }
    }
    
    req.params.id = id;
    await roleController.getUserRolesAndPermissions(req, res);
  })
);

export { router as rolesRouter };
export default router;
