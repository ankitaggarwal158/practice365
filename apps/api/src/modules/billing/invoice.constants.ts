export enum InvoiceStatus {
  DRAFT = "DRAFT",
  ISSUED = "ISSUED",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum InvoiceItemSourceType {
  TIME_ENTRY = "TIME_ENTRY",
  EXPENSE = "EXPENSE",
  MANUAL = "MANUAL",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CHEQUE = "CHEQUE",
  CARD = "CARD",
  OTHER = "OTHER",
}
