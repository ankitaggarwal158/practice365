import { Request, Response } from "express";
import { Types } from "mongoose";
import * as noteService from "./note.service.js";
import { getUserEffectivePermissions } from "../roles/service/permission.service.js";
import { NoteDocument } from "./note.types.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId.toString();
}

export function formatNote(note: NoteDocument) {
  return {
    id: note._id.toString(),
    firmId: note.firmId.toString(),
    entityType: note.entityType,
    entityId: note.entityId.toString(),
    title: note.title || "",
    content: note.content,
    authorId: note.authorId ? {
      id: (note.authorId as any)._id?.toString() || note.authorId.toString(),
      firstName: (note.authorId as any).firstName || "",
      lastName: (note.authorId as any).lastName || "",
      displayName: (note.authorId as any).displayName || "",
    } : null,
    isPinned: note.isPinned,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export async function listNotes(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const { entityType, entityId, authorId, isPinned, search, page, limit } = req.query;

  const filter = {
    entityType: entityType ? String(entityType) : undefined,
    entityId: entityId ? String(entityId) : undefined,
    authorId: authorId ? String(authorId) : undefined,
    isPinned: isPinned !== undefined ? isPinned === "true" : undefined,
    search: search ? String(search) : undefined,
    page: page ? parseInt(String(page)) : undefined,
    limit: limit ? parseInt(String(limit)) : undefined,
  };

  const paginated = await noteService.listNotes(firmId, filter);

  res.status(200).json({
    success: true,
    data: paginated.docs.map(formatNote),
    pagination: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.totalDocs,
      pages: paginated.totalPages,
    },
  });
}

export async function getNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const noteId = req.params.id as string;

  const note = await noteService.getNote(noteId, firmId);
  res.status(200).json({
    success: true,
    data: formatNote(note),
  });
}

export async function createNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const { entityType, entityId, title, content } = req.body;

  const created = await noteService.createNote(firmId, userId, {
    entityType,
    entityId,
    title,
    content,
  });

  res.status(201).json({
    success: true,
    data: formatNote(created),
  });
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const noteId = req.params.id as string;
  const { title, content } = req.body;

  const permissions = await getUserEffectivePermissions(userId);

  const updated = await noteService.updateNote(
    noteId,
    firmId,
    { title, content },
    userId,
    permissions
  );

  res.status(200).json({
    success: true,
    data: formatNote(updated),
  });
}

export async function pinNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const noteId = req.params.id as string;
  const { isPinned } = req.body;

  const updated = await noteService.pinNote(noteId, firmId, isPinned);

  res.status(200).json({
    success: true,
    data: formatNote(updated),
  });
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  const firmId = await getRequestingUserFirmId(req);
  const userId = req.user!.userId;
  const noteId = req.params.id as string;

  const permissions = await getUserEffectivePermissions(userId);

  await noteService.softDeleteNote(noteId, firmId, userId, permissions);

  res.status(200).json({
    success: true,
    message: "Note deleted successfully.",
  });
}
