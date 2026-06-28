import mongoose, { Schema } from "mongoose";
import { LeadDocument, LeadNoteDocument, LeadActivityDocument, LeadAttachmentDocument } from "../lead.types.js";
import { LEAD_STATUSES, LEAD_SOURCES } from "../lead.constants.js";
import { CONTACT_METHODS } from "../../intake/intake.constants.js";

// ─── Lead Schema ─────────────────────────────────────────────

const leadSchema = new Schema<LeadDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Firm",
      index: true,
    },
    leadNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    intakeId: {
      type: Schema.Types.ObjectId,
      ref: "Intake",
      default: null,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      required: true,
      default: "NEW",
      index: true,
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      required: true,
      default: "MANUAL",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    preferredContactMethod: {
      type: String,
      enum: CONTACT_METHODS,
      default: "EMAIL",
    },
    practiceArea: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    consultationDate: {
      type: Date,
      default: null,
    },
    engagementSentAt: {
      type: Date,
      default: null,
    },
    convertedClientId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    lostReason: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "leads",
  }
);

// Compound indexes for optimization
leadSchema.index({ firmId: 1, status: 1 });
leadSchema.index({ firmId: 1, createdAt: -1 });

export const Lead = mongoose.model<LeadDocument>("Lead", leadSchema);

// ─── Lead Notes Schema ────────────────────────────────────────

const leadNoteSchema = new Schema<LeadNoteDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Lead",
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "lead_notes",
  }
);

export const LeadNote = mongoose.model<LeadNoteDocument>("LeadNote", leadNoteSchema);

// ─── Lead Activities Schema ───────────────────────────────────

const leadActivitySchema = new Schema<LeadActivityDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Lead",
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    activityType: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We log createdAt manually as immutable action logs
    collection: "lead_activities",
  }
);

export const LeadActivity = mongoose.model<LeadActivityDocument>("LeadActivity", leadActivitySchema);

// ─── Lead Attachments Schema ──────────────────────────────────

const leadAttachmentSchema = new Schema<LeadAttachmentDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Lead",
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "lead_attachments",
  }
);

export const LeadAttachment = mongoose.model<LeadAttachmentDocument>(
  "LeadAttachment",
  leadAttachmentSchema
);
