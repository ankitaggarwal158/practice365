import { Types } from "mongoose";
import { Intake, IntakeNote, IntakeAttachment } from "./schemas/intake.schema.js";
import { IntakeDocument, IntakeNoteDocument, IntakeAttachmentDocument } from "./intake.types.js";

export async function create(data: Partial<IntakeDocument>): Promise<IntakeDocument> {
  return Intake.create(data);
}

export async function findById(id: string, firmId: string): Promise<IntakeDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Intake.findOne({ _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) });
}

export async function findByIdWithDetails(id: string, firmId: string): Promise<IntakeDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Intake.findOne({ _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) })
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email");
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<IntakeDocument>
): Promise<IntakeDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  
  return Intake.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export interface ListFilters {
  status?: string;
  source?: string;
  assignedTo?: string;
  q?: string;
}

export async function list(
  firmId: string,
  filters: ListFilters,
  options: { page: number; limit: number }
): Promise<{ data: IntakeDocument[]; total: number; pages: number }> {
  const query: any = { firmId: new Types.ObjectId(firmId) };

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.source) {
    query.source = filters.source;
  }
  if (filters.assignedTo) {
    if (filters.assignedTo === "unassigned" || filters.assignedTo === "null") {
      query.assignedTo = null;
    } else if (Types.ObjectId.isValid(filters.assignedTo)) {
      query.assignedTo = new Types.ObjectId(filters.assignedTo);
    }
  }

  if (filters.q && filters.q.trim()) {
    const qRegex = new RegExp(filters.q.trim(), "i");
    query.$or = [
      { firstName: qRegex },
      { lastName: qRegex },
      { email: qRegex },
      { subject: qRegex },
      { companyName: qRegex },
      { intakeNumber: qRegex },
    ];
  }

  const page = Math.max(1, options.page);
  const limit = Math.max(1, options.limit);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Intake.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "firstName lastName email")
      .exec(),
    Intake.countDocuments(query),
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
  intakeId: string,
  userId: string,
  noteText: string
): Promise<IntakeNoteDocument> {
  return IntakeNote.create({
    intakeId: new Types.ObjectId(intakeId),
    userId: new Types.ObjectId(userId),
    note: noteText,
  });
}

export async function findNotesByIntakeId(intakeId: string): Promise<IntakeNoteDocument[]> {
  if (!Types.ObjectId.isValid(intakeId)) return [];
  return IntakeNote.find({ intakeId: new Types.ObjectId(intakeId) })
    .populate("userId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .exec();
}

// ─── Attachments Operations ──────────────────────────────────

export async function addAttachment(
  intakeId: string,
  documentId: string,
  uploadedBy: string
): Promise<IntakeAttachmentDocument> {
  return IntakeAttachment.create({
    intakeId: new Types.ObjectId(intakeId),
    documentId: new Types.ObjectId(documentId),
    uploadedBy: new Types.ObjectId(uploadedBy),
  });
}

export async function findAttachmentsByIntakeId(intakeId: string): Promise<IntakeAttachmentDocument[]> {
  if (!Types.ObjectId.isValid(intakeId)) return [];
  return IntakeAttachment.find({ intakeId: new Types.ObjectId(intakeId) })
    .populate("uploadedBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .exec();
}
