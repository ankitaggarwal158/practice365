export type EntityType =
  | "MATTER"
  | "CLIENT"
  | "LEAD"
  | "INTAKE"
  | "DOCUMENT"
  | "TASK"
  | "CALENDAR_EVENT"
  | "TIME_ENTRY"
  | "EXPENSE"
  | "INVOICE";

export interface NoteAuthor {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface Note {
  id: string;
  firmId: string;
  entityType: EntityType;
  entityId: string;
  title: string;
  content: string;
  authorId: NoteAuthor | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  entityType: EntityType;
  entityId: string;
  title?: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
