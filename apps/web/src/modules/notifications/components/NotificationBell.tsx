import { useState } from "react";
import { Bell } from "lucide-react";
import useUnreadCount from "../hooks/useUnreadCount";
import NotificationDrawer from "./NotificationDrawer";

export function NotificationBell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { unreadCount, refetch } = useUnreadCount();

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="relative p-2 rounded-xl bg-surface-900 border border-white/[0.06] hover:bg-white/5 text-surface-200/80 hover:text-white transition-all cursor-pointer group"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5 group-hover:scale-105 transition-transform" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white border border-surface-950 animate-pulse-subtle">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefreshCount={refetch}
      />
    </>
  );
}

export default NotificationBell;
