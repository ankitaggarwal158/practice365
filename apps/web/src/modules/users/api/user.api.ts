import { httpClient } from "@/services/http-client";
import type {
  UserResponseData,
  InviteUserRequest,
  UpdateUserRequest,
  UpdateOwnProfileRequest,
  UpdatePreferencesRequest,
  ChangeStatusRequest,
  AcceptInvitationRequest,
} from "../types/user.types";

export const userApi = {
  listUsers: (query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    status?: string;
    q?: string;
  }) => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.order) params.append("order", query.order);
    if (query.status) params.append("status", query.status);
    if (query.q) params.append("q", query.q);

    return httpClient.getPaginated<UserResponseData>(`/users?${params.toString()}`);
  },

  getUser: (id: string) =>
    httpClient.get<UserResponseData>(`/users/${id}`),

  inviteUser: (data: InviteUserRequest) =>
    httpClient.post<UserResponseData>("/users", data),

  updateUser: (id: string, data: UpdateUserRequest) =>
    httpClient.patch<UserResponseData>(`/users/${id}`, data),

  updateCurrentUser: (data: UpdateOwnProfileRequest) =>
    httpClient.patch<UserResponseData>("/users/me", data),

  updatePreferences: (data: UpdatePreferencesRequest) =>
    httpClient.patch<UserResponseData>("/users/me/preferences", data),

  changeUserStatus: (id: string, data: ChangeStatusRequest) =>
    httpClient.patch<UserResponseData>(`/users/${id}/status`, data),

  acceptInvitation: (data: AcceptInvitationRequest) =>
    httpClient.post<UserResponseData>("/users/accept-invitation", data, true),
};
export default userApi;
