import { useEffect, useState } from "react";
import systemSettingsApi from "../api/system-settings.api";

export function MaintenancePage() {
  const [message, setMessage] = useState("System is currently undergoing scheduled upgrades. We will be back online shortly.");

  useEffect(() => {
    // Attempt to load settings dynamically to display updated config message
    systemSettingsApi
      .getSystemSettings()
      .then((settings) => {
        if (settings?.maintenanceMessage) {
          setMessage(settings.maintenanceMessage);
        }
      })
      .catch(() => {
        // Fallback to default message on 503 or net fail
      });
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-950 p-4 select-none overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-danger/10 blur-[80px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brand-500/10 blur-[80px]"></div>

      <div className="relative text-center max-w-lg w-full flex flex-col items-center gap-6 animate-fade-in p-6">
        {/* Gear / Maintenance Icon */}
        <div className="rounded-2xl border border-white/[0.08] bg-surface-900/60 p-4 shadow-xl mb-2 text-brand-400">
          <svg className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          System Maintenance
        </h2>
        
        <p className="text-base text-surface-200/70 leading-relaxed font-medium">
          {message}
        </p>

        <div className="border-t border-white/[0.06] pt-6 mt-4 w-full text-xs text-surface-200/40 font-semibold uppercase tracking-widest flex flex-col gap-1">
          <span>Practice365 Core Services</span>
          <span className="text-brand-400 font-normal">System Administration Mode Active</span>
        </div>
      </div>
    </div>
  );
}
export default MaintenancePage;
