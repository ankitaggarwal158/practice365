
import { useSystemSettings } from "../hooks/useSystemSettings";
import { SystemHealthCards } from "../components/SystemHealthCards";
import { MaintenanceModeCard } from "../components/MaintenanceModeCard";

export function SystemSettingsPage() {
  const { settings, health, isLoading, updateSettings, isUpdating } = useSystemSettings();

  return (
    <div className="space-y-6">
      {/* System Health Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-4">
          System Diagnostics
        </h2>
        <SystemHealthCards health={health} isLoading={isLoading} />
      </div>

      {/* Maintenance configuration */}
      <div className="max-w-2xl">
        <MaintenanceModeCard
          settings={settings}
          onUpdate={updateSettings}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
export default SystemSettingsPage;
