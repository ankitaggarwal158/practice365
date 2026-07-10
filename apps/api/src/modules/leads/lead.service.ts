import { AppError } from "../../shared/app-error.js";
import { LEAD_ERROR_MESSAGES, VALID_STATUS_TRANSITIONS } from "./lead.constants.js";
import * as leadRepository from "./lead.repository.js";
import * as leadActivityService from "./lead.activity.service.js";
import { LeadNote, LeadAttachment } from "./schemas/lead.schema.js";
import { Types } from "mongoose";
import {
  LeadDocument,
  LeadNoteDocument,
  LeadActivityDocument,
  LeadAttachmentDocument,
  LeadResponseData,
  LeadNoteResponseData,
  LeadActivityResponseData,
  LeadAttachmentResponseData,
} from "./lead.types.js";

// Formatters

export function formatNote(note: any): LeadNoteResponseData {
  return {
    id: note._id.toString(),
    leadId: note.leadId.toString(),
    userId: note.userId._id ? note.userId._id.toString() : note.userId.toString(),
    userName: note.userId && note.userId.firstName
      ? `${note.userId.firstName} ${note.userId.lastName}`
      : undefined,
    note: note.note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function formatActivity(act: any): LeadActivityResponseData {
  return {
    id: act._id.toString(),
    leadId: act.leadId.toString(),
    userId: act.userId._id ? act.userId._id.toString() : act.userId.toString(),
    userName: act.userId && act.userId.firstName
      ? `${act.userId.firstName} ${act.userId.lastName}`
      : undefined,
    activityType: act.activityType,
    description: act.description,
    metadata: act.metadata,
    createdAt: act.createdAt.toISOString(),
  };
}

export function formatAttachment(att: any): LeadAttachmentResponseData {
  return {
    id: att._id.toString(),
    leadId: att.leadId.toString(),
    documentId: att.documentId.toString(),
    uploadedBy: att.uploadedBy._id ? att.uploadedBy._id.toString() : att.uploadedBy.toString(),
    uploadedByName: att.uploadedBy && att.uploadedBy.firstName
      ? `${att.uploadedBy.firstName} ${att.uploadedBy.lastName}`
      : undefined,
    createdAt: att.createdAt.toISOString(),
  };
}

export function formatLead(
  lead: any,
  notes: any[] = [],
  activities: any[] = [],
  attachments: any[] = []
): LeadResponseData {
  return {
    id: lead._id.toString(),
    firmId: lead.firmId.toString(),
    leadNumber: lead.leadNumber,
    intakeId: lead.intakeId?.toString() || undefined,
    ownerId: lead.ownerId?._id ? lead.ownerId._id.toString() : lead.ownerId?.toString(),
    ownerName: lead.ownerId && lead.ownerId.firstName
      ? `${lead.ownerId.firstName} ${lead.ownerId.lastName}`
      : undefined,
    status: lead.status,
    source: lead.source,
    firstName: lead.firstName,
    lastName: lead.lastName,
    companyName: lead.companyName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    preferredContactMethod: lead.preferredContactMethod || "EMAIL",
    practiceArea: lead.practiceArea || "",
    subject: lead.subject,
    description: lead.description || "",
    consultationDate: lead.consultationDate?.toISOString() || undefined,
    engagementSentAt: lead.engagementSentAt?.toISOString() || undefined,
    convertedClientId: lead.convertedClientId?.toString() || undefined,
    convertedAt: lead.convertedAt?.toISOString() || undefined,
    lostReason: lead.lostReason || undefined,
    customFields: lead.customFields || {},
    createdBy: lead.createdBy?._id ? lead.createdBy._id.toString() : lead.createdBy?.toString() || undefined,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    notes: notes.map(formatNote),
    activities: activities.map(formatActivity),
    attachments: attachments.map(formatAttachment),
  };
}

export function generateLeadNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
  return `LED-${dateStr}-${randomStr}`;
}

export async function createLead(
  firmId: string,
  createdByUserId: string,
  data: any
): Promise<LeadResponseData> {
  const leadNumber = generateLeadNumber();
  
  // Every lead must have an owner (defaults to creator)
  const ownerId = data.ownerId || createdByUserId;

  const created = await leadRepository.create({
    ...data,
    firmId: new Types.ObjectId(firmId),
    ownerId: new Types.ObjectId(ownerId),
    createdBy: new Types.ObjectId(createdByUserId),
    leadNumber,
    status: "NEW",
    source: "MANUAL",
  });

  // Log activity
  await leadActivityService.logActivity(
    created._id.toString(),
    createdByUserId,
    "CREATED",
    `Lead ${leadNumber} created manually.`
  );

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Created: ID=${created._id}, Number=${leadNumber}, FirmID=${firmId}`);

  return formatLead(created);
}

export async function createLeadFromIntake(
  firmId: string,
  intakeDoc: any
): Promise<LeadDocument> {
  const leadNumber = generateLeadNumber();
  
  // Every lead must have an owner (defaults to intake assignee or creator)
  const ownerId = intakeDoc.assignedTo || intakeDoc.createdBy;

  const created = await leadRepository.create({
    firmId: new Types.ObjectId(firmId),
    leadNumber,
    intakeId: intakeDoc._id,
    ownerId: new Types.ObjectId(ownerId.toString()),
    status: "NEW",
    source: "INTAKE",
    firstName: intakeDoc.firstName,
    lastName: intakeDoc.lastName,
    companyName: intakeDoc.companyName || "",
    email: intakeDoc.email || "",
    phone: intakeDoc.phone || "",
    preferredContactMethod: intakeDoc.preferredContactMethod || "EMAIL",
    practiceArea: intakeDoc.practiceArea || "",
    subject: intakeDoc.subject,
    description: intakeDoc.description || "",
    opposingPartyNames: intakeDoc.opposingPartyNames || [],
    createdBy: intakeDoc.createdBy ? new Types.ObjectId(intakeDoc.createdBy.toString()) : undefined,
  });

  // Log activity
  await leadActivityService.logActivity(
    created._id.toString(),
    intakeDoc.createdBy?.toString() || ownerId.toString(),
    "CREATED",
    `Lead ${leadNumber} created via conversion from Intake ${intakeDoc.intakeNumber}.`
  );

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Created from Intake: LeadID=${created._id}, IntakeID=${intakeDoc._id}`);

  return created;
}

