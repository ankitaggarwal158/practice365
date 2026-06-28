import { AppError } from "../../shared/app-error.js";
import * as conflictCheckRepository from "./conflict-check.repository.js";
import * as conflictEngineService from "./conflict-engine.service.js";
import { Lead } from "../leads/schemas/lead.schema.js";
import { ConflictCheckDocument, ConflictCheckResponseData, ConflictEngineResult } from "./conflict-check.types.js";
import { Types } from "mongoose";

export function formatConflictCheck(check: any): ConflictCheckResponseData {
  return {
    id: check._id.toString(),
    firmId: check.firmId.toString(),
    leadId: check.leadId?.toString() || undefined,
    clientId: check.clientId?.toString() || undefined,
    matterId: check.matterId?.toString() || undefined,
    requestedBy: check.requestedBy?._id ? check.requestedBy._id.toString() : check.requestedBy?.toString(),
    requestedByName: check.requestedBy && check.requestedBy.firstName
      ? `${check.requestedBy.firstName} ${check.requestedBy.lastName}`
      : undefined,
    reviewedBy: check.reviewedBy?._id ? check.reviewedBy._id.toString() : check.reviewedBy?.toString() || undefined,
    reviewedByName: check.reviewedBy && check.reviewedBy.firstName
      ? `${check.reviewedBy.firstName} ${check.reviewedBy.lastName}`
      : undefined,
    overallResult: check.overallResult,
    finalDecision: check.finalDecision,
    reviewNotes: check.reviewNotes || "",
    completedAt: check.completedAt?.toISOString() || undefined,
    createdAt: check.createdAt.toISOString(),
    matches: check.matches || [],
  };
}

export async function executeConflictCheck(
  firmId: string,
  requestedByUserId: string,
  data: { leadId: string }
): Promise<ConflictCheckResponseData> {
  const leadId = data.leadId;
  if (!Types.ObjectId.isValid(leadId)) {
    throw AppError.badRequest("Invalid lead ID.");
  }

  const lead = await Lead.findOne({ _id: new Types.ObjectId(leadId), firmId: new Types.ObjectId(firmId) });
  if (!lead) {
    throw AppError.notFound("Lead not found.");
  }

  // Scan conflict engine
  const criteria = {
    personName: `${lead.firstName} ${lead.lastName}`,
    organizationName: lead.companyName || undefined,
    email: lead.email || undefined,
    phone: lead.phone || undefined,
  };

  const engineResult = await conflictEngineService.searchConflict(firmId, criteria);

  // Save historical record
  const check = await conflictCheckRepository.create({
    firmId: new Types.ObjectId(firmId),
    leadId: new Types.ObjectId(leadId),
    requestedBy: new Types.ObjectId(requestedByUserId),
    overallResult: engineResult.overallResult,
    finalDecision: "PENDING",
    matches: engineResult.matches,
  });

  // Compliance Audit Logging
  console.log(`[AUDIT] Conflict Check Executed: ID=${check._id}, LeadID=${leadId}, Result=${engineResult.overallResult}`);

  return getConflictCheck(check._id.toString(), firmId);
}

export async function manualConflictSearch(
  firmId: string,
  criteria: conflictEngineService.SearchCriteria
): Promise<ConflictEngineResult> {
  const result = await conflictEngineService.searchConflict(firmId, criteria);

  // Compliance Audit Logging
  console.log(`[AUDIT] Manual Conflict Search Executed: FirmID=${firmId}, SearchCriteria=${JSON.stringify(criteria)}`);

  return result;
}

export async function getConflictCheck(
  id: string,
  firmId: string
): Promise<ConflictCheckResponseData> {
  const check = await conflictCheckRepository.findByIdWithDetails(id, firmId);
  if (!check) {
    throw AppError.notFound("Conflict check not found.");
  }
  return formatConflictCheck(check);
}

export async function recordDecision(
  id: string,
  firmId: string,
  userId: string,
  data: { decision: "CLEARED" | "WAIVED" | "REJECTED"; reviewNotes?: string }
): Promise<ConflictCheckResponseData> {
  const check = await conflictCheckRepository.findById(id, firmId);
  if (!check) {
    throw AppError.notFound("Conflict check not found.");
  }

  if (check.finalDecision !== "PENDING") {
    throw AppError.badRequest("Attorney decision has already been recorded and is now immutable.");
  }

  const updated = await conflictCheckRepository.update(id, firmId, {
    finalDecision: data.decision,
    reviewNotes: data.reviewNotes || "",
    completedAt: new Date(),
    reviewedBy: new Types.ObjectId(userId),
  });

  if (!updated) {
    throw AppError.notFound("Conflict check not found.");
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Conflict Review Completed: ID=${id}, Decision=${data.decision}, ReviewerID=${userId}`);

  return getConflictCheck(id, firmId);
}

export async function listConflictChecks(
  firmId: string,
  options: { page: number; limit: number }
) {
  const { data, total, pages } = await conflictCheckRepository.list(firmId, options);
  const formatted = data.map(formatConflictCheck);
  return {
    data: formatted,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      pages,
    },
  };
}
