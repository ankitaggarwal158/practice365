import { Types } from "mongoose";
import {
  Matter,
  MatterTeamMember,
  MatterNote,
  MatterAttachment,
  Document,
} from "./schemas/matter.schema.js";
import {
  MatterDocument,
  MatterTeamMemberDocument,
  MatterNoteDocument,
  MatterAttachmentDocument,
  DocumentDocument,
} from "./matter.types.js";
import { PracticeArea } from "../practice-areas/index.js";
import { PracticeAreaDocument } from "../practice-areas/practice-area.types.js";

// ─── Matter Operations ──────────────────────────────────────────

export async function create(data: Partial<MatterDocument>): Promise<MatterDocument> {
  return Matter.create(data);
}

export async function findById(
  id: string,
  firmId: string
): Promise<MatterDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Matter.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  });
}

export async function findByIdWithDetails(
  id: string,
  firmId: string
): Promise<MatterDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Matter.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  })
    .populate("clientId", "firstName lastName companyName clientType clientNumber")
    .populate("responsibleAttorneyId", "firstName lastName email")
    .populate("practiceAreaId", "name")
    .populate("createdBy", "firstName lastName email")
    .populate("conflictCheckId", "checkNumber finalDecision")
    .populate("leadId", "leadNumber");
}

export async function findByMatterNumber(
  matterNumber: string,
  firmId: string
): Promise<MatterDocument | null> {
  if (!Types.ObjectId.isValid(firmId)) return null;
  return Matter.findOne({
    matterNumber,
    firmId: new Types.ObjectId(firmId),
  });
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<MatterDocument>
): Promise<MatterDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Matter.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function updateStatus(
  id: string,
  firmId: string,
  status: string,
  unsetFields?: Record<string, any>
): Promise<MatterDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  const updateObj: any = { $set: { status } };
  if (unsetFields) {
    updateObj.$unset = unsetFields;
  }
  return Matter.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) },
    updateObj,
    { new: true }
  );
}

export async function list(
  firmId: string,
  filters: {
    page: number;
    limit: number;
    query?: string;
    status?: string;
    priority?: string;
    practiceAreaId?: string;
    clientId?: string;
    responsibleAttorneyId?: string;
  }
): Promise<{ data: MatterDocument[]; total: number; pages: number }> {
  if (!Types.ObjectId.isValid(firmId)) {
    return { data: [], total: 0, pages: 1 };
  }

  const match: any = { firmId: new Types.ObjectId(firmId) };

  if (filters.status) match.status = filters.status;
  if (filters.priority) match.priority = filters.priority;
  if (filters.practiceAreaId && Types.ObjectId.isValid(filters.practiceAreaId)) {
    match.practiceAreaId = new Types.ObjectId(filters.practiceAreaId);
  }
  if (filters.clientId && Types.ObjectId.isValid(filters.clientId)) {
    match.clientId = new Types.ObjectId(filters.clientId);
  }
  if (filters.responsibleAttorneyId && Types.ObjectId.isValid(filters.responsibleAttorneyId)) {
    match.responsibleAttorneyId = new Types.ObjectId(filters.responsibleAttorneyId);
  }

  if (filters.query) {
    const regex = new RegExp(filters.query, "i");
    match.$or = [
      { title: regex },
      { matterNumber: regex },
      { description: regex },
      { clientReference: regex },
      { courtFileNumber: regex },
    ];
  }

  const page = Math.max(1, filters.page);
  const limit = Math.max(1, filters.limit);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Matter.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("clientId", "firstName lastName companyName clientType clientNumber")
      .populate("responsibleAttorneyId", "firstName lastName email")
      .populate("practiceAreaId", "name")
      .exec(),
    Matter.countDocuments(match),
  ]);

  return {
    data,
    total,
    pages: Math.ceil(total / limit),
  };
}

// ─── Team Members Operations ───────────────────────────────────

export async function addTeamMember(
  matterId: string,
  userId: string,
  role: string,
  assignedBy: string
): Promise<MatterTeamMemberDocument> {
  return MatterTeamMember.create({
    matterId: new Types.ObjectId(matterId),
    userId: new Types.ObjectId(userId),
    role,
    assignedBy: new Types.ObjectId(assignedBy),
  });
}

