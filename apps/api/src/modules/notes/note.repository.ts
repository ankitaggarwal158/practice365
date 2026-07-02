import { Types } from "mongoose";
import { Note } from "./schemas/note.schema.js";
import { NoteDocument } from "./note.types.js";

export interface ListFilter {
  entityType?: string;
  entityId?: string;
  authorId?: string;
  isPinned?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDocs<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export async function findAll(
  firmId: string,
  filter: ListFilter
): Promise<PaginatedDocs<NoteDocument>> {
  const page = filter.page || 1;
  const limit = filter.limit || 25;
  const skip = (page - 1) * limit;

  const query: any = {
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  };

  if (filter.entityType) {
    query.entityType = filter.entityType;
  }

  if (filter.entityId && Types.ObjectId.isValid(filter.entityId)) {
    query.entityId = new Types.ObjectId(filter.entityId);
  }

  if (filter.authorId && Types.ObjectId.isValid(filter.authorId)) {
    query.authorId = new Types.ObjectId(filter.authorId);
  }

  if (typeof filter.isPinned === "boolean") {
    query.isPinned = filter.isPinned;
  }

  if (filter.search?.trim()) {
    const searchRegex = new RegExp(filter.search.trim(), "i");
    query.$or = [{ title: searchRegex }, { content: searchRegex }];
  }

  const [docs, totalDocs] = await Promise.all([
    Note.find(query)
      .populate("authorId", "firstName lastName displayName")
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Note.countDocuments(query),
  ]);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}

export async function findById(id: string, firmId: string): Promise<NoteDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return Note.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  })
    .populate("authorId", "firstName lastName displayName")
    .exec();
}

export async function create(payload: Partial<NoteDocument>): Promise<NoteDocument> {
  const created = await Note.create(payload);
  return created.populate("authorId", "firstName lastName displayName");
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<NoteDocument>
): Promise<NoteDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return Note.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    { $set: data },
    { new: true }
  )
    .populate("authorId", "firstName lastName displayName")
    .exec();
}

export async function pin(
  id: string,
  firmId: string,
  isPinned: boolean
): Promise<NoteDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return Note.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    { $set: { isPinned } },
    { new: true }
  )
    .populate("authorId", "firstName lastName displayName")
    .exec();
}

export async function softDelete(
  id: string,
  firmId: string,
  deletedBy: string
): Promise<NoteDocument | null> {
  if (
    !Types.ObjectId.isValid(id) ||
    !Types.ObjectId.isValid(firmId) ||
    !Types.ObjectId.isValid(deletedBy)
  ) {
    return null;
  }
  return Note.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    {
      $set: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: new Types.ObjectId(deletedBy),
      },
    },
    { new: true }
  )
    .populate("authorId", "firstName lastName displayName")
    .exec();
}
