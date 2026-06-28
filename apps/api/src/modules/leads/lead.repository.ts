import { Types } from "mongoose";
import { Lead, LeadNote, LeadActivity, LeadAttachment } from "./schemas/lead.schema.js";
import { LeadDocument, LeadNoteDocument, LeadActivityDocument, LeadAttachmentDocument } from "./lead.types.js";

export async function create(data: Partial<LeadDocument>): Promise<LeadDocument> {
  return Lead.create(data);
}

export async function findById(id: string, firmId: string): Promise<LeadDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Lead.findOne({ _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) });
}

export async function findByIdWithDetails(id: string, firmId: string): Promise<LeadDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Lead.findOne({ _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) })
    .populate("ownerId", "firstName lastName email")
    .populate("createdBy", "firstName lastName email");
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<LeadDocument>
): Promise<LeadDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Lead.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export interface ListLeadsFilters {
  status?: string;
  source?: string;
  ownerId?: string;
  practiceArea?: string;
  q?: string;
}

export async function list(
  firmId: string,
  filters: ListLeadsFilters,
  options: { page: number; limit: number }
): Promise<{ data: LeadDocument[]; total: number; pages: number }> {
  const query: any = { firmId: new Types.ObjectId(firmId) };

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.source) {
    query.source = filters.source;
  }
  if (filters.ownerId) {
    if (Types.ObjectId.isValid(filters.ownerId)) {
      query.ownerId = new Types.ObjectId(filters.ownerId);
    }
  }
  if (filters.practiceArea) {
    query.practiceArea = { $regex: new RegExp(filters.practiceArea, "i") };
  }

  if (filters.q && filters.q.trim()) {
    const qRegex = new RegExp(filters.q.trim(), "i");
    query.$or = [
      { firstName: qRegex },
      { lastName: qRegex },
      { email: qRegex },
      { subject: qRegex },
      { companyName: qRegex },
      { leadNumber: qRegex },
    ];
  }

  const page = Math.max(1, options.page);
  const limit = Math.max(1, options.limit);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "firstName lastName email")
      .exec(),
    Lead.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    data,
    total,
    pages,
  };
}

// ─── Notes Operations ────────────────────────────────────────

export async function addNote(
  leadId: string,
  userId: string,
  noteText: string
): Promise<LeadNoteDocument> {
  return LeadNote.create({
    leadId: new Types.ObjectId(leadId),
    userId: new Types.ObjectId(userId),
    note: noteText,
  });
}

export async function findNotesByLeadId(leadId: string): Promise<LeadNoteDocument[]> {
  if (!Types.ObjectId.isValid(leadId)) return [];
  return LeadNote.find({ leadId: new Types.ObjectId(leadId) })
    .populate("userId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .exec();
}

// ─── Activities Operations ────────────────────────────────────

export async function findActivitiesByLeadId(leadId: string): Promise<LeadActivityDocument[]> {
  if (!Types.ObjectId.isValid(leadId)) return [];
  return LeadActivity.find({ leadId: new Types.ObjectId(leadId) })
    .populate("userId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .exec();
}

// ─── Attachments Operations ──────────────────────────────────

export async function addAttachment(
  leadId: string,
  documentId: string,
  uploadedBy: string
): Promise<LeadAttachmentDocument> {
  return LeadAttachment.create({
    leadId: new Types.ObjectId(leadId),
    documentId: new Types.ObjectId(documentId),
    uploadedBy: new Types.ObjectId(uploadedBy),
  });
}

export async function findAttachmentsByLeadId(leadId: string): Promise<LeadAttachmentDocument[]> {
  if (!Types.ObjectId.isValid(leadId)) return [];
  return LeadAttachment.find({ leadId: new Types.ObjectId(leadId) })
    .populate("uploadedBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .exec();
}
