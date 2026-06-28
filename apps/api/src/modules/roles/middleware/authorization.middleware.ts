import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/app-error.js";
import { hasPermission } from "../service/permission.service.js";

/**
 * Express middleware to check if the authenticated user has the specified permission.
 * Calls next() if authorized, or passes an AppError.forbidden to error handler.
 */
export function requirePermission(permissionCode: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      const allowed = await hasPermission(req.user.userId, permissionCode);
      if (!allowed) {
        throw AppError.forbidden(`Access denied. Requires permission: ${permissionCode}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
