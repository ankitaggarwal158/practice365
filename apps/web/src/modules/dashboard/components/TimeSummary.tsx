import { Link } from "react-router-dom";
import { Clock, TrendingUp, ArrowUpRight } from "lucide-react";
import { TimeTrackingSummaryData } from "../types/dashboard.types";

interface TimeSummaryProps {
  timeSummary: TimeTrackingSummaryData | null;
  isLoading: boolean;
}

export function TimeSummary({ timeSummary, isLoading }: TimeSummaryProps) {
  if (timeSummary === null) return null;

  const targetHours = 40;
  const weeklyHours = timeSummary?.weekHours || 0;
  const progressPercent = Math.min(Math.round((weeklyHours / targetHours) * 100), 100);

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-white">Time Tracking Summary</h3>
        </div>
        <Link
          to="/time-entries"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          Track Time <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="animate-pulse space-y-4 py-4">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Weekly Target Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs text-surface-200/60 mb-2">
                <span>Weekly Target Progress</span>
                <span className="font-semibold text-white">{weeklyHours} / {targetHours} hrs ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-surface-950 border border-white/[0.04] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-warning h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Time Grid Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-950/40 border border-white/[0.03] p-4 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-surface-200/40 tracking-wider">Today</p>
                <p className="text-xl font-bold text-white mt-1.5">{timeSummary.todayHours}h</p>
                <p className="text-[10px] text-success font-semibold mt-1">
                  {timeSummary.todayBillableHours}h billable
                </p>
              </div>

              <div className="bg-surface-950/40 border border-white/[0.03] p-4 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-surface-200/40 tracking-wider">This Week</p>
                <p className="text-xl font-bold text-white mt-1.5">{timeSummary.weekHours}h</p>
                <p className="text-[10px] text-success font-semibold mt-1">
                  {timeSummary.weekBillableHours}h billable
                </p>
              </div>

              <div className="bg-surface-950/40 border border-white/[0.03] p-4 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-surface-200/40 tracking-wider">This Month</p>
                <p className="text-xl font-bold text-white mt-1.5">{timeSummary.monthHours}h</p>
                <p className="text-[10px] text-success font-semibold mt-1">
                  {timeSummary.monthBillableHours}h billable
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-xs text-surface-200/50">
          <TrendingUp className="h-4 w-4 text-success" />
          <span>
            Billable ratio this week:{" "}
            <span className="font-semibold text-white">
              {weeklyHours > 0
                ? `${Math.round((timeSummary.weekBillableHours / weeklyHours) * 100)}%`
                : "0%"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
export default TimeSummary;
