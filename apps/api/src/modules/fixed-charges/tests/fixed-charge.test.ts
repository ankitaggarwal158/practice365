import { test, describe } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { formatFixedCharge } from "../fixed-charge.service.js";
import {
  createFixedChargeSchema,
  updateFixedChargeSchema,
} from "../fixed-charge.validation.js";

describe("Fixed Charges Module Tests", () => {
  describe("Formatting Helper", () => {
    test("should serialize Mongoose documents properly", () => {
      const mockRecord = {
        _id: new Types.ObjectId(),
        firmId: new Types.ObjectId(),
        matterId: new Types.ObjectId(),
        clientId: new Types.ObjectId(),
        clientDescription: "Filing Fee",
        internalNote: "Paid via card",
        amount: 250,
        billingType: "BILLABLE",
        isBilled: false,
        invoiceId: null,
        date: new Date("2026-07-10T12:00:00Z"),
        createdBy: new Types.ObjectId(),
        createdAt: new Date("2026-07-10T12:00:00Z"),
        updatedAt: new Date("2026-07-10T12:00:00Z"),
      };

      const formatted = formatFixedCharge(mockRecord);
      assert.strictEqual(formatted.id, mockRecord._id.toString());
      assert.strictEqual(formatted.clientDescription, "Filing Fee");
      assert.strictEqual(formatted.amount, 250);
      assert.strictEqual(formatted.isBilled, false);
    });
  });

  describe("Validation Schemas", () => {
    test("createFixedChargeSchema should validate valid input parameters", () => {
      const payload = {
        matterId: new Types.ObjectId().toString(),
        clientId: new Types.ObjectId().toString(),
        clientDescription: "Document Drafting",
        amount: 150,
        billingType: "BILLABLE",
        date: "2026-07-10",
      };
      const result = createFixedChargeSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createFixedChargeSchema should fail with invalid amount", () => {
      const payload = {
        matterId: new Types.ObjectId().toString(),
        clientId: new Types.ObjectId().toString(),
        clientDescription: "Document Drafting",
        amount: -50, // Negative amount
      };
      const result = createFixedChargeSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("updateFixedChargeSchema should validate valid partial update", () => {
      const payload = {
        amount: 200,
        clientDescription: "Updated Description",
      };
      const result = updateFixedChargeSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });
});
