import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { CreateTimeEntrySchema, UpdateTimeEntrySchema, StartTimerSchema } from "../validations/time-entry.validation.js";
import { timeEntryService } from "../time-entry.service.js";
import { timerService } from "../timer.service.js";
import { TimeEntryModel } from "../schemas/time-entry.schema.js";
import { User } from "../../users/schemas/user.schema.js";

describe("Time Tracking Module (036) Tests", () => {
  let originalUserFindById: any;

  before(() => {
    originalUserFindById = User.findById;
    User.findById = () => {
      return Promise.resolve({ defaultHourlyRate: 150 }) as any;
    };
  });

  after(() => {
    User.findById = originalUserFindById;
  });
  describe("Validation Schemas", () => {
    test("CreateTimeEntrySchema should validate valid input parameters", () => {
      const payload = {
        body: {
          matterId: "507f1f77bcf86cd799439011",
          billingType: "BILLABLE",
          clientDescription: "Drafted plea agreement",
          durationMinutes: 45,
          date: new Date().toISOString(),
        },
      };
      const result = CreateTimeEntrySchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("CreateTimeEntrySchema should fail if durationMinutes is negative", () => {
      const payload = {
        body: {
          matterId: "507f1f77bcf86cd799439011",
          billingType: "BILLABLE",
          durationMinutes: -15,
        },
      };
      const result = CreateTimeEntrySchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("CreateTimeEntrySchema should fail if neither matterId nor clientId is provided", () => {
      const payload = {
        body: {
          billingType: "BILLABLE",
          durationMinutes: 30,
        },
      };
      const result = CreateTimeEntrySchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Billing Rules and Constraints", () => {
    test("updateEntry should fail if document is already billed", async () => {
      const firmId = new Types.ObjectId().toString();
      const entryId = new Types.ObjectId().toString();
      const mockEntry: any = {
        _id: new Types.ObjectId(entryId),
        firmId: new Types.ObjectId(firmId),
        userId: new Types.ObjectId(),
        durationMinutes: 60,
        billingType: "BILLABLE",
        hourlyRate: 150,
        isBilled: true,
        date: new Date(),
      };

      // Mock repository findById
      const originalFindOne = TimeEntryModel.findOne;
      TimeEntryModel.findOne = () => {
        return {
          populate: () => ({
            populate: () => ({
              populate: () => ({
                exec: () => Promise.resolve(mockEntry),
              }),
            }),
          }),
        } as any;
      };

      try {
        await timeEntryService.updateEntry(entryId, firmId, { durationMinutes: 120 });
        assert.fail("Should have thrown error on billed entry update");
      } catch (error: any) {
        assert.ok(error.message.includes("Cannot modify duration"));
      } finally {
        TimeEntryModel.findOne = originalFindOne;
      }
    });

    test("updateEntry should allow updating descriptions even on billed entry", async () => {
      const firmId = new Types.ObjectId().toString();
      const entryId = new Types.ObjectId().toString();
      const mockEntry: any = {
        _id: new Types.ObjectId(entryId),
        firmId: new Types.ObjectId(firmId),
        userId: new Types.ObjectId(),
        durationMinutes: 60,
        billingType: "BILLABLE",
        hourlyRate: 150,
        isBilled: true,
        date: new Date(),
      };

      const originalFindOne = TimeEntryModel.findOne;
      const originalFindOneAndUpdate = TimeEntryModel.findOneAndUpdate;
      
      TimeEntryModel.findOne = () => {
        return {
          populate: () => ({
            populate: () => ({
              populate: () => ({
                exec: () => Promise.resolve(mockEntry),
              }),
            }),
          }),
        } as any;
      };

      TimeEntryModel.findOneAndUpdate = () => {
        return {
          exec: () => Promise.resolve({ ...mockEntry, clientDescription: "Updated notes" }),
        } as any;
      };

      try {
        const result = await timeEntryService.updateEntry(entryId, firmId, { clientDescription: "Updated notes" });
        assert.strictEqual(result?.clientDescription, "Updated notes");
      } finally {
        TimeEntryModel.findOne = originalFindOne;
        TimeEntryModel.findOneAndUpdate = originalFindOneAndUpdate;
      }
    });
  });

  describe("Timer Lifecycle Actions", () => {
    test("startTimer should fail if user already has active timer", async () => {
      const firmId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const activeTimerMock: any = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        firmId: new Types.ObjectId(firmId),
        timerStatus: "RUNNING",
      };

      const originalFindOne = TimeEntryModel.findOne;
      TimeEntryModel.findOne = () => {
        return {
          exec: () => Promise.resolve(activeTimerMock),
        } as any;
      };

      try {
        await timerService.startTimer(firmId, userId, { matterId: "507f1f77bcf86cd799439011" });
        assert.fail("Should have thrown error due to active timer");
      } catch (error: any) {
        assert.ok(error.message.includes("active timer"));
      } finally {
        TimeEntryModel.findOne = originalFindOne;
      }
    });
  });
});
