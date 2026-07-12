import { Schema, model, Document } from "mongoose";

export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IJob extends Document {
  name: string;
  data: Record<string, any>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  runAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    name: { type: String, required: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    error: { type: String },
    runAt: { type: Date, default: Date.now, index: true },
    processedAt: { type: Date },
    completedAt: { type: Date },
    failedAt: { type: Date },
  },
  { timestamps: true }
);

export const Job = model<IJob>("Job", jobSchema);
export default Job;
