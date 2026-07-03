import { Request, Response, NextFunction } from "express";
import { portalSessionService } from "./portal-session.service.js";
import { AppError } from "../../shared/app-error.js";

declare global {
  namespace Express {
    interface Request {
      portalUser?: {
        portalUserId: string;
        clientId: string;
        firmId: string;
        sessionId: string;
      };
    }
  }
}

export function portalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw AppError.unauthorized("Portal authentication is required.");
  }

  const token = authHeader.substring(7);
  const payload = portalSessionService.verifyAccessToken(token);
  if (!payload) {
    throw AppError.unauthorized("Portal session has expired or is invalid.");
  }

  req.portalUser = payload;
  next();
}
