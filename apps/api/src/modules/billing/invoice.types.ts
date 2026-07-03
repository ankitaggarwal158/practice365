import { Types } from "mongoose";
import { InvoiceStatus, InvoiceItemSourceType, PaymentMethod } from "./invoice.constants.js";

export interface Invoice {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  clientId: Types.ObjectId;
  matterId?: Types.ObjectId;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate?: Date;
  dueDate?: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  _id: Types.ObjectId;
  invoiceId: Types.ObjectId;
  sourceType: InvoiceItemSourceType;
  sourceId?: Types.ObjectId;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoicePayment {
  _id: Types.ObjectId;
  invoiceId: Types.ObjectId;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  receivedBy: Types.ObjectId;
  createdAt: Date;
}
