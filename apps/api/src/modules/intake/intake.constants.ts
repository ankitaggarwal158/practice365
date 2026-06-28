export const INTAKE_SOURCES = [
  "WEBSITE",
  "PHONE",
  "EMAIL",
  "WALK_IN",
  "REFERRAL",
  "ADVERTISEMENT",
  "MANUAL",
] as const;

export const INTAKE_STATUSES = [
  "NEW",
  "IN_REVIEW",
  "AWAITING_RESPONSE",
  "QUALIFIED",
  "REJECTED",
  "CONVERTED",
] as const;

export const CONTACT_METHODS = ["PHONE", "EMAIL", "SMS"] as const;

export const INTAKE_ERROR_MESSAGES = {
  INTAKE_NOT_FOUND: "Intake record not found.",
  CONVERTED_READ_ONLY: "This intake has been converted and is now read-only.",
  INVALID_STATUS_TRANSITION: "Invalid lifecycle status transition requested.",
  DUPLICATE_CONVERSION: "This intake has already been converted into a Lead.",
  ASSIGNMENT_CROSS_FIRM: "Cannot assign an intake to a user belonging to another firm.",
  ASSIGNEE_NOT_FOUND: "Assignee user not found.",
  INVALID_ID: "Invalid ID format.",
};

// Define valid status transitions map
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ["IN_REVIEW", "AWAITING_RESPONSE", "REJECTED"],
  IN_REVIEW: ["AWAITING_RESPONSE", "QUALIFIED", "REJECTED"],
  AWAITING_RESPONSE: ["IN_REVIEW", "QUALIFIED", "REJECTED"],
  QUALIFIED: ["CONVERTED", "REJECTED", "IN_REVIEW"],
  REJECTED: ["IN_REVIEW"],
  CONVERTED: [], // Terminating state, no transitions allowed
};
