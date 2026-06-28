import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as conflictCheckService from "./conflict-check.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function executeConflictCheck(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await conflictCheckService.executeConflictCheck(firmId, userId, req.body);
  sendSuccess(res, result);
}

export async function listConflictChecks(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;

  const result = await conflictCheckService.listConflictChecks(firmId, { page, limit });
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function getConflictCheck(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await conflictCheckService.getConflictCheck(id, firmId);
  sendSuccess(res, result);
}

export async function recordDecision(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await conflictCheckService.recordDecision(id, firmId, userId, req.body);
  sendSuccess(res, result);
}

export async function manualConflictSearch(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const result = await conflictCheckService.manualConflictSearch(firmId, req.body);
  sendSuccess(res, result);
}
