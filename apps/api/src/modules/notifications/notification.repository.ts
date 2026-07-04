import { Types } from "mongoose";
import { Notification } from "./schemas/notification.schema.js";
import { NotificationPreference } from "./schemas/notification-preference.schema.js";
import { NotificationDeliveryLog } from "./schemas/notification-delivery-log.schema.js";
import {
  NotificationDocument,
  NotificationPreferenceDocument,
  NotificationDeliveryLogDocument,
} from "./notification.types.js";

// ─── Notification Operations ──────────────────────────────────

export async function findNotifications(
  firmId: string,
  userId: string,
  filters: {
    page: number;
    limit: number;
    isRead?: boolean;
  }
): Promise<{
  data: NotificationDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const query: any = {
    firmId: new Types.ObjectId(firmId),
    userId: new Types.ObjectId(userId),
    deleted: { $ne: true },
  };

  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }

  const total = await Notification.countDocuments(query);
  const data = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((filters.page - 1) * filters.limit)
    .limit(filters.limit);

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit),
    },
  };
}

export async function findById(
  id: string,
  userId: string
): Promise<NotificationDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
  return Notification.findOne({
    _id: new Types.ObjectId(id),
    userId: new Types.ObjectId(userId),
    deleted: { $ne: true },
  });
}

export async function markAsRead(
  id: string,
  userId: string
): Promise<NotificationDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
  return Notification.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      deleted: { $ne: true },
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    { new: true }
  );
}

export async function markAllAsRead(
  firmId: string,
  userId: string
): Promise<void> {
  await Notification.updateMany(
    {
      firmId: new Types.ObjectId(firmId),
      userId: new Types.ObjectId(userId),
      isRead: false,
      deleted: { $ne: true },
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );
}

export async function softDelete(
  id: string,
  userId: string
): Promise<NotificationDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
  return Notification.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      deleted: { $ne: true },
    },
    {
      $set: {
        deleted: true,
      },
    },
    { new: true }
  );
}

export async function createNotification(
  data: any
): Promise<NotificationDocument> {
  return Notification.create(data);
}

// ─── Preferences Operations ───────────────────────────────────

export async function findPreferencesByUserId(
  userId: string
): Promise<NotificationPreferenceDocument | null> {
  if (!Types.ObjectId.isValid(userId)) return null;
  return NotificationPreference.findOne({
    userId: new Types.ObjectId(userId),
  });
}

export async function createPreferences(
  data: any
): Promise<NotificationPreferenceDocument> {
  return NotificationPreference.create(data);
}

export async function updatePreferences(
  userId: string,
  data: any
): Promise<NotificationPreferenceDocument | null> {
  if (!Types.ObjectId.isValid(userId)) return null;
  return NotificationPreference.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { $set: data },
    { new: true, upsert: true }
  );
}

// ─── Delivery Log Operations ──────────────────────────────────

export async function createDeliveryLog(
  data: {
    notificationId: string;
    deliveryType: "IN_APP" | "EMAIL";
    status: "PENDING" | "DELIVERED" | "FAILED";
    failureReason?: string;
  }
): Promise<NotificationDeliveryLogDocument> {
  return NotificationDeliveryLog.create({
    notificationId: new Types.ObjectId(data.notificationId),
    deliveryType: data.deliveryType,
    status: data.status,
    failureReason: data.failureReason || "",
    attemptedAt: new Date(),
  });
}

// Check unread count
export async function countUnreadNotifications(userId: string): Promise<number> {
  return Notification.countDocuments({
    userId: new Types.ObjectId(userId),
    isRead: false,
    deleted: { $ne: true },
  });
}
