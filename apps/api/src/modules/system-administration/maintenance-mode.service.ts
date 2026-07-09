import { Request, Response, NextFunction } from "express";
import * as systemSettingsRepository from "./system-settings.repository.js";
import { getUserEffectivePermissions } from "../roles/service/permission.service.js";
import { verifyAccessToken } from "../auth/auth.tokens.js";
import { AppError } from "../../shared/app-error.js";

/**
 * Checks if maintenance mode is active.
 */
export async function isMaintenanceModeActive(): Promise<boolean> {
  const settings = await systemSettingsRepository.getSettings();
  return settings.maintenanceMode;
}

/**
 * Gets the current maintenance message.
 */
export async function getMaintenanceMessage(): Promise<string> {
  const settings = await systemSettingsRepository.getSettings();
  return settings.maintenanceMessage;
}

/**
 * Global Express middleware to block non-admin requests when maintenance mode is active.
 */
export async function checkMaintenanceMode(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const isMaint = await isMaintenanceModeActive();
    if (!isMaint) {
      return next();
    }

    // Bypass list for health, auth login/refresh, and active announcements
    const bypassPaths = [
      "/health",
      "/api/auth/login",
      "/api/auth/refresh",
      "/api/system/announcements/active",
    ];

    if (bypassPaths.some((p) => req.path === p || req.path.startsWith(p))) {
      return next();
    }

    // Populates req.user if authorization token is passed
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyAccessToken(token);
        if (payload) {
          req.user = {
            userId: payload.userId,
            sessionId: payload.sessionId,
          };
        }
      } catch (err) {
        // Suppress verification errors so that the standard authenticate middleware handles 401 response
      }
    }

    // If authenticated (directly or parsed here), check for SYSTEM_ADMIN permission
    if (req.user) {
      const permissions = await getUserEffectivePermissions(req.user.userId);
      if (permissions.includes("SYSTEM_ADMIN")) {
        return next();
      }

      const msg = await getMaintenanceMessage();
      return next(new AppError(msg, 503));
    }

    // If unauthenticated guest, let standard route auth middleware block or allow
    next();
  } catch (err) {
    next(err);
  }
}
