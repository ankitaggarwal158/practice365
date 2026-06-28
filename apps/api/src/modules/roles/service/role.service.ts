import { Types } from "mongoose";
import { AppError } from "../../../shared/app-error.js";
import { ROLE_ERROR_MESSAGES } from "../constants/role.constants.js";
import * as roleRepository from "../repository/role.repository.js";
import { RoleDocument, RoleResponseData } from "../types/role.types.js";
import { UserRole } from "../schemas/user-role.schema.js";

export function formatRole(role: RoleDocument): RoleResponseData {
  return {
    id: role._id.toString(),
    firmId: role.firmId ? role.firmId.toString() : null,
    name: role.name,
    description: role.description,
    isSystemRole: role.isSystemRole,
    isActive: role.isActive,
    createdBy: role.createdBy ? role.createdBy.toString() : null,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

export async function listRoles(firmId: string): Promise<RoleResponseData[]> {
  const roles = await roleRepository.findRolesByFirmId(firmId);
  return roles.map(formatRole);
}

export async function getRoleById(
  id: string,
  requestingFirmId: string
): Promise<RoleResponseData> {
  const role = await roleRepository.findRoleById(id);
  if (!role) {
    throw AppError.notFound(ROLE_ERROR_MESSAGES.ROLE_NOT_FOUND);
  }

  // Cross-firm isolation: system roles are global (firmId is null), others must match requesting firm
  if (!role.isSystemRole && role.firmId && role.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }

  const permissions = await roleRepository.findPermissionsByRoleId(id);

  return {
    ...formatRole(role),
    permissionIds: permissions.map((p) => p._id.toString()),
  };
}

export async function createRole(
  firmId: string,
  name: string,
  description: string,
  creatorUserId: string
): Promise<RoleResponseData> {
  if (!name || !name.trim()) {
    throw AppError.badRequest(ROLE_ERROR_MESSAGES.ROLE_NAME_REQUIRED);
  }

  // Check for duplicate name in the same firm
  const existing = await roleRepository.findRoleByName(firmId, name);
  if (existing) {
    throw AppError.conflict(ROLE_ERROR_MESSAGES.ROLE_NAME_DUPLICATE);
  }

  const role = await roleRepository.createRole({
    firmId: new Types.ObjectId(firmId),
    name: name.trim(),
    description: description.trim(),
    isSystemRole: false,
    isActive: true,
    createdBy: new Types.ObjectId(creatorUserId),
  });

  return formatRole(role);
}

export async function updateRole(
  id: string,
  name: string,
  description: string,
  requestingFirmId: string
): Promise<RoleResponseData> {
  if (!name || !name.trim()) {
    throw AppError.badRequest(ROLE_ERROR_MESSAGES.ROLE_NAME_REQUIRED);
  }

  const role = await roleRepository.findRoleById(id);
  if (!role) {
    throw AppError.notFound(ROLE_ERROR_MESSAGES.ROLE_NOT_FOUND);
  }

  // Protect system roles
  if (role.isSystemRole) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.SYSTEM_ROLE_PROTECTED);
  }

  // Firm isolation
  if (role.firmId && role.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }

  // Check name uniqueness if changed
  const existing = await roleRepository.findRoleByName(requestingFirmId, name);
  if (existing && existing._id.toString() !== id) {
    throw AppError.conflict(ROLE_ERROR_MESSAGES.ROLE_NAME_DUPLICATE);
  }

  const updated = await roleRepository.updateRole(id, {
    name: name.trim(),
    description: description.trim(),
  });

  if (!updated) {
    throw AppError.notFound(ROLE_ERROR_MESSAGES.ROLE_NOT_FOUND);
  }

  return formatRole(updated);
}

export async function deleteRole(id: string, requestingFirmId: string): Promise<void> {
  const role = await roleRepository.findRoleById(id);
  if (!role) {
    throw AppError.notFound(ROLE_ERROR_MESSAGES.ROLE_NOT_FOUND);
  }

  // Protect system roles
  if (role.isSystemRole) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.SYSTEM_ROLE_PROTECTED);
  }

  // Firm isolation
  if (role.firmId && role.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }

  // Ensure role is not currently assigned to any users
  const userRolesCount = await UserRole.countDocuments({ roleId: new Types.ObjectId(id) });
  if (userRolesCount > 0) {
    throw AppError.badRequest("Cannot delete role because it is currently assigned to users.");
  }

  // Delete role and its permission mappings
  await roleRepository.deleteRole(id);
  await roleRepository.assignPermissionsToRole(id, []); // clears role_permissions
}
