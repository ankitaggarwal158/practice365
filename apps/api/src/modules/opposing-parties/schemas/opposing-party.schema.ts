import mongoose, { Schema } from "mongoose";
import { OpposingPartyDocument } from "../opposing-party.types.js";
import { PARTY_TYPES } from "../opposing-party.constants.js";

const opposingPartySchema = new Schema<OpposingPartyDocument>(
  {
    firmId: { type: Schema.Types.ObjectId, required: true, ref: "Firm", index: true },
    partyType: { type: String, enum: PARTY_TYPES, required: true },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    organizationName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    alternatePhone: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    addressLine1: { type: String, trim: true, default: "" },
    addressLine2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, required: true, default: true, index: true },
    deleted: { type: Boolean, required: true, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "opposing_parties" }
);

// Individual Field Indexes
opposingPartySchema.index({ lastName: 1 });
opposingPartySchema.index({ organizationName: 1 });
opposingPartySchema.index({ email: 1 });
opposingPartySchema.index({ phone: 1 });

// Composite Indexes
opposingPartySchema.index({ firmId: 1, lastName: 1 });
opposingPartySchema.index({ firmId: 1, organizationName: 1 });

export const OpposingParty = mongoose.model<OpposingPartyDocument>(
  "OpposingParty",
  opposingPartySchema
);
