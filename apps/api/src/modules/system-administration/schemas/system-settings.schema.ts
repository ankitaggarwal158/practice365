import mongoose, { Schema } from "mongoose";
import { SystemSettingsDocument } from "../system-settings.types.js";

const systemSettingsSchema = new Schema<SystemSettingsDocument>(
  {
    maintenanceMode: { type: Boolean, required: true, default: false },
    maintenanceMessage: { type: String, required: true, default: "System is currently undergoing maintenance. Please try again later." },
    applicationName: { type: String, required: true, default: "Practice365" },
    defaultTimezone: { type: String, required: true, default: "UTC" },
  },
  {
    timestamps: true,
    collection: "system_settings",
  }
);

export const SystemSettingsModel = mongoose.model<SystemSettingsDocument>("SystemSettings", systemSettingsSchema);
export default SystemSettingsModel;
