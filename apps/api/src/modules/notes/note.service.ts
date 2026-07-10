import { Types } from "mongoose";
import * as noteRepository from "./note.repository.js";
import { NoteDocument } from "./note.types.js";
import { NOTE_ERROR_MESSAGES } from "./note.constants.js";
import { AppError } from "../../shared/app-error.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { Client } from "../clients/schemas/client.schema.js";
import { Lead } from "../leads/schemas/lead.schema.js";
import { Intake } from "../intake/schemas/intake.schema.js";

/**
 * Custom XSS Sanitizer for Rich Text HTML Note Content.
 * Permits basic formatting tags but strips scripts, iframes, inline event handlers, and javascript: links.
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return "";
  
  let sanitized = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Strip dangerous tag structures
  sanitized = sanitized.replace(/<(iframe|object|embed|frame|style|link|meta|applet)[^>]*>([\s\S]*?)<\/\1>/gi, "");
  sanitized = sanitized.replace(/<(iframe|object|embed|frame|style|link|meta|applet)[^>]*>/gi, "");

  // Strip event handlers (onload, onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // Replace JavaScript links
  sanitized = sanitized.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
  
  return sanitized;
}

/**
 * Validates that the referenced parent entity exists and belongs to this firm.
 */
async function validateParentEntity(
  firmId: string,
  entityType: string,
  entityId: string
): Promise<void> {
  if (!Types.ObjectId.isValid(entityId)) {
    throw AppError.validation("Invalid entity ID format.");
  }

  const query = {
    _id: new Types.ObjectId(entityId),
    firmId: new Types.ObjectId(firmId),
  };

  let exists = false;

  switch (entityType) {
    case "MATTER":
      exists = !!(await Matter.findOne(query).exec());
      break;
    case "CLIENT":
      exists = !!(await Client.findOne(query).exec());
      break;
    case "LEAD":
      // Leads do not have a deleted field or have active/archived matching
      exists = !!(await Lead.findOne({ _id: query._id, firmId: query.firmId }).exec());
      break;
    case "INTAKE":
      exists = !!(await Intake.findOne(query).exec());
      break;
    default:
      // Unimplemented modules (DOCUMENT, TASK, CALENDAR_EVENT, TIME_ENTRY, EXPENSE, INVOICE)
      // skip database verification checks but require valid ObjectId format
      exists = true;
      break;
  }

  if (!exists) {
    throw AppError.validation(NOTE_ERROR_MESSAGES.INVALID_ENTITY);
  }
}

export async function listNotes(firmId: string, filter: noteRepository.ListFilter) {
  return noteRepository.findAll(firmId, filter);
}

export async function getNote(id: string, firmId: string): Promise<NoteDocument> {
  const note = await noteRepository.findById(id, firmId);
  if (!note) {
    throw AppError.notFound(NOTE_ERROR_MESSAGES.NOTE_NOT_FOUND);
  }
  return note;
}

export async function createNote(
  firmId: string,
  userId: string,
  data: {
    entityType: string;
    entityId: string;
    title?: string;
    content: string;
  }
): Promise<NoteDocument> {
  await validateParentEntity(firmId, data.entityType, data.entityId);

  const payload: Partial<NoteDocument> = {
    firmId: new Types.ObjectId(firmId),
    entityType: data.entityType as any,
    entityId: new Types.ObjectId(data.entityId),
    title: data.title || "",
    content: sanitizeHtmlContent(data.content),
    authorId: new Types.ObjectId(userId),
    isPinned: false,
    deleted: false,
  };

  return noteRepository.create(payload);
}

export async function updateNote(
  id: string,
  firmId: string,
  data: { title?: string; content?: string },
  userId: string,
  userPermissions: string[]
): Promise<NoteDocument> {
  throw AppError.badRequest("Notes are immutable and cannot be edited.");
}

export async function pinNote(
  id: string,
  firmId: string,
  isPinned: boolean
): Promise<NoteDocument> {
  const note = await noteRepository.findById(id, firmId);
  if (!note) {
    throw AppError.notFound(NOTE_ERROR_MESSAGES.NOTE_NOT_FOUND);
  }

  const updated = await noteRepository.pin(id, firmId, isPinned);
  if (!updated) {
    throw AppError.notFound(NOTE_ERROR_MESSAGES.NOTE_NOT_FOUND);
  }

  return updated;
}

export async function softDeleteNote(
  id: string,
  firmId: string,
  userId: string,
  userPermissions: string[]
): Promise<NoteDocument> {
  const note = await noteRepository.findById(id, firmId);
  if (!note) {
    throw AppError.notFound(NOTE_ERROR_MESSAGES.NOTE_NOT_FOUND);
  }

  // Authorization: Only the author OR users with NOTES_MANAGE permission (Admins/Owners)
  const isAuthor = note.authorId.toString() === userId;
  const isManager = userPermissions.includes("NOTES_MANAGE");

  if (!isAuthor && !isManager) {
    throw AppError.forbidden(NOTE_ERROR_MESSAGES.UNAUTHORIZED_EDIT);
  }

  const deleted = await noteRepository.softDelete(id, firmId, userId);
  if (!deleted) {
    throw AppError.notFound(NOTE_ERROR_MESSAGES.NOTE_NOT_FOUND);
  }

  return deleted;
}
