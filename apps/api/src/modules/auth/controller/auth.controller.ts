import { Request, Response } from "express";
import { sendSuccess } from "../../../shared/api-response.js";
import { AppError } from "../../../shared/app-error.js";
import * as authService from "../service/auth.service.js";
import * as sessionService from "../service/auth.session.service.js";
import * as passwordService from "../service/auth.password.service.js";
import * as emailService from "../service/auth.email.service.js";
import { extractRequestMeta } from "../service/auth.service.js";
import { AUTH_ERROR_MESSAGES } from "../constants/auth.constants.js";
import type {
  LoginRequest,
  RefreshRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth.types.js";

import { isMaintenanceModeActive, getMaintenanceMessage } from "../../system-administration/index.js";
import { getUserEffectivePermissions } from "../../roles/service/permission.service.js";

/**
 * POST /auth/login
 * Authenticate user with email and password.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginRequest;

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const userAgent = req.headers["user-agent"] || "";

  const meta = extractRequestMeta(ipAddress, userAgent);
  const result = await authService.login(email, password, meta);

  // Check if maintenance mode is active
  const isMaint = await isMaintenanceModeActive();
  if (isMaint) {
    const permissions = await getUserEffectivePermissions(result.user.id);
    if (!permissions.includes("SYSTEM_ADMIN")) {
      const msg = await getMaintenanceMessage();
      throw new AppError(msg, 503);
    }
  }

  sendSuccess(res, result);
}

/**
 * POST /auth/logout
 * Logout current session.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  await sessionService.logout(req.user.sessionId);
  sendSuccess(res, null);
}

/**
 * POST /auth/logout-all
 * Logout all sessions for the authenticated user.
 */
export async function logoutAll(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  await sessionService.logoutAll(req.user.userId);
  sendSuccess(res, null);
}

/**
 * POST /auth/refresh
 * Refresh access token using a valid refresh token.
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshRequest;
  const result = await authService.refresh(refreshToken);
  sendSuccess(res, result);
}

/**
 * POST /auth/forgot-password
 * Request a password reset link.
 */
export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { email } = req.body as ForgotPasswordRequest;
  await passwordService.forgotPassword(email);

  // Always return success per AUTH-006
  sendSuccess(res, {
    message: AUTH_ERROR_MESSAGES.PASSWORD_RESET_SUCCESS,
  });
}

/**
 * POST /auth/reset-password
 * Reset password with a valid reset token.
 */
export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { token, password } = req.body as ResetPasswordRequest;
  await passwordService.resetPassword(token, password);
  sendSuccess(res, null);
}

/**
 * POST /auth/verify-email
 * Verify email with a verification token.
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.body as VerifyEmailRequest;
  await emailService.verifyEmail(token);
  sendSuccess(res, {
    message: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_SUCCESS,
  });
}

/**
 * GET /auth/me
 * Get current authenticated user.
 */
export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const currentUser = await authService.getCurrentUser(req.user.userId);
  sendSuccess(res, currentUser);
}
