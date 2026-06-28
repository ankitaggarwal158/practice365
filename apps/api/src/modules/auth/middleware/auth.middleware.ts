import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth.tokens.js";
import { AppError } from "../../../shared/app-error.js";
import { AUTH_ERROR_MESSAGES } from "../constants/auth.constants.js";
import type { AuthenticatedUser } from "../types/auth.types.js";

/**
 * Augment Express Request to include authenticated user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware.
 *
 * Extracts Bearer token from the Authorization header,
 * verifies the JWT, and attaches `req.user` with userId and sessionId.
 *
 * Returns 401 if:
 * - No Authorization header is present
 * - Token format is invalid
 * - Token is expired or tampered
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  const payload = verifyAccessToken(token);

  if (!payload) {
    throw AppError.unauthorized(AUTH_ERROR_MESSAGES.INVALID_TOKEN);
  }

  req.user = {
    userId: payload.userId,
    sessionId: payload.sessionId,
  };

  next();
}
