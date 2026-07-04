import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, CheckSquare, Settings, Bell } from "lucide-react";
import useNotifications from "../hooks/useNotifications";
import NotificationItem from "./NotificationItem";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCount?: () => void;
}

export function NotificationDrawer({ isOpen, onClose, onRefreshCount }: NotificationDrawerProps) {
  // Fetch only unread notifications (or recent ones) for the quick drawer preview
  const {
    notifications,
    isLoading,
    markRead,
    markAllRead,
    deleteNotification,
    refetch,
  } = useNotifications({ limit: 10 });

  // Refetch when the drawer opens
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Sync count on change
  useEffect(() => {
    if (onRefreshCount) {
      onRefreshCount();
    }
  }, [notifications, onRefreshCount]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface-900 border-l border-white/[0.08] shadow-2xl z-50 flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-400" />
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-200/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-surface-950/40 border-b border-white/[0.03] flex items-center justify-between text-xs">
          <button
            onClick={async () => {
              await markAllRead();
              if (onRefreshCount) onRefreshCount();
            }}
            className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="h-3.5 w-3.5" /> Mark all read
          </button>
          <Link
            to="/settings/notifications"
            onClick={onClose}
            className="text-surface-200/50 hover:text-white font-medium flex items-center gap-1"
          >
            <Settings className="h-3.5 w-3.5" /> Preferences
          </Link>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
          {isLoading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex items-start space-x-3">
                  <div className="rounded bg-white/10 h-8 w-8 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-white/10 rounded w-1/3"></div>
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-surface-200/20 mb-3">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-white">All caught up!</p>
              <p className="text-xs text-surface-200/40 mt-1 max-w-[240px]">
                No new notifications. We will alert you when something happens.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <NotificationItem
                key={item._id}
                notification={item}
                onMarkRead={async (id) => {
                  await markRead(id);
                  if (onRefreshCount) onRefreshCount();
                }}
                onDelete={async (id) => {
                  await deleteNotification(id);
                  if (onRefreshCount) onRefreshCount();
                }}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-surface-950/20">
          <Link
            to="/notifications"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white text-xs tracking-wide shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all text-center"
          >
            View Notification Center
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotificationDrawer;
