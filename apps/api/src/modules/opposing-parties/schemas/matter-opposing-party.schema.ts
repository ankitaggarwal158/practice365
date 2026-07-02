import mongoose, { Schema } from "mongoose";
import { MatterOpposingPartyDocument } from "../opposing-party.types.js";

const matterOpposingPartySchema = new Schema<MatterOpposingPartyDocument>(
  {
    matterId: { type: Schema.Types.ObjectId, required: true, ref: "Matter", index: true },
    opposingPartyId: { type: Schema.Types.ObjectId, required: true, ref: "OpposingParty", index: true },
    role: { type: String, trim: true, default: "Opposing Party" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "matter_opposing_parties",
  }
);

// Prevent duplicate associations between the same matter and opposing party
matterOpposingPartySchema.index({ matterId: 1, opposingPartyId: 1 }, { unique: true });

export const MatterOpposingParty = mongoose.model<MatterOpposingPartyDocument>(
  "MatterOpposingParty",
  matterOpposingPartySchema
);
