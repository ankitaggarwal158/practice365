import { Types, FilterQuery } from "mongoose";
import { DocumentMeta } from "./schemas/document.schema.js";
import { DocumentMeta as IDocumentMeta } from "./document.types.js";

export interface DocumentSearchFilters {
  matterId?: string;
  clientId?: string;
  folderId?: string | null;
  category?: string;
  search?: string;
}

export class DocumentRepository {
  async create(data: Partial<IDocumentMeta>): Promise<IDocumentMeta> {
    const doc = new DocumentMeta(data);
    await doc.save();
    return doc.toObject();
  }

  async findById(id: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<IDocumentMeta | null> {
    return DocumentMeta.findOne({ _id: id, firmId, deleted: false })
      .populate("currentVersionId")
      .populate("createdBy", "firstName lastName displayName")
      .lean();
  }

  async update(
    id: string | Types.ObjectId,
    firmId: string | Types.ObjectId,
    data: Partial<IDocumentMeta>
  ): Promise<IDocumentMeta | null> {
    return DocumentMeta.findOneAndUpdate({ _id: id, firmId, deleted: false }, { $set: data }, { new: true }).lean();
  }

  async softDelete(id: string | Types.ObjectId, firmId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<boolean> {
    const result = await DocumentMeta.updateOne(
      { _id: id, firmId, deleted: false },
      { $set: { deleted: true, deletedAt: new Date(), deletedBy: userId } }
    );
    return result.modifiedCount > 0;
  }

  async search(firmId: string | Types.ObjectId, filters: DocumentSearchFilters, skip = 0, limit = 50): Promise<{ data: IDocumentMeta[]; total: number }> {
    const query: FilterQuery<any> = { firmId, deleted: false };

    if (filters.matterId) query.matterId = new Types.ObjectId(filters.matterId);
    if (filters.clientId) query.clientId = new Types.ObjectId(filters.clientId);
    if (filters.folderId !== undefined) {
      if (filters.folderId === null) {
        query.folderId = null;
      } else {
        query.folderId = new Types.ObjectId(filters.folderId);
      }
    }
    if (filters.category) query.category = filters.category;
    
    if (filters.search) {
      const regex = new RegExp(filters.search, "i");
      query.$or = [
        { documentName: regex },
        { originalFileName: regex },
        { description: regex },
        { tags: { $in: [regex] } },
      ];
    }

    const [data, total] = await Promise.all([
      DocumentMeta.find(query)
        .populate("currentVersionId")
        .populate("createdBy", "firstName lastName displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DocumentMeta.countDocuments(query),
    ]);

    return { data, total };
  }

  async countInFolder(folderId: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<number> {
    return DocumentMeta.countDocuments({ folderId, firmId, deleted: false });
  }
}

export const documentRepository = new DocumentRepository();
