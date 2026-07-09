import { Types } from "mongoose";
import { FirmSettings } from "./schemas/firm-settings.schema.js";
import { Firm } from "../firm/schemas/firm.schema.js";

export async function ensureSettingsInitialized(firmId: string): Promise<any> {
  const firmObjId = new Types.ObjectId(firmId);
  let doc = await FirmSettings.findOne({ firmId: firmObjId }).exec();
  
  if (!doc) {
    // Check if the Firm exists and use its properties as defaults
    const firm = await Firm.findById(firmObjId).exec();
    
    doc = await FirmSettings.create({
      firmId: firmObjId,
      firmLogo: firm?.logoUrl || "",
      primaryColor: firm?.primaryColor || "#5520F0",
      secondaryColor: "#000000",
      timezone: firm?.timezone || "UTC",
      currency: firm?.currency || "USD",
      dateFormat: firm?.dateFormat || "YYYY-MM-DD",
      timeFormat: firm?.timeFormat === "12" ? "12_HOUR" : "24_HOUR",
      matterNumberPrefix: firm?.matterPrefix || "MAT-",
      matterNextNumber: 1001,
      clientNumberPrefix: "CLI-",
      clientNextNumber: 1,
      invoiceNumberPrefix: firm?.invoicePrefix || "INV-",
      invoiceNextNumber: 1,
    });
  }
  
  return doc;
}

export const numberSequenceService = {
  async generateMatterNumber(firmId: string): Promise<string> {
    await ensureSettingsInitialized(firmId);
    
    const updated = await FirmSettings.findOneAndUpdate(
      { firmId: new Types.ObjectId(firmId) },
      { $inc: { matterNextNumber: 1 } },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error("Failed to atomically generate matter sequence number.");
    }
    
    const sequenceValue = updated.matterNextNumber - 1;
    const prefix = updated.matterNumberPrefix || "MAT-";
    
    return `${prefix}${sequenceValue}`;
  },

  async generateClientNumber(firmId: string): Promise<string> {
    await ensureSettingsInitialized(firmId);
    
    const updated = await FirmSettings.findOneAndUpdate(
      { firmId: new Types.ObjectId(firmId) },
      { $inc: { clientNextNumber: 1 } },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error("Failed to atomically generate client sequence number.");
    }
    
    const sequenceValue = updated.clientNextNumber - 1;
    const prefix = updated.clientNumberPrefix || "CLI-";
    
    return `${prefix}${sequenceValue}`;
  },

  async generateInvoiceNumber(firmId: string): Promise<string> {
    await ensureSettingsInitialized(firmId);
    
    const updated = await FirmSettings.findOneAndUpdate(
      { firmId: new Types.ObjectId(firmId) },
      { $inc: { invoiceNextNumber: 1 } },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error("Failed to atomically generate invoice sequence number.");
    }
    
    const sequenceValue = updated.invoiceNextNumber - 1;
    const prefix = updated.invoiceNumberPrefix || "INV-";
    
    // Invoices are formatted with 6 digits padding (e.g. INV-000001)
    return `${prefix}${String(sequenceValue).padStart(6, "0")}`;
  }
};

export default numberSequenceService;
