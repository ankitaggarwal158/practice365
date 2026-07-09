import { Request, Response } from "express";
import * as service from "./firm-settings.service.js";
import { uploadLogo as saveLogoFile } from "./logo-upload.service.js";
import * as userService from "../users/service/user.service.js";
import { AppError } from "../../shared/app-error.js";
import { FirmSettingsDocument } from "./firm-settings.types.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId.toString();
}

function getAuthContext(req: Request) {
  return {
    userId: req.user!.userId,
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
  };
}

export function formatSettingsResponse(doc: FirmSettingsDocument) {
  return {
    id: doc._id.toString(),
    firmId: doc.firmId.toString(),
    firmLogo: doc.firmLogo || "",
    primaryColor: doc.primaryColor || "#5520F0",
    secondaryColor: doc.secondaryColor || "#000000",
    timezone: doc.timezone || "UTC",
    currency: doc.currency || "USD",
    dateFormat: doc.dateFormat || "YYYY-MM-DD",
    timeFormat: doc.timeFormat || "24_HOUR",
    matterNumberPrefix: doc.matterNumberPrefix || "MAT-",
    matterNextNumber: doc.matterNextNumber,
    clientNumberPrefix: doc.clientNumberPrefix || "CLI-",
    clientNextNumber: doc.clientNextNumber,
    invoiceNumberPrefix: doc.invoiceNumberPrefix || "INV-",
    invoiceNextNumber: doc.invoiceNextNumber,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getSettings(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const doc = await service.getSettings(firmId);
  
  res.status(200).json({
    success: true,
    data: formatSettingsResponse(doc),
  });
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const authContext = getAuthContext(req);
  const doc = await service.updateSettings(firmId, req.body, authContext);
  
  res.status(200).json({
    success: true,
    data: formatSettingsResponse(doc),
  });
}

export async function uploadLogo(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const authContext = getAuthContext(req);
  
  if (!req.file) {
    throw AppError.badRequest("Logo image file is required.");
  }
  
  const logoUrl = await saveLogoFile(firmId, req.file);
  const doc = await service.updateLogoUrl(firmId, logoUrl, authContext);
  
  res.status(200).json({
    success: true,
    data: formatSettingsResponse(doc),
  });
}
