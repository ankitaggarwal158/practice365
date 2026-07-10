import { Types, FilterQuery } from "mongoose";
import { TimeEntryModel } from "./schemas/time-entry.schema.js";
import { TimeEntry } from "./types/time-entry.types.js";

export class TimeEntryRepository {
  async create(data: Partial<TimeEntry>): Promise<TimeEntry> {
    const entry = new TimeEntryModel(data);
    return entry.save();
  }

  async findById(id: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<TimeEntry | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
    return TimeEntryModel.findOne({ _id: id, firmId, deleted: false })
      .populate("userId", "firstName lastName email")
      .populate("matterId", "title")
      .populate("clientId", "firstName lastName name")
      .exec();
  }

  async update(id: string | Types.ObjectId, firmId: string | Types.ObjectId, data: Partial<TimeEntry>): Promise<TimeEntry | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
    return TimeEntryModel.findOneAndUpdate(
      { _id: id, firmId, deleted: false },
      { $set: data },
      { new: true }
    ).exec();
  }

  async softDelete(id: string | Types.ObjectId, firmId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return false;
    const result = await TimeEntryModel.updateOne(
      { _id: id, firmId, deleted: false },
      { $set: { deleted: true, deletedAt: new Date(), deletedBy: new Types.ObjectId(userId) } }
    ).exec();
    return result.modifiedCount > 0;
  }

  async findActiveTimerForUser(userId: string | Types.ObjectId, firmId: string | Types.ObjectId): Promise<TimeEntry | null> {
    return TimeEntryModel.findOne({
      userId,
      firmId,
      timerStatus: { $in: ["RUNNING", "PAUSED"] },
      deleted: false,
    }).exec();
  }

  async search(filters: {
    firmId: string | Types.ObjectId;
    matterId?: string;
    clientId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    billingType?: string;
    status?: string;
    isBilled?: string | boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: TimeEntry[]; total: number }> {
    const query: FilterQuery<TimeEntry> = {
      firmId: new Types.ObjectId(filters.firmId),
      deleted: false,
    };

    if (filters.matterId) query.matterId = new Types.ObjectId(filters.matterId);
    if (filters.clientId) query.clientId = new Types.ObjectId(filters.clientId);
    if (filters.userId) query.userId = new Types.ObjectId(filters.userId);
    if (filters.billingType) query.billingType = filters.billingType;
    if (filters.isBilled !== undefined) {
      query.isBilled = filters.isBilled === "true" || filters.isBilled === true;
    }
    if (filters.status) {
      if (filters.status === "ACTIVE") {
        query.timerStatus = { $in: ["RUNNING", "PAUSED"] };
      } else {
        query.timerStatus = filters.status;
      }
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      TimeEntryModel.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName email")
        .populate("matterId", "title")
        .populate("clientId", "firstName lastName name")
        .exec(),
      TimeEntryModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }
}

export const timeEntryRepository = new TimeEntryRepository();
