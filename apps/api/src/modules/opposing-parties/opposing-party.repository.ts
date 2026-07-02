import { Types } from "mongoose";
import { OpposingParty } from "./schemas/opposing-party.schema.js";
import { OpposingPartyDocument } from "./opposing-party.types.js";

export interface ListFilter {
  partyType?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListResult {
  docs: OpposingPartyDocument[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export async function findAll(firmId: string, filter: ListFilter): Promise<ListResult> {
  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const skip = (page - 1) * limit;

  const query: any = {
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  };

  if (filter.partyType) {
    query.partyType = filter.partyType;
  }

  if (typeof filter.isActive === "boolean") {
    query.isActive = filter.isActive;
  }

  if (filter.search) {
    const searchRegex = new RegExp(filter.search.trim(), "i");
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { organizationName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const [docs, totalDocs] = await Promise.all([
    OpposingParty.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    OpposingParty.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalDocs / limit);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages,
  };
}

export async function findById(id: string, firmId: string): Promise<OpposingPartyDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return OpposingParty.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  }).exec();
}

export async function findByNameAndEmailOrPhone(
  firmId: string,
  criteria: {
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
  },
  excludeId?: string
): Promise<OpposingPartyDocument[]> {
  const query: any = {
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  };

  if (excludeId && Types.ObjectId.isValid(excludeId)) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const matches: any[] = [];
  
  if (criteria.email && criteria.email.trim() !== "") {
    matches.push({ email: criteria.email.trim() });
  }

  if (criteria.phone && criteria.phone.trim() !== "") {
    matches.push({ phone: criteria.phone.trim() });
  }

  if (criteria.firstName && criteria.lastName) {
    matches.push({
      firstName: criteria.firstName.trim(),
      lastName: criteria.lastName.trim(),
    });
  }

  if (criteria.organizationName && criteria.organizationName.trim() !== "") {
    matches.push({ organizationName: criteria.organizationName.trim() });
  }

  if (matches.length === 0) return [];

  query.$or = matches;

  return OpposingParty.find(query).exec();
}

export async function create(data: Partial<OpposingPartyDocument>): Promise<OpposingPartyDocument> {
  return OpposingParty.create(data);
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<OpposingPartyDocument>
): Promise<OpposingPartyDocument | null> {
  return OpposingParty.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId), deleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).exec();
}

export async function softDelete(
  id: string,
  firmId: string,
  deletedBy: string
): Promise<OpposingPartyDocument | null> {
  return OpposingParty.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId), deleted: false },
    {
      $set: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: new Types.ObjectId(deletedBy),
      },
    },
    { new: true }
  ).exec();
}

export async function archive(
  id: string,
  firmId: string,
  isActive: boolean
): Promise<OpposingPartyDocument | null> {
  return OpposingParty.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId), deleted: false },
    { $set: { isActive } },
    { new: true }
  ).exec();
}
