import mongoose, { Schema } from "mongoose";
import { CONTACT_TYPES } from "../matter-contact.constants.js";
import { MatterContactDocument } from "../matter-contact.types.js";

const matterContactSchema = new Schema<MatterContactDocument>(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
      index: true,
    },
    contactType: {
      type: String,
      enum: CONTACT_TYPES,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    organizationName: {
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
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
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
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes defined in specification
matterContactSchema.index({ lastName: 1 });
matterContactSchema.index({ organizationName: 1 });
matterContactSchema.index({ email: 1 });
matterContactSchema.index({ phone: 1 });

// Composite indexes
matterContactSchema.index({ firmId: 1, lastName: 1 });
matterContactSchema.index({ firmId: 1, organizationName: 1 });

export const MatterContact = mongoose.model<MatterContactDocument>(
  "MatterContact",
  matterContactSchema,
  "matter_contacts"
);
