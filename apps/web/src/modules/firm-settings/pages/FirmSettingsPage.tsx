import { useState } from "react";
import { useCurrentUserPermissions } from "@/modules/roles";
import { FirmProfileSection } from "../components/FirmProfileSection";
import { BrandingSection } from "../components/BrandingSection";
import { RegionalSettingsSection } from "../components/RegionalSettingsSection";
import { NumberingSection } from "../components/NumberingSection";

type ActiveTab = "profile" | "branding" | "regional" | "numbering";

export function FirmSettingsPage() {
  const { hasPermission, isLoading: isAuthLoading } = useCurrentUserPermissions();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  const canManage = hasPermission("FIRM_SETTINGS_MANAGE") || hasPermission("FIRM_UPDATE");
  const canView = hasPermission("FIRM_SETTINGS_VIEW") || hasPermission("FIRM_VIEW");

  if (isAuthLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to view firm configuration settings.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Firm Settings</h1>
        <p className="text-sm text-surface-200/50">
          Central management panel for profile details, document branding, localization formats, and sequential numbering.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-white/[0.06] mb-8">
        <nav className="flex gap-6 -mb-px" aria-label="Tabs">
          {[
            { id: "profile", name: "Firm Profile" },
            { id: "branding", name: "Branding Assets" },
            { id: "regional", name: "Regional Settings" },
            { id: "numbering", name: "Auto Number Sequences" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? "border-brand-400 text-brand-300"
                    : "border-transparent text-surface-200/55 hover:text-white hover:border-white/10"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        {!canManage && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300 mb-6">
            You are in read-only mode. Administrator permissions required to save changes.
          </div>
        )}

        {/* Tab contents */}
        {activeTab === "profile" && <FirmProfileSection disabled={!canManage} />}
        {activeTab === "branding" && <BrandingSection disabled={!canManage} />}
        {activeTab === "regional" && <RegionalSettingsSection disabled={!canManage} />}
        {activeTab === "numbering" && <NumberingSection disabled={!canManage} />}
      </div>
    </div>
  );
}

export default FirmSettingsPage;
