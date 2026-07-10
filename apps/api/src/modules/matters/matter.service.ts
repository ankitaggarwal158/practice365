import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { MATTER_ERROR_MESSAGES, MATTER_STATUSES } from "./matter.constants.js";
import * as matterRepository from "./matter.repository.js";
import * as searchService from "./matter-search.service.js";
import * as statusService from "./matter-status.service.js";
import { Client } from "../clients/schemas/client.schema.js";
import { Lead } from "../leads/schemas/lead.schema.js";
import { ConflictCheck } from "../conflict-check/schemas/conflict-check.schema.js";
import { Firm } from "../firm/schemas/firm.schema.js";
import { User } from "../users/schemas/user.schema.js";
import { MatterResponseData } from "./matter.types.js";
import { PracticeArea } from "../practice-areas/index.js";

import { numberSequenceService } from "../firm-settings/index.js";

// ─── Number Generation ────────────────────────────────────────

export async function generateMatterNumber(firmId: string): Promise<string> {
  return numberSequenceService.generateMatterNumber(firmId);
}

// ─── Mapper Utility ───────────────────────────────────────────

export function formatMatter(
  matter: any,
  teamMembers: any[] = [],
  notes: any[] = [],
  attachments: any[] = []
): MatterResponseData {
  return {
    id: matter._id.toString(),
    firmId: matter.firmId.toString(),
    clientId: matter.clientId?._id ? matter.clientId._id.toString() : matter.clientId?.toString() || "",
    clientName: matter.clientId
      ? matter.clientId.clientType === "INDIVIDUAL"
        ? `${matter.clientId.firstName || ""} ${matter.clientId.lastName || ""}`.trim()
        : matter.clientId.companyName || ""
      : undefined,
    matterNumber: matter.matterNumber,
    title: matter.title,
    description: matter.description || undefined,
    practiceAreaId: matter.practiceAreaId?._id ? matter.practiceAreaId._id.toString() : matter.practiceAreaId?.toString() || "",
    practiceAreaName: matter.practiceAreaId?.name || undefined,
    matterType: matter.matterType,
    billingMethod: matter.billingMethod,
    customHourlyRate: matter.customHourlyRate,
    flatFeeAmount: matter.flatFeeAmount,
    status: matter.status,
    priority: matter.priority,
    responsibleAttorneyId: matter.responsibleAttorneyId?._id ? matter.responsibleAttorneyId._id.toString() : matter.responsibleAttorneyId?.toString() || "",
    responsibleAttorneyName: matter.responsibleAttorneyId
      ? `${matter.responsibleAttorneyId.firstName || ""} ${matter.responsibleAttorneyId.lastName || ""}`.trim()
      : undefined,
    openedDate: matter.openedDate.toISOString(),
    closedDate: matter.closedDate?.toISOString() || undefined,
    archivedAt: matter.archivedAt?.toISOString() || undefined,
    archivedBy: matter.archivedBy?.toString() || undefined,
    conflictCheckId: matter.conflictCheckId?.toString() || undefined,
    leadId: matter.leadId?.toString() || undefined,
    clientReference: matter.clientReference || undefined,
    courtFileNumber: matter.courtFileNumber || undefined,
    statuteOfLimitations: matter.statuteOfLimitations?.toISOString() || undefined,
    estimatedValue: matter.estimatedValue ? parseFloat(matter.estimatedValue.toString()) : undefined,
    retainerAmountAgreed: matter.retainerAmountAgreed,
    retainerCollected: matter.retainerCollected,
    retainerDateCollected: matter.retainerDateCollected?.toISOString() || null,
    retainerAmountCollected: matter.retainerAmountCollected,
    customFields: matter.customFields || {},
    createdBy: matter.createdBy?.toString() || "",
    createdAt: matter.createdAt.toISOString(),
    updatedAt: matter.updatedAt.toISOString(),
    teamMembers: teamMembers.map((tm) => ({
      id: tm._id.toString(),
      matterId: tm.matterId.toString(),
      userId: tm.userId?._id ? tm.userId._id.toString() : tm.userId.toString(),
      userName: tm.userId && tm.userId.firstName ? `${tm.userId.firstName} ${tm.userId.lastName}` : undefined,
      userEmail: tm.userId?.email || undefined,
      role: tm.role,
      assignedBy: tm.assignedBy?._id ? tm.assignedBy._id.toString() : tm.assignedBy.toString(),
      assignedAt: tm.assignedAt.toISOString(),
    })),
    notes: notes.map((n) => ({
      id: n._id.toString(),
      matterId: n.matterId.toString(),
      userId: n.userId?._id ? n.userId._id.toString() : n.userId.toString(),
      userName: n.userId && n.userId.firstName ? `${n.userId.firstName} ${n.userId.lastName}` : undefined,
      note: n.note,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
    attachments: attachments.map((a) => ({
      id: a._id.toString(),
      matterId: a.matterId.toString(),
      documentId: a.documentId?._id ? a.documentId._id.toString() : a.documentId?.toString() || "",
      fileName: a.documentId?.fileName || "",
      fileSize: a.documentId?.fileSize || 0,
      mimeType: a.documentId?.mimeType || "",
      key: a.documentId?.key || "",
      uploadedBy: a.uploadedBy?._id ? a.uploadedBy._id.toString() : a.uploadedBy?.toString() || "",
      uploadedByName: a.uploadedBy && a.uploadedBy.firstName ? `${a.uploadedBy.firstName} ${a.uploadedBy.lastName}` : undefined,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

// ─── CRUD Operations ──────────────────────────────────────────

export async function createMatter(
  firmId: string,
  userId: string,
  data: any
): Promise<MatterResponseData> {
  // Validate Client
  const client = await Client.findOne({ _id: new Types.ObjectId(data.clientId), firmId: new Types.ObjectId(firmId) });
  if (!client) {
    throw AppError.badRequest(MATTER_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Validate Practice Area (must exist, same firm, active, not soft deleted)
  const practiceArea = await PracticeArea.findOne({
    _id: new Types.ObjectId(data.practiceAreaId),
    firmId: new Types.ObjectId(firmId),
    isActive: true,
    deleted: false,
  });
  if (!practiceArea) {
    throw AppError.badRequest("Invalid, inactive, or deleted practice area selected.");
  }

  // Validate Responsible Attorney
  const attorney = await User.findOne({ _id: new Types.ObjectId(data.responsibleAttorneyId), firmId: new Types.ObjectId(firmId) });
  if (!attorney) {
    throw AppError.badRequest(MATTER_ERROR_MESSAGES.ATTORNEY_NOT_FOUND);
  }

  // Optional Conflict Check validation
  if (data.conflictCheckId) {
    const cc = await ConflictCheck.findOne({ _id: new Types.ObjectId(data.conflictCheckId), firmId: new Types.ObjectId(firmId) });
    if (!cc) {
      throw AppError.badRequest("Conflict check not found.");
    }
  }

  // Optional Lead validation
  let opposingPartyNames = data.opposingPartyNames || [];
  if (data.leadId) {
    const lead = await Lead.findOne({ _id: new Types.ObjectId(data.leadId), firmId: new Types.ObjectId(firmId) });
    if (!lead) {
      throw AppError.badRequest("Lead not found.");
    }
    if (opposingPartyNames.length === 0 && lead.opposingPartyNames) {
      opposingPartyNames = lead.opposingPartyNames;
    }
  }

  const matterNumber = await generateMatterNumber(firmId);

  const created = await matterRepository.create({
    ...data,
    opposingPartyNames,
    firmId: new Types.ObjectId(firmId),
    matterNumber,
    status: MATTER_STATUSES.OPEN,
    createdBy: new Types.ObjectId(userId),
    openedDate: new Date(),
  });

  // Automatically assign Responsible Attorney to the team members collection
  await matterRepository.addTeamMember(created._id.toString(), data.responsibleAttorneyId, "Responsible Attorney", userId);

  // Compliance Audit Logging
  console.log(`[AUDIT] Matter Created: ID=${created._id}, Number=${matterNumber}, FirmID=${firmId}`);

  return getMatter(created._id.toString(), firmId);
}

export async function getMatter(
  id: string,
  firmId: string
): Promise<MatterResponseData> {
  const matter = await matterRepository.findByIdWithDetails(id, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  const [teamMembers, notes, attachments] = await Promise.all([
    matterRepository.findTeamMembersForMatter(id),
    matterRepository.findNotesForMatter(id),
    matterRepository.findAttachmentsForMatter(id),
  ]);

  return formatMatter(matter, teamMembers, notes, attachments);
}

export async function updateMatter(
  id: string,
  firmId: string,
  data: any,
  userId: string
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(id, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  // Check if matter is read-only (Archived)
  if (matter.status === MATTER_STATUSES.ARCHIVED) {
    throw AppError.badRequest("Cannot update archived matters.");
  }

  // If changing practice area, validate it
  if (data.practiceAreaId) {
    const pa = await PracticeArea.findOne({
      _id: new Types.ObjectId(data.practiceAreaId),
      firmId: new Types.ObjectId(firmId),
      isActive: true,
      deleted: false,
    });
    if (!pa) {
      throw AppError.badRequest("Invalid, inactive, or deleted practice area selected.");
    }
  }

  // Prevent modifying client or matter number (immutable)
  if (data.clientId && data.clientId !== matter.clientId.toString()) {
    throw AppError.badRequest(MATTER_ERROR_MESSAGES.IMMUTABLE_FIELD);
  }
  if (data.matterNumber && data.matterNumber !== matter.matterNumber) {
    throw AppError.badRequest(MATTER_ERROR_MESSAGES.IMMUTABLE_FIELD);
  }

  const updated = await matterRepository.update(id, firmId, data);
  if (!updated) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Matter Updated: ID=${id}, FirmID=${firmId}, ExecutorID=${userId}`);

  return getMatter(id, firmId);
}

export async function listMatters(
  firmId: string,
  filters: any
): Promise<{ data: MatterResponseData[]; pagination: any }> {
  const { data, total, pages } = await searchService.searchMatters(firmId, filters);
  const formatted = data.map((m) => formatMatter(m));
  return {
    data: formatted,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages,
    },
  };
}

// ─── Lifecycle & Status Service Handlers ──────────────────────

export async function updateMatterStatus(
  id: string,
  firmId: string,
  newStatus: string,
  userId: string
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(id, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  statusService.validateTransition(matter.status, newStatus);

  const updateFields: any = { status: newStatus };
  let unsetFields: any = undefined;

  if (newStatus === MATTER_STATUSES.CLOSED) {
    updateFields.closedDate = new Date();
  } else if (newStatus === MATTER_STATUSES.ARCHIVED) {
    updateFields.archivedAt = new Date();
    updateFields.archivedBy = new Types.ObjectId(userId);
  } else if (matter.status === MATTER_STATUSES.CLOSED && newStatus === MATTER_STATUSES.OPEN) {
    // Reopen closed
    unsetFields = { closedDate: "" };
  } else if (matter.status === MATTER_STATUSES.ARCHIVED && newStatus === MATTER_STATUSES.OPEN) {
    // Reopen archived
    unsetFields = { archivedAt: "", archivedBy: "" };
  }

  let updated;
  if (unsetFields) {
    updated = await matterRepository.updateStatus(id, firmId, newStatus, unsetFields);
  } else {
    updated = await matterRepository.update(id, firmId, updateFields);
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Matter Status Changed: ID=${id}, From=${matter.status}, To=${newStatus}, ExecutorID=${userId}`);

  return getMatter(id, firmId);
}

export async function archiveMatter(
  id: string,
  firmId: string,
  userId: string
): Promise<MatterResponseData> {
  return updateMatterStatus(id, firmId, MATTER_STATUSES.ARCHIVED, userId);
}

export async function reopenMatter(
  id: string,
  firmId: string,
  userId: string
): Promise<MatterResponseData> {
  return updateMatterStatus(id, firmId, MATTER_STATUSES.OPEN, userId);
}

export async function changeResponsibleAttorney(
  id: string,
  firmId: string,
  newAttorneyId: string,
  userId: string
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(id, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  if (matter.status === MATTER_STATUSES.ARCHIVED) {
    throw AppError.badRequest("Cannot update attorney on archived matters.");
  }

  // Validate user exists in firm
  const attorney = await User.findOne({ _id: new Types.ObjectId(newAttorneyId), firmId: new Types.ObjectId(firmId) });
  if (!attorney) {
    throw AppError.badRequest(MATTER_ERROR_MESSAGES.ATTORNEY_NOT_FOUND);
  }

  const oldAttorneyId = matter.responsibleAttorneyId.toString();
  await matterRepository.update(id, firmId, { responsibleAttorneyId: new Types.ObjectId(newAttorneyId) });

  // Add the new Responsible Attorney to the team members if not already exists
  const existingTeam = await matterRepository.findTeamMember(id, newAttorneyId);
  if (!existingTeam) {
    await matterRepository.addTeamMember(id, newAttorneyId, "Responsible Attorney", userId);
  } else if (existingTeam.role !== "Responsible Attorney") {
    await matterRepository.updateTeamMemberRole(id, newAttorneyId, "Responsible Attorney");
  }

  // Demote old responsible attorney in team or keep them as Assisting Attorney
  const oldTeam = await matterRepository.findTeamMember(id, oldAttorneyId);
  if (oldTeam && oldTeam.role === "Responsible Attorney") {
    await matterRepository.updateTeamMemberRole(id, oldAttorneyId, "Assisting Attorney");
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Responsible Attorney Changed: MatterID=${id}, OldAttorneyID=${oldAttorneyId}, NewAttorneyID=${newAttorneyId}, ExecutorID=${userId}`);

  return getMatter(id, firmId);
}

// ─── Notes Operations ──────────────────────────────────────────

export async function addMatterNote(
  matterId: string,
  firmId: string,
  userId: string,
  noteText: string
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(matterId, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  if (matter.status === MATTER_STATUSES.ARCHIVED) {
    throw AppError.badRequest("Cannot add notes to archived matters.");
  }

  await matterRepository.addNote(matterId, userId, noteText);

  // Compliance Audit Logging
  console.log(`[AUDIT] Note Added: MatterID=${matterId}, UserID=${userId}`);

  return getMatter(matterId, firmId);
}

export async function updateMatterNote(
  noteId: string,
  matterId: string,
  firmId: string,
  userId: string,
  noteText: string
): Promise<MatterResponseData> {
  throw AppError.badRequest("Notes are immutable and cannot be edited.");
}

export async function deleteMatterNote(
  noteId: string,
  matterId: string,
  firmId: string,
  userId: string
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(matterId, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  if (matter.status === MATTER_STATUSES.ARCHIVED) {
    throw AppError.badRequest("Cannot delete notes from archived matters.");
  }

  const note = await matterRepository.findNoteById(noteId);
  if (!note || note.matterId.toString() !== matterId) {
    throw AppError.notFound("Note not found.");
  }

  if (note.userId.toString() !== userId) {
    throw AppError.forbidden("You are not permitted to delete this note.");
  }

  await matterRepository.deleteNote(noteId);

  return getMatter(matterId, firmId);
}

// ─── Attachments & Documents Operations ────────────────────────

export async function addMatterAttachment(
  matterId: string,
  firmId: string,
  userId: string,
  fileData: { fileName: string; fileSize: number; mimeType: string; key: string }
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(matterId, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  if (matter.status === MATTER_STATUSES.ARCHIVED) {
    throw AppError.badRequest("Cannot add attachments to archived matters.");
  }

  // Create Document registry
  const doc = await matterRepository.createDocument(
    firmId,
    fileData.fileName,
    fileData.fileSize,
    fileData.mimeType,
    fileData.key,
    userId
  );

  // Link to matter attachments
  await matterRepository.addAttachment(matterId, doc._id.toString(), userId);

  // Compliance Audit Logging
  console.log(`[AUDIT] Attachment Uploaded: MatterID=${matterId}, DocumentID=${doc._id}, ExecutorID=${userId}`);

  return getMatter(matterId, firmId);
}

export async function deleteMatterAttachment(
  attachmentId: string,
  matterId: string,
  firmId: string,
  userId: string
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(matterId, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  if (matter.status === MATTER_STATUSES.ARCHIVED) {
    throw AppError.badRequest("Cannot delete attachments from archived matters.");
  }

  const attachment = await matterRepository.findAttachmentById(attachmentId);
  if (!attachment || attachment.matterId.toString() !== matterId) {
    throw AppError.notFound("Attachment not found.");
  }

  // Delete both the link and document metadata
  await matterRepository.deleteAttachment(attachmentId);
  // Note: we can keep document in documents or delete it. Deleting it is clean.
  // Wait, let's just delete the attachment link.
  
  return getMatter(matterId, firmId);
}

export async function markRetainerCollected(
  matterId: string,
  firmId: string,
  amount: number,
  dateCollected: Date = new Date()
): Promise<MatterResponseData> {
  const matter = await matterRepository.findById(matterId, firmId);
  if (!matter) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  const newCollectedAmount = (matter.retainerAmountCollected || 0) + amount;
  const isFullyCollected = matter.retainerAmountAgreed !== undefined && matter.retainerAmountAgreed !== null && newCollectedAmount >= matter.retainerAmountAgreed;

  const updated = await matterRepository.update(matterId, firmId, {
    retainerAmountCollected: newCollectedAmount,
    retainerCollected: isFullyCollected,
    retainerDateCollected: dateCollected,
  });

  if (!updated) {
    throw AppError.notFound(MATTER_ERROR_MESSAGES.MATTER_NOT_FOUND);
  }

  console.log(`[AUDIT] Retainer Collected: MatterID=${matterId}, Amount=${amount}, TotalCollected=${newCollectedAmount}`);

  return getMatter(matterId, firmId);
}
