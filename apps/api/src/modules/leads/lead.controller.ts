import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as leadService from "./lead.service.js";
import * as leadAssignmentService from "./lead.assignment.service.js";
import * as leadConversionService from "./lead.conversion.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function createLead(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const createdBy = req.user!.userId;
  const result = await leadService.createLead(firmId, createdBy, req.body);
  sendSuccess(res, result);
}

export async function getLead(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await leadService.getLead(id, firmId);
  sendSuccess(res, result);
}

export async function updateLead(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await leadService.updateLead(id, firmId, userId, req.body);
  sendSuccess(res, result);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const { status, lostReason, consultationDate } = req.body;

  const additionalData: any = {};
  if (lostReason) additionalData.lostReason = lostReason;
  if (consultationDate) additionalData.consultationDate = new Date(consultationDate);

  const result = await leadService.updateStatus(id, firmId, userId, status, additionalData);
  sendSuccess(res, result);
}

export async function assignLead(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const { ownerId } = req.body;
  const result = await leadAssignmentService.assignLead(id, firmId, userId, ownerId);
  sendSuccess(res, result);
}

export async function addNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { note } = req.body;
  const userId = req.user!.userId;
  const result = await leadService.addNote(id, firmId, userId, note);
  sendSuccess(res, result);
}

export async function addAttachment(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const { documentId } = req.body;
  const userId = req.user!.userId;
  const result = await leadService.addAttachment(id, firmId, userId, documentId);
  sendSuccess(res, result);
}

export async function convertLead(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await leadConversionService.convertLead(id, firmId, userId);
  sendSuccess(res, result);
}

export async function listLeads(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const filters = {
    status: req.query.status as string,
    source: req.query.source as string,
    ownerId: req.query.ownerId as string,
    practiceArea: req.query.practiceArea as string,
    q: req.query.q as string,
  };

  const { data, total, pages } = await leadService.listLeads(firmId, filters, { page, limit });
  const formattedData = data.map((item) => leadService.formatLead(item));

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
