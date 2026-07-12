
import { SystemHealth } from "../types";

interface SystemHealthCardsProps {
  health?: SystemHealth;
  isLoading: boolean;
}

export function SystemHealthCards({ health, isLoading }: SystemHealthCardsProps) {
  const formatUptime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs} hrs, ${mins} mins`;
  };

  const isDbConnected = health?.db === "CONNECTED";
  const isApiHealthy = health?.api === "HEALTHY";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in">
      {/* Database Connection */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
        <span className="text-xs font-medium text-surface-200/60 uppercase tracking-wider block mb-2">
          Database Connection
        </span>
        <div>
          {isLoading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isDbConnected ? "bg-success" : "bg-danger animate-ping"}`} />
              <span className="text-2xl font-bold text-white tracking-tight">
                {isDbConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          )}
          <span className="text-xs text-surface-200/40 mt-1 block">
            MongoDB replica set state
          </span>
        </div>
      </div>

      {/* API Gateway Status */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
        <span className="text-xs font-medium text-surface-200/60 uppercase tracking-wider block mb-2">
          API Gateway
        </span>
        <div>
          {isLoading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isApiHealthy ? "bg-success" : "bg-danger animate-ping"}`} />
              <span className="text-2xl font-bold text-white tracking-tight">
                {isApiHealthy ? "Healthy" : "Degraded"}
              </span>
            </div>
          )}
          <span className="text-xs text-surface-200/40 mt-1 block">
            Node Express cluster status
          </span>
        </div>
      </div>

      {/* Uptime */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
        <span className="text-xs font-medium text-surface-200/60 uppercase tracking-wider block mb-2">
          System Uptime
        </span>
        <div>
          {isLoading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <span className="text-2xl font-bold text-white tracking-tight block">
              {formatUptime(health?.uptime)}
            </span>
          )}
          <span className="text-xs text-surface-200/40 mt-1 block">
            Time since last deploy/restart
          </span>
        </div>
      </div>
    </div>
  );
}
export default SystemHealthCards;