export async function getLead(id: string, firmId: string): Promise<LeadResponseData> {
  const lead = await leadRepository.findByIdWithDetails(id, firmId);
  if (!lead) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  const [notes, activities, attachments] = await Promise.all([
    leadRepository.findNotesByLeadId(id),
    leadRepository.findActivitiesByLeadId(id),
    leadRepository.findAttachmentsByLeadId(id),
  ]);

  return formatLead(lead, notes, activities, attachments);
}

export async function updateLead(
  id: string,
  firmId: string,
  userId: string,
  data: any
): Promise<LeadResponseData> {
  const lead = await leadRepository.findById(id, firmId);
  if (!lead) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  if (lead.status === "CONVERTED") {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  const updated = await leadRepository.update(id, firmId, data);
  if (!updated) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  // Log activity
  await leadActivityService.logActivity(id, userId, "UPDATED", "Lead details updated.");

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Updated: ID=${id}, UserID=${userId}`);

  return formatLead(updated);
}

export async function updateStatus(
  id: string,
  firmId: string,
  userId: string,
  newStatus: string,
  additionalData: { lostReason?: string; consultationDate?: Date } = {}
): Promise<LeadResponseData> {
  const lead = await leadRepository.findById(id, firmId);
  if (!lead) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  if (lead.status === "CONVERTED") {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  // Lifecycle check
  const currentStatus = lead.status;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
  }

  const updates: any = { status: newStatus };
  let activityType: any = "STATUS_CHANGED";
  let activityDescription = `Status updated from ${currentStatus} to ${newStatus}.`;

  if (newStatus === "LOST") {
    updates.lostReason = additionalData.lostReason || "Not specified";
    activityType = "LOST";
    activityDescription = `Lead was marked lost. Reason: ${updates.lostReason}`;
  } else if (newStatus === "CONSULTATION_SCHEDULED") {
    updates.consultationDate = additionalData.consultationDate || new Date();
    activityType = "CONSULTATION_SCHEDULED";
    activityDescription = `Consultation scheduled for ${new Date(updates.consultationDate).toLocaleString()}`;
  } else if (newStatus === "CONSULTATION_COMPLETED") {
    activityType = "CONSULTATION_COMPLETED";
    activityDescription = "Consultation was completed.";
  } else if (newStatus === "ENGAGEMENT_SENT") {
    updates.engagementSentAt = new Date();
    activityType = "ENGAGEMENT_SENT";
    activityDescription = "Engagement letter was sent.";
  } else if (newStatus === "CONTACTED") {
    activityType = "CONTACTED";
    activityDescription = "Lead was contacted.";
  }

  const updated = await leadRepository.update(id, firmId, updates);
  if (!updated) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  // Log activity
  await leadActivityService.logActivity(id, userId, activityType, activityDescription);

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Status Changed: ID=${id}, From=${currentStatus}, To=${newStatus}, UserID=${userId}`);

  return formatLead(updated);
}

export async function listLeads(
  firmId: string,
  filters: any,
  options: { page: number; limit: number }
) {
  return leadRepository.list(firmId, filters, options);
}

export async function addNote(
  leadId: string,
  firmId: string,
  userId: string,
  noteText: string
): Promise<LeadNoteResponseData> {
  const lead = await leadRepository.findById(leadId, firmId);
  if (!lead) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  if (lead.status === "CONVERTED") {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  const created = await leadRepository.addNote(leadId, userId, noteText);

  // Log activity
  await leadActivityService.logActivity(leadId, userId, "UPDATED", "New internal note added.");

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Note Added: LeadID=${leadId}, UserID=${userId}`);

  // Fetch populated note
  const populated = await LeadNote.findById(created._id).populate("userId", "firstName lastName email");
  return formatNote(populated);
}

export async function addAttachment(
  leadId: string,
  firmId: string,
  userId: string,
  documentId: string
): Promise<LeadAttachmentResponseData> {
  const lead = await leadRepository.findById(leadId, firmId);
  if (!lead) {
    throw AppError.notFound(LEAD_ERROR_MESSAGES.LEAD_NOT_FOUND);
  }

  if (lead.status === "CONVERTED") {
    throw AppError.badRequest(LEAD_ERROR_MESSAGES.CONVERTED_READ_ONLY);
  }

  const created = await leadRepository.addAttachment(leadId, documentId, userId);

  // Log activity
  await leadActivityService.logActivity(leadId, userId, "UPDATED", `New document attached: ${documentId}`);

  // Compliance Audit logging
  console.log(`[AUDIT] Lead Attachment Uploaded: LeadID=${leadId}, DocumentID=${documentId}`);

  const populated = await LeadAttachment.findById(created._id).populate("uploadedBy", "firstName lastName email");
  return formatAttachment(populated);
}
