import { Types } from "mongoose";
import { TimerStatus, BillingType } from "../constants/time-entry.constants.js";

export interface TimeEntry {
  _id: Types.ObjectId;
  firmId: Types.ObjectId;
  userId: Types.ObjectId;
  matterId?: Types.ObjectId;
  clientId?: Types.ObjectId;
  
  description?: string;
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
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateTimeEntryDTO {
  matterId?: string;
  clientId?: string;
  description?: string;
  date?: string | Date;
  durationMinutes: number;
  billingType?: BillingType;
  hourlyRate?: number;
}

export interface UpdateTimeEntryDTO {
  matterId?: string;
  clientId?: string;
  description?: string;
  date?: string | Date;
  durationMinutes?: number;
  billingType?: BillingType;
  hourlyRate?: number;
}
