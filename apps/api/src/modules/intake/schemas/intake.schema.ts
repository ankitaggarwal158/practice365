import mongoose, { Schema } from "mongoose";
import { IntakeDocument, IntakeNoteDocument, IntakeAttachmentDocument } from "../intake.types.js";
import { INTAKE_SOURCES, INTAKE_STATUSES, CONTACT_METHODS } from "../intake.constants.js";

// ─── Intake Schema ───────────────────────────────────────────

const intakeSchema = new Schema<IntakeDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Firm",
      index: true,
    },
    intakeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      enum: INTAKE_SOURCES,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: INTAKE_STATUSES,
      required: true,
      default: "NEW",
      index: true,
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
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    convertedLeadId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    rejectedReason: {
      type: String,
      trim: true,
      default: "",
    },
    opposingPartyNames: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "intakes",
  }
);

// Create compound index for listing/dashboard performance
intakeSchema.index({ firmId: 1, status: 1 });
intakeSchema.index({ firmId: 1, createdAt: -1 });

export const Intake = mongoose.model<IntakeDocument>("Intake", intakeSchema);

// ─── Intake Notes Schema ──────────────────────────────────────

const intakeNoteSchema = new Schema<IntakeNoteDocument>(
  {
    intakeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Intake",
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
    collection: "intake_notes",
  }
);

export const IntakeNote = mongoose.model<IntakeNoteDocument>("IntakeNote", intakeNoteSchema);

// ─── Intake Attachments Schema ───────────────────────────────

const intakeAttachmentSchema = new Schema<IntakeAttachmentDocument>(
  {
    intakeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Intake",
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
    collection: "intake_attachments",
  }
);

export const IntakeAttachment = mongoose.model<IntakeAttachmentDocument>(
  "IntakeAttachment",
  intakeAttachmentSchema
);
