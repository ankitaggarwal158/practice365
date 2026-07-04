import { useState } from "react";
import useNotifications from "../hooks/useNotifications";
import NotificationList from "../components/NotificationList";
import { CheckSquare, RefreshCw } from "lucide-react";

export function NotificationCenterPage() {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean | undefined>(undefined);
  const {
    notifications,
    pagination,
    isLoading,
    error,
    page,
    setPage,
    refetch,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications({
    isRead: filterUnreadOnly,
    limit: 15,
  });

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notification Center</h1>
          <p className="text-sm text-surface-200/50">
            Keep track of matter logs, event reminders, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            title="Refresh feed"
            className="p-2 rounded-xl bg-surface-900 border border-white/[0.06] hover:bg-white/5 text-surface-200/80 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={markAllRead}
            disabled={notifications.length === 0}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-900 border border-white/[0.06] hover:bg-white/5 text-surface-200/80 hover:text-white disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckSquare className="h-4 w-4" /> Mark all read
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl p-4">
          Error loading notifications: {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-white/[0.06]">
        <button
          onClick={() => {
            setFilterUnreadOnly(undefined);
            setPage(1);
          }}
          className={`px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            filterUnreadOnly === undefined
              ? "border-brand-500 text-brand-400"
              : "border-transparent text-surface-200/50 hover:text-white"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => {
            setFilterUnreadOnly(false);
            setPage(1);
          }}
          className={`px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            filterUnreadOnly === false
              ? "border-brand-500 text-brand-400"
              : "border-transparent text-surface-200/50 hover:text-white"
          }`}
        >
          Unread Alerts
        </button>
      </div>

      {/* List content */}
      <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl min-h-[300px] flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-4 py-4 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white/5 h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            onMarkRead={markRead}
            onDelete={deleteNotification}
          />
        )}

        {/* Pagination controls */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
            <span className="text-xs text-surface-200/40">
              Showing page {page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-950 border border-white/[0.04] text-surface-200/80 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-950 border border-white/[0.04] text-surface-200/80 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenterPage;
