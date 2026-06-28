import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as intakeService from "./intake.service.js";
import * as intakeAssignmentService from "./intake.assignment.service.js";
import * as intakeConversionService from "./intake.conversion.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function createIntake(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const createdBy = req.user!.userId;
  const result = await intakeService.createIntake(firmId, createdBy, req.body);
  sendSuccess(res, result);
}

export async function getIntake(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await intakeService.getIntake(id, firmId);
  sendSuccess(res, result);
}

export async function updateIntake(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await intakeService.updateIntake(id, firmId, req.body);
  sendSuccess(res, result);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { status, rejectedReason } = req.body;
  const result = await intakeService.updateStatus(id, firmId, status, rejectedReason);
  sendSuccess(res, result);
}

export async function assignIntake(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { assignedTo } = req.body;
  const result = await intakeAssignmentService.assignIntake(id, firmId, assignedTo);
  sendSuccess(res, result);
}

export async function addNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { note } = req.body;
  const userId = req.user!.userId;
  const result = await intakeService.addNote(id, firmId, userId, note);
  sendSuccess(res, result);
}

export async function addAttachment(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { documentId } = req.body;
  const userId = req.user!.userId;
  const result = await intakeService.addAttachment(id, firmId, userId, documentId);
  sendSuccess(res, result);
}

export async function convertToLead(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await intakeConversionService.convertToLead(id, firmId);
  sendSuccess(res, result);
}

export async function listIntakes(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const filters = {
    status: req.query.status as string,
    source: req.query.source as string,
    assignedTo: req.query.assignedTo as string,
    q: req.query.q as string,
  };
  
  const { data, total, pages } = await intakeService.listIntakes(firmId, filters, { page, limit });
  
  const formattedData = data.map((item) => intakeService.formatIntake(item));
  
  res.json({
    success: true,
    data: formattedData,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  });
}
