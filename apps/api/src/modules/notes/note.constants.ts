export const ENTITY_TYPES = [
  "MATTER",
  "CLIENT",
  "LEAD",
  "INTAKE",
  "DOCUMENT",
  "TASK",
  "CALENDAR_EVENT",
  "TIME_ENTRY",
  "EXPENSE",
  "INVOICE",
] as const;

export const NOTE_ERROR_MESSAGES = {
  NOTE_NOT_FOUND: "Note not found.",
  INVALID_ENTITY: "The referenced parent entity is invalid or belongs to another firm.",
  UNAUTHORIZED_EDIT: "You are not authorized to edit this note.",
};
