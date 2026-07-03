import mongoose, { Schema } from "mongoose";
import { InvoicePayment } from "../invoice.types.js";
import { PaymentMethod } from "../invoice.constants.js";

const InvoicePaymentSchema = new Schema<InvoicePayment>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: Object.values(PaymentMethod), 
      required: true 
    },
    referenceNumber: { type: String },
    notes: { type: String },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for payments
  }
);

export const InvoicePaymentModel = mongoose.model<InvoicePayment>("InvoicePayment", InvoicePaymentSchema, "invoice_payments");
