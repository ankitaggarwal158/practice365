import mongoose, { Schema } from "mongoose";
import { ConflictCheckDocument } from "../conflict-check.types.js";

const matchRecordSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["LEAD", "CLIENT", "MATTER", "OPPOSING_PARTY"],
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    entityName: {
      type: String,
      required: true,
    },
    matchedField: {
      type: String,
      required: true,
    },
    matchedValue: {
      type: String,
      required: true,
    },
    similarityScore: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const conflictCheckSchema = new Schema<ConflictCheckDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Firm",
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    matterId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    overallResult: {
      type: String,
      enum: ["NO_CONFLICT", "POSSIBLE_CONFLICT", "CONFIRMED_CONFLICT"],
      required: true,
      index: true,
    },
    finalDecision: {
      type: String,
      enum: ["PENDING", "CLEARED", "WAIVED", "REJECTED"],
      required: true,
      default: "PENDING",
      index: true,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: "",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    matches: {
      type: [matchRecordSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "conflict_checks",
  }
);

conflictCheckSchema.index({ firmId: 1, createdAt: -1 });

export const ConflictCheck = mongoose.model<ConflictCheckDocument>(
  "ConflictCheck",
  conflictCheckSchema
);
