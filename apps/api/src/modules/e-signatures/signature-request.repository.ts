import { Types, FilterQuery } from "mongoose";
import { SignatureRequest } from "./schemas/signature-request.schema.js";
import { SignatureRequestDocument } from "./signature-request.types.js";

export interface SignatureRequestFilters {
  matterId?: string;
  documentId?: string;
  status?: string;
  search?: string;
}

export class SignatureRequestRepository {
  async create(data: Partial<SignatureRequestDocument>): Promise<SignatureRequestDocument> {
    const request = new SignatureRequest(data);
    await request.save();
    return request;
  }

  async findById(id: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<SignatureRequestDocument | null> {
    return SignatureRequest.findOne({ _id: id, firmId, deleted: false });
  }

  async findByIdRaw(id: string | Types.ObjectId): Promise<SignatureRequestDocument | null> {
    return SignatureRequest.findOne({ _id: id, deleted: false });
  }

  async update(
    id: string | Types.ObjectId,
    firmId: string | Types.ObjectId,
    data: Partial<SignatureRequestDocument>
  ): Promise<SignatureRequestDocument | null> {
    return SignatureRequest.findOneAndUpdate(
      { _id: id, firmId, deleted: false },
      { $set: data },
      { new: true }
    );
  }

  async softDelete(
    id: string | Types.ObjectId,
    firmId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    const result = await SignatureRequest.updateOne(
      { _id: id, firmId, deleted: false },
      { $set: { deleted: true, deletedAt: new Date(), deletedBy: new Types.ObjectId(userId) } }
    );
    return result.modifiedCount > 0;
  }

  async list(
    firmId: string | Types.ObjectId,
    filters: SignatureRequestFilters,
    skip = 0,
    limit = 50
  ): Promise<{ data: SignatureRequestDocument[]; total: number }> {
    const query: FilterQuery<any> = { firmId, deleted: false };

    if (filters.matterId) query.matterId = new Types.ObjectId(filters.matterId);
    if (filters.documentId) query.documentId = new Types.ObjectId(filters.documentId);
    if (filters.status) query.status = filters.status;

    if (filters.search) {
      query.requestTitle = new RegExp(filters.search, "i");
    }

    const [data, total] = await Promise.all([
      SignatureRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SignatureRequest.countDocuments(query),
    ]);

    return { data, total };
  }
}

export const signatureRequestRepository = new SignatureRequestRepository();
export default signatureRequestRepository;
