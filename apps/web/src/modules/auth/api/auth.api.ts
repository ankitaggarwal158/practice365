import { httpClient } from "@/services/http-client";
import type {
  LoginRequest,
  LoginResponseData,
  RefreshResponseData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  CurrentUser,
  MessageData,
} from "../types/auth.types";

/**
 * Authentication API client.
 * Per module architecture (002 §6): all API communication is encapsulated here.
 */
export const authApi = {
  login: (data: LoginRequest) =>
    httpClient.post<LoginResponseData>("/auth/login", data, true),

  logout: () =>
    httpClient.post<null>("/auth/logout"),

  logoutAll: () =>
    httpClient.post<null>("/auth/logout-all"),

  refresh: (refreshToken: string) =>
    httpClient.post<RefreshResponseData>(
      "/auth/refresh",
      { refreshToken },
      true
    ),

  forgotPassword: (data: ForgotPasswordRequest) =>
    httpClient.post<MessageData>("/auth/forgot-password", data, true),

  resetPassword: (data: ResetPasswordRequest) =>
    httpClient.post<null>("/auth/reset-password", data, true),

  verifyEmail: (data: VerifyEmailRequest) =>
    httpClient.post<MessageData>("/auth/verify-email", data, true),

  getCurrentUser: () =>
    httpClient.get<CurrentUser>("/auth/me"),
};
