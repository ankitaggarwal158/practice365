export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONSULTATION_SCHEDULED",
  "CONSULTATION_COMPLETED",
  "ENGAGEMENT_SENT",
  "QUALIFIED",
  "LOST",
  "CONVERTED",
] as const;

export const LEAD_SOURCES = ["INTAKE", "MANUAL"] as const;

export const LEAD_ERROR_MESSAGES = {
  LEAD_NOT_FOUND: "Lead record not found.",
  CONVERTED_READ_ONLY: "This lead has been converted and is now read-only.",
  INVALID_STATUS_TRANSITION: "Invalid lifecycle status transition requested.",
  DUPLICATE_CONVERSION: "This lead has already been converted into a Client.",
  ASSIGNMENT_CROSS_FIRM: "Cannot assign a lead to a user belonging to another firm.",
  OWNER_NOT_FOUND: "Owner user not found.",
  INVALID_ID: "Invalid ID format.",
};

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ["CONTACTED", "CONSULTATION_SCHEDULED", "LOST"],
  CONTACTED: ["CONSULTATION_SCHEDULED", "LOST"],
  CONSULTATION_SCHEDULED: ["CONSULTATION_COMPLETED", "LOST"],
  CONSULTATION_COMPLETED: ["ENGAGEMENT_SENT", "QUALIFIED", "LOST"],
  ENGAGEMENT_SENT: ["QUALIFIED", "LOST"],
  QUALIFIED: ["CONVERTED", "LOST"],
  LOST: ["NEW", "CONTACTED"],
  CONVERTED: [], // Terminating state
};
