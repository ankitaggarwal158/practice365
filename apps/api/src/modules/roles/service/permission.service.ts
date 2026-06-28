import { Types } from "mongoose";
import { AppError } from "../../../shared/app-error.js";
import { ROLE_ERROR_MESSAGES, SYSTEM_PERMISSIONS, SYSTEM_ROLES } from "../constants/role.constants.js";
import * as roleRepository from "../repository/role.repository.js";
import { PermissionDocument, PermissionResponseData } from "../types/role.types.js";
import { User } from "../../users/schemas/user.schema.js";
import { Role } from "../schemas/role.schema.js";

export function formatPermission(permission: PermissionDocument): PermissionResponseData {
  return {
    id: permission._id.toString(),
    code: permission.code,
    name: permission.name,
    module: permission.module,
    description: permission.description,
    createdAt: permission.createdAt.toISOString(),
  };
}

export async function listPermissions(): Promise<PermissionResponseData[]> {
  const permissions = await roleRepository.findAllPermissions();
  return permissions.map(formatPermission);
}

export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[],
  requestingFirmId: string
): Promise<void> {
  const role = await roleRepository.findRoleById(roleId);
  if (!role) {
    throw AppError.notFound(ROLE_ERROR_MESSAGES.ROLE_NOT_FOUND);
  }

  // Prevent modifying system roles
  if (role.isSystemRole) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.SYSTEM_ROLE_PROTECTED);
  }

  // Firm isolation
  if (role.firmId && role.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }

  // Validate permission IDs exist
  const allPermissions = await roleRepository.findAllPermissions();
  const validIds = new Set(allPermissions.map((p) => p._id.toString()));
  
  for (const pId of permissionIds) {
    if (!validIds.has(pId)) {
      throw AppError.badRequest(ROLE_ERROR_MESSAGES.PERMISSION_NOT_FOUND);
    }
  }

  await roleRepository.assignPermissionsToRole(roleId, permissionIds);
}

export async function assignRolesToUser(
  targetUserId: string,
  roleIds: string[],
  requestingFirmId: string,
  assignedByUserId: string
): Promise<void> {
  // Validate target user exists and belongs to same firm
  const user = await User.findById(targetUserId);
  if (!user) {
    throw AppError.notFound("User not found.");
  }
  if (user.firmId.toString() !== requestingFirmId) {
    throw AppError.forbidden(ROLE_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
  }

  // Enforce role assignment count (minimum 1 role)
  if (!roleIds || roleIds.length === 0) {
    throw AppError.badRequest(ROLE_ERROR_MESSAGES.ROLE_ASSIGNMENT_REQUIRED);
  }

  // Validate role IDs exist and are scoped correctly
  for (const rId of roleIds) {
    const role = await roleRepository.findRoleById(rId);
    if (!role) {
      throw AppError.notFound(`Role ID ${rId} not found.`);
    }
    if (!role.isSystemRole && role.firmId && role.firmId.toString() !== requestingFirmId) {
      throw AppError.forbidden(ROLE_ERROR_MESSAGES.ACCESS_DENIED_SAME_FIRM);
    }
  }

  await roleRepository.assignRolesToUser(targetUserId, roleIds, assignedByUserId);
}

export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const roles = await roleRepository.findRolesByUserId(userId);
  if (roles.length === 0) return false;

  for (const role of roles) {
    const permissions = await roleRepository.findPermissionsByRoleId(role._id.toString());
    if (permissions.some((p) => p.code === permissionCode.toUpperCase())) {
      return true;
    }
  }

  return false;
}

export async function getUserEffectivePermissions(userId: string): Promise<string[]> {
  const roles = await roleRepository.findRolesByUserId(userId);
  if (roles.length === 0) return [];

  const permissionCodes = new Set<string>();

  for (const role of roles) {
    const permissions = await roleRepository.findPermissionsByRoleId(role._id.toString());
    for (const p of permissions) {
      permissionCodes.add(p.code);
    }
  }

  return Array.from(permissionCodes);
}

export async function seedSystemPermissionsAndRoles(): Promise<void> {
  console.log("[SEED] Initializing system permissions and roles...");

  // 1. Seed system permissions
  const seededPermissions: Record<string, Types.ObjectId> = {};
  for (const pDef of SYSTEM_PERMISSIONS) {
    const doc = await roleRepository.upsertPermission(pDef);
    seededPermissions[pDef.code] = doc._id;
  }

  // 2. Seed system roles
  for (const rDef of SYSTEM_ROLES) {
    let role = await Role.findOne({ name: rDef.name, isSystemRole: true, firmId: null });
    
    if (!role) {
      role = await Role.create({
        firmId: null,
        name: rDef.name,
        description: rDef.description,
        isSystemRole: true,
        isActive: true,
        createdBy: null,
      });
    } else {
      // Update description if needed
      role.description = rDef.description;
      await role.save();
    }

    // Assign mapped permissions
    const permissionIdsToAssign = rDef.permissions
      .map((code) => seededPermissions[code])
      .filter(Boolean)
      .map((id) => id.toString());

    await roleRepository.assignPermissionsToRole(role._id.toString(), permissionIdsToAssign);
  }

  console.log("[SEED] System permissions and roles successfully initialized.");
}
