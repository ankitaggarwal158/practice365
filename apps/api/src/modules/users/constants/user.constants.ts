export const USER_ERROR_MESSAGES = {
  USER_NOT_FOUND: "User not found.",
  DUPLICATE_EMAIL: "A user with this email address already exists.",
  INVALID_STATUS_TRANSITION: "Invalid user status transition.",
  INVITATION_EXPIRED: "Invitation link has expired.",
  INVITATION_ALREADY_ACCEPTED: "Invitation has already been accepted.",
  INVALID_INVITATION_TOKEN: "Invalid or expired invitation token.",
  PASSWORD_REQUIRED: "Password is required to accept invitation.",
  ACCESS_DENIED_SAME_FIRM: "Access denied: Users must belong to the same firm.",
  ADMINISTRATIVE_ACTION_REQUIRED: "Permission denied for this administrative action.",
} as const;

export const INVITATION_TOKEN_EXPIRY = 72 * 3600; // 72 hours in seconds

export const INVITATION_TOKEN_BYTES = 32;

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_PREFERENCES = {
  timezone: "UTC",
  language: "en",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "24",
  notificationPreferences: {
    email: true,
  },
} as const;
