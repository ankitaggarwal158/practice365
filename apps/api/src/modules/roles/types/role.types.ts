import { Types, Document } from "mongoose";

export interface RoleDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId | null; // null for system roles
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionDocument extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  module: string;
  description: string;
  createdAt: Date;
}

export interface RolePermissionDocument extends Document {
  _id: Types.ObjectId;
  roleId: Types.ObjectId;
  permissionId: Types.ObjectId;
  createdAt: Date;
}

export interface UserRoleDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  assignedBy: Types.ObjectId;
  assignedAt: Date;
  createdAt: Date;
}

// ─── API Response Data Types ─────────────────────────────────

export interface RoleResponseData {
  id: string;
  firmId: string | null;
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  permissionIds?: string[];
}

export interface PermissionResponseData {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
  createdAt: string;
}

export interface UserRoleResponseData {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  createdAt: string;
}

// ─── Request Schemas ──────────────────────────────────────────

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface AssignRolesRequest {
  roleIds: string[];
}
