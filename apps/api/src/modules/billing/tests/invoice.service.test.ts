import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { CreateInvoiceSchema, RecordPaymentSchema } from "../invoice.validation.js";
import { invoiceService } from "../invoice.service.js";
import { paymentService } from "../payment.service.js";
import { billingCalculationService } from "../billing-calculation.service.js";
import { InvoiceStatus, InvoiceItemSourceType, PaymentMethod } from "../invoice.constants.js";
import { Client } from "../../clients/schemas/client.schema.js";
import { Matter } from "../../matters/schemas/matter.schema.js";
import { TimeEntryModel } from "../../time-tracking/schemas/time-entry.schema.js";
import { InvoiceModel } from "../schemas/invoice.schema.js";
import { InvoiceItemModel } from "../schemas/invoice-item.schema.js";
import { InvoicePaymentModel } from "../schemas/invoice-payment.schema.js";

describe("Billing & Invoicing Service Tests", () => {
  describe("Validation Schemas", () => {
    test("CreateInvoiceSchema should pass valid payload", () => {
      const payload = {
        body: {
          clientId: "507f1f77bcf86cd799439011",
          timeEntryIds: ["507f1f77bcf86cd799439012"],
          manualItems: [
            { description: "Consultation Fee", quantity: 1, rate: 150.00 }
          ],
          dueDate: new Date().toISOString(),
          notes: "Payment due within 30 days.",
        }
      };
      const result = CreateInvoiceSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("CreateInvoiceSchema should fail with invalid clientId", () => {
      const payload = {
        body: {
          clientId: "invalid-id",
        }
      };
      const result = CreateInvoiceSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("RecordPaymentSchema should validate payment method and positive amount", () => {
      const payload = {
        body: {
          amount: 250.00,
          paymentMethod: "BANK_TRANSFER",
        }
      };
      const result = RecordPaymentSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

  describe("Billing Calculation Logic", () => {
    test("calculateTotals computes values correctly with rounding", () => {
      const items = [
        { amount: 100.05 },
        { amount: 200.10 }
      ];
      // Test 10% tax rate
      const result = billingCalculationService.calculateTotals(items, 10, 50.00);
      assert.strictEqual(result.subtotal, 300.15);
      assert.strictEqual(result.taxAmount, 30.02); // 300.15 * 0.1 = 30.015 -> rounded to 30.02
      assert.strictEqual(result.totalAmount, 330.17); // 300.15 + 30.02 = 330.17
      assert.strictEqual(result.balanceDue, 280.17); // 330.17 - 50.00 = 280.17
    });
  });

  describe("Invoice Lifecycle Operations", () => {
    let originalClientExists: any;
    let originalTimeEntryFind: any;
    let originalTimeEntryUpdateMany: any;
    let originalInvoiceCount: any;
    let originalInvoiceExists: any;
    let originalInvoiceCreate: any;
    let originalInvoiceItemInsertMany: any;
    let originalInvoiceFindOne: any;
    let originalInvoiceFindOneAndUpdate: any;

    before(() => {
      originalClientExists = Client.exists;
      originalTimeEntryFind = TimeEntryModel.find;
      originalTimeEntryUpdateMany = TimeEntryModel.updateMany;
      originalInvoiceCount = InvoiceModel.countDocuments;
      originalInvoiceExists = InvoiceModel.exists;
      originalInvoiceItemInsertMany = InvoiceItemModel.insertMany;
      originalInvoiceFindOne = InvoiceModel.findOne;
      originalInvoiceFindOneAndUpdate = InvoiceModel.findOneAndUpdate;
    });

    after(() => {
      Client.exists = originalClientExists;
      TimeEntryModel.find = originalTimeEntryFind;
      TimeEntryModel.updateMany = originalTimeEntryUpdateMany;
      InvoiceModel.countDocuments = originalInvoiceCount;
      InvoiceModel.exists = originalInvoiceExists;
      InvoiceItemModel.insertMany = originalInvoiceItemInsertMany;
      InvoiceModel.findOne = originalInvoiceFindOne;
      InvoiceModel.findOneAndUpdate = originalInvoiceFindOneAndUpdate;
    });

    test("createDraftInvoice handles database saving, locking, and numbering", async () => {
      const firmId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const clientId = new Types.ObjectId().toString();

      // Mock database calls
      Client.exists = () => Promise.resolve(true) as any;
      TimeEntryModel.find = () => ({
        exec: () => Promise.resolve([
          {
            _id: new Types.ObjectId(),
            firmId: new Types.ObjectId(firmId),
            durationMinutes: 120,
            hourlyRate: 200,
            billableAmount: 400,
            billingType: "BILLABLE",
            isBilled: false,
          }
        ])
      }) as any;

      TimeEntryModel.updateMany = () => ({
        exec: () => Promise.resolve({ modifiedCount: 1 })
      }) as any;

      InvoiceModel.countDocuments = () => ({
        exec: () => Promise.resolve(0)
      }) as any;

      InvoiceModel.exists = () => Promise.resolve(false) as any;

      InvoiceModel.prototype.save = function () {
        this._id = new Types.ObjectId();
        return Promise.resolve(this);
      };

      InvoiceItemModel.insertMany = (items: any) => {
        return Promise.resolve(items.map((item: any) => ({ ...item, _id: new Types.ObjectId() })));
      };

      const result = await invoiceService.createDraftInvoice(firmId, userId, {
        clientId,
        timeEntryIds: [new Types.ObjectId().toString()],
        manualItems: [
          { description: "Admin Work", quantity: 2, rate: 50.00 }
        ]
      });

      assert.strictEqual(result.status, InvoiceStatus.DRAFT);
      assert.strictEqual(result.invoiceNumber, "INV-2026-000001");
      assert.strictEqual(result.subtotal, 500.00); // 400 (time entry) + 100 (manual)
      assert.strictEqual(result.totalAmount, 500.00);
      assert.strictEqual(result.items.length, 2);
    });

    test("recordPayment updates status to PAID and records payment log", async () => {
      const firmId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const invoiceId = new Types.ObjectId().toString();

      const mockInvoice = {
        _id: new Types.ObjectId(invoiceId),
        firmId: new Types.ObjectId(firmId),
        status: InvoiceStatus.ISSUED,
        totalAmount: 300.00,
        amountPaid: 100.00,
        balanceDue: 200.00,
        toObject: () => mockInvoice
      };

      InvoiceModel.findOne = () => ({
        populate: () => ({
          populate: () => ({
            populate: () => ({
              exec: () => Promise.resolve(mockInvoice),
            }),
          }),
        }),
      }) as any;

      InvoicePaymentModel.prototype.save = function () {
        this._id = new Types.ObjectId();
        return Promise.resolve(this);
      };

      let updatedFields: any = null;
      InvoiceModel.findOneAndUpdate = (query: any, update: any) => {
        updatedFields = update.$set;
        return {
          populate: () => ({
            populate: () => ({
              exec: () => Promise.resolve({ ...mockInvoice, ...updatedFields }),
            }),
          }),
        } as any;
      };

      // Record full payment of 200.00
      const payment = await paymentService.recordPayment(firmId, invoiceId, userId, {
        amount: 200.00,
        paymentMethod: PaymentMethod.CARD,
      });

      assert.strictEqual(payment.amount, 200.00);
      assert.strictEqual(payment.paymentMethod, PaymentMethod.CARD);
      assert.ok(updatedFields);
      assert.strictEqual(updatedFields.amountPaid, 300.00);
      assert.strictEqual(updatedFields.balanceDue, 0);
      assert.strictEqual(updatedFields.status, InvoiceStatus.PAID);
    });
  });
});
