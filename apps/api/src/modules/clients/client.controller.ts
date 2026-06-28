import { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";
import * as clientService from "./client.service.js";
import * as duplicateService from "./client.duplicate.service.js";
import * as mergeService from "./client.merge.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function createClient(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const result = await clientService.createClient(firmId, userId, req.body);
  sendSuccess(res, result);
}

export async function getClient(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await clientService.getClient(id, firmId);
  sendSuccess(res, result);
}

export async function updateClient(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const result = await clientService.updateClient(id, firmId, req.body);
  sendSuccess(res, result);
}

export async function listClients(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const query = req.query.query as string | undefined;
  const status = req.query.status as string | undefined;
  const clientType = req.query.clientType as string | undefined;

  const result = await clientService.listClients(firmId, {
    page,
    limit,
    query,
    status,
    clientType,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function archiveClient(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await clientService.archiveClient(id, firmId, userId);
  sendSuccess(res, result);
}

export async function reactivateClient(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const id = req.params.id as string;
  const userId = req.user!.userId;
  const result = await clientService.reactivateClient(id, firmId, userId);
  sendSuccess(res, result);
}

export async function mergeClients(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const sourceClientId = req.params.id as string;
  const targetClientId = req.body.targetClientId as string;
  const userId = req.user!.userId;

  const result = await mergeService.mergeClients(firmId, sourceClientId, targetClientId, userId);
  sendSuccess(res, result);
}

export async function findDuplicates(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const result = await duplicateService.findDuplicates(firmId, req.body);
  sendSuccess(res, result);
}

// ─── Notes Controllers ───────────────────────────────────────

export async function addNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const clientId = req.params.id as string;
  const userId = req.user!.userId;
  const result = await clientService.addClientNote(clientId, firmId, userId, req.body.content);
  sendSuccess(res, result);
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const clientId = req.params.id as string;
  const noteId = req.params.noteId as string;
  const userId = req.user!.userId;
  const result = await clientService.updateClientNote(noteId, clientId, firmId, userId, req.body.content);
  sendSuccess(res, result);
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const clientId = req.params.id as string;
  const noteId = req.params.noteId as string;
  const userId = req.user!.userId;
  const result = await clientService.deleteClientNote(noteId, clientId, firmId, userId);
  sendSuccess(res, result);
}

// ─── Attachments Controllers ─────────────────────────────────

export async function addAttachment(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const clientId = req.params.id as string;
  const userId = req.user!.userId;
  const result = await clientService.addClientAttachment(clientId, firmId, userId, req.body);
  sendSuccess(res, result);
}

export async function deleteAttachment(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const clientId = req.params.id as string;
  const attachmentId = req.params.attachmentId as string;
  const userId = req.user!.userId;
  const result = await clientService.deleteClientAttachment(attachmentId, clientId, firmId, userId);
  sendSuccess(res, result);
}
