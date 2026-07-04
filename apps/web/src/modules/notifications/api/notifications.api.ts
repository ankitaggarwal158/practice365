import { httpClient } from "@/services/http-client";
import {
  NotificationListResponse,
  NotificationItemData,
  NotificationPreferencesData,
} from "../types/notifications.types";

export const notificationsApi = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.isRead !== undefined) {
      searchParams.append("isRead", String(params.isRead));
    }

    const response = await httpClient.get<{
      success: boolean;
      data: NotificationListResponse;
    }>(`/notifications?${searchParams.toString()}`);
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await httpClient.get<{
      success: boolean;
      data: { count: number };
    }>("/notifications/unread-count");
    return response.data.count;
  },

  async markAsRead(id: string): Promise<NotificationItemData> {
    const response = await httpClient.patch<{
      success: boolean;
      data: NotificationItemData;
    }>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await httpClient.patch<any>("/notifications/read-all");
  },

  async deleteNotification(id: string): Promise<void> {
    await httpClient.delete<any>(`/notifications/${id}`);
  },

  async getPreferences(): Promise<NotificationPreferencesData> {
    const response = await httpClient.get<{
      success: boolean;
      data: NotificationPreferencesData;
    }>("/notification-preferences");
    return response.data;
  },

  async updatePreferences(
    data: Partial<NotificationPreferencesData>
  ): Promise<NotificationPreferencesData> {
    const response = await httpClient.patch<{
      success: boolean;
      data: NotificationPreferencesData;
    }>("/notification-preferences", data);
    return response.data;
  },
};

export default notificationsApi;
