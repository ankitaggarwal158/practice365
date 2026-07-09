import React, { useState, useEffect } from "react";
import { useFirmSettings, useUpdateFirmSettings } from "../hooks/useFirmSettings";

interface RegionalSettingsSectionProps {
  disabled?: boolean;
}

export function RegionalSettingsSection({ disabled }: RegionalSettingsSectionProps) {
  const { data: settings } = useFirmSettings();
  const updateSettingsMutation = useUpdateFirmSettings();

  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<"12_HOUR" | "24_HOUR">("24_HOUR");

  useEffect(() => {
    if (settings) {
      setTimezone(settings.timezone || "UTC");
      setCurrency(settings.currency || "USD");
      setDateFormat(settings.dateFormat || "YYYY-MM-DD");
      setTimeFormat(settings.timeFormat || "24_HOUR");
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timezone.trim() || !currency.trim() || !dateFormat.trim()) {
      alert("Timezone, Currency, and Date Format are required.");
      return;
    }
    updateSettingsMutation.mutate({
      timezone,
      currency,
      dateFormat,
      timeFormat,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timezone */}
        <div className="space-y-2">
          <label htmlFor="timezone" className="block text-sm font-semibold text-white">Primary Timezone *</label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={disabled || updateSettingsMutation.isPending}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          >
            <option value="UTC" className="bg-surface-900 text-white">UTC (GMT)</option>
            <option value="America/New_York" className="bg-surface-900 text-white">Eastern Time (EST/EDT)</option>
            <option value="America/Chicago" className="bg-surface-900 text-white">Central Time (CST/CDT)</option>
            <option value="America/Denver" className="bg-surface-900 text-white">Mountain Time (MST/MDT)</option>
            <option value="America/Los_Angeles" className="bg-surface-900 text-white">Pacific Time (PST/PDT)</option>
            <option value="Europe/London" className="bg-surface-900 text-white">London (GMT/BST)</option>
            <option value="Asia/Kolkata" className="bg-surface-900 text-white">India Standard Time (IST)</option>
          </select>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label htmlFor="currency" className="block text-sm font-semibold text-white">Default Currency Code *</label>
          <input
            type="text"
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            disabled={disabled || updateSettingsMutation.isPending}
            placeholder="e.g. USD"
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <label htmlFor="dateFormat" className="block text-sm font-semibold text-white">Default Date Format *</label>
          <select
            id="dateFormat"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            disabled={disabled || updateSettingsMutation.isPending}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          >
            <option value="YYYY-MM-DD" className="bg-surface-900 text-white">YYYY-MM-DD (ISO)</option>
            <option value="MM/DD/YYYY" className="bg-surface-900 text-white">MM/DD/YYYY (US)</option>
            <option value="DD/MM/YYYY" className="bg-surface-900 text-white">DD/MM/YYYY (UK/EU)</option>
          </select>
        </div>

        {/* Time Format */}
        <div className="space-y-2">
          <label htmlFor="timeFormat" className="block text-sm font-semibold text-white">Default Time Format *</label>
          <div className="flex gap-6 pt-3">
            <label className="flex items-center gap-2.5 text-sm text-white cursor-pointer select-none">
              <input
                type="radio"
                name="timeFormat"
                value="12_HOUR"
                checked={timeFormat === "12_HOUR"}
                onChange={() => setTimeFormat("12_HOUR")}
                disabled={disabled || updateSettingsMutation.isPending}
                className="h-4.5 w-4.5 border-white/[0.15] bg-surface-900/40 text-brand-500 checked:bg-brand-500 focus:outline-none cursor-pointer"
              />
              12 Hour (AM/PM)
            </label>
            <label className="flex items-center gap-2.5 text-sm text-white cursor-pointer select-none">
              <input
                type="radio"
                name="timeFormat"
                value="24_HOUR"
                checked={timeFormat === "24_HOUR"}
                onChange={() => setTimeFormat("24_HOUR")}
                disabled={disabled || updateSettingsMutation.isPending}
                className="h-4.5 w-4.5 border-white/[0.15] bg-surface-900/40 text-brand-500 checked:bg-brand-500 focus:outline-none cursor-pointer"
              />
              24 Hour (Military)
            </label>
          </div>
        </div>
      </div>

      {!disabled && (
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20 min-w-[120px] flex items-center justify-center"
          >
            {updateSettingsMutation.isPending ? (
              <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Save Regional Settings"
            )}
          </button>
        </div>
      )}
    </form>
  );
}
export default RegionalSettingsSection;
