import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { formatEvent } from "../calendar.controller.js";
import {
  createEventSchema,
  updateEventSchema,
  completeEventSchema,
} from "../calendar.validation.js";
import { reconcileOverdueEvent, createEvent, updateEvent, completeEvent } from "../calendar.service.js";
import { CalendarEvent } from "../schemas/calendar-event.schema.js";

describe("Calendar Module (034) Tests", () => {
  describe("Validation Schemas", () => {
    test("createEventSchema should validate valid input parameters", () => {
      const payload = {
        title: "Court Hearing",
        eventType: "HEARING",
        startDateTime: "2026-07-02T10:00:00.000Z",
        endDateTime: "2026-07-02T11:00:00.000Z",
        reminderOffsets: [15, 60],
        status: "UPCOMING",
      };
      const result = createEventSchema.safeParse(payload);
      assert.strictEqual(result.success, true);
    });

    test("createEventSchema should fail if endDateTime is before startDateTime", () => {
      const payload = {
        title: "Invalid Hearing",
        eventType: "HEARING",
        startDateTime: "2026-07-02T12:00:00.000Z",
        endDateTime: "2026-07-02T11:00:00.000Z",
      };
      const result = createEventSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });

    test("createEventSchema should fail if eventType is invalid", () => {
      const payload = {
        title: "Bad Event Type",
        eventType: "INVALID_ENUM_VALUE",
        startDateTime: "2026-07-02T10:00:00.000Z",
        endDateTime: "2026-07-02T11:00:00.000Z",
      };
      const result = createEventSchema.safeParse(payload);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Overdue Status Reconciliation", () => {
    test("reconcileOverdueEvent should change status of upcoming overdue events to MISSED", async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      
      const eventMock: any = {
        _id: new Types.ObjectId(),
        status: "UPCOMING",
        endDateTime: pastDate,
      };

      // Mock findByIdAndUpdate to return updated document
      const originalFindByIdAndUpdate = CalendarEvent.findByIdAndUpdate;
      CalendarEvent.findByIdAndUpdate = () => {
        return {
          populate: () => ({
            populate: () => ({
              populate: () => ({
                exec: () => Promise.resolve({
                  ...eventMock,
                  status: "MISSED",
                }),
              }),
            }),
          }),
        } as any;
      };

      const reconciled = await reconcileOverdueEvent(eventMock);
      assert.strictEqual(reconciled.status, "MISSED");

      CalendarEvent.findByIdAndUpdate = originalFindByIdAndUpdate;
    });

    test("reconcileOverdueEvent should not change status of upcoming future events", async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const eventMock: any = {
        _id: new Types.ObjectId(),
        status: "UPCOMING",
        endDateTime: futureDate,
      };

      const reconciled = await reconcileOverdueEvent(eventMock);
      assert.strictEqual(reconciled.status, "UPCOMING");
    });
  });

  describe("Authorization Security Rules & Service", () => {
    let originalFindOne: any;
    let originalCreate: any;
    let originalFindByIdAndUpdate: any;

    before(() => {
      originalFindOne = CalendarEvent.findOne;
      originalCreate = CalendarEvent.create;
      originalFindByIdAndUpdate = CalendarEvent.findByIdAndUpdate;
    });

    after(() => {
      CalendarEvent.findOne = originalFindOne;
      CalendarEvent.create = originalCreate;
      CalendarEvent.findByIdAndUpdate = originalFindByIdAndUpdate;
    });

    test("should complete event successfully and change status", async () => {
      const eventId = new Types.ObjectId().toString();
      const firmId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      CalendarEvent.findOne = () => {
        return {
          populate: () => ({
            populate: () => ({
              populate: () => ({
                exec: () => Promise.resolve({
                  _id: new Types.ObjectId(eventId),
                  firmId: new Types.ObjectId(firmId),
                  status: "UPCOMING",
                }),
              }),
            }),
          }),
        } as any;
      };

      CalendarEvent.findOneAndUpdate = () => {
        return {
          populate: () => ({
            populate: () => ({
              populate: () => ({
                exec: () => Promise.resolve({
                  _id: new Types.ObjectId(eventId),
                  firmId: new Types.ObjectId(firmId),
                  status: "COMPLETED",
                  completedAt: new Date(),
                  completedBy: new Types.ObjectId(userId),
                }),
              }),
            }),
          }),
        } as any;
      };

      const completed = await completeEvent(eventId, firmId, userId, "COMPLETED");
      assert.strictEqual(completed.status, "COMPLETED");
    });
  });
});
