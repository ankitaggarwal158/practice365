import mongoose, { Schema } from "mongoose";
import { TimeEntry } from "../types/time-entry.types.js";
import { TimerStatus, BillingType } from "../constants/time-entry.constants.js";

const TimeEntrySchema = new Schema<TimeEntry>(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    matterId: { type: Schema.Types.ObjectId, ref: "Matter", index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
    
    description: { type: String },
    date: { type: Date, required: true },
    
    durationMinutes: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    billableAmount: { type: Number, default: 0 },
    
    timerStatus: { 
      type: String, 
      enum: Object.values(TimerStatus), 
      required: true,
      index: true
    },
    billingType: { 
      type: String, 
      enum: Object.values(BillingType), 
      default: BillingType.BILLABLE,
      required: true 
    },
    
    timerStartedAt: { type: Date },
    timerStoppedAt: { type: Date },
    accumulatedSeconds: { type: Number, default: 0 },
    lastResumedAt: { type: Date },
    
    isBilled: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const TimeEntryModel = mongoose.model<TimeEntry>("TimeEntry", TimeEntrySchema, "time_entries");
