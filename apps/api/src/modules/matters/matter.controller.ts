import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as matterService from "./matter.service.js";
import * as teamService from "./matter-team.service.js";
import * as practiceAreaService from "../practice-areas/practice-area.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function createMatter(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await matterService.createMatter(firmId, userId, req.body);
  sendSuccess(res, result);
}

export async function getMatter(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await matterService.getMatter(id, firmId);
  sendSuccess(res, result);
}

export async function updateMatter(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await matterService.updateMatter(id, firmId, req.body, userId);
  sendSuccess(res, result);
}

export async function listMatters(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const query = req.query.query as string | undefined;
  const status = req.query.status as string | undefined;
  const priority = req.query.priority as string | undefined;
  const practiceAreaId = req.query.practiceAreaId as string | undefined;
  const clientId = req.query.clientId as string | undefined;
  const responsibleAttorneyId = req.query.responsibleAttorneyId as string | undefined;

  const result = await matterService.listMatters(firmId, {
    page,
    limit,
    query,
    status,
    priority,
    practiceAreaId,
    clientId,
    responsibleAttorneyId,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function updateMatterStatus(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const status = req.body.status as string;
  const userId = req.user!.userId;
  const result = await matterService.updateMatterStatus(id, firmId, status, userId);
  sendSuccess(res, result);
}

export async function archiveMatter(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await matterService.archiveMatter(id, firmId, userId);
  sendSuccess(res, result);
}

export async function reopenMatter(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await matterService.reopenMatter(id, firmId, userId);
  sendSuccess(res, result);
}

export async function changeResponsibleAttorney(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const responsibleAttorneyId = req.body.responsibleAttorneyId as string;
  const userId = req.user!.userId;
  const result = await matterService.changeResponsibleAttorney(id, firmId, responsibleAttorneyId, userId);
  sendSuccess(res, result);
}

export async function updateMatterTeam(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const teamMembers = req.body.teamMembers as Array<{ userId: string; role: string }>;
  const userId = req.user!.userId;

  const result = await teamService.updateTeam(id, firmId, teamMembers, userId);
  sendSuccess(res, result);
}

// ─── Notes Controllers ─────────────────────────────────────────

export async function addNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await matterService.addMatterNote(id, firmId, userId, req.body.note);
  sendSuccess(res, result);
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const noteId = req.params.noteId as string;
  const userId = req.user!.userId;
  const result = await matterService.updateMatterNote(noteId, id, firmId, userId, req.body.note);
  sendSuccess(res, result);
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const noteId = req.params.noteId as string;
  const userId = req.user!.userId;
  const result = await matterService.deleteMatterNote(noteId, id, firmId, userId);
  sendSuccess(res, result);
}

// ─── Attachments Controllers ───────────────────────────────────

export async function addAttachment(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await matterService.addMatterAttachment(id, firmId, userId, req.body);
  sendSuccess(res, result);
}

export async function deleteAttachment(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const attachmentId = req.params.attachmentId as string;
  const userId = req.user!.userId;
  const result = await matterService.deleteMatterAttachment(attachmentId, id, firmId, userId);
  sendSuccess(res, result);
}

// ─── Practice Areas Controller ─────────────────────────────────

export async function listPracticeAreas(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const result = await practiceAreaService.listPracticeAreas(firmId);
  sendSuccess(res, result);
}
