import { Request, Response } from "express";
import mongoose from "mongoose";
import * as systemSettingsService from "./system-settings.service.js";
import * as featureFlagService from "./feature-flag.service.js";
import * as announcementService from "./announcement.service.js";
import * as userService from "../users/service/user.service.js";
import { AppError } from "../../shared/app-error.js";
import { sendSuccess } from "../../shared/api-response.js";

// Helper to retrieve client IP and User Agent
function getAuditOptions(req: Request) {
  return {
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
  };
}

// Retrieves the administrator's firmId dynamically for audit trail logs
async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  if (!user || !user.firmId) {
    throw AppError.forbidden("Access denied. Admin user not associated with a firm.");
  }
  return user.firmId.toString();
}

export async function getSystemSettings(req: Request, res: Response): Promise<void> {
  const settings = await systemSettingsService.getSettings();
  sendSuccess(res, settings);
}

export async function updateSystemSettings(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const settings = await systemSettingsService.updateSettings(
    req.body,
    userId,
    firmId,
    getAuditOptions(req)
  );
  sendSuccess(res, settings);
}

export async function listFeatureFlags(req: Request, res: Response): Promise<void> {
  const flags = await featureFlagService.listFeatureFlags();
  sendSuccess(res, flags);
}

export async function updateFeatureFlag(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const id = req.params.id as string;
  const { enabled } = req.body;

  const flag = await featureFlagService.updateFeatureFlag(
    id,
    enabled,
    userId,
    firmId,
    getAuditOptions(req)
  );
  sendSuccess(res, flag);
}

export async function listAnnouncements(req: Request, res: Response): Promise<void> {
  const announcements = await announcementService.listAnnouncements();
  sendSuccess(res, announcements);
}

export async function listActiveAnnouncements(req: Request, res: Response): Promise<void> {
  const announcements = await announcementService.listActiveAnnouncements();
  sendSuccess(res, announcements);
}

export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const announcement = await announcementService.createAnnouncement(
    req.body,
    userId,
    firmId,
    getAuditOptions(req)
  );
  sendSuccess(res, announcement);
}

export async function updateAnnouncement(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const announcement = await announcementService.updateAnnouncement(
    id,
    req.body,
    userId,
    firmId,
    getAuditOptions(req)
  );
  sendSuccess(res, announcement);
}

export async function deleteAnnouncement(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const announcement = await announcementService.softDeleteAnnouncement(
    id,
    userId,
    firmId,
    getAuditOptions(req)
  );
  sendSuccess(res, announcement);
}

export async function getSystemHealth(req: Request, res: Response): Promise<void> {
  const dbState = mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED";
  sendSuccess(res, {
    db: dbState,
    api: "HEALTHY",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}
