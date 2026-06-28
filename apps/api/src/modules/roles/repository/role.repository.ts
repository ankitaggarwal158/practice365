import { Types } from "mongoose";
import { Role } from "../schemas/role.schema.js";
import { Permission } from "../schemas/permission.schema.js";
import { RolePermission } from "../schemas/role-permission.schema.js";
import { UserRole } from "../schemas/user-role.schema.js";
import {
  RoleDocument,
  PermissionDocument,
  RolePermissionDocument,
  UserRoleDocument,
} from "../types/role.types.js";

// ─── Role Operations ──────────────────────────────────────────

export async function findRoleById(id: string): Promise<RoleDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Role.findById(id);
}

export async function findRoleByName(
  firmId: string | null,
  name: string
): Promise<RoleDocument | null> {
  const query = {
    firmId: firmId ? new Types.ObjectId(firmId) : null,
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  };
  return Role.findOne(query);
}

export async function findRolesByFirmId(firmId: string): Promise<RoleDocument[]> {
  if (!Types.ObjectId.isValid(firmId)) return [];
  // Return firm's custom roles OR system roles (isSystemRole: true)
  return Role.find({
    $or: [
      { firmId: new Types.ObjectId(firmId) },
      { isSystemRole: true },
    ],
    isActive: true,
  }).sort({ isSystemRole: -1, name: 1 });
}

export async function createRole(data: Partial<RoleDocument>): Promise<RoleDocument> {
  return Role.create(data);
}

export async function updateRole(
  id: string,
  data: Partial<RoleDocument>
): Promise<RoleDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Role.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
}

export async function deleteRole(id: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(id)) return false;
  const result = await Role.deleteOne({ _id: new Types.ObjectId(id) });
  return (result.deletedCount ?? 0) > 0;
}

// ─── Permission Operations ────────────────────────────────────

export async function findAllPermissions(): Promise<PermissionDocument[]> {
  return Permission.find({}).sort({ module: 1, name: 1 });
}

export async function findPermissionByCode(code: string): Promise<PermissionDocument | null> {
  return Permission.findOne({ code: code.toUpperCase() });
}

export async function upsertPermission(data: {
  code: string;
  name: string;
  module: string;
  description: string;
}): Promise<PermissionDocument> {
  return Permission.findOneAndUpdate(
    { code: data.code.toUpperCase() },
    { $set: data },
    { upsert: true, new: true, runValidators: true }
  ) as unknown as Promise<PermissionDocument>;
}

// ─── Role Permission Mapping ─────────────────────────────────

export async function findPermissionsByRoleId(roleId: string): Promise<PermissionDocument[]> {
  if (!Types.ObjectId.isValid(roleId)) return [];
  
  const rolePerms = await RolePermission.find({ roleId: new Types.ObjectId(roleId) })
    .populate<{ permissionId: PermissionDocument }>("permissionId");

  return rolePerms.map((rp) => rp.permissionId).filter(Boolean);
}

export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[]
): Promise<void> {
  if (!Types.ObjectId.isValid(roleId)) return;

  const roleObjId = new Types.ObjectId(roleId);

  // Use a transaction or simply delete existing and recreate
  await RolePermission.deleteMany({ roleId: roleObjId });

  if (permissionIds.length === 0) return;

  const docs = permissionIds.map((pId) => ({
    roleId: roleObjId,
    permissionId: new Types.ObjectId(pId),
  }));

  await RolePermission.insertMany(docs);
}

// ─── User Role Mapping ───────────────────────────────────────

export async function findRolesByUserId(userId: string): Promise<RoleDocument[]> {
  if (!Types.ObjectId.isValid(userId)) return [];

  const userRoles = await UserRole.find({ userId: new Types.ObjectId(userId) })
    .populate<{ roleId: RoleDocument }>("roleId");

  return userRoles
    .map((ur) => ur.roleId)
    .filter((role) => role && role.isActive);
}

export async function findUserRoles(userId: string): Promise<UserRoleDocument[]> {
  if (!Types.ObjectId.isValid(userId)) return [];
  return UserRole.find({ userId: new Types.ObjectId(userId) });
}

export async function assignRolesToUser(
  userId: string,
  roleIds: string[],
  assignedByUserId: string
): Promise<void> {
  if (!Types.ObjectId.isValid(userId)) return;

  const userObjId = new Types.ObjectId(userId);
  const assignedByObjId = new Types.ObjectId(assignedByUserId);

  // Remove existing user role mappings
  await UserRole.deleteMany({ userId: userObjId });

  if (roleIds.length === 0) return;

  const docs = roleIds.map((rId) => ({
    userId: userObjId,
    roleId: new Types.ObjectId(rId),
    assignedBy: assignedByObjId,
    assignedAt: new Date(),
  }));

  await UserRole.insertMany(docs);
}
