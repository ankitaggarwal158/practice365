import { Request, Response } from "express";
import { sendSuccess } from "../../../shared/api-response.js";
import { AppError } from "../../../shared/app-error.js";
import * as roleService from "../service/role.service.js";
import * as permissionService from "../service/permission.service.js";
import * as userService from "../../users/service/user.service.js";
import {
  CreateRoleRequest,
  AssignPermissionsRequest,
  AssignRolesRequest,
} from "../types/role.types.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function listRoles(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const roles = await roleService.listRoles(firmId);
  sendSuccess(res, roles);
}

export async function getRoleById(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  const role = await roleService.getRoleById(id, firmId);
  sendSuccess(res, role);
}

export async function createRole(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { name, description } = req.body as CreateRoleRequest;
  const role = await roleService.createRole(firmId, name, description, req.user!.userId);
  sendSuccess(res, role, 201);
}

export async function updateRole(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  const { name, description } = req.body as CreateRoleRequest;
  const role = await roleService.updateRole(id, name, description, firmId);
  sendSuccess(res, role);
}

export async function deleteRole(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  await roleService.deleteRole(id, firmId);
  sendSuccess(res, null, 204);
}

export async function listPermissions(req: Request, res: Response): Promise<void> {
  const permissions = await permissionService.listPermissions();
  sendSuccess(res, permissions);
}

export async function assignRolePermissions(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  const { permissionIds } = req.body as AssignPermissionsRequest;
  await permissionService.assignPermissionsToRole(id, permissionIds, firmId);
  sendSuccess(res, null);
}

export async function assignUserRoles(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  const { roleIds } = req.body as AssignRolesRequest;
  await permissionService.assignRolesToUser(id, roleIds, firmId, req.user!.userId);
  sendSuccess(res, null);
}

export async function getUserRolesAndPermissions(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  let { id } = req.params as { id: string };
  
  if (id === "me") {
    id = req.user!.userId;
  }

  // Double check firm isolation
  const targetUser = await userService.getCurrentUser(id);
  if (targetUser.firmId !== firmId) {
    throw AppError.forbidden("Access denied. User belongs to another firm.");
  }

  const roles = await roleRepositoryFindRoles(id);
  const permissions = await permissionService.getUserEffectivePermissions(id);
  
  sendSuccess(res, {
    roles,
    permissions,
  });
}

// Inline helper to bypass direct repository calls in controller
import * as roleRepository from "../repository/role.repository.js";
async function roleRepositoryFindRoles(userId: string) {
  const roles = await roleRepository.findRolesByUserId(userId);
  return roles.map(roleService.formatRole);
}
