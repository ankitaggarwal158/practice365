import React from "react";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { FeatureFlagTable } from "../components/FeatureFlagTable";

export function FeatureFlagsPage() {
  const { flags, isLoading, toggleFlag, isToggling } = useFeatureFlags();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Feature Toggles
          </h2>
          <p className="text-sm text-surface-200/50 mt-1">
            Roll out, enable, or disable supported modules dynamically across all accounts without code redeployments.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <FeatureFlagTable
          flags={flags}
          onToggle={toggleFlag}
          isToggling={isToggling}
        />
      )}
    </div>
  );
}
export default FeatureFlagsPage;
