import { AppError } from "../../shared/app-error.js";
import { CLIENT_ERROR_MESSAGES } from "./client.constants.js";
import * as clientRepository from "./client.repository.js";
import { Lead } from "../leads/schemas/lead.schema.js";
import * as conflictRepository from "../conflict-check/conflict-check.repository.js";
import { ClientResponseData } from "./client.types.js";
import { Types } from "mongoose";

export function generateClientNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
  return `CLI-${dateStr}-${randomStr}`;
}

export function formatClient(
  client: any,
  notes: any[] = [],
  attachments: any[] = []
): ClientResponseData {
  return {
    id: client._id.toString(),
    firmId: client.firmId.toString(),
    leadId: client.leadId?.toString() || undefined,
    clientNumber: client.clientNumber,
    clientType: client.clientType,
    status: client.status,
    firstName: client.firstName || undefined,
    lastName: client.lastName || undefined,
    companyName: client.companyName || undefined,
    email: client.email || undefined,
    phone: client.phone || undefined,
    website: client.website || undefined,
    address: client.address,
    customFields: client.customFields,
    mergedIntoClientId: client.mergedIntoClientId?.toString() || undefined,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    notes: notes.map((n) => ({
      id: n._id.toString(),
      clientId: n.clientId.toString(),
      authorId: n.authorId?._id ? n.authorId._id.toString() : n.authorId.toString(),
      authorName: n.authorId && n.authorId.firstName
        ? `${n.authorId.firstName} ${n.authorId.lastName}`
        : undefined,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
    attachments: attachments.map((a) => ({
      id: a._id.toString(),
      clientId: a.clientId.toString(),
      fileName: a.fileName,
      fileSize: a.fileSize,
      mimeType: a.mimeType,
      key: a.key,
      uploadedBy: a.uploadedBy?._id ? a.uploadedBy._id.toString() : a.uploadedBy.toString(),
      uploadedByName: a.uploadedBy && a.uploadedBy.firstName
        ? `${a.uploadedBy.firstName} ${a.uploadedBy.lastName}`
        : undefined,
      uploadedAt: a.uploadedAt.toISOString(),
    })),
  };
}

export async function createClient(
  firmId: string,
  userId: string,
  data: any
): Promise<ClientResponseData> {
  const clientNumber = generateClientNumber();

  const created = await clientRepository.create({
    ...data,
    firmId: new Types.ObjectId(firmId),
    clientNumber,
    status: "ACTIVE",
  });

  // Compliance Audit Logging
  console.log(`[AUDIT] Client Created: ID=${created._id}, Number=${clientNumber}, FirmID=${firmId}`);

  return getClient(created._id.toString(), firmId);
}

export async function createClientFromLead(
  leadId: string,
  firmId: string,
  userId: string
): Promise<string> {
  if (!Types.ObjectId.isValid(leadId)) {
    throw AppError.badRequest("Invalid lead ID.");
  }

  const lead = await Lead.findOne({
    _id: new Types.ObjectId(leadId),
    firmId: new Types.ObjectId(firmId),
  });

  if (!lead) {
    throw AppError.notFound("Lead not found.");
  }

  if (lead.status === "CONVERTED") {
    throw AppError.badRequest("Lead has already been converted.");
  }

  // Conflict clearance validation
  const clearedCheck = await conflictRepository.findLatestClearedCheckForLead(leadId, firmId);
  if (!clearedCheck) {
    throw AppError.badRequest("A cleared conflict check is required before conversion.");
  }

  const clientNumber = generateClientNumber();
  const clientType = lead.companyName ? "ORGANIZATION" : "INDIVIDUAL";

  const client = await clientRepository.create({
    firmId: new Types.ObjectId(firmId),
    leadId: new Types.ObjectId(leadId),
    clientNumber,
    clientType,
    firstName: lead.firstName || "",
    lastName: lead.lastName || "",
    companyName: lead.companyName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    status: "ACTIVE",
  });

  // Compliance Audit Logging
  console.log(`[AUDIT] Client Created from Lead: LeadID=${leadId}, ClientID=${client._id}, Number=${clientNumber}`);

  return client._id.toString();
}

export async function updateClient(
  id: string,
  firmId: string,
  data: any
): Promise<ClientResponseData> {
  const client = await clientRepository.findById(id, firmId);
  if (!client) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Type lock check
  if (data.clientType && data.clientType !== client.clientType) {
    throw AppError.badRequest(CLIENT_ERROR_MESSAGES.IMMUTABLE_TYPE);
  }

  const updated = await clientRepository.update(id, firmId, data);
  if (!updated) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Client Updated: ID=${id}, FirmID=${firmId}`);

  return getClient(id, firmId);
}

export async function archiveClient(
  id: string,
  firmId: string,
  userId: string
): Promise<ClientResponseData> {
  const updated = await clientRepository.update(id, firmId, { status: "ARCHIVED" });
  if (!updated) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Client Archived: ID=${id}, ExecutorID=${userId}`);

  return getClient(id, firmId);
}

export async function reactivateClient(
  id: string,
  firmId: string,
  userId: string
): Promise<ClientResponseData> {
  const updated = await clientRepository.update(id, firmId, { status: "ACTIVE" });
  if (!updated) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Compliance Audit Logging
  console.log(`[AUDIT] Client Reactivated: ID=${id}, ExecutorID=${userId}`);

  return getClient(id, firmId);
}

export async function getClient(
  id: string,
  firmId: string
): Promise<ClientResponseData> {
  const client = await clientRepository.findByIdWithDetails(id, firmId);
  if (!client) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  const [notes, attachments] = await Promise.all([
    clientRepository.findNotesForClient(id),
    clientRepository.findAttachmentsForClient(id),
  ]);

  return formatClient(client, notes, attachments);
}

export async function listClients(
  firmId: string,
  filters: {
    page: number;
    limit: number;
    query?: string;
    status?: string;
    clientType?: string;
  }
) {
  const { data, total, pages } = await clientRepository.list(firmId, filters);
  const formatted = data.map((c) => formatClient(c));
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

// ─── Notes Operations ────────────────────────────────────────

export async function addClientNote(
  clientId: string,
  firmId: string,
  authorId: string,
  content: string
): Promise<ClientResponseData> {
  const client = await clientRepository.findById(clientId, firmId);
  if (!client) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  await clientRepository.addNote(clientId, authorId, content);
  return getClient(clientId, firmId);
}

export async function updateClientNote(
  noteId: string,
  clientId: string,
  firmId: string,
  userId: string,
  content: string
): Promise<ClientResponseData> {
  const note = await clientRepository.findNoteById(noteId);
  if (!note || note.clientId.toString() !== clientId) {
    throw AppError.notFound("Note not found.");
  }

  if (note.authorId.toString() !== userId) {
    throw AppError.forbidden("You are not permitted to edit this note.");
  }

  await clientRepository.updateNote(noteId, content);
  return getClient(clientId, firmId);
}

export async function deleteClientNote(
  noteId: string,
  clientId: string,
  firmId: string,
  userId: string
): Promise<ClientResponseData> {
  const note = await clientRepository.findNoteById(noteId);
  if (!note || note.clientId.toString() !== clientId) {
    throw AppError.notFound("Note not found.");
  }

  if (note.authorId.toString() !== userId) {
    throw AppError.forbidden("You are not permitted to delete this note.");
  }

  await clientRepository.deleteNote(noteId);
  return getClient(clientId, firmId);
}

// ─── Attachments Operations ──────────────────────────────────

export async function addClientAttachment(
  clientId: string,
  firmId: string,
  userId: string,
  fileData: { fileName: string; fileSize: number; mimeType: string; key: string }
): Promise<ClientResponseData> {
  const client = await clientRepository.findById(clientId, firmId);
  if (!client) {
    throw AppError.notFound(CLIENT_ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  await clientRepository.addAttachment(clientId, {
    ...fileData,
    uploadedBy: new Types.ObjectId(userId),
  });

  return getClient(clientId, firmId);
}

export async function deleteClientAttachment(
  attachmentId: string,
  clientId: string,
  firmId: string,
  userId: string
): Promise<ClientResponseData> {
  // Simple validation & delete
  await clientRepository.deleteAttachment(attachmentId);
  return getClient(clientId, firmId);
}
