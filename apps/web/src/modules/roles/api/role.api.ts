import { httpClient } from "@/services/http-client";
import type {
  RoleResponseData,
  PermissionResponseData,
  UserRolesAndPermissionsResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  AssignRolesRequest,
} from "../types/role.types";

export const roleApi = {
  listRoles: () =>
    httpClient.get<RoleResponseData[]>("/roles"),

  getRole: (id: string) =>
    httpClient.get<RoleResponseData>(`/roles/${id}`),

  createRole: (data: CreateRoleRequest) =>
    httpClient.post<RoleResponseData>("/roles", data),

  updateRole: (id: string, data: UpdateRoleRequest) =>
    httpClient.patch<RoleResponseData>(`/roles/${id}`, data),

  deleteRole: (id: string) =>
    httpClient.delete<null>(`/roles/${id}`),

  listPermissions: () =>
    httpClient.get<PermissionResponseData[]>("/permissions"),

  assignRolePermissions: (roleId: string, data: AssignPermissionsRequest) =>
    httpClient.patch<null>(`/roles/${roleId}/permissions`, data),

  assignUserRoles: (userId: string, data: AssignRolesRequest) =>
    httpClient.patch<null>(`/users/${userId}/roles`, data),

  getUserRolesAndPermissions: (userId: string) =>
    httpClient.get<UserRolesAndPermissionsResponse>(`/users/${userId}/roles`),
};

export default roleApi;
