import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import {
  matterReportQuerySchema,
  clientReportQuerySchema,
  timeReportQuerySchema,
  invoiceReportQuerySchema,
  revenueReportQuerySchema,
  userActivityReportQuerySchema,
} from "../reports.validation.js";
import { exportToCsv } from "../csv-export.service.js";

describe("Reports Module (044) Tests", () => {
  describe("Zod Validation Schemas", () => {
    test("matterReportQuerySchema should validate valid input parameters", () => {
      const payload = {
        status: "OPEN",
        practiceAreaId: new Types.ObjectId().toString(),
        responsibleAttorneyId: new Types.ObjectId().toString(),
        clientId: new Types.ObjectId().toString(),
        fromDate: "2026-07-01",
        toDate: "2026-07-10",
        page: "2",
        limit: "50",
      };
      const result = matterReportQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 50);
      assert.strictEqual(result.data.status, "OPEN");
    });

    test("matterReportQuerySchema should fail with invalid status", () => {
      const payload = {
        status: "INVALID_STATUS",
      };
      const result = matterReportQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("clientReportQuerySchema should validate type and status", () => {
      const payload = {
        status: "ACTIVE",
        clientType: "ORGANIZATION",
      };
      const result = clientReportQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("timeReportQuerySchema should validate billingType", () => {
      const payload = {
        billingType: "BILLABLE",
      };
      const result = timeReportQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("invoiceReportQuerySchema should validate status", () => {
      const payload = {
        status: "OVERDUE",
      };
      const result = invoiceReportQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("revenueReportQuerySchema should validate method", () => {
      const payload = {
        paymentMethod: "STRIPE",
      };
      const result = revenueReportQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("userActivityReportQuerySchema should validate optional fields", () => {
      const payload = {
        module: "Billing",
        action: "GENERATE_INVOICE",
      };
      const result = userActivityReportQuerySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

  describe("CSV Export Logic", () => {
    test("should export matters report to CSV correctly", async () => {
      const mockMatters = [
        {
          matterNumber: "MAT-100",
          title: "General Advisory",
          status: "OPEN",
          practiceAreaName: "Corporate Law",
          billingMethod: "HOURLY",
          estimatedValue: 15000,
          responsibleAttorneyName: "Jane Smith",
          clientName: "Acme Corp",
          openedDate: new Date("2026-07-01T12:00:00.000Z"),
        },
      ];

      const csv = await exportToCsv("matters", mockMatters);
      assert.ok(csv.includes("Matter Number,Title,Status,Practice Area"));
      assert.ok(csv.includes("MAT-100"));
      assert.ok(csv.includes("General Advisory"));
      assert.ok(csv.includes("Corporate Law"));
      assert.ok(csv.includes("Jane Smith"));
    });

    test("should export client report to CSV correctly", async () => {
      const mockClients = [
        {
          clientNumber: "CLI-001",
          clientType: "INDIVIDUAL",
          status: "ACTIVE",
          firstName: "John",
          lastName: "Doe",
          companyName: "",
          email: "john.doe@example.com",
          phone: "555-0199",
          createdAt: new Date("2026-07-02T10:00:00.000Z"),
        },
      ];

      const csv = await exportToCsv("clients", mockClients);
      assert.ok(csv.includes("Client Number,Client Type,Status,First Name"));
      assert.ok(csv.includes("CLI-001"));
      assert.ok(csv.includes("John"));
      assert.ok(csv.includes("john.doe@example.com"));
    });

    test("should export time report to CSV correctly", async () => {
      const mockTime = [
        {
          date: new Date("2026-07-03T11:00:00.000Z"),
          durationMinutes: 90,
          hourlyRate: 200,
          billableAmount: 300,
          billingType: "BILLABLE",
          isBilled: false,
          userName: "Bob Jones",
          matterNumber: "MAT-101",
          matterTitle: "Consultation",
          clientName: "David Lee",
          description: "Reviewed client intake questionnaire",
        },
      ];

      const csv = await exportToCsv("time", mockTime);
      assert.ok(csv.includes("Date,Duration (Mins),Rate,Amount"));
      assert.ok(csv.includes("90"));
      assert.ok(csv.includes("$200.00"));
      assert.ok(csv.includes("$300.00"));
      assert.ok(csv.includes("Reviewed client intake questionnaire"));
    });
  });
});
