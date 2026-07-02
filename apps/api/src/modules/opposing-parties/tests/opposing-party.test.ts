import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { formatOpposingParty, formatAssociation } from "../opposing-party.controller.js";
import {
  createOpposingPartySchema,
  updateOpposingPartySchema,
  linkMatterSchema,
  checkDuplicatesSchema,
} from "../opposing-party.validation.js";
import { detectDuplicates } from "../duplicate-detection.service.js";
import { OpposingParty } from "../schemas/opposing-party.schema.js";

describe("Opposing Parties Module (031) Tests", () => {
  describe("formatOpposingParty Utility", () => {
    test("should correctly format a mock OpposingParty document", () => {
      const mockId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const now = new Date();

      const mockParty = {
        _id: mockId,
        firmId: mockFirmId,
        partyType: "INDIVIDUAL",
        firstName: "Lex",
        lastName: "Luthor",
        organizationName: "",
        email: "lex@lexcorp.com",
        phone: "+15556667777",
        alternatePhone: "",
        website: "https://lexcorp.com",
        addressLine1: "1 Lex Towers",
        addressLine2: "",
        city: "Metropolis",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        notes: "Keep close watch.",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      } as any;

      const formatted = formatOpposingParty(mockParty);

      assert.strictEqual(formatted.id, mockId.toString());
      assert.strictEqual(formatted.firmId, mockFirmId.toString());
      assert.strictEqual(formatted.partyType, "INDIVIDUAL");
      assert.strictEqual(formatted.firstName, "Lex");
      assert.strictEqual(formatted.lastName, "Luthor");
      assert.strictEqual(formatted.email, "lex@lexcorp.com");
      assert.strictEqual(formatted.website, "https://lexcorp.com");
      assert.strictEqual(formatted.city, "Metropolis");
      assert.strictEqual(formatted.isActive, true);
    });
  });

  describe("Validation Schemas", () => {
    test("createOpposingPartySchema should validate valid INDIVIDUAL payload", () => {
      const payload = {
        partyType: "INDIVIDUAL",
        firstName: "Clark",
        lastName: "Kent",
        email: "clark@dailyplanet.com",
      };
      const result = createOpposingPartySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createOpposingPartySchema should fail on invalid email format", () => {
      const payload = {
        partyType: "INDIVIDUAL",
        firstName: "Clark",
        lastName: "Kent",
        email: "invalid-email",
      };
      const result = createOpposingPartySchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("createOpposingPartySchema should validate valid ORGANIZATION payload", () => {
      const payload = {
        partyType: "ORGANIZATION",
        organizationName: "Wayne Enterprises",
        website: "https://waynecorp.com",
      };
      const result = createOpposingPartySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("updateOpposingPartySchema should validate updates", () => {
      const payload = {
        firstName: "Obadiah",
        lastName: "Stane",
        notes: "Modified notes.",
      };
      const result = updateOpposingPartySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("linkMatterSchema should validate opposingPartyIds list", () => {
      const payload = {
        opposingPartyIds: [new Types.ObjectId().toString(), new Types.ObjectId().toString()],
      };
      const result = linkMatterSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("linkMatterSchema should fail if input contains invalid ObjectIds", () => {
      const payload = {
        opposingPartyIds: ["not-a-valid-id"],
      };
      const result = linkMatterSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Duplicate Detection Service Logic", () => {
    let originalFind: any;

    before(() => {
      originalFind = (OpposingParty as any).find;
    });

    after(() => {
      (OpposingParty as any).find = originalFind;
    });

    test("should detect exact match duplicate by email", async () => {
      const firmId = new Types.ObjectId().toString();
      const mockId = new Types.ObjectId();
      
      (OpposingParty as any).find = (query: any) => {
        return {
          exec: () => Promise.resolve([
            {
              _id: mockId,
              firmId: new Types.ObjectId(firmId),
              partyType: "INDIVIDUAL",
              firstName: "Lex",
              lastName: "Luthor",
              email: "lex@lexcorp.com",
              phone: "+15556667777",
              isActive: true,
              deleted: false,
            },
          ])
        } as any;
      };

      const result = await detectDuplicates(firmId, {
        partyType: "INDIVIDUAL",
        firstName: "Lex",
        lastName: "Luthor",
        email: "lex@lexcorp.com",
      });

      assert.strictEqual(result.hasDuplicates, true);
      assert.strictEqual(result.duplicates.length, 1);
      assert.strictEqual(result.duplicates[0].id, mockId.toString());
      assert.ok(result.duplicates[0].matchReasons.includes("Email Address matches exactly"));
      assert.ok(result.duplicates[0].matchReasons.includes("Full Name matches exactly"));
    });
  });
});
