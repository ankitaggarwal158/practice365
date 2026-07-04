import { Document, Types } from "mongoose";

export interface Notification {
  firmId: Types.ObjectId;
  userId: Types.ObjectId;
  sourceModule: string;
  entityType: string;
  entityId?: Types.ObjectId;
  title: string;
  message: string;
  severity: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  readAt?: Date | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDocument extends Document, Omit<Notification, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreference {
  userId: Types.ObjectId;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  calendarReminders: boolean;
  billingNotifications: boolean;
  taskNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferenceDocument extends Document, Omit<NotificationPreference, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDeliveryLog {
  notificationId: Types.ObjectId;
  deliveryType: "IN_APP" | "EMAIL";
  status: "PENDING" | "DELIVERED" | "FAILED";
  attemptedAt: Date;
  failureReason?: string;
}

export interface NotificationDeliveryLogDocument extends Document, NotificationDeliveryLog {}

export interface CreateNotificationInput {
  firmId: string;
  userId: string;
  sourceModule: string;
  entityType: string;
  entityId?: string;
  title: string;
  message: string;
  severity?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  forceEmail?: boolean;
}
