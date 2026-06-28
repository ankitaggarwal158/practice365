import mongoose, { Schema } from "mongoose";
import { FirmDocument } from "../firm.types.js";

const firmSchema = new Schema<FirmDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    primaryColor: {
      type: String,
      trim: true,
      default: "#5520F0",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    addressLine1: {
      type: String,
      trim: true,
      default: "",
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      index: true,
      default: "United States",
    },

    // Regional Settings
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    locale: {
      type: String,
      required: true,
      default: "en-US",
    },
    dateFormat: {
      type: String,
      required: true,
      default: "YYYY-MM-DD",
    },
    timeFormat: {
      type: String,
      enum: ["12", "24"],
      required: true,
      default: "24",
    },

    // Billing Defaults
    defaultBillingRate: {
      type: Number,
      required: true,
      default: 0,
    },
    invoicePrefix: {
      type: String,
      trim: true,
      default: "INV-",
    },
    matterPrefix: {
      type: String,
      trim: true,
      default: "MAT-",
    },

    isActive: {
      type: Boolean,
      required: true,
      index: true,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "firms",
  }
);

export const Firm = mongoose.model<FirmDocument>("Firm", firmSchema);
export default Firm;
