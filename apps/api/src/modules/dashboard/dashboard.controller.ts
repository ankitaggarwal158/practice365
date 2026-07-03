import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as dashboardService from "./dashboard.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await dashboardService.getDashboardSummary(firmId, userId);
  sendSuccess(res, result);
}

export async function getDashboardWidgets(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await dashboardService.getDashboardWidgets(firmId, userId);
  sendSuccess(res, result);
}

export async function getDashboardActivity(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const result = await dashboardService.getDashboardSummary(firmId, req.user!.userId);
  sendSuccess(res, result.activity);
}

export async function getQuickActions(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const userId = req.user.userId;
  const result = await dashboardService.getQuickActions(userId);
  sendSuccess(res, result);
}
