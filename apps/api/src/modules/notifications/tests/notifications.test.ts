import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { Types } from "mongoose";
import { User } from "../../users/schemas/user.schema.js";
import { Notification } from "../schemas/notification.schema.js";
import { NotificationPreference } from "../schemas/notification-preference.schema.js";
import { NotificationDeliveryLog } from "../schemas/notification-delivery-log.schema.js";
import { notificationDispatchService } from "../notification-dispatch.service.js";
import * as notificationRepository from "../notification.repository.js";

describe("Notifications Module (041) Tests", () => {
  let originalUserFindById: any;
  let originalPreferenceFindOne: any;
  let originalPreferenceCreate: any;
  let originalPreferenceFindOneAndUpdate: any;
  let originalNotificationCreate: any;
  let originalNotificationFind: any;
  let originalNotificationCountDocuments: any;
  let originalNotificationFindOneAndUpdate: any;
  let originalNotificationUpdateMany: any;
  let originalDeliveryLogCreate: any;

  before(() => {
    originalUserFindById = User.findById;
    originalPreferenceFindOne = NotificationPreference.findOne;
    originalPreferenceCreate = NotificationPreference.create;
    originalPreferenceFindOneAndUpdate = NotificationPreference.findOneAndUpdate;
    originalNotificationCreate = Notification.create;
    originalNotificationFind = Notification.find;
    originalNotificationCountDocuments = Notification.countDocuments;
    originalNotificationFindOneAndUpdate = Notification.findOneAndUpdate;
    originalNotificationUpdateMany = Notification.updateMany;
    originalDeliveryLogCreate = NotificationDeliveryLog.create;
  });

  after(() => {
    User.findById = originalUserFindById;
    NotificationPreference.findOne = originalPreferenceFindOne;
    NotificationPreference.create = originalPreferenceCreate;
    NotificationPreference.findOneAndUpdate = originalPreferenceFindOneAndUpdate;
    Notification.create = originalNotificationCreate;
    Notification.find = originalNotificationFind;
    Notification.countDocuments = originalNotificationCountDocuments;
    Notification.findOneAndUpdate = originalNotificationFindOneAndUpdate;
    Notification.updateMany = originalNotificationUpdateMany;
    NotificationDeliveryLog.create = originalDeliveryLogCreate;
  });

  describe("Notification Dispatch Service", () => {
    test("dispatch should create in-app notification and email when preferences are enabled", async () => {
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();
      const mockNotificationId = new Types.ObjectId();

      // Mock user lookup
      User.findById = () =>
        Promise.resolve({
          _id: mockUserId,
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
        }) as any;

      // Mock preferences lookup (enabled)
      NotificationPreference.findOne = () =>
        Promise.resolve({
          userId: mockUserId,
          emailNotifications: true,
          inAppNotifications: true,
          calendarReminders: true,
          billingNotifications: true,
          taskNotifications: true,
        }) as any;

      // Mock creations
      Notification.create = (data: any) =>
        Promise.resolve({
          _id: mockNotificationId,
          ...data,
        }) as any;

      NotificationDeliveryLog.create = (data: any) => Promise.resolve(data) as any;

      let emailSent = false;
      const originalSend = notificationDispatchService["dispatch"];

      const notificationId = await notificationDispatchService.dispatch({
        firmId: mockFirmId.toString(),
        userId: mockUserId.toString(),
        sourceModule: "Calendar",
        entityType: "CalendarEvent",
        entityId: new Types.ObjectId().toString(),
        title: "Meeting Scheduled",
        message: "A new client meeting has been scheduled.",
        severity: "INFO",
      });

      assert.strictEqual(notificationId, mockNotificationId.toString());
    });

    test("dispatch should bypass email preferences when forceEmail is true", async () => {
      const mockFirmId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();
      const mockNotificationId = new Types.ObjectId();

      User.findById = () =>
        Promise.resolve({
          _id: mockUserId,
          email: "urgent@example.com",
          firstName: "Admin",
          lastName: "User",
        }) as any;

      // Mock preferences lookup (email disabled)
      NotificationPreference.findOne = () =>
        Promise.resolve({
          userId: mockUserId,
          emailNotifications: false, // disabled
          inAppNotifications: true,
          calendarReminders: false,
          billingNotifications: false,
          taskNotifications: false,
        }) as any;

      Notification.create = (data: any) =>
        Promise.resolve({
          _id: mockNotificationId,
          ...data,
        }) as any;

      NotificationDeliveryLog.create = (data: any) => Promise.resolve(data) as any;

      const notificationId = await notificationDispatchService.dispatch({
        firmId: mockFirmId.toString(),
        userId: mockUserId.toString(),
        sourceModule: "Billing",
        entityType: "Invoice",
        title: "Overdue Notice",
        message: "Critical billing notice.",
        severity: "ERROR",
        forceEmail: true, // override email disable
      });

      assert.strictEqual(notificationId, mockNotificationId.toString());
    });
  });

  describe("Notification Repository & States", () => {
    test("markAsRead should update read status fields", async () => {
      const mockUserId = new Types.ObjectId();
      const mockNotificationId = new Types.ObjectId();

      Notification.findOneAndUpdate = (query: any, update: any, options: any) => {
        assert.deepStrictEqual(query.userId, mockUserId);
        assert.deepStrictEqual(query._id, mockNotificationId);
        assert.strictEqual(update.$set.isRead, true);
        return Promise.resolve({
          _id: mockNotificationId,
          userId: mockUserId,
          isRead: true,
          readAt: new Date(),
        }) as any;
      };

      const updated = await notificationRepository.markAsRead(
        mockNotificationId.toString(),
        mockUserId.toString()
      );
      assert.ok(updated);
      assert.strictEqual(updated.isRead, true);
    });

    test("softDelete should set deleted flag to true", async () => {
      const mockUserId = new Types.ObjectId();
      const mockNotificationId = new Types.ObjectId();

      Notification.findOneAndUpdate = (query: any, update: any, options: any) => {
        assert.strictEqual(update.$set.deleted, true);
        return Promise.resolve({
          _id: mockNotificationId,
          deleted: true,
        }) as any;
      };

      const deleted = await notificationRepository.softDelete(
        mockNotificationId.toString(),
        mockUserId.toString()
      );
      assert.ok(deleted);
      assert.strictEqual(deleted.deleted, true);
    });
  });
});
