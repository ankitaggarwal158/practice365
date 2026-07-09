import React, { useState, useEffect } from "react";
import { SystemSettings } from "../types";
import { toast } from "sonner";

interface MaintenanceModeCardProps {
  settings?: SystemSettings;
  onUpdate: (data: Partial<SystemSettings>) => Promise<any>;
  isUpdating: boolean;
}

export function MaintenanceModeCard({ settings, onUpdate, isUpdating }: MaintenanceModeCardProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode);
      setMaintenanceMessage(settings.maintenanceMessage);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({
        maintenanceMode,
        maintenanceMessage,
      });
      toast.success("Maintenance configuration updated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update maintenance settings.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-6 shadow-xl flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold text-white tracking-tight">Maintenance Mode</h3>
        <p className="text-sm text-surface-200/50 mt-1">
          When active, only System Administrators can log in or access endpoints. All other users will receive a maintenance message.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-white">Status</span>
            <span className="text-xs text-surface-200/40">
              {maintenanceMode ? "Application is currently IN MAINTENANCE" : "Application is ONLINE"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              maintenanceMode ? "bg-danger" : "bg-white/[0.08]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                maintenanceMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Message Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
            Maintenance Screen Message
          </label>
          <textarea
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            disabled={!maintenanceMode}
            rows={3}
            className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white placeholder-surface-200/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-45 disabled:cursor-not-allowed"
            placeholder="e.g. System is undergoing scheduled upgrades. We will be back online shortly."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-semibold transition cursor-pointer select-none"
          >
            {isUpdating ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
export default MaintenanceModeCard;
