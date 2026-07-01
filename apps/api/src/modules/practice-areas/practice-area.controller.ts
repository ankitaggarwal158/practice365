import { Request, Response } from "express";
import * as practiceAreaService from "./practice-area.service.js";
import { CreatePracticeAreaRequest, UpdatePracticeAreaRequest, ReorderPracticeAreasRequest } from "./practice-area.types.js";

export async function listPracticeAreas(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const data = await practiceAreaService.listPracticeAreas(firmId);
  res.status(200).json({ success: true, data });
}

export async function listActivePracticeAreas(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const data = await practiceAreaService.listActivePracticeAreas(firmId);
  res.status(200).json({ success: true, data });
}

export async function getPracticeArea(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const { id } = req.params;
  const data = await practiceAreaService.getPracticeArea(id, firmId);
  res.status(200).json({ success: true, data });
}

export async function createPracticeArea(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const userId = req.user!.id.toString();
  const requestData = req.body as CreatePracticeAreaRequest;
  const data = await practiceAreaService.createPracticeArea(firmId, requestData, userId);
  res.status(201).json({ success: true, data });
}

export async function updatePracticeArea(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const { id } = req.params;
  const requestData = req.body as UpdatePracticeAreaRequest;
  const data = await practiceAreaService.updatePracticeArea(id, firmId, requestData);
  res.status(200).json({ success: true, data });
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const { id } = req.params;
  const { isActive } = req.body;
  const data = await practiceAreaService.updateStatus(id, firmId, isActive);
  res.status(200).json({ success: true, data });
}

export async function reorderPracticeAreas(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const requestData = req.body as ReorderPracticeAreasRequest;
  await practiceAreaService.reorderPracticeAreas(firmId, requestData);
  res.status(204).send();
}

export async function deletePracticeArea(req: Request, res: Response): Promise<void> {
  const firmId = req.user!.firmId.toString();
  const userId = req.user!.id.toString();
  const { id } = req.params;
  await practiceAreaService.deletePracticeArea(id, firmId, userId);
  res.status(204).send();
}
