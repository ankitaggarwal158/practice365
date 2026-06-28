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

export interface UserRolesAndPermissionsResponse {
  roles: RoleResponseData[];
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface AssignRolesRequest {
  roleIds: string[];
}
