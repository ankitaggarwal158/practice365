import { useState } from "react";
import { AuditLog } from "../types";

interface ActivityTimelineProps {
  logs: AuditLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const getActionColor = (action: string): string => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("UPLOAD") || act.includes("ADD")) {
      return "bg-emerald-500 ring-emerald-500/20";
    }
    if (act.includes("DELETE") || act.includes("ARCHIVE") || act.includes("REMOVE")) {
      return "bg-red-500 ring-red-500/20";
    }
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("PIN")) {
      return "bg-amber-500 ring-amber-500/20";
    }
    return "bg-brand-500 ring-brand-500/20";
  };

  const getActionIcon = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("UPLOAD") || act.includes("ADD")) {
      return (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    }
    if (act.includes("DELETE") || act.includes("ARCHIVE") || act.includes("REMOVE")) {
      return (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
      );
    }
    return (
      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    );
  };

  const renderChangesList = (prev: any, curr: any) => {
    const prevObj = typeof prev === "string" ? JSON.parse(prev) : prev || {};
    const currObj = typeof curr === "string" ? JSON.parse(curr) : curr || {};

    const allKeys = Array.from(new Set([...Object.keys(prevObj), ...Object.keys(currObj)]));
    const changes = allKeys.filter((key) => JSON.stringify(prevObj[key]) !== JSON.stringify(currObj[key]));

    if (changes.length === 0) return null;

    return (
      <div className="mt-3 bg-surface-950 border border-white/[0.04] p-3 rounded-lg text-xs space-y-1">
        {changes.map((key) => {
          const pVal = prevObj[key];
          const cVal = currObj[key];
          return (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-0.5 border-b border-white/[0.02]">
              <span className="font-semibold text-surface-200/50">{key}</span>
              <span className="font-mono text-[11px] truncate max-w-[200px]">
                <span className="text-danger-400 line-through mr-1.5">
                  {pVal === undefined || pVal === null ? "none" : String(pVal)}
                </span>
                <span className="text-brand-300">
                  {cVal === undefined || cVal === null ? "none" : String(cVal)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (logs.length === 0) {
    return (
      <div className="bg-surface-900/30 border border-white/[0.04] rounded-2xl p-10 text-center text-surface-200/50">
        No recent activity logs recorded.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, logIdx) => {
          const isLast = logIdx === logs.length - 1;
          const userDisplayName = log.userId?.displayName || "System";
          const userEmail = log.userId?.email || "";
          const isExpanded = expandedLogId === log.id;

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/[0.06]" aria-hidden="true" />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-surface-950 ${getActionColor(
                        log.action
                      )}`}
                    >
                      {getActionIcon(log.action)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <p className="text-sm text-surface-200/80">
                          <span className="font-bold text-white">{userDisplayName}</span>{" "}
                          <span className="font-medium text-surface-100">{log.action}</span>{" "}
                          {log.entityType && (
                            <>
                              on{" "}
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-surface-900 border border-white/5 text-brand-300">
                                {log.entityType}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-surface-200/40">
                          {new Date(log.createdAt).toLocaleString()}
                          {userEmail && ` • ${userEmail}`}
                          {log.ipAddress && ` • IP: ${log.ipAddress}`}
                        </p>
                      </div>
                      {(log.previousState || log.currentState) && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="px-2.5 py-1 rounded-md border border-white/[0.06] bg-surface-900 hover:bg-surface-800 text-xs font-semibold text-surface-200 hover:text-white transition-colors self-start sm:self-center"
                        >
                          {isExpanded ? "Hide Changes" : "Show Changes"}
                        </button>
                      )}
                    </div>

                    {/* Timeline Log Details Summary */}
                    {log.metadata?.message && (
                      <p className="mt-2 text-xs text-surface-200/60 leading-relaxed font-medium">
                        {log.metadata.message}
                      </p>
                    )}

                    {isExpanded && renderChangesList(log.previousState, log.currentState)}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default ActivityTimeline;
