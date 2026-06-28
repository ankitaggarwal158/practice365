import { AppError } from "../../shared/app-error.js";
import { LEAD_ERROR_MESSAGES } from "./lead.constants.js";
import * as leadRepository from "./lead.repository.js";
import * as leadActivityService from "./lead.activity.service.js";
import * as conflictRepository from "../conflict-check/conflict-check.repository.js";
import * as clientService from "../clients/client.service.js";
import { formatLead } from "./lead.service.js";
import { LeadResponseData } from "./lead.types.js";
import { Types } from "mongoose";

export async function convertLead(
  leadId: string,
  firmId: string,
  userId: string
): Promise<LeadResponseData> {
  const lead = await leadRepository.findById(leadId, firmId);
  if (!lead) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  if (lead.status === "CONVERTED") {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.DUPLICATE_CONVERSION);
  }

  if (lead.status === "LOST") {
    throw AppError.badRequest("Cannot convert a lost lead to a client.");
  }

  // Enforce that lead can only convert if there is a CLEARED conflict check
  const clearedCheck = await conflictRepository.findLatestClearedCheckForLead(leadId, firmId);
  if (!clearedCheck) {
    throw AppError.badRequest("Cannot convert lead to client. A cleared conflict check is required.");
  }

  // Call the Client module to create a real client record
  const clientIdStr = await clientService.createClientFromLead(leadId, firmId, userId);
  const convertedClientId = new Types.ObjectId(clientIdStr);
  const convertedAt = new Date();

  const updated = await leadRepository.update(leadId, firmId, {
    status: "CONVERTED",
    convertedClientId,
    convertedAt,
  });

  if (!updated) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  // Log activity
  await leadActivityService.logActivity(
    leadId,
    userId,
    "CONVERTED",
    `Lead converted to Client. Client Ref: ${convertedClientId}`
  );

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Converted: ID=${leadId}, ClientID=${convertedClientId}, UserID=${userId}`);

  // Fetch populated
  const populated = await leadRepository.findByIdWithDetails(leadId, firmId);
  return formatLead(populated);
}
