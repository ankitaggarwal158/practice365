import { Types } from "mongoose";
import { ConflictCheck } from "./schemas/conflict-check.schema.js";
import { ConflictCheckDocument } from "./conflict-check.types.js";

export async function create(
  data: Partial<ConflictCheckDocument>
): Promise<ConflictCheckDocument> {
  return ConflictCheck.create(data);
}

export async function findById(
  id: string,
  firmId: string
): Promise<ConflictCheckDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return ConflictCheck.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  });
}

export async function findByIdWithDetails(
  id: string,
  firmId: string
): Promise<ConflictCheckDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return ConflictCheck.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
  })
    .populate("requestedBy", "firstName lastName email")
    .populate("reviewedBy", "firstName lastName email");
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<ConflictCheckDocument>
): Promise<ConflictCheckDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) return null;
  return ConflictCheck.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId) },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function list(
  firmId: string,
  options: { page: number; limit: number }
): Promise<{ data: ConflictCheckDocument[]; total: number; pages: number }> {
  const query = { firmId: new Types.ObjectId(firmId) };
  const page = Math.max(1, options.page);
  const limit = Math.max(1, options.limit);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    ConflictCheck.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("requestedBy", "firstName lastName email")
      .populate("reviewedBy", "firstName lastName email")
      .populate("leadId", "firstName lastName leadNumber")
      .exec(),
    ConflictCheck.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    data,
    total,
    pages,
  };
}

export async function findLatestClearedCheckForLead(
  leadId: string,
  firmId: string
): Promise<ConflictCheckDocument | null> {
  if (!Types.ObjectId.isValid(leadId) || !Types.ObjectId.isValid(firmId)) return null;
  return ConflictCheck.findOne({
    leadId: new Types.ObjectId(leadId),
    firmId: new Types.ObjectId(firmId),
    finalDecision: "CLEARED",
  }).sort({ createdAt: -1 });
}
