export const MATTER_STATUSES = {
  OPEN: "OPEN",
  ON_HOLD: "ON_HOLD",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED",
} as const;

export const MATTER_TYPES = {
  LITIGATION: "LITIGATION",
  TRANSACTIONAL: "TRANSACTIONAL",
  CONSULTATION: "CONSULTATION",
  ADVISORY: "ADVISORY",
  REGULATORY: "REGULATORY",
  OTHER: "OTHER",
} as const;

export const MATTER_PRIORITIES = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export const MATTER_ERROR_MESSAGES = {
  MATTER_NOT_FOUND: "Matter not found.",
  CLIENT_NOT_FOUND: "Client not found or belongs to another firm.",
  ATTORNEY_NOT_FOUND: "Responsible attorney not found or belongs to another firm.",
  PRACTICE_AREA_NOT_FOUND: "Practice area not found or belongs to another firm.",
  DUPLICATE_TEAM_MEMBER: "This user is already a member of the matter team.",
  TEAM_MEMBER_NOT_FOUND: "User is not a member of the matter team.",
  INVALID_STATUS_TRANSITION: "Invalid lifecycle status transition.",
  IMMUTABLE_FIELD: "Field is immutable after matter creation.",
  CLIENT_REQUIRED: "Every matter must be assigned to a client.",
  ATTORNEY_REQUIRED: "Every matter must always have exactly one Responsible Attorney.",
  PRACTICE_AREA_REQUIRED: "Every matter must belong to exactly one Practice Area.",
};
