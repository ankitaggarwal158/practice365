import { Types, FilterQuery } from "mongoose";
import { FixedChargeModel } from "./schemas/fixed-charge.schema.js";
import { FixedChargeDocument } from "./fixed-charge.types.js";

export const fixedChargeRepository = {
  async create(data: Partial<FixedChargeDocument>): Promise<FixedChargeDocument> {
    const record = new FixedChargeModel(data);
    await record.save();
    return record;
  },

  async findById(id: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<FixedChargeDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
    return FixedChargeModel.findOne({ _id: id, firmId, deleted: false });
  },

  async update(
    id: string | Types.ObjectId,
    firmId: string | Types.ObjectId,
    data: Partial<FixedChargeDocument>
  ): Promise<FixedChargeDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
    return FixedChargeModel.findOneAndUpdate(
      { _id: id, firmId, deleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async softDelete(
    id: string | Types.ObjectId,
    firmId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return false;
    const result = await FixedChargeModel.updateOne(
      { _id: id, firmId, deleted: false },
      { $set: { deleted: true, deletedAt: new Date(), deletedBy: new Types.ObjectId(userId) } }
    );
    return result.modifiedCount > 0;
  },

  async search(
    firmId: string | Types.ObjectId,
    filters: {
      matterId?: string;
      clientId?: string;
      isBilled?: boolean;
      billingType?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: FixedChargeDocument[]; total: number; pages: number }> {
    const query: FilterQuery<any> = { firmId, deleted: false };

    if (filters.matterId && Types.ObjectId.isValid(filters.matterId)) {
      query.matterId = new Types.ObjectId(filters.matterId);
    }
    if (filters.clientId && Types.ObjectId.isValid(filters.clientId)) {
      query.clientId = new Types.ObjectId(filters.clientId);
    }
    if (filters.isBilled !== undefined) {
      query.isBilled = filters.isBilled;
    }
    if (filters.billingType) {
      query.billingType = filters.billingType;
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 50);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      FixedChargeModel.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      FixedChargeModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      pages: Math.ceil(total / limit),
    };
  },

  async lockMany(ids: string[] | Types.ObjectId[], invoiceId: string | Types.ObjectId): Promise<void> {
    const oIds = ids.map(id => new Types.ObjectId(id));
    await FixedChargeModel.updateMany(
      { _id: { $in: oIds } },
      { $set: { isBilled: true, invoiceId: new Types.ObjectId(invoiceId) } }
    );
  },

  async unlockMany(ids: string[] | Types.ObjectId[]): Promise<void> {
    const oIds = ids.map(id => new Types.ObjectId(id));
    await FixedChargeModel.updateMany(
      { _id: { $in: oIds } },
      { $set: { isBilled: false, invoiceId: null } }
    );
  }
};
