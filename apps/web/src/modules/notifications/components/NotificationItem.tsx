import { Info, CheckCircle2, AlertTriangle, XCircle, Trash2, Check } from "lucide-react";
import { NotificationItemData } from "../types/notifications.types";

interface NotificationItemProps {
  notification: NotificationItemData;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "SUCCESS":
        return {
          icon: CheckCircle2,
          iconClass: "text-success bg-success/10 border-success/20",
          borderClass: "border-l-success",
        };
      case "WARNING":
        return {
          icon: AlertTriangle,
          iconClass: "text-warning bg-warning/10 border-warning/20",
          borderClass: "border-l-warning",
        };
      case "ERROR":
        return {
          icon: XCircle,
          iconClass: "text-danger bg-danger/10 border-danger/20",
          borderClass: "border-l-danger",
        };
      default:
        return {
          icon: Info,
          iconClass: "text-brand-400 bg-brand-500/10 border-brand-500/20",
          borderClass: "border-l-brand-500",
        };
    }
  };

  const { icon: SeverityIcon, iconClass, borderClass } = getSeverityStyles(notification.severity);

  const getRelativeTime = (createdAtString: string) => {
    const now = new Date();
    const date = new Date(createdAtString);
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`relative p-4 bg-surface-950/40 border-y border-r border-l-3 border-white/[0.04] ${borderClass} hover:bg-white/[0.02] transition-colors group flex gap-3`}
    >
      <div className={`p-2.5 rounded-lg border h-fit shrink-0 ${iconClass}`}>
        <SeverityIcon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 pr-12">
        <div className="flex items-center justify-between gap-2">
          <h4 className={`text-xs font-semibold truncate ${notification.isRead ? "text-surface-200/50" : "text-white"}`}>
            {notification.title}
          </h4>
        </div>
        <p className={`text-xs mt-1 leading-normal ${notification.isRead ? "text-surface-200/30" : "text-surface-200/60"}`}>
          {notification.message}
        </p>
        <span className="text-[10px] text-surface-200/30 mt-2 block font-medium">
          {getRelativeTime(notification.createdAt)}
        </span>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <button
            onClick={() => onMarkRead(notification._id)}
            title="Mark as read"
            className="p-1.5 rounded-lg bg-surface-800 border border-white/[0.06] text-surface-200/80 hover:text-white hover:bg-brand-500/20 hover:border-brand-500/30 transition-all cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          title="Delete"
          className="p-1.5 rounded-lg bg-surface-800 border border-white/[0.06] text-surface-200/80 hover:text-danger hover:bg-danger/20 hover:border-danger/30 transition-all cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default NotificationItem;
