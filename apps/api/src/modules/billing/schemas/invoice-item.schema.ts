import mongoose, { Schema } from "mongoose";
import { InvoiceItem } from "../invoice.types.js";
import { InvoiceItemSourceType } from "../invoice.constants.js";

const InvoiceItemSchema = new Schema<InvoiceItem>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    sourceType: { 
      type: String, 
      enum: Object.values(InvoiceItemSourceType), 
      required: true 
    },
    sourceId: { type: Schema.Types.ObjectId, index: true },
    description: { type: String, required: true },
    quantity: { type: Number, default: 1, required: true },
    rate: { type: Number, default: 0, required: true },
    amount: { type: Number, default: 0, required: true },
    displayOrder: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
  }
);

export const InvoiceItemModel = mongoose.model<InvoiceItem>("InvoiceItem", InvoiceItemSchema, "invoice_items");
