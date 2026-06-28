import { AppError } from "../../shared/app-error.js";
import { INTAKE_ERROR_MESSAGES } from "./intake.constants.js";
import * as intakeRepository from "./intake.repository.js";
import { formatIntake } from "./intake.service.js";
import { IntakeResponseData } from "./intake.types.js";
import * as leadService from "../leads/lead.service.js";
import { Types } from "mongoose";

export async function convertToLead(intakeId: string, firmId: string): Promise<IntakeResponseData> {
  const intake = await intakeRepository.findById(intakeId, firmId);
  if (!intake) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  if (intake.status === "CONVERTED") {
    throw AppError.badRequest(INTAKE_ERROR_MESSAGES.DUPLICATE_CONVERSION);
  }

  // Enforce that only qualified (or unconverted/active) intakes can be converted
  if (intake.status === "REJECTED") {
    throw AppError.badRequest("Cannot convert a rejected intake to a lead.");
  }

  // Call Lead creation service
  const lead = await leadService.createLeadFromIntake(firmId, intake);
  const convertedLeadId = lead._id;
  const convertedAt = lead.createdAt;

  const updated = await intakeRepository.update(intakeId, firmId, {
    status: "CONVERTED",
    convertedLeadId,
    convertedAt,
  });

  if (!updated) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  // Populate details
  const populated = await intakeRepository.findByIdWithDetails(intakeId, firmId);

  // Compliance Audit logging
  console.log(`[AUDIT] Intake Converted: ID=${intakeId}, ConvertedLeadID=${convertedLeadId}`);

  return formatIntake(populated);
}
