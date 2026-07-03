import { Briefcase, FileText, DollarSign, Clock, Calendar, Activity } from "lucide-react";
import { ActivityItem } from "../types/dashboard.types";

interface RecentActivityProps {
  activity: ActivityItem[];
  isLoading: boolean;
}

export function RecentActivity({ activity, isLoading }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "MATTER":
        return <Briefcase className="h-4 w-4 text-brand-400" />;
      case "DOCUMENT":
        return <FileText className="h-4 w-4 text-brand-400" />;
      case "INVOICE":
        return <DollarSign className="h-4 w-4 text-success" />;
      case "TIME_ENTRY":
        return <Clock className="h-4 w-4 text-warning" />;
      case "CALENDAR_EVENT":
        return <Calendar className="h-4 w-4 text-brand-400" />;
      default:
        return <Activity className="h-4 w-4 text-surface-200/50" />;
    }
  };

  const getActivityActionText = (action: string) => {
    switch (action) {
      case "created":
        return "created a new";
      case "updated":
        return "updated the";
      case "uploaded":
        return "uploaded";
      case "logged":
        return "logged time for";
      case "status_changed":
        return "changed status of";
      case "completed":
        return "completed";
      default:
        return "modified";
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
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
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
        <Activity className="h-5 w-5 text-brand-400" />
        <h3 className="font-semibold text-white">Recent Activity Feed</h3>
      </div>

      <div className="flex-1 overflow-auto max-h-[380px] pr-1">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse flex items-center space-x-3">
                <div className="rounded-full bg-white/10 h-8 w-8 shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 bg-white/10 rounded w-2/3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !activity || activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-surface-200/40">No recent activity logged.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/[0.06] pl-4 ml-3 space-y-6 py-2">
            {activity.map((item) => (
              <div key={item.id} className="relative group">
                {/* Icon node */}
                <div className="absolute -left-[29px] top-0.5 p-1.5 rounded-full bg-surface-900 border border-white/[0.06] group-hover:border-white/[0.12] transition-colors">
                  {getActivityIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-surface-200/50">
                    <span className="font-semibold text-white mr-1">
                      {item.userName}
                    </span>
                    {getActivityActionText(item.action)}{" "}
                    <span className="text-surface-200/80 font-medium">
                      {item.type.toLowerCase().replace("_", " ")}
                    </span>
                  </p>
                  <h4 className="text-sm font-semibold text-white mt-1 group-hover:text-brand-400 transition-colors leading-tight">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-surface-200/30 font-medium mt-1.5 block">
                    {getRelativeTime(item.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default RecentActivity;
