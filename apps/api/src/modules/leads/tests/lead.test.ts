import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { Lead, LeadNote, LeadActivity, LeadAttachment } from "../schemas/lead.schema.js";
import { formatLead, formatNote, formatAttachment } from "../lead.service.js";
import { convertLead } from "../lead.conversion.service.js";
import { assignLead } from "../lead.assignment.service.js";
import * as userService from "../../users/service/user.service.js";
import { User } from "../../users/schemas/user.schema.js";
import { ConflictCheck } from "../../conflict-check/schemas/conflict-check.schema.js";
import { Client } from "../../clients/schemas/client.schema.js";
import {
  createLeadSchema,
  changeStatusSchema,
  addNoteSchema,
} from "../lead.validation.js";

describe("Lead Management Module (021) Tests", () => {
  describe("Formatting Utilities", () => {
    test("should correctly format a mock LeadDocument", () => {
      const mockLeadId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockOwnerId = new Types.ObjectId();
      const now = new Date();

      const mockLead = {
        _id: mockLeadId,
        firmId: mockFirmId,
        leadNumber: "LED-202606-5555",
        ownerId: mockOwnerId,
        status: "NEW",
        source: "MANUAL",
        firstName: "Robert",
        lastName: "Downey",
        subject: "Contract Negotiation",
        createdAt: now,
        updatedAt: now,
      } as any;

      const formatted = formatLead(mockLead);
      assert.strictEqual(formatted.id, mockLeadId.toString());
      assert.strictEqual(formatted.firmId, mockFirmId.toString());
      assert.strictEqual(formatted.leadNumber, "LED-202606-5555");
      assert.strictEqual(formatted.firstName, "Robert");
      assert.strictEqual(formatted.status, "NEW");
    });
  });

  describe("Validation Schemas", () => {
    test("createLeadSchema should validate valid input", () => {
      const payload = {
        firstName: "Tony",
        lastName: "Stark",
        subject: "IP Protection Consult",
      };
      const result = createLeadSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createLeadSchema should reject missing subject", () => {
      const payload = {
        firstName: "Tony",
        lastName: "Stark",
      };
      const result = createLeadSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("changeStatusSchema should validate status types", () => {
      const payload = {
        status: "CONSULTATION_SCHEDULED",
        consultationDate: new Date().toISOString(),
      };
      const result = changeStatusSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

  describe("Operations & Lifecycle Checks", () => {
    let originalFindOne: any;
    let originalFindOneAndUpdate: any;
    let originalUserFindById: any;
    let originalActivityCreate: any;
    let originalConflictFindOne: any;
    let originalClientCreate: any;

    before(() => {
      originalFindOne = Lead.findOne;
      originalFindOneAndUpdate = Lead.findOneAndUpdate;
      originalUserFindById = User.findById;
      originalActivityCreate = LeadActivity.create;
      originalConflictFindOne = ConflictCheck.findOne;
      originalClientCreate = Client.create;
    });

    after(() => {
      Lead.findOne = originalFindOne;
      Lead.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalUserFindById;
      LeadActivity.create = originalActivityCreate;
      ConflictCheck.findOne = originalConflictFindOne;
      Client.create = originalClientCreate;
    });

    test("convertLead should transition status to CONVERTED and mock Client ID", async () => {
      const mockId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const mockDoc = {
        _id: mockId,
        firmId: mockFirmId,
        status: "QUALIFIED",
        ownerId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      Lead.findOne = () => {
        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => Promise.resolve(mockDoc).then(resolve),
        };
        return queryMock as any;
      };

      ConflictCheck.findOne = () => {
        const queryMock = {
          sort: () => queryMock,
          then: (resolve: any) => Promise.resolve({ finalDecision: "CLEARED" }).then(resolve),
        };
        return queryMock as any;
      };

      Client.create = (doc: any) => {
        return Promise.resolve({
          _id: new Types.ObjectId(),
          ...doc,
        }) as any;
      };

      Lead.findOneAndUpdate = (query: any, updateObj: any, options: any) => {
        const setObj = updateObj.$set;
        mockDoc.status = setObj.status;
        mockDoc.convertedClientId = setObj.convertedClientId;
        mockDoc.convertedAt = setObj.convertedAt;

        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => Promise.resolve(mockDoc).then(resolve),
        };
        return queryMock as any;
      };

      LeadActivity.create = () => Promise.resolve({}) as any;

      const result = await convertLead(mockId.toString(), mockFirmId.toString(), mockUserId.toString());
      assert.strictEqual(result.status, "CONVERTED");
      assert.ok(result.convertedClientId);
    });

    test("assignLead should throw firm mismatch if owner user is from different firm", async () => {
      const mockId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();
      const targetOwnerId = new Types.ObjectId();

      const mockDoc = {
        _id: mockId,
        firmId: mockFirmId,
        status: "NEW",
        ownerId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Lead.findOne = () => {
        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => Promise.resolve(mockDoc).then(resolve),
        };
        return queryMock as any;
      };

      User.findById = (id: any) => {
        return Promise.resolve({
          _id: targetOwnerId,
          firmId: new Types.ObjectId(), // Different firm ID!
          firstName: "Other",
          lastName: "Lawyer",
          email: "other@example.com",
          displayName: "Other",
          phone: "",
          avatarUrl: "",
          jobTitle: "",
          status: "ACTIVE",
          timezone: "UTC",
          language: "en",
          dateFormat: "YYYY-MM-DD",
          timeFormat: "24",
          notificationPreferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as any;
      };

      try {
        await assignLead(mockId.toString(), mockFirmId.toString(), mockUserId.toString(), targetOwnerId.toString());
        assert.fail("Should fail cross-firm assignments");
      } catch (err: any) {
        assert.ok(err.message.includes("another firm"));
      }
    });
  });
});