export async function findTeamMembersForMatter(
  matterId: string
): Promise<MatterTeamMemberDocument[]> {
  if (!Types.ObjectId.isValid(matterId)) return [];
  return MatterTeamMember.find({ matterId: new Types.ObjectId(matterId) })
    .sort({ createdAt: 1 })
    .populate("userId", "firstName lastName email")
    .populate("assignedBy", "firstName lastName email")
    .exec();
}

export async function findTeamMember(
  matterId: string,
  userId: string
): Promise<MatterTeamMemberDocument | null> {
  if (!Types.ObjectId.isValid(matterId) || !Types.ObjectId.isValid(userId)) return null;
  return MatterTeamMember.findOne({
    matterId: new Types.ObjectId(matterId),
    userId: new Types.ObjectId(userId),
  });
}

export async function updateTeamMemberRole(
  matterId: string,
  userId: string,
  role: string
): Promise<MatterTeamMemberDocument | null> {
  if (!Types.ObjectId.isValid(matterId) || !Types.ObjectId.isValid(userId)) return null;
  return MatterTeamMember.findOneAndUpdate(
    { matterId: new Types.ObjectId(matterId), userId: new Types.ObjectId(userId) },
    { $set: { role } },
    { new: true }
  );
}

export async function removeTeamMember(
  matterId: string,
  userId: string
): Promise<any> {
  if (!Types.ObjectId.isValid(matterId) || !Types.ObjectId.isValid(userId)) return null;
  return MatterTeamMember.deleteOne({
    matterId: new Types.ObjectId(matterId),
    userId: new Types.ObjectId(userId),
  });
}

// ─── Notes Operations ──────────────────────────────────────────

export async function addNote(
  matterId: string,
  userId: string,
  note: string
): Promise<MatterNoteDocument> {
  return MatterNote.create({
    matterId: new Types.ObjectId(matterId),
    userId: new Types.ObjectId(userId),
    note,
  });
}

export async function findNotesForMatter(
  matterId: string
): Promise<MatterNoteDocument[]> {
  if (!Types.ObjectId.isValid(matterId)) return [];
  return MatterNote.find({ matterId: new Types.ObjectId(matterId) })
    .sort({ createdAt: -1 })
    .populate("userId", "firstName lastName email")
    .exec();
}

export async function findNoteById(
  noteId: string
): Promise<MatterNoteDocument | null> {
  if (!Types.ObjectId.isValid(noteId)) return null;
  return MatterNote.findById(noteId);
}

export async function updateNote(
  noteId: string,
  note: string
): Promise<MatterNoteDocument | null> {
  if (!Types.ObjectId.isValid(noteId)) return null;
  return MatterNote.findByIdAndUpdate(
    noteId,
    { $set: { note } },
    { new: true }
  );
}

export async function deleteNote(
  noteId: string
): Promise<any> {
  if (!Types.ObjectId.isValid(noteId)) return null;
  return MatterNote.findByIdAndDelete(noteId);
}

// ─── Attachments & Documents Operations ────────────────────────

export async function createDocument(
  firmId: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  key: string,
  uploadedBy: string
): Promise<DocumentDocument> {
  return Document.create({
    firmId: new Types.ObjectId(firmId),
    fileName,
    fileSize,
    mimeType,
    key,
    uploadedBy: new Types.ObjectId(uploadedBy),
  });
}

export async function addAttachment(
  matterId: string,
  documentId: string,
  uploadedBy: string
): Promise<MatterAttachmentDocument> {
  return MatterAttachment.create({
    matterId: new Types.ObjectId(matterId),
    documentId: new Types.ObjectId(documentId),
    uploadedBy: new Types.ObjectId(uploadedBy),
  });
}

export async function findAttachmentsForMatter(
  matterId: string
): Promise<MatterAttachmentDocument[]> {
  if (!Types.ObjectId.isValid(matterId)) return [];
  return MatterAttachment.find({ matterId: new Types.ObjectId(matterId) })
    .sort({ createdAt: -1 })
    .populate({
      path: "documentId",
      model: "Document",
    })
    .populate("uploadedBy", "firstName lastName email")
    .exec();
}

export async function findAttachmentById(
  id: string
): Promise<MatterAttachmentDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return MatterAttachment.findById(id);
}

export async function deleteAttachment(
  attachmentId: string
): Promise<any> {
  if (!Types.ObjectId.isValid(attachmentId)) return null;
  return MatterAttachment.findByIdAndDelete(attachmentId);
}


