import { Types } from "mongoose";
import { PracticeArea } from "./schemas/practice-area.schema.js";
import { PracticeAreaDocument, PracticeAreaReorderItem } from "./practice-area.types.js";

export async function findAll(firmId: string): Promise<PracticeAreaDocument[]> {
  return PracticeArea.find({
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  })
    .sort({ displayOrder: 1, name: 1 })
    .exec();
}

export async function findActive(firmId: string): Promise<PracticeAreaDocument[]> {
  return PracticeArea.find({
    firmId: new Types.ObjectId(firmId),
    isActive: true,
    deleted: false,
  })
    .sort({ displayOrder: 1, name: 1 })
    .exec();
}

export async function findById(id: string, firmId: string): Promise<PracticeAreaDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return PracticeArea.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  }).exec();
}

export async function findByNameOrCode(
  firmId: string,
  name: string,
  code: string,
  excludeId?: string
): Promise<PracticeAreaDocument | null> {
  const query: any = {
    firmId: new Types.ObjectId(firmId),
    deleted: false,
    $or: [{ name }, { code }],
  };
  
  if (excludeId && Types.ObjectId.isValid(excludeId)) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }
  
  return PracticeArea.findOne(query).exec();
}

export async function countByFirmId(firmId: string): Promise<number> {
  return PracticeArea.countDocuments({ firmId: new Types.ObjectId(firmId) });
}

export async function create(
  data: Partial<PracticeAreaDocument>
): Promise<PracticeAreaDocument> {
  return PracticeArea.create(data);
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<PracticeAreaDocument>
): Promise<PracticeAreaDocument | null> {
  return PracticeArea.findOneAndUpdate(
    { _id: new Types.ObjectId(id), firmId: new Types.ObjectId(firmId), deleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).exec();
}

export async function reorder(
  firmId: string,
  items: PracticeAreaReorderItem[]
): Promise<void> {
  const session = await PracticeArea.startSession();
  session.startTransaction();
  
  try {
    const promises = items.map((item) =>
      PracticeArea.updateOne(
        { _id: new Types.ObjectId(item.id), firmId: new Types.ObjectId(firmId), deleted: false },
        { $set: { displayOrder: item.displayOrder } },
        { session }
      )
    );
    await Promise.all(promises);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function softDelete(
  id: string,
  firmId: string,
  deletedBy: string
): Promise<PracticeAreaDocument | null> {
  return PracticeArea.findOneAndUpdate(
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
