import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { Intake, IntakeNote, IntakeAttachment } from "../schemas/intake.schema.js";
import { formatIntake, formatNote, formatAttachment } from "../intake.service.js";
import { convertToLead } from "../intake.conversion.service.js";
import { assignIntake } from "../intake.assignment.service.js";
import { updateStatus } from "../intake.service.js";
import * as userService from "../../users/service/user.service.js";
import { User } from "../../users/schemas/user.schema.js";
import { Lead, LeadActivity } from "../../leads/schemas/lead.schema.js";
import {
  createIntakeSchema,
  updateStatusSchema,
  addNoteSchema,
} from "../intake.validation.js";

describe("Intake Module (020) Tests", () => {
  describe("Formatting Utilities", () => {
    test("should correctly format a mock IntakeDocument", () => {
      const mockIntakeId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();
      const now = new Date();

      const mockIntake = {
        _id: mockIntakeId,
        firmId: mockFirmId,
        intakeNumber: "ITK-202606-1234",
        source: "WEBSITE",
        status: "NEW",
        firstName: "Alice",
        lastName: "Smith",
        subject: "General Consultation",
        createdAt: now,
        updatedAt: now,
        createdBy: mockUserId,
      } as any;

      const formatted = formatIntake(mockIntake);
      assert.strictEqual(formatted.id, mockIntakeId.toString());
      assert.strictEqual(formatted.firmId, mockFirmId.toString());
      assert.strictEqual(formatted.intakeNumber, "ITK-202606-1234");
      assert.strictEqual(formatted.firstName, "Alice");
      assert.strictEqual(formatted.status, "NEW");
    });
  });

  describe("Validation Schemas", () => {
    test("createIntakeSchema should validate valid input", () => {
      const payload = {
        firstName: "John",
        lastName: "Doe",
        subject: "Need contract review",
        source: "PHONE",
      };
      const result = createIntakeSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createIntakeSchema should reject missing required fields", () => {
      const payload = {
        firstName: "John",
        source: "PHONE",
      };
      const result = createIntakeSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("updateStatusSchema should validate status values", () => {
      const payload = {
        status: "IN_REVIEW",
      };
      const result = updateStatusSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });
  });

  describe("Lifecycle & Operations unit checks", () => {
    let originalFindOne: any;
    let originalFindOneAndUpdate: any;
    let originalUserFindById: any;
    let originalLeadCreate: any;
    let originalLeadActivityCreate: any;

    before(() => {
      originalFindOne = Intake.findOne;
      originalFindOneAndUpdate = Intake.findOneAndUpdate;
      originalUserFindById = User.findById;
      originalLeadCreate = Lead.create;
      originalLeadActivityCreate = LeadActivity.create;
    });

    after(() => {
      Intake.findOne = originalFindOne;
      Intake.findOneAndUpdate = originalFindOneAndUpdate;
      User.findById = originalUserFindById;
      Lead.create = originalLeadCreate;
      LeadActivity.create = originalLeadActivityCreate;
    });

    test("convertToLead should set status to CONVERTED and generate lead reference ID", async () => {
      const mockId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();

      const mockDoc = {
        _id: mockId,
        firmId: mockFirmId,
        intakeNumber: "ITK-202606-9999",
        status: "QUALIFIED",
        firstName: "Alice",
        lastName: "Smith",
        subject: "Intake Subject",
        assignedTo: new Types.ObjectId(),
        createdBy: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      Intake.findOne = () => {
        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => Promise.resolve(mockDoc).then(resolve),
        };
        return queryMock as any;
      };

      Intake.findOneAndUpdate = (query: any, updateObj: any, options: any) => {
        const setObj = updateObj.$set;
        mockDoc.status = setObj.status;
        mockDoc.convertedLeadId = setObj.convertedLeadId;
        mockDoc.convertedAt = setObj.convertedAt;

        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => Promise.resolve(mockDoc).then(resolve),
        };
        return queryMock as any;
      };

      // Mock Lead creation and Activity logging
      const mockCreatedLeadId = new Types.ObjectId();
      Lead.create = (doc: any) => {
        return Promise.resolve({
          _id: mockCreatedLeadId,
          createdAt: new Date(),
          ...doc,
        }) as any;
      };
      LeadActivity.create = () => Promise.resolve({}) as any;

      const result = await convertToLead(mockId.toString(), mockFirmId.toString());
      assert.strictEqual(result.status, "CONVERTED");
      assert.ok(result.convertedLeadId);
    });

    test("assignIntake should fail if target user does not belong to same firm", async () => {
      const mockId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const targetUserId = new Types.ObjectId();

      const mockDoc = {
        _id: mockId,
        firmId: mockFirmId,
        status: "NEW",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Intake.findOne = () => {
        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) => Promise.resolve(mockDoc).then(resolve),
        };
        return queryMock as any;
      };

      User.findById = (id: any) => {
        return Promise.resolve({
          _id: targetUserId,
          firmId: new Types.ObjectId(), // Different firm ID!
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          displayName: "Other User",
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
        await assignIntake(mockId.toString(), mockFirmId.toString(), targetUserId.toString());
        assert.fail("Should have thrown firm mismatch error.");
      } catch (err: any) {
        assert.ok(err.message.includes("another firm"));
      }
    });
  });
});
