import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as firmService from "./firm.service.js";
import * as firmSettingsService from "./firm.settings.service.js";
import {
  UpdateFirmRequest,
  UpdateFirmBrandingRequest,
  UpdateFirmSettingsRequest,
} from "./firm.types.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function getFirm(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const firm = await firmService.getFirmProfile(firmId);
  sendSuccess(res, firm);
}

export async function updateFirm(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const data = req.body as UpdateFirmRequest;
  const firm = await firmService.updateFirmProfile(firmId, data);
  sendSuccess(res, firm);
}

export async function updateBranding(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const data = req.body as UpdateFirmBrandingRequest;
  const firm = await firmService.updateBranding(firmId, data);
  sendSuccess(res, firm);
}

export async function getSettings(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const settings = await firmSettingsService.getFirmSettings(firmId);
  sendSuccess(res, settings);
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const data = req.body as UpdateFirmSettingsRequest;
  const settings = await firmSettingsService.updateFirmSettings(firmId, data);
  sendSuccess(res, settings);
}
