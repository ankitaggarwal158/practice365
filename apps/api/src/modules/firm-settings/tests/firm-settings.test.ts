import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { updateFirmSettingsSchema } from "../firm-settings.validation.js";
import { numberSequenceService, ensureSettingsInitialized } from "../number-sequence.service.js";
import { uploadLogo } from "../logo-upload.service.js";
import { FirmSettings } from "../schemas/firm-settings.schema.js";
import { Firm } from "../../firm/schemas/firm.schema.js";

describe("Firm Settings Module (043) Tests", () => {
  describe("Zod Validation Schemas", () => {
    test("updateFirmSettingsSchema should validate valid input parameters", () => {
      const payload = {
        timezone: "America/New_York",
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12_HOUR",
        matterNumberPrefix: "CASE-",
        matterNextNumber: 2000,
        primaryColor: "#FF5733",
        secondaryColor: "#000",
      };
      const result = updateFirmSettingsSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("updateFirmSettingsSchema should fail on invalid time format", () => {
      const payload = {
        timeFormat: "12", // should be "12_HOUR" or "24_HOUR"
      };
      const result = updateFirmSettingsSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("updateFirmSettingsSchema should fail on invalid color code", () => {
      const payload = {
        primaryColor: "blue",
      };
      const result = updateFirmSettingsSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Atomic Number Sequences", () => {
    let originalFindOne: any;
    let originalFindById: any;
    let originalCreate: any;

    before(() => {
      originalFindOne = FirmSettings.findOne;
      originalFindById = Firm.findById;
      originalCreate = FirmSettings.create;
    });

    after(() => {
      FirmSettings.findOne = originalFindOne;
      Firm.findById = originalFindById;
      FirmSettings.create = originalCreate;
    });

    test("should atomically generate sequential numbers for matter, client, and invoice", async () => {
      const firmId = new Types.ObjectId().toString();
      
      const mockSettings = {
        _id: new Types.ObjectId(),
        firmId: new Types.ObjectId(firmId),
        matterNumberPrefix: "CASE-",
        matterNextNumber: 5000,
        clientNumberPrefix: "CLI-",
        clientNextNumber: 10,
        invoiceNumberPrefix: "BILL-",
        invoiceNextNumber: 100,
      };

      // Mock DB find/upsert flow
      FirmSettings.findOne = () => ({ exec: () => Promise.resolve(mockSettings) }) as any;
      Firm.findById = () => ({ exec: () => Promise.resolve({ logoUrl: "http://logo.url" }) }) as any;
      
      // Mock findOneAndUpdate for Matter
      let callCount = 0;
      FirmSettings.findOneAndUpdate = (query: any, update: any) => {
        callCount++;
        const incField = Object.keys(update.$inc)[0];
        const val = mockSettings[incField as keyof typeof mockSettings] as number;
        // Mock increment
        const nextVal = val + 1;
        return {
          exec: () => Promise.resolve({
            ...mockSettings,
            [incField]: nextVal,
          }),
        } as any;
      };

      const matterNum = await numberSequenceService.generateMatterNumber(firmId);
      assert.strictEqual(matterNum, "CASE-5000");

      const clientNum = await numberSequenceService.generateClientNumber(firmId);
      assert.strictEqual(clientNum, "CLI-10");

      const invoiceNum = await numberSequenceService.generateInvoiceNumber(firmId);
      assert.strictEqual(invoiceNum, "BILL-000100");
    });
  });

  describe("Logo File Upload Service", () => {
    test("should fail logo validation when file size exceeds 2MB limit", async () => {
      const firmId = new Types.ObjectId().toString();
      const largeFile = {
        size: 3 * 1024 * 1024, // 3MB
        mimetype: "image/png",
        originalname: "logo.png",
        buffer: Buffer.from("dummy-large-buffer"),
      } as Express.Multer.File;

      try {
        await uploadLogo(firmId, largeFile);
        assert.fail("Should have failed for large size");
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Logo image size must be less than 2MB.");
      }
    });

    test("should fail logo validation when file type is not image", async () => {
      const firmId = new Types.ObjectId().toString();
      const textFile = {
        size: 1000,
        mimetype: "text/plain",
        originalname: "malicious.sh",
        buffer: Buffer.from("echo 'hello'"),
      } as Express.Multer.File;

      try {
        await uploadLogo(firmId, textFile);
        assert.fail("Should have failed for invalid mimetype");
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Only JPEG, PNG, GIF, and WEBP image files are allowed.");
      }
    });
  });
});
