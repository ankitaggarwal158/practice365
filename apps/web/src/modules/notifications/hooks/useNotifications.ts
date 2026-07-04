import { useState, useEffect, useCallback } from "react";
import { notificationsApi } from "../api/notifications.api";
import { NotificationItemData, PaginationData } from "../types/notifications.types";

export function useNotifications(initialFilters?: { isRead?: boolean; limit?: number }) {
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsApi.getNotifications({
        page,
        limit: initialFilters?.limit || 20,
        isRead: initialFilters?.isRead,
      });
      setNotifications(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [page, initialFilters?.isRead, initialFilters?.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err: any) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
      if (pagination) {
        setPagination({
          ...pagination,
          total: pagination.total - 1,
        });
      }
    } catch (err: any) {
      console.error("Failed to delete notification", err);
    }
  };

  return {
    notifications,
    pagination,
    isLoading,
    error,
    page,
    setPage,
    refetch: fetchNotifications,
    markRead,
    markAllRead,
    deleteNotification,
  };
}

export default useNotifications;
