import { Request, Response } from "express";
import * as practiceAreaService from "./practice-area.service.js";
import { CreatePracticeAreaRequest, UpdatePracticeAreaRequest, ReorderPracticeAreasRequest } from "./practice-area.types.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export async function listPracticeAreas(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const data = await practiceAreaService.listPracticeAreas(firmId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function listActivePracticeAreas(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const data = await practiceAreaService.listActivePracticeAreas(firmId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getPracticeArea(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const id = req.params.id as string;
    const data = await practiceAreaService.getPracticeArea(id, firmId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function createPracticeArea(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const userId = req.user!.userId.toString();
    const requestData = req.body as CreatePracticeAreaRequest;
    const data = await practiceAreaService.createPracticeArea(firmId, requestData, userId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function updatePracticeArea(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const id = req.params.id as string;
    const requestData = req.body as UpdatePracticeAreaRequest;
    const data = await practiceAreaService.updatePracticeArea(id, firmId, requestData);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const id = req.params.id as string;
    const { isActive } = req.body;
    const data = await practiceAreaService.updateStatus(id, firmId, isActive);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function reorderPracticeAreas(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const requestData = req.body as ReorderPracticeAreasRequest;
    await practiceAreaService.reorderPracticeAreas(firmId, requestData);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function deletePracticeArea(req: Request, res: Response): Promise<void> {
  try {
    const firmId = await getRequestingUserFirmId(req);
    const userId = req.user!.userId.toString();
    const id = req.params.id as string;
    await practiceAreaService.deletePracticeArea(id, firmId, userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
