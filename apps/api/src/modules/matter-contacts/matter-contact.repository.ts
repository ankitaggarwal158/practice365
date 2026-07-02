import { Types } from "mongoose";
import { MatterContact } from "./schemas/matter-contact.schema.js";
import { MatterContactDocument } from "./matter-contact.types.js";

export interface ListFilter {
  contactType?: string;
  isActive?: boolean;
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
): Promise<PaginatedDocs<MatterContactDocument>> {
  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const skip = (page - 1) * limit;

  const query: any = {
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  };

  if (filter.contactType) {
    query.contactType = filter.contactType;
  }

  if (typeof filter.isActive === "boolean") {
    query.isActive = filter.isActive;
  }

  if (filter.search?.trim()) {
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
    MatterContact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    MatterContact.countDocuments(query),
  ]);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}

export async function findById(
  id: string,
  firmId: string
): Promise<MatterContactDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return MatterContact.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  }).exec();
}

export async function create(
  payload: Partial<MatterContactDocument>
): Promise<MatterContactDocument> {
  return MatterContact.create(payload);
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<MatterContactDocument>
): Promise<MatterContactDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return MatterContact.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    { $set: data },
    { new: true }
  ).exec();
}

export async function archive(
  id: string,
  firmId: string,
  isActive: boolean
): Promise<MatterContactDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return MatterContact.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    { $set: { isActive } },
    { new: true }
  ).exec();
}

export async function softDelete(
  id: string,
  firmId: string,
  deletedBy: string
): Promise<MatterContactDocument | null> {
  if (
    !Types.ObjectId.isValid(id) ||
    !Types.ObjectId.isValid(firmId) ||
    !Types.ObjectId.isValid(deletedBy)
  ) {
    return null;
  }
  return MatterContact.findOneAndUpdate(
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
  ).exec();
}

export async function findByNameAndEmailOrPhone(
  firmId: string,
  data: {
    partyType?: string; // matching field name from payload, wait, contactType in schema
    contactType: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    email?: string;
    phone?: string;
  }
): Promise<MatterContactDocument[]> {
  const query: any = {
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  };

  const nameQuery: any[] = [];
  const contactQuery: any[] = [];

  if (data.contactType === "INDIVIDUAL") {
    if (data.firstName?.trim() && data.lastName?.trim()) {
      nameQuery.push({
        contactType: "INDIVIDUAL",
        firstName: { $regex: new RegExp(`^${data.firstName.trim()}$`, "i") },
        lastName: { $regex: new RegExp(`^${data.lastName.trim()}$`, "i") },
      });
    }
  } else if (data.contactType === "ORGANIZATION") {
    if (data.organizationName?.trim()) {
      nameQuery.push({
        contactType: "ORGANIZATION",
        organizationName: { $regex: new RegExp(`^${data.organizationName.trim()}$`, "i") },
      });
    }
  }

  if (data.email?.trim()) {
    contactQuery.push({ email: data.email.trim().toLowerCase() });
  }

  if (data.phone?.trim()) {
    // Normalizing phone for matching is a good practice
    const cleanPhone = data.phone.replace(/\D/g, "");
    if (cleanPhone) {
      contactQuery.push({ phone: data.phone.trim() });
    }
  }

  const matches = [...nameQuery, ...contactQuery];
  if (matches.length === 0) {
    return [];
  }

  query.$or = matches;

  return MatterContact.find(query).exec();
}
