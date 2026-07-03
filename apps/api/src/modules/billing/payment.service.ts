import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { invoiceRepository } from "./invoice.repository.js";
import { InvoiceStatus, PaymentMethod } from "./invoice.constants.js";
import { InvoicePayment } from "./invoice.types.js";

export const paymentService = {
  async recordPayment(
    firmId: string,
    invoiceId: string,
    userId: string,
    data: {
      paymentDate?: string | Date;
      amount: number;
      paymentMethod: PaymentMethod;
      referenceNumber?: string;
      notes?: string;
    }
  ): Promise<InvoicePayment> {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      throw AppError.badRequest("Cannot record payment on a draft invoice.");
    }
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw AppError.badRequest("Cannot record payment on a cancelled invoice.");
    }
    if (invoice.balanceDue <= 0) {
      throw AppError.badRequest("Invoice is already fully paid.");
    }
    if (data.amount <= 0) {
      throw AppError.badRequest("Payment amount must be greater than 0.");
    }

    // Safety: ensure payment doesn't exceed balance due by too much, or cap it.
    // The spec says: updates Amount Paid, updates Balance Due, updates Invoice Status automatically.
    const newAmountPaid = Math.round((invoice.amountPaid + data.amount) * 100) / 100;
    const newBalanceDue = Math.round(Math.max(0, invoice.totalAmount - newAmountPaid) * 100) / 100;

    let newStatus = invoice.status;
    if (newBalanceDue === 0) {
      newStatus = InvoiceStatus.PAID;
    } else if (newBalanceDue > 0 && newAmountPaid > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    // Create the payment record
    const payment = await invoiceRepository.createPayment({
      invoiceId: invoice._id,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      receivedBy: new Types.ObjectId(userId),
    });

    // Update the invoice
    await invoiceRepository.update(invoice._id, firmId, {
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus,
    });

    console.log(
      `[AUDIT] Payment Recorded: ID=${payment._id}, InvoiceID=${invoice._id}, Amount=${payment.amount}, NewStatus=${newStatus}`
    );

    return payment;
  },

  async getPaymentsForInvoice(invoiceId: string, firmId: string): Promise<InvoicePayment[]> {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }
    return invoiceRepository.findPaymentsByInvoiceId(invoiceId);
  }
};
