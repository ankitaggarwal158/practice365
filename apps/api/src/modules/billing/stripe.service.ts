import Stripe from "stripe";
import { Types } from "mongoose";
import { AppError } from "../../shared/app-error.js";
import { invoiceRepository } from "./invoice.repository.js";
import { paymentService } from "./payment.service.js";
import { InvoiceStatus } from "./invoice.constants.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock_key", {
  apiVersion: "2022-11-15" as any,
});

export const stripeService = {
  async createCheckoutSession(firmId: string, invoiceId: string) {
    const invoice = await invoiceRepository.findById(invoiceId, firmId);
    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }
    if (invoice.status === InvoiceStatus.DRAFT) {
      throw AppError.badRequest("Cannot pay a draft invoice.");
    }
    if (invoice.balanceDue <= 0) {
      throw AppError.badRequest("Invoice is already fully paid.");
    }

    const portalUrl = process.env.CLIENT_PORTAL_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Invoice #${invoice.invoiceNumber}`,
              description: `Payment for Invoice #${invoice.invoiceNumber}`,
            },
            unit_amount: Math.round(invoice.balanceDue * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${portalUrl}/portal/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${portalUrl}/portal/invoices`,
      metadata: {
        invoiceId: invoice._id.toString(),
        firmId: invoice.firmId.toString(),
      },
    });

    console.log(`[AUDIT] Stripe Checkout Session Created: SessionID=${session.id}, InvoiceID=${invoice._id}`);
    return { checkoutUrl: session.url };
  },

  async handleWebhook(rawBody: Buffer, signature: string, webhookSecret: string) {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      throw AppError.badRequest(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      if (!metadata || !metadata.invoiceId || !metadata.firmId) {
        console.log(`[AUDIT] Stripe Webhook Checkout Session Completed missing metadata: SessionID=${session.id}`);
        return;
      }

      const { invoiceId, firmId } = metadata;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
      const systemUserId = new Types.ObjectId("000000000000000000000000"); // System default

      await paymentService.recordPayment(firmId, invoiceId, systemUserId.toString(), {
        amount: amountPaid,
        paymentMethod: "STRIPE" as any,
        referenceNumber: session.id,
        notes: `Stripe Checkout completed. Session: ${session.id}`,
      });
    }
  }
};
