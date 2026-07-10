import mongoose, { Schema } from "mongoose";
import { FixedChargeDocument } from "../fixed-charge.types.js";
import { BillingType } from "../fixed-charge.constants.js";

const FixedChargeSchema = new Schema<FixedChargeDocument>(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    matterId: { type: Schema.Types.ObjectId, ref: "Matter", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    
    clientDescription: { type: String, required: true },
    internalNote: { type: String, default: "" },
    amount: { type: Number, required: true },
    
    billingType: { 
      type: String, 
      enum: Object.values(BillingType), 
      default: BillingType.BILLABLE,
      required: true 
    },
    
    isBilled: { type: Boolean, default: false, required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", default: null, index: true },
    date: { type: Date, required: true },
    
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deleted: { type: Boolean, default: false, required: true, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Compound Index
FixedChargeSchema.index({ firmId: 1, matterId: 1 });
FixedChargeSchema.index({ firmId: 1, isBilled: 1 });

export const FixedChargeModel = mongoose.model<FixedChargeDocument>("FixedCharge", FixedChargeSchema, "fixed_charges");
