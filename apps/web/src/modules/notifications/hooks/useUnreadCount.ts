import { useState, useEffect, useCallback } from "react";
import { notificationsApi } from "../api/notifications.api";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread notification count", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [fetchCount]);

  const decrement = () => {
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return {
    unreadCount,
    isLoading,
    refetch: fetchCount,
    decrement,
  };
}

export default useUnreadCount;
