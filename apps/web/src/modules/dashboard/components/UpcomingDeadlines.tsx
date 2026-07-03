import { Link } from "react-router-dom";
import { AlertCircle, Calendar, ArrowUpRight } from "lucide-react";

interface UpcomingDeadlinesProps {
  deadlines: any[] | null;
  isLoading: boolean;
}

export function UpcomingDeadlines({ deadlines, isLoading }: UpcomingDeadlinesProps) {
  if (deadlines === null) return null;

  const getDaysRemainingText = (dateTimeString: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(dateTimeString);
    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const getUrgencyClass = (dateTimeString: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(dateTimeString);
    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return "text-danger bg-danger/10 border-danger/20";
    }
    if (diffDays <= 3) {
      return "text-warning bg-warning/10 border-warning/20";
    }
    return "text-brand-400 bg-brand-500/10 border-brand-500/20";
  };

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString([], { month: "short", day: "numeric", weekday: "short" });
  };

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-danger" />
          <h3 className="font-semibold text-white">Upcoming Deadlines</h3>
        </div>
        <Link
          to="/calendar"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          View Deadlines <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto max-h-[380px]">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2].map((n) => (
              <div key={n} className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !deadlines || deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-surface-200/40">No upcoming deadlines found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <div
                key={deadline._id}
                className="bg-surface-950/40 border border-white/[0.03] hover:border-white/[0.08] p-3.5 rounded-xl transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate" title={deadline.title}>
                      {deadline.title}
                    </h4>
                    {deadline.matterId && (
                      <Link
                        to={`/matters/${deadline.matterId._id}`}
                        className="text-[11px] font-medium text-brand-400/80 hover:text-brand-400 hover:underline mt-1 inline-block truncate"
                      >
                        Ref: {deadline.matterId.matterNumber}
                      </Link>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide shrink-0 ${getUrgencyClass(deadline.startDateTime)}`}>
                    {getDaysRemainingText(deadline.startDateTime)}
                  </span>
                </div>

                <div className="flex items-center text-xs text-surface-200/50 gap-1 mt-2.5 pt-2 border-t border-white/[0.02]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Due: {formatDate(deadline.startDateTime)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default UpcomingDeadlines;
