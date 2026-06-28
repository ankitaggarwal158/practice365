import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { ConflictCheck } from "../schemas/conflict-check.schema.js";
import { formatConflictCheck } from "../conflict-check.service.js";
import { computeSimilarity } from "../name-matching.service.js";
import { executeConflictCheck, recordDecision, manualConflictSearch } from "../conflict-check.service.js";
import { Lead } from "../../leads/schemas/lead.schema.js";
import {
  executeCheckSchema,
  manualSearchSchema,
  reviewDecisionSchema,
} from "../conflict-check.validation.js";

describe("Conflict Check Module (022) Tests", () => {
  describe("Name Similarity Computations", () => {
    test("should return 1.0 for identical string values", () => {
      const score = computeSimilarity("John Doe", "John Doe");
      assert.strictEqual(score, 1.0);
    });

    test("should match tokenized names with high similarity", () => {
      const score = computeSimilarity("John A. Smith", "John Smith");
      assert.ok(score >= 0.7);
    });

    test("should return 0.0 for completely different tokens", () => {
      const score = computeSimilarity("John Stark", "Tony Wayne");
      assert.strictEqual(score, 0.0);
    });
  });

  describe("Validation Schemas", () => {
    test("executeCheckSchema should validate valid Lead ObjectId", () => {
      const payload = { leadId: new Types.ObjectId().toString() };
      const result = executeCheckSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("manualSearchSchema should fail on completely empty query parameters", () => {
      const payload = {};
      const result = manualSearchSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("reviewDecisionSchema should reject invalid status type", () => {
      const payload = { decision: "FINISHED" };
      const result = reviewDecisionSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Operations & Business Locks", () => {
    let originalLeadFindOne: any;
    let originalLeadFind: any;
    let originalConflictCreate: any;
    let originalConflictFindOne: any;
    let originalConflictFindOneAndUpdate: any;

    before(() => {
      originalLeadFindOne = Lead.findOne;
      originalLeadFind = Lead.find;
      originalConflictCreate = ConflictCheck.create;
      originalConflictFindOne = ConflictCheck.findOne;
      originalConflictFindOneAndUpdate = ConflictCheck.findOneAndUpdate;
    });

    after(() => {
      Lead.findOne = originalLeadFindOne;
      Lead.find = originalLeadFind;
      ConflictCheck.create = originalConflictCreate;
      ConflictCheck.findOne = originalConflictFindOne;
      ConflictCheck.findOneAndUpdate = originalConflictFindOneAndUpdate;
    });

    test("executeConflictCheck should run search criteria and save results in DB", async () => {
      const mockLeadId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const mockLead = {
        _id: mockLeadId,
        firmId: mockFirmId,
        firstName: "Wayne",
        lastName: "Bruce",
        companyName: "Wayne Enterprises",
        email: "bruce@waynecorp.com",
      };

      Lead.findOne = () => Promise.resolve(mockLead) as any;
      Lead.find = () => Promise.resolve([]) as any;

      ConflictCheck.create = (doc: any) => {
        return Promise.resolve({
          _id: new Types.ObjectId(),
          createdAt: new Date(),
          ...doc,
        }) as any;
      };

      ConflictCheck.findOne = () => {
        const queryMock = {
          populate: () => queryMock,
          then: (resolve: any) =>
            Promise.resolve({
              _id: new Types.ObjectId(),
              firmId: mockFirmId,
              leadId: mockLeadId,
              requestedBy: mockUserId,
              overallResult: "CONFIRMED_CONFLICT",
              finalDecision: "PENDING",
              createdAt: new Date(),
              matches: [],
            }).then(resolve),
        };
        return queryMock as any;
      };

      const result = await executeConflictCheck(mockFirmId.toString(), mockUserId.toString(), {
        leadId: mockLeadId.toString(),
      });

      assert.strictEqual(result.overallResult, "CONFIRMED_CONFLICT");
      assert.strictEqual(result.finalDecision, "PENDING");
    });

    test("recordDecision should fail and lock updates if decision is already cleared", async () => {
      const mockCheckId = new Types.ObjectId();
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const mockCheck = {
        _id: mockCheckId,
        firmId: mockFirmId,
        finalDecision: "CLEARED", // Already finalized!
      };

      ConflictCheck.findOne = () => Promise.resolve(mockCheck) as any;

      try {
        await recordDecision(mockCheckId.toString(), mockFirmId.toString(), mockUserId.toString(), {
          decision: "REJECTED",
        });
        assert.fail("Should have thrown error on locked check");
      } catch (err: any) {
        assert.ok(err.message.includes("immutable"));
      }
    });
  });
});
