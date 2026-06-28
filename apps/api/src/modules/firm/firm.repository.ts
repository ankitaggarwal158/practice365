import { Types } from "mongoose";
import { Firm } from "./schemas/firm.schema.js";
import { FirmDocument } from "./firm.types.js";

export async function findById(id: string): Promise<FirmDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return Firm.findById(id);
}

export async function findOrCreate(id: string, defaultName = "My Law Firm"): Promise<FirmDocument> {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid Firm ID format.");
  }
  
  let firm = await Firm.findById(id);
  
  if (!firm) {
    firm = await Firm.create({
      _id: new Types.ObjectId(id),
      name: defaultName,
      legalName: defaultName,
      displayName: defaultName,
      timezone: "UTC",
      currency: "USD",
      locale: "en-US",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "24",
      defaultBillingRate: 0,
      isActive: true,
    });
  }
  
  return firm;
}

export async function update(id: string, data: Partial<FirmDocument>): Promise<FirmDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  
  return Firm.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
}
