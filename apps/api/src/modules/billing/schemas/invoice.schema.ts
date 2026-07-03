import mongoose, { Schema } from "mongoose";
import { Invoice } from "../invoice.types.js";
import { InvoiceStatus } from "../invoice.constants.js";

const InvoiceSchema = new Schema<Invoice>(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    matterId: { type: Schema.Types.ObjectId, ref: "Matter", index: true },
    invoiceNumber: { type: String, required: true, index: true },
    status: { 
      type: String, 
      enum: Object.values(InvoiceStatus), 
      default: InvoiceStatus.DRAFT, 
      required: true,
      index: true 
    },
    issueDate: { type: Date, index: true },
    dueDate: { type: Date, index: true },
    subtotal: { type: Number, default: 0, required: true },
    taxAmount: { type: Number, default: 0, required: true },
    totalAmount: { type: Number, default: 0, required: true },
    amountPaid: { type: Number, default: 0, required: true },
    balanceDue: { type: Number, default: 0, required: true },
    notes: { type: String },
    deleted: { type: Boolean, default: false, required: true },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for firm isolation, search performance, and unique numbering
InvoiceSchema.index({ firmId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ firmId: 1, clientId: 1 });
InvoiceSchema.index({ firmId: 1, status: 1 });

export const InvoiceModel = mongoose.model<Invoice>("Invoice", InvoiceSchema, "invoices");
