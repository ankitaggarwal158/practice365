export const REQUEST_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  PARTIALLY_SIGNED: "PARTIALLY_SIGNED",
  COMPLETED: "COMPLETED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export const SIGNING_MODE = {
  PARALLEL: "PARALLEL",
  SEQUENTIAL: "SEQUENTIAL",
} as const;

export const SIGNER_STATUS = {
  PENDING: "PENDING",
  VIEWED: "VIEWED",
  SIGNED: "SIGNED",
  DECLINED: "DECLINED",
} as const;

export const EVENT_TYPE = {
  CREATED: "CREATED",
  SENT: "SENT",
  EMAIL_DELIVERED: "EMAIL_DELIVERED",
  VIEWED: "VIEWED",
  SIGNED: "SIGNED",
  DECLINED: "DECLINED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type RequestStatus = typeof REQUEST_STATUS[keyof typeof REQUEST_STATUS];
export type SigningMode = typeof SIGNING_MODE[keyof typeof SIGNING_MODE];
export type SignerStatus = typeof SIGNER_STATUS[keyof typeof SIGNER_STATUS];
export type EventType = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];
