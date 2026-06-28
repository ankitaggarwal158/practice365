import { Request, Response } from "express";
import { sendSuccess, sendPaginatedSuccess } from "../../../shared/api-response.js";
import { AppError } from "../../../shared/app-error.js";
import * as userService from "../service/user.service.js";
import * as userInvitationService from "../service/user.invitation.service.js";
import {
  InviteUserRequest,
  UpdateUserRequest,
  ChangeStatusRequest,
  UpdatePreferencesRequest,
  UpdateOwnProfileRequest,
  AcceptInvitationRequest,
} from "../types/user.types.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const query = req.query as any;
  
  const result = await userService.listUsers(firmId, query);
  sendPaginatedSuccess(res, result.users, result.pagination);
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  
  const user = await userService.getUserById(id, firmId);
  sendSuccess(res, user);
}

export async function inviteUser(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { email, firstName, lastName } = req.body as InviteUserRequest;
  
  const user = await userInvitationService.inviteUser(
    email,
    firstName,
    lastName,
    req.user!.userId,
    firmId
  );
  sendSuccess(res, user, 201);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  const data = req.body as UpdateUserRequest;
  
  const user = await userService.updateUser(id, data, firmId);
  sendSuccess(res, user);
}

export async function changeUserStatus(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { id } = req.params as { id: string };
  const { status } = req.body as ChangeStatusRequest;
  
  const user = await userService.changeUserStatus(id, status, firmId);
  sendSuccess(res, user);
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  
  const user = await userService.getCurrentUser(req.user.userId);
  sendSuccess(res, user);
}

export async function updateOwnProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const data = req.body as UpdateOwnProfileRequest;
  
  const user = await userService.updateOwnProfile(req.user.userId, data);
  sendSuccess(res, user);
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const preferences = req.body as UpdatePreferencesRequest;
  
  const user = await userService.updatePreferences(req.user.userId, preferences);
  sendSuccess(res, user);
}

export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as AcceptInvitationRequest;
  
  const user = await userInvitationService.acceptInvitation(token, password);
  sendSuccess(res, user);
}
