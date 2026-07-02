import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { formatMatterContact, formatContactLink } from "../matter-contact.controller.js";
import {
  createMatterContactSchema,
  updateMatterContactSchema,
  linkMattersSchema,
  checkDuplicatesSchema,
} from "../matter-contact.validation.js";
import { detectDuplicates } from "../duplicate-detection.service.js";
import { MatterContact } from "../schemas/matter-contact.schema.js";

describe("Matter Contacts Module (032) Tests", () => {
  describe("formatMatterContact Utility", () => {
    test("should correctly format a mock MatterContact document", () => {
      const mockId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const now = new Date();

      const mockContact = {
        _id: mockId,
        firmId: mockFirmId,
        contactType: "INDIVIDUAL",
        firstName: "Clark",
        lastName: "Kent",
        organizationName: "",
        email: "clark@dailyplanet.com",
        phone: "+15551112222",
        alternatePhone: "",
        website: "",
        addressLine1: "344 Clinton St",
        addressLine2: "Apt 3B",
        city: "Metropolis",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        notes: "Reporter friend.",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      } as any;

      const formatted = formatMatterContact(mockContact);

      assert.strictEqual(formatted.id, mockId.toString());
      assert.strictEqual(formatted.firmId, mockFirmId.toString());
      assert.strictEqual(formatted.contactType, "INDIVIDUAL");
      assert.strictEqual(formatted.firstName, "Clark");
      assert.strictEqual(formatted.lastName, "Kent");
      assert.strictEqual(formatted.email, "clark@dailyplanet.com");
      assert.strictEqual(formatted.city, "Metropolis");
      assert.strictEqual(formatted.isActive, true);
    });
  });

  describe("Validation Schemas", () => {
    test("createMatterContactSchema should validate valid INDIVIDUAL payload", () => {
      const payload = {
        contactType: "INDIVIDUAL",
        firstName: "Bruce",
        lastName: "Wayne",
        email: "bruce@waynecorp.com",
      };
      const result = createMatterContactSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createMatterContactSchema should fail on invalid email format", () => {
      const payload = {
        contactType: "INDIVIDUAL",
        firstName: "Bruce",
        lastName: "Wayne",
        email: "invalid-email-string",
      };
      const result = createMatterContactSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("createMatterContactSchema should validate valid ORGANIZATION payload", () => {
      const payload = {
        contactType: "ORGANIZATION",
        organizationName: "Wayne Enterprises",
        website: "https://waynecorp.com",
      };
      const result = createMatterContactSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("updateMatterContactSchema should validate updates", () => {
      const payload = {
        firstName: "Alfred",
        lastName: "Pennyworth",
        notes: "Butler.",
      };
      const result = updateMatterContactSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("linkMattersSchema should validate contacts array list", () => {
      const payload = {
        contacts: [
          {
            contactId: new Types.ObjectId().toString(),
            role: "WITNESS",
          },
          {
            contactId: new Types.ObjectId().toString(),
            role: "EXPERT_WITNESS",
          },
        ],
      };
      const result = linkMattersSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("linkMattersSchema should fail if role is invalid", () => {
      const payload = {
        contacts: [
          {
            contactId: new Types.ObjectId().toString(),
            role: "INVALID_ROLE_ENUM",
          },
        ],
      };
      const result = linkMattersSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Duplicate Detection Logic", () => {
    let originalFind: any;

    before(() => {
      originalFind = (MatterContact as any).find;
    });

    after(() => {
      (MatterContact as any).find = originalFind;
    });

    test("should detect duplicate contacts by name match", async () => {
      const firmId = new Types.ObjectId().toString();
      const mockId = new Types.ObjectId();

      (MatterContact as any).find = (query: any) => {
        return {
          exec: () => Promise.resolve([
            {
              _id: mockId,
              firmId: new Types.ObjectId(firmId),
              contactType: "INDIVIDUAL",
              firstName: "Bruce",
              lastName: "Wayne",
              email: "bruce@waynecorp.com",
              phone: "+15551234567",
              isActive: true,
              deleted: false,
            },
          ])
        } as any;
      };

      const result = await detectDuplicates(firmId, {
        contactType: "INDIVIDUAL",
        firstName: "Bruce",
        lastName: "Wayne",
        email: "bruce@waynecorp.com",
      });

      assert.strictEqual(result.hasDuplicates, true);
      assert.strictEqual(result.duplicates.length, 1);
      assert.strictEqual(result.duplicates[0].id, mockId.toString());
      assert.ok(result.duplicates[0].matchReasons.includes("Full Name matches exactly"));
      assert.ok(result.duplicates[0].matchReasons.includes("Email Address matches exactly"));
    });
  });
});
