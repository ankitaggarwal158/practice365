import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { Firm } from "../schemas/firm.schema.js";
import { formatFirm } from "../firm.service.js";
import { formatSettings } from "../firm.settings.service.js";
import {
  updateFirmProfileSchema,
  updateSettingsSchema,
  updateBrandingSchema,
} from "../firm.validation.js";

describe("Firm Management Module (013) Tests", () => {
  describe("formatFirm and formatSettings Utilities", () => {
    test("should correctly format a mock FirmDocument", () => {
      const mockId = new Types.ObjectId();
      const now = new Date();

      const mockFirm = {
        _id: mockId,
        name: "Smith & Associates",
        legalName: "Smith & Associates LLP",
        displayName: "Smith Law",
        logoUrl: "http://example.com/logo.png",
        primaryColor: "#1A2B3C",
        website: "https://smithlaw.com",
        email: "contact@smithlaw.com",
        phone: "+1555123456",
        addressLine1: "123 Main St",
        addressLine2: "Suite 400",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        timezone: "America/New_York",
        currency: "USD",
        locale: "en-US",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12",
        defaultBillingRate: 250,
        invoicePrefix: "INV-",
        matterPrefix: "MAT-",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      } as any;

      const formatted = formatFirm(mockFirm);

      assert.strictEqual(formatted.id, mockId.toString());
      assert.strictEqual(formatted.name, "Smith & Associates");
      assert.strictEqual(formatted.primaryColor, "#1A2B3C");
      assert.strictEqual(formatted.timezone, "America/New_York");
      assert.strictEqual(formatted.currency, "USD");
      assert.strictEqual(formatted.timeFormat, "12");
      assert.strictEqual(formatted.defaultBillingRate, 250);

      const settings = formatSettings(mockFirm);
      assert.strictEqual(settings.timezone, "America/New_York");
      assert.strictEqual(settings.currency, "USD");
      assert.strictEqual(settings.timeFormat, "12");
      assert.strictEqual(settings.defaultBillingRate, 250);
    });
  });

  describe("Validation Schemas", () => {
    test("updateFirmProfileSchema should validate valid profile payloads", () => {
      const payload = {
        name: "Updated Law Firm",
        website: "https://newfirm.com",
        phone: "+1555987654",
      };
      const result = updateFirmProfileSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("updateSettingsSchema should validate valid settings", () => {
      const payload = {
        timezone: "Europe/London",
        currency: "GBP",
        timeFormat: "24",
        defaultBillingRate: 350,
      };
      const result = updateSettingsSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("updateSettingsSchema should fail on invalid timeFormat value", () => {
      const payload = {
        timeFormat: "invalid-format",
      };
      const result = updateSettingsSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("updateBrandingSchema should validate valid branding settings", () => {
      const payload = {
        logoUrl: "https://mybucket.s3.amazonaws.com/logo.png",
        primaryColor: "#5520F0",
      };
      const result = updateBrandingSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("updateBrandingSchema should fail on invalid color format", () => {
      const payload = {
        primaryColor: "not-a-hex-color",
      };
      const result = updateBrandingSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Mongoose Model Mocks (Unit Tests)", () => {
    let originalFindById: any;
    let originalCreate: any;
    let originalFindByIdAndUpdate: any;

    before(() => {
      originalFindById = Firm.findById;
      originalCreate = Firm.create;
      originalFindByIdAndUpdate = Firm.findByIdAndUpdate;
    });

    after(() => {
      Firm.findById = originalFindById;
      Firm.create = originalCreate;
      Firm.findByIdAndUpdate = originalFindByIdAndUpdate;
    });

    test("Firm.findById mock return values", async () => {
      const mockId = new Types.ObjectId();
      Firm.findById = (id: any) => {
        return Promise.resolve({
          _id: mockId,
          name: "Find Mock Firm",
          legalName: "Find Mock Legal",
          displayName: "Find Mock Display",
          timezone: "UTC",
          currency: "USD",
          locale: "en",
          dateFormat: "YYYY-MM-DD",
          timeFormat: "24",
          defaultBillingRate: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as any;
      };

      const result = await Firm.findById(mockId.toString());
      assert.ok(result);
      assert.strictEqual(result!.name, "Find Mock Firm");
    });
  });
});
