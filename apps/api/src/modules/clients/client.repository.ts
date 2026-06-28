import { Types } from "mongoose";
import { Client, ClientNote, ClientAttachment } from "./schemas/client.schema.js";
import { ClientDocument, ClientNoteDocument, ClientAttachmentDocument } from "./client.types.js";

export async function create(data: Partial<ClientDocument>): Promise<ClientDocument> {
  return Client.create(data);
}

export async function findById(
  id: string,
  firmId: string
): Promise<ClientDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Client.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  });
}

export async function findByIdWithDetails(
  id: string,
  firmId: string
): Promise<ClientDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Client.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  }).populate("leadId", "leadNumber");
}

export async function findByClientNumber(
  clientNumber: string,
  firmId: string
): Promise<ClientDocument | null> {
  if (!Types.ObjectId.isValid(firmId)) return null;
  return Client.findOne({
    clientNumber,
    firmId: new Types.ObjectId(firmId),
  });
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<ClientDocument>
): Promise<ClientDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return Client.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function list(
  firmId: string,
  filters: {
    page: number;
    limit: number;
    query?: string;
    status?: string;
    clientType?: string;
  }
): Promise<{ data: ClientDocument[]; total: number; pages: number }> {
  if (!Types.ObjectId.isValid(firmId)) {
    return { data: [], total: 0, pages: 1 };
  }

  const match: any = { firmId: new Types.ObjectId(firmId) };

  // Status Filter
  if (filters.status) {
    match.status = filters.status;
  }

  // Client Type Filter
  if (filters.clientType) {
    match.clientType = filters.clientType;
  }

  // Text Search Query
  if (filters.query) {
    const regex = new RegExp(filters.query, "i");
    match.$or = [
      { firstName: regex },
      { lastName: regex },
      { companyName: regex },
      { clientNumber: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  const page = Math.max(1, filters.page);
  const limit = Math.max(1, filters.limit);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Client.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Client.countDocuments(match),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    data,
    total,
    pages,
  };
}

// ─── Child Notes Helpers ─────────────────────────────────────

export async function addNote(
  clientId: string,
  authorId: string,
  content: string
): Promise<ClientNoteDocument> {
  return ClientNote.create({
    clientId: new Types.ObjectId(clientId),
    authorId: new Types.ObjectId(authorId),
    content,
  });
}

export async function findNotesForClient(clientId: string): Promise<ClientNoteDocument[]> {
  if (!Types.ObjectId.isValid(clientId)) return [];
  return ClientNote.find({ clientId: new Types.ObjectId(clientId) })
    .sort({ createdAt: -1 })
    .populate("authorId", "firstName lastName email")
    .exec();
}

export async function findNoteById(id: string): Promise<ClientNoteDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return ClientNote.findById(id);
}

export async function updateNote(id: string, content: string): Promise<ClientNoteDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return ClientNote.findByIdAndUpdate(id, { $set: { content } }, { new: true });
}

export async function deleteNote(id: string): Promise<any> {
  if (!Types.ObjectId.isValid(id)) return null;
  return ClientNote.findByIdAndDelete(id);
}

// ─── Child Attachments Helpers ───────────────────────────────

export async function addAttachment(
  clientId: string,
  data: Partial<ClientAttachmentDocument>
): Promise<ClientAttachmentDocument> {
  return ClientAttachment.create({
    ...data,
    clientId: new Types.ObjectId(clientId),
  });
}

export async function findAttachmentsForClient(clientId: string): Promise<ClientAttachmentDocument[]> {
  if (!Types.ObjectId.isValid(clientId)) return [];
  return ClientAttachment.find({ clientId: new Types.ObjectId(clientId) })
    .sort({ uploadedAt: -1 })
    .populate("uploadedBy", "firstName lastName email")
    .exec();
}

export async function deleteAttachment(id: string): Promise<any> {
  if (!Types.ObjectId.isValid(id)) return null;
  return ClientAttachment.findByIdAndDelete(id);
}
