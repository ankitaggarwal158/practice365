import { Link } from "react-router-dom";
import { Briefcase, ArrowUpRight } from "lucide-react";

interface MyMattersProps {
  matters: any[] | null;
  isLoading: boolean;
}

export function MyMatters({ matters, isLoading }: MyMattersProps) {
  if (matters === null) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-success/10 text-success border-success/20";
      case "ON_HOLD":
        return "bg-warning/10 text-warning border-warning/20";
      case "CLOSED":
        return "bg-surface-200/10 text-surface-200/50 border-surface-200/20";
      default:
        return "bg-white/5 text-white/40 border-white/10";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
      case "HIGH":
        return "bg-danger/10 text-danger border-danger/20";
      case "NORMAL":
        return "bg-brand-500/10 text-brand-400 border-brand-500/20";
      case "LOW":
        return "bg-white/5 text-surface-200/50 border-white/10";
      default:
        return "bg-white/5 text-white/40 border-white/10";
    }
  };

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-brand-400" />
          <h3 className="font-semibold text-white">My Active Matters</h3>
        </div>
        <Link
          to="/matters"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          View All Matters <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto max-h-[380px]">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !matters || matters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-surface-200/40">No active matters found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {matters.map((matter) => {
              const clientName = matter.clientId
                ? matter.clientId.companyName || `${matter.clientId.firstName} ${matter.clientId.lastName}`
                : "Unknown Client";

              return (
                <div key={matter._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between group">
                  <div className="min-w-0 pr-4">
                    <Link
                      to={`/matters/${matter._id}`}
                      className="text-sm font-semibold text-white hover:text-brand-400 transition-colors truncate block"
                    >
                      {matter.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-surface-200/40 font-mono">
                        {matter.matterNumber}
                      </span>
                      <span className="text-xs text-surface-200/30">•</span>
                      <span className="text-xs text-surface-200/50 truncate">
                        {clientName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getPriorityBadgeClass(matter.priority)}`}>
                      {matter.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getStatusBadgeClass(matter.status)}`}>
                      {matter.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default MyMatters;
