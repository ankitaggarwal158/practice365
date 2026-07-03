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

export interface Invoice {
  _id: string;
  firmId: string;
  clientId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
  matterId?: {
    _id: string;
    title: string;
  };
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  _id: string;
  invoiceId: string;
  sourceType: InvoiceItemSourceType;
  sourceId?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  displayOrder: number;
}

export interface InvoicePayment {
  _id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  receivedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateInvoiceDTO {
  clientId: string;
  matterId?: string;
  timeEntryIds?: string[];
  expenseIds?: string[];
  manualItems?: {
    description: string;
    quantity: number;
    rate: number;
  }[];
  dueDate?: string;
  notes?: string;
}

export interface UpdateInvoiceDTO {
  clientId?: string;
  matterId?: string;
  dueDate?: string;
  notes?: string;
  timeEntryIds?: string[];
  manualItems?: {
    description: string;
    quantity: number;
    rate: number;
  }[];
}

export interface RecordPaymentDTO {
  paymentDate?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}
