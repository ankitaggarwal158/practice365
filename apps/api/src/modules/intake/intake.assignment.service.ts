import { AppError } from "../../shared/app-error.js";
import { INTAKE_ERROR_MESSAGES } from "./intake.constants.js";
import * as intakeRepository from "./intake.repository.js";
import * as userService from "../users/service/user.service.js";
import { formatIntake } from "./intake.service.js";
import { IntakeResponseData } from "./intake.types.js";
import { Types } from "mongoose";

export async function assignIntake(
  intakeId: string,
  firmId: string,
  assignedToUserId: string | null
): Promise<IntakeResponseData> {
  const intake = await intakeRepository.findById(intakeId, firmId);
  if (!intake) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  if (intake.status === "CONVERTED") {
    throw AppError.badRequest(INTAKE_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  let assignedObjectId: Types.ObjectId | null = null;

  if (assignedToUserId) {
    if (!Types.ObjectId.isValid(assignedToUserId)) {
      throw AppError.badRequest(INTAKE_ERROR_MESSAGES.INVALID_ID);
    }

    // Verify user exists and belongs to same firm
    const targetUser = await userService.getCurrentUser(assignedToUserId).catch(() => null);
    if (!targetUser) {
      throw AppError.notFound(INTAKE_ERROR_MESSAGES.ASSIGNEE_NOT_FOUND);
    }

    if (targetUser.firmId !== firmId) {
      throw AppError.badRequest(INTAKE_ERROR_MESSAGES.ASSIGNMENT_CROSS_FIRM);
    }

    assignedObjectId = new Types.ObjectId(assignedToUserId);
  }

  const updated = await intakeRepository.update(intakeId, firmId, {
    assignedTo: assignedObjectId as any,
  });

  if (!updated) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  // Populate details
  const populated = await intakeRepository.findByIdWithDetails(intakeId, firmId);

  // Compliance Audit logging
  console.log(`[AUDIT] Intake Assigned: ID=${intakeId}, AssignedTo=${assignedToUserId || "Unassigned"}`);

  return formatIntake(populated);
}
