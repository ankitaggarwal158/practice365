import { Types } from "mongoose";
import { TimerStatus, BillingType } from "../constants/time-entry.constants.js";

export interface TimeEntry {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  userId: Types.ObjectId;
  matterId?: Types.ObjectId;
  clientId?: Types.ObjectId;
  
  clientDescription: string;
  internalNote?: string;
  date: Date;
  
  durationMinutes: number; // Stored in minutes
  hourlyRate: number;
  billableAmount: number;
  
  timerStatus: TimerStatus;
  billingType: BillingType;
  
  // Timer tracking fields
  timerStartedAt?: Date;
  timerStoppedAt?: Date;
  accumulatedSeconds: number; // Internal tracking for pause/resume
  lastResumedAt?: Date;
  
  isBilled: boolean;
  invoiceId?: Types.ObjectId | null;
  createdBy?: Types.ObjectId;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimeEntryDTO {
  matterId?: string;
  clientId?: string;
  clientDescription: string;
  internalNote?: string;
  date?: string | Date;
  durationMinutes: number;
  billingType?: BillingType;
  hourlyRate?: number;
}

export interface UpdateTimeEntryDTO {
  matterId?: string;
  clientId?: string;
  clientDescription?: string;
  internalNote?: string;
  date?: string | Date;
  durationMinutes?: number;
  billingType?: BillingType;
  hourlyRate?: number;
}
