import { Document, Types } from "mongoose";
import { BillingType } from "./fixed-charge.constants.js";

export interface FixedChargeDocument extends Document {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  matterId: Types.ObjectId;
  clientId: Types.ObjectId;
  clientDescription: string;
  internalNote?: string;
  amount: number;
  billingType: BillingType;
  isBilled: boolean;
  invoiceId?: Types.ObjectId | null;
  date: Date;
  createdBy: Types.ObjectId;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFixedChargeDTO {
  matterId: string;
  clientId: string;
  clientDescription: string;
  internalNote?: string;
  amount: number;
  billingType?: BillingType;
  date?: string | Date;
}

export interface UpdateFixedChargeDTO {
  clientDescription?: string;
  internalNote?: string;
  amount?: number;
  billingType?: BillingType;
  date?: string | Date;
}

export interface FixedChargeResponseData {
  id: string;
  firmId: string;
  matterId: string;
  clientId: string;
  clientDescription: string;
  internalNote?: string;
  amount: number;
  billingType: string;
  isBilled: boolean;
  invoiceId?: string | null;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
