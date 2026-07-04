export interface NotificationItemData {
  _id: string;
  firmId: string;
  userId: string;
  sourceModule: string;
  entityType: string;
  entityId?: string;
  title: string;
  message: string;
  severity: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NotificationListResponse {
  data: NotificationItemData[];
  pagination: PaginationData;
}

export interface NotificationPreferencesData {
  _id: string;
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  calendarReminders: boolean;
  billingNotifications: boolean;
  taskNotifications: boolean;
  updatedAt: string;
}
