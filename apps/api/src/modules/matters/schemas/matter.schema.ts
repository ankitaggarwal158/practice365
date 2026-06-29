import mongoose, { Schema } from "mongoose";
import {
  MatterDocument,
  MatterTeamMemberDocument,
  MatterNoteDocument,
  MatterAttachmentDocument,
  PracticeAreaDocument,
  DocumentDocument,
} from "../matter.types.js";

// Practice Area Schema
const practiceAreaSchema = new Schema<PracticeAreaDocument>(
  {
    firmId: { type: Schema.Types.ObjectId, required: true, ref: "Firm", index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: "practice_areas" }
);
practiceAreaSchema.index({ firmId: 1, name: 1 }, { unique: true });

// Shared Document Metadata Schema
const documentSchema = new Schema<DocumentDocument>(
  {
    firmId: { type: Schema.Types.ObjectId, required: true, ref: "Firm", index: true },
    fileName: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true, collection: "documents" }
);

// Matter Parent Schema
const matterSchema = new Schema<MatterDocument>(
  {
    firmId: { type: Schema.Types.ObjectId, required: true, ref: "Firm", index: true },
    clientId: { type: Schema.Types.ObjectId, required: true, ref: "Client", index: true },
    matterNumber: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    practiceAreaId: { type: Schema.Types.ObjectId, required: true, ref: "PracticeArea", index: true },
    matterType: {
      type: String,
      enum: ["LITIGATION", "TRANSACTIONAL", "CONSULTATION", "ADVISORY", "REGULATORY", "OTHER"],
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "ON_HOLD", "CLOSED", "ARCHIVED"],
      required: true,
      default: "OPEN",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      required: true,
      default: "NORMAL",
      index: true,
    },
    responsibleAttorneyId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    openedDate: { type: Date, required: true, default: Date.now, index: true },
    closedDate: { type: Date },
    archivedAt: { type: Date },
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
    conflictCheckId: { type: Schema.Types.ObjectId, ref: "ConflictCheck" },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    clientReference: { type: String, trim: true, default: "" },
    courtFileNumber: { type: String, trim: true, default: "" },
    statuteOfLimitations: { type: Date },
    estimatedValue: { type: Schema.Types.Decimal128 },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
    collection: "matters",
  }
);
matterSchema.index({ firmId: 1, matterNumber: 1 }, { unique: true });
matterSchema.index({ firmId: 1, createdAt: -1 });

// Matter Team Member Schema
const matterTeamMemberSchema = new Schema<MatterTeamMemberDocument>(
  {
    matterId: { type: Schema.Types.ObjectId, required: true, ref: "Matter", index: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    role: { type: String, required: true, trim: true },
    assignedBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    assignedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "matter_team_members",
  }
);
matterTeamMemberSchema.index({ matterId: 1, userId: 1 }, { unique: true });

// Matter Note Schema
const matterNoteSchema = new Schema<MatterNoteDocument>(
  {
    matterId: { type: Schema.Types.ObjectId, required: true, ref: "Matter", index: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    note: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    collection: "matter_notes",
  }
);

// Matter Attachment Schema
const matterAttachmentSchema = new Schema<MatterAttachmentDocument>(
  {
    matterId: { type: Schema.Types.ObjectId, required: true, ref: "Matter", index: true },
    documentId: { type: Schema.Types.ObjectId, required: true, ref: "Document" },
    uploadedBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    collection: "matter_attachments",
  }
);

export const PracticeArea = mongoose.model<PracticeAreaDocument>("PracticeArea", practiceAreaSchema);
export const Document = mongoose.model<DocumentDocument>("Document", documentSchema);
export const Matter = mongoose.model<MatterDocument>("Matter", matterSchema);
export const MatterTeamMember = mongoose.model<MatterTeamMemberDocument>("MatterTeamMember", matterTeamMemberSchema);
export const MatterNote = mongoose.model<MatterNoteDocument>("MatterNote", matterNoteSchema);
export const MatterAttachment = mongoose.model<MatterAttachmentDocument>("MatterAttachment", matterAttachmentSchema);
