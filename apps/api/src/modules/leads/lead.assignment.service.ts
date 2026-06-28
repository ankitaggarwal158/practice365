import { AppError } from "../../shared/app-error.js";
import { LEAD_ERROR_MESSAGES } from "./lead.constants.js";
import * as leadRepository from "./lead.repository.js";
import * as leadActivityService from "./lead.activity.service.js";
import * as userService from "../users/service/user.service.js";
import { formatLead } from "./lead.service.js";
import { LeadResponseData } from "./lead.types.js";
import { Types } from "mongoose";

export async function assignLead(
  leadId: string,
  firmId: string,
  assignerUserId: string,
  ownerId: string
): Promise<LeadResponseData> {
  const lead = await leadRepository.findById(leadId, firmId);
  if (!lead) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  if (lead.status === "CONVERTED") {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  if (!Types.ObjectId.isValid(ownerId)) {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.INVALID_ID);
  }

  // Verify target user belongs to same firm
  const targetUser = await userService.getCurrentUser(ownerId).catch(() => null);
  if (!targetUser) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.OWNER_NOT_FOUND);
  }

  if (targetUser.firmId !== firmId) {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.ASSIGNMENT_CROSS_FIRM);
  }

  const updated = await leadRepository.update(leadId, firmId, {
    ownerId: new Types.ObjectId(ownerId),
  });

  if (!updated) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  // Log activity
  const ownerName = `${targetUser.firstName} ${targetUser.lastName}`;
  await leadActivityService.logActivity(
    leadId,
    assignerUserId,
    "ASSIGNED",
    `Ownership reassigned to ${ownerName}.`
  );

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Assigned: ID=${leadId}, OwnerID=${ownerId}, UserID=${assignerUserId}`);

  // Fetch populated
  const populated = await leadRepository.findByIdWithDetails(leadId, firmId);
  return formatLead(populated);
}
