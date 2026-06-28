export const CLIENT_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export const CLIENT_TYPES = {
  INDIVIDUAL: "INDIVIDUAL",
  ORGANIZATION: "ORGANIZATION",
} as const;

export const CLIENT_ERROR_MESSAGES = {
  CLIENT_NOT_FOUND: "Client not found.",
  IMMUTABLE_TYPE: "Client type (INDIVIDUAL/ORGANIZATION) is immutable and cannot be changed.",
  DUPLICATE_CLIENT_NUMBER: "A client with this identification number already exists in the firm.",
  MERGE_SELF: "Cannot merge a client into themselves.",
  MERGE_ARCHIVED: "Cannot merge or reassign an already archived client.",
};
