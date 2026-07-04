import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as notificationRepository from "./notification.repository.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  
  let isRead: boolean | undefined;
  if (req.query.isRead !== undefined) {
    isRead = req.query.isRead === "true";
  }

  const result = await notificationRepository.findNotifications(firmId, userId, {
    page,
    limit,
    isRead,
  });

  sendSuccess(res, result);
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const userId = req.user.userId;
  const count = await notificationRepository.countUnreadNotifications(userId);
  sendSuccess(res, { count });
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const userId = req.user.userId as string;
  const id = req.params.id as string;

  const updated = await notificationRepository.markAsRead(id, userId);
  if (!updated) {
    throw AppError.notFound("Notification not found or access denied.");
  }

  sendSuccess(res, updated);
}

export async function markAllNotificationsRead(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;

  await notificationRepository.markAllAsRead(firmId, userId);
  sendSuccess(res, { success: true });
}

export async function deleteNotification(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const userId = req.user.userId as string;
  const id = req.params.id as string;

  const deleted = await notificationRepository.softDelete(id, userId);
  if (!deleted) {
    throw AppError.notFound("Notification not found or access denied.");
  }

  sendSuccess(res, { success: true });
}

export async function getPreferences(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const userId = req.user.userId;

  let preferences = await notificationRepository.findPreferencesByUserId(userId);
  if (!preferences) {
    // Lazy initialize default preferences
    preferences = await notificationRepository.createPreferences({
      userId: new Types.ObjectId(userId) as any,
      emailNotifications: true,
      inAppNotifications: true,
      calendarReminders: true,
      billingNotifications: true,
      taskNotifications: true,
    });
  }

  sendSuccess(res, preferences);
}

import { Types } from "mongoose";

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const userId = req.user.userId;

  const updated = await notificationRepository.updatePreferences(userId, req.body);
  sendSuccess(res, updated);
}
