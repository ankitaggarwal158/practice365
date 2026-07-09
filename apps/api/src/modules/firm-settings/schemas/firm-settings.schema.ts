import mongoose, { Schema } from "mongoose";
import { FirmSettingsDocument } from "../firm-settings.types.js";

const firmSettingsSchema = new Schema<FirmSettingsDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      unique: true,
      index: true,
    },
    firmLogo: {
      type: String,
      default: "",
    },
    primaryColor: {
      type: String,
      default: "#5520F0",
    },
    secondaryColor: {
      type: String,
      default: "#000000",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    currency: {
      type: String,
      default: "USD",
    },
    dateFormat: {
      type: String,
      default: "YYYY-MM-DD",
    },
    timeFormat: {
      type: String,
      enum: ["12_HOUR", "24_HOUR"],
      default: "24_HOUR",
    },
    matterNumberPrefix: {
      type: String,
      default: "MAT-",
    },
    matterNextNumber: {
      type: Number,
      default: 1001,
    },
    clientNumberPrefix: {
      type: String,
      default: "CLI-",
    },
    clientNextNumber: {
      type: Number,
      default: 1,
    },
    invoiceNumberPrefix: {
      type: String,
      default: "INV-",
    },
    invoiceNextNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "firm_settings",
  }
);

export const FirmSettings = mongoose.model<FirmSettingsDocument>("FirmSettings", firmSettingsSchema, "firm_settings");
export default FirmSettings;
