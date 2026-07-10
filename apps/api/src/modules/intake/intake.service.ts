import { AppError } from "../../shared/app-error.js";
import { INTAKE_ERROR_MESSAGES, VALID_STATUS_TRANSITIONS } from "./intake.constants.js";
import * as intakeRepository from "./intake.repository.js";
import { IntakeNote, IntakeAttachment } from "./schemas/intake.schema.js";
import {
  IntakeDocument,
  IntakeNoteDocument,
  IntakeAttachmentDocument,
  IntakeResponseData,
  IntakeNoteResponseData,
  IntakeAttachmentResponseData,
} from "./intake.types.js";

// Helper formatter functions

export function formatNote(note: any): IntakeNoteResponseData {
  return {
    id: note._id.toString(),
    intakeId: note.intakeId.toString(),
    userId: note.userId._id ? note.userId._id.toString() : note.userId.toString(),
    userName: note.userId && note.userId.firstName
      ? `${note.userId.firstName} ${note.userId.lastName}`
      : undefined,
    note: note.note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function formatAttachment(att: any): IntakeAttachmentResponseData {
  return {
    id: att._id.toString(),
    intakeId: att.intakeId.toString(),
    documentId: att.documentId.toString(),
    uploadedBy: att.uploadedBy._id ? att.uploadedBy._id.toString() : att.uploadedBy.toString(),
    uploadedByName: att.uploadedBy && att.uploadedBy.firstName
      ? `${att.uploadedBy.firstName} ${att.uploadedBy.lastName}`
      : undefined,
    createdAt: att.createdAt.toISOString(),
  };
}

export function formatIntake(
  intake: any,
  notes: any[] = [],
  attachments: any[] = []
): IntakeResponseData {
  return {
    id: intake._id.toString(),
    firmId: intake.firmId.toString(),
    intakeNumber: intake.intakeNumber,
    source: intake.source,
    status: intake.status,
    firstName: intake.firstName,
    lastName: intake.lastName,
    companyName: intake.companyName || "",
    email: intake.email || "",
    phone: intake.phone || "",
    preferredContactMethod: intake.preferredContactMethod || "EMAIL",
    practiceArea: intake.practiceArea || "",
    subject: intake.subject,
    description: intake.description || "",
    assignedTo: intake.assignedTo?._id
      ? intake.assignedTo._id.toString()
      : intake.assignedTo?.toString() || undefined,
    assignedToName: intake.assignedTo && intake.assignedTo.firstName
      ? `${intake.assignedTo.firstName} ${intake.assignedTo.lastName}`
      : undefined,
    convertedLeadId: intake.convertedLeadId?.toString() || undefined,
    convertedAt: intake.convertedAt?.toISOString() || undefined,
    rejectedReason: intake.rejectedReason || undefined,
    opposingPartyNames: intake.opposingPartyNames || [],
    createdBy: intake.createdBy?._id
      ? intake.createdBy._id.toString()
      : intake.createdBy?.toString() || undefined,
    createdAt: intake.createdAt.toISOString(),
    updatedAt: intake.updatedAt.toISOString(),
    notes: notes.map(formatNote),
    attachments: attachments.map(formatAttachment),
  };
}

export function generateIntakeNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
  return `ITK-${dateStr}-${randomStr}`;
}

export async function createIntake(
  firmId: string,
  createdByUserId: string,
  data: any
): Promise<IntakeResponseData> {
  const intakeNumber = generateIntakeNumber();
  
  const created = await intakeRepository.create({
    ...data,
    firmId,
    createdBy: createdByUserId,
    intakeNumber,
    status: "NEW",
  });

  // Compliance Audit logging
  console.log(`[AUDIT] Intake Created: ID=${created._id}, Number=${intakeNumber}, FirmID=${firmId}`);

  return formatIntake(created);
}

export async function getIntake(id: string, firmId: string): Promise<IntakeResponseData> {
  const intake = await intakeRepository.findByIdWithDetails(id, firmId);
  if (!intake) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  const [notes, attachments] = await Promise.all([
    intakeRepository.findNotesByIntakeId(id),
    intakeRepository.findAttachmentsByIntakeId(id),
  ]);

  return formatIntake(intake, notes, attachments);
}

export async function updateIntake(
  id: string,
  firmId: string,
  data: any
): Promise<IntakeResponseData> {
  const intake = await intakeRepository.findById(id, firmId);
  if (!intake) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  if (intake.status === "CONVERTED") {
    throw AppError.badRequest(INTAKE_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  const updated = await intakeRepository.update(id, firmId, data);
  if (!updated) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  // Compliance Audit logging
  console.log(`[AUDIT] Intake Updated: ID=${id}`);

  return formatIntake(updated);
}

export async function updateStatus(
  id: string,
  firmId: string,
  newStatus: string,
  rejectedReason?: string
): Promise<IntakeResponseData> {
  const intake = await intakeRepository.findById(id, firmId);
  if (!intake) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  if (intake.status === "CONVERTED") {
    throw AppError.badRequest(INTAKE_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  // Check lifecycle transition
  const currentStatus = intake.status;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw AppError.badRequest(INTAKE_ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
  }

  const updates: any = { status: newStatus };
  if (newStatus === "REJECTED" && rejectedReason) {
    updates.rejectedReason = rejectedReason;
  }

  const updated = await intakeRepository.update(id, firmId, updates);
  if (!updated) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  // Compliance Audit logging
  console.log(`[AUDIT] Intake Status Changed: ID=${id}, From=${currentStatus}, To=${newStatus}`);

  return formatIntake(updated);
}

export async function listIntakes(
  firmId: string,
  filters: any,
  options: { page: number; limit: number }
) {
  return intakeRepository.list(firmId, filters, options);
}

export async function addNote(
  intakeId: string,
  firmId: string,
  userId: string,
  noteText: string
): Promise<IntakeNoteResponseData> {
  const intake = await intakeRepository.findById(intakeId, firmId);
  if (!intake) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  if (intake.status === "CONVERTED") {
    throw AppError.badRequest(INTAKE_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  const created = await intakeRepository.addNote(intakeId, userId, noteText);
  
  // Compliance Audit logging
  console.log(`[AUDIT] Intake Note Added: IntakeID=${intakeId}, UserID=${userId}`);

  // Fetch populated note
  const populated = await IntakeNote.findById(created._id).populate("userId", "firstName lastName email");
  return formatNote(populated);
}

export async function addAttachment(
  intakeId: string,
  firmId: string,
  userId: string,
  documentId: string
): Promise<IntakeAttachmentResponseData> {
  const intake = await intakeRepository.findById(intakeId, firmId);
  if (!intake) {
    throw AppError.notFound(INTAKE_ERROR_MESSAGES.INTAKE_NOT_FOUND);
  }

  if (intake.status === "CONVERTED") {
    throw AppError.badRequest(INTAKE_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  const created = await intakeRepository.addAttachment(intakeId, documentId, userId);

  // Compliance Audit logging
  console.log(`[AUDIT] Intake Attachment Uploaded: IntakeID=${intakeId}, DocumentID=${documentId}`);

  // Fetch populated attachment
  const populated = await IntakeAttachment.findById(created._id).populate("uploadedBy", "firstName lastName email");
  return formatAttachment(populated);
}
