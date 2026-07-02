import { httpClient } from "../../../services/http-client";
import {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  PaginatedResult,
} from "../types/note.types";

export async function listNotes(params: {
  entityType?: string;
  entityId?: string;
  authorId?: string;
  isPinned?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<Note>> {
  return httpClient.get<PaginatedResult<Note>>("/notes", { params });
}

export async function getNote(id: string): Promise<Note> {
  return httpClient.get<Note>(`/notes/${id}`);
}

export async function createNote(data: CreateNoteRequest): Promise<Note> {
  return httpClient.post<Note>("/notes", data);
}

export async function updateNote(id: string, data: UpdateNoteRequest): Promise<Note> {
  return httpClient.patch<Note>(`/notes/${id}`, data);
}

export async function deleteNote(id: string): Promise<void> {
  await httpClient.delete(`/notes/${id}`);
}

export async function pinNote(id: string, isPinned: boolean): Promise<Note> {
  return httpClient.patch<Note>(`/notes/${id}/pin`, { isPinned });
}
