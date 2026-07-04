import mongoose, { Schema } from "mongoose";
import { AuditLogDocument } from "../audit-log.types.js";

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      index: true,
    },
    module: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: false,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    previousState: {
      type: Schema.Types.Mixed,
      required: false,
    },
    currentState: {
      type: Schema.Types.Mixed,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false, // Audit logs are immutable, update is not allowed
    },
  }
);

// Indexes
auditLogSchema.index({ createdAt: -1 });

// Composite indexes
auditLogSchema.index({ firmId: 1, createdAt: -1 });
auditLogSchema.index({ firmId: 1, module: 1 });
auditLogSchema.index({ firmId: 1, entityType: 1 });
auditLogSchema.index({ entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema, "audit_logs");
