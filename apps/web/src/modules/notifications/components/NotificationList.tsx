import NotificationItem from "./NotificationItem";
import { NotificationItemData } from "../types/notifications.types";

interface NotificationListProps {
  notifications: NotificationItemData[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationList({ notifications, onMarkRead, onDelete }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-surface-200/40">No notifications to display.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-white/[0.04] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
      {notifications.map((item) => (
        <NotificationItem
          key={item._id}
          notification={item}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default NotificationList;
