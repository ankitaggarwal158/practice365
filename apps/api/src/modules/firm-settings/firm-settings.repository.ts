import { Types } from "mongoose";
import { FirmSettings } from "./schemas/firm-settings.schema.js";
import { FirmSettingsDocument } from "./firm-settings.types.js";

export async function findByFirmId(firmId: string): Promise<FirmSettingsDocument | null> {
  if (!Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return FirmSettings.findOne({ firmId: new Types.ObjectId(firmId) }).exec();
}

export async function create(payload: Partial<FirmSettingsDocument>): Promise<FirmSettingsDocument> {
  return FirmSettings.create(payload);
}

export async function update(
  firmId: string,
  data: Partial<FirmSettingsDocument>
): Promise<FirmSettingsDocument | null> {
  if (!Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return FirmSettings.findOneAndUpdate(
    { firmId: new Types.ObjectId(firmId) },
    { $set: data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).exec();
}
