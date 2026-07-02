import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { PRACTICE_AREA_ERROR_MESSAGES } from "./practice-area.constants.js";
import * as practiceAreaRepository from "./practice-area.repository.js";
import {
  PracticeAreaDocument,
  PracticeAreaResponseData,
  CreatePracticeAreaRequest,
  UpdatePracticeAreaRequest,
  ReorderPracticeAreasRequest,
} from "./practice-area.types.js";
import { Matter } from "../matters/index.js";

export function formatPracticeArea(pa: PracticeAreaDocument): PracticeAreaResponseData {
  return {
    id: pa._id.toString(),
    firmId: pa.firmId.toString(),
    name: pa.name,
    code: pa.code,
    description: pa.description || "",
    displayOrder: pa.displayOrder,
    color: pa.color || "",
    icon: pa.icon || "",
    defaultHourlyRate: pa.defaultHourlyRate || 0,
    isSystem: pa.isSystem,
    isActive: pa.isActive,
    createdAt: pa.createdAt.toISOString(),
    updatedAt: pa.updatedAt.toISOString(),
  };
}

export async function listPracticeAreas(firmId: string): Promise<PracticeAreaResponseData[]> {
  const list = await practiceAreaRepository.findAll(firmId);
  return list.map(formatPracticeArea);
}

export async function listActivePracticeAreas(firmId: string): Promise<PracticeAreaResponseData[]> {
  const list = await practiceAreaRepository.findActive(firmId);
  return list.map(formatPracticeArea);
}

export async function getPracticeArea(id: string, firmId: string): Promise<PracticeAreaResponseData> {
  const pa = await practiceAreaRepository.findById(id, firmId);
  if (!pa) {
    throw AppError.notFound(PRACTICE_AREA_ERROR_MESSAGES.NOT_FOUND);
  }
  return formatPracticeArea(pa);
}

export async function createPracticeArea(
  firmId: string,
  data: CreatePracticeAreaRequest,
  userId: string
): Promise<PracticeAreaResponseData> {
  // Check duplicates
  const existing = await practiceAreaRepository.findByNameOrCode(firmId, data.name, data.code);
  if (existing) {
    throw AppError.badRequest(PRACTICE_AREA_ERROR_MESSAGES.DUPLICATE_NAME_OR_CODE);
  }

  // Get max display order
  const allPas = await practiceAreaRepository.findAll(firmId);
  const maxOrder = allPas.reduce((max, pa) => Math.max(max, pa.displayOrder), 0);

  const newPa = await practiceAreaRepository.create({
    firmId: new Types.ObjectId(firmId),
    name: data.name,
    code: data.code,
    description: data.description,
    displayOrder: maxOrder + 1,
    color: data.color,
    icon: data.icon,
    isSystem: false,
    isActive: true,
    createdBy: new Types.ObjectId(userId),
    deleted: false,
  });

  return formatPracticeArea(newPa);
}

export async function updatePracticeArea(
  id: string,
  firmId: string,
  data: UpdatePracticeAreaRequest
): Promise<PracticeAreaResponseData> {
  const pa = await practiceAreaRepository.findById(id, firmId);
  if (!pa) {
    throw AppError.notFound(PRACTICE_AREA_ERROR_MESSAGES.NOT_FOUND);
  }

  if (data.name) {
    const existing = await practiceAreaRepository.findByNameOrCode(firmId, data.name, pa.code, id);
    if (existing) {
      throw AppError.badRequest(PRACTICE_AREA_ERROR_MESSAGES.DUPLICATE_NAME_OR_CODE);
    }
  }

  const updated = await practiceAreaRepository.update(id, firmId, data);
  if (!updated) {
    throw AppError.notFound(PRACTICE_AREA_ERROR_MESSAGES.NOT_FOUND);
  }

  return formatPracticeArea(updated);
}

export async function updateStatus(
  id: string,
  firmId: string,
  isActive: boolean
): Promise<PracticeAreaResponseData> {
  const pa = await practiceAreaRepository.findById(id, firmId);
  if (!pa) {
    throw AppError.notFound(PRACTICE_AREA_ERROR_MESSAGES.NOT_FOUND);
  }

  const updated = await practiceAreaRepository.update(id, firmId, { isActive });
  if (!updated) {
    throw AppError.notFound(PRACTICE_AREA_ERROR_MESSAGES.NOT_FOUND);
  }

  return formatPracticeArea(updated);
}

export async function reorderPracticeAreas(
  firmId: string,
  data: ReorderPracticeAreasRequest
): Promise<void> {
  await practiceAreaRepository.reorder(firmId, data.practiceAreas);
}

export async function deletePracticeArea(
  id: string,
  firmId: string,
  userId: string
): Promise<void> {
  const pa = await practiceAreaRepository.findById(id, firmId);
  if (!pa) {
    throw AppError.notFound(PRACTICE_AREA_ERROR_MESSAGES.NOT_FOUND);
  }

  if (pa.isSystem) {
    throw AppError.badRequest(PRACTICE_AREA_ERROR_MESSAGES.CANNOT_DELETE_SYSTEM);
  }

  // Check if referenced by Matters
  const matterCount = await Matter.countDocuments({
    practiceAreaId: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  });

  if (matterCount > 0) {
    throw AppError.badRequest(PRACTICE_AREA_ERROR_MESSAGES.CANNOT_DELETE_REFERENCED);
  }

  await practiceAreaRepository.softDelete(id, firmId, userId);
}
