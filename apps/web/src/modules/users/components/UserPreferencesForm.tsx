import { useState, type FormEvent } from "react";
import { TimeFormat } from "../types/user.types";
import { Button } from "@/modules/auth/components/Button";
import { Alert } from "@/modules/auth/components/Alert";

interface UserPreferencesFormProps {
  initialPreferences: {
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: TimeFormat;
    notificationPreferences: {
      email: boolean;
    };
  };
  onSave: (data: any) => Promise<unknown>;
}

export function UserPreferencesForm({ initialPreferences, onSave }: UserPreferencesFormProps) {
  const [timezone, setTimezone] = useState(initialPreferences.timezone || "UTC");
  const [language, setLanguage] = useState(initialPreferences.language || "en");
  const [dateFormat, setDateFormat] = useState(initialPreferences.dateFormat || "YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(initialPreferences.timeFormat || TimeFormat.TWENTY_FOUR);
  const [emailNotifications, setEmailNotifications] = useState(
    initialPreferences.notificationPreferences?.email !== false
  );

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const timezones = [
    { label: "Coordinated Universal Time (UTC)", value: "UTC" },
    { label: "Eastern Time (US & Canada)", value: "America/New_York" },
    { label: "Central Time (US & Canada)", value: "America/Chicago" },
    { label: "Mountain Time (US & Canada)", value: "America/Denver" },
    { label: "Pacific Time (US & Canada)", value: "America/Los_Angeles" },
    { label: "London / Greenwich Mean Time", value: "Europe/London" },
    { label: "Paris / Berlin (Central European)", value: "Europe/Paris" },
    { label: "India Standard Time (IST)", value: "Asia/Kolkata" },
    { label: "Tokyo / Seoul Standard Time", value: "Asia/Tokyo" },
    { label: "Sydney / Melbourne Standard Time", value: "Australia/Sydney" },
  ];

  const languages = [
    { label: "English", value: "en" },
    { label: "Spanish (Español)", value: "es" },
    { label: "French (Français)", value: "fr" },
    { label: "German (Deutsch)", value: "de" },
  ];

  const dateFormats = [
    { label: "YYYY-MM-DD (2026-06-28)", value: "YYYY-MM-DD" },
    { label: "MM/DD/YYYY (06/28/2026)", value: "MM/DD/YYYY" },
    { label: "DD/MM/YYYY (28/06/2026)", value: "DD/MM/YYYY" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      await onSave({
        timezone,
        language,
        dateFormat,
        timeFormat,
        notificationPreferences: {
          email: emailNotifications,
        },
      });
      setSuccess("Preferences updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update preferences.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Timezone */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-200/80">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-850 px-4 py-3 text-sm text-surface-100 focus:border-brand-400/50 focus:ring-4 focus:ring-brand-400/10 focus:outline-none transition-all duration-200"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-surface-900">
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-200/80">
            Preferred Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-850 px-4 py-3 text-sm text-surface-100 focus:border-brand-400/50 focus:ring-4 focus:ring-brand-400/10 focus:outline-none transition-all duration-200"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-surface-900">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Date Format */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-200/80">
            Date Format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-850 px-4 py-3 text-sm text-surface-100 focus:border-brand-400/50 focus:ring-4 focus:ring-brand-400/10 focus:outline-none transition-all duration-200"
          >
            {dateFormats.map((df) => (
              <option key={df.value} value={df.value} className="bg-surface-900">
                {df.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Format */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-200/80">
            Time Format
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTimeFormat(TimeFormat.TWELVE)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none ${
                timeFormat === TimeFormat.TWELVE
                  ? "border-brand-400 bg-brand-500/10 text-brand-300"
                  : "border-white/[0.08] bg-surface-850 text-surface-200/80 hover:bg-white/[0.02]"
              }`}
            >
              12-Hour (AM/PM)
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat(TimeFormat.TWENTY_FOUR)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none ${
                timeFormat === TimeFormat.TWENTY_FOUR
                  ? "border-brand-400 bg-brand-500/10 text-brand-300"
                  : "border-white/[0.08] bg-surface-850 text-surface-200/80 hover:bg-white/[0.02]"
              }`}
            >
              24-Hour
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3 pt-4 border-t border-surface-800">
        <h4 className="text-sm font-semibold text-white">Notification Settings</h4>
        <label className="relative flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="mt-1 h-4 w-4 rounded-md border-white/[0.08] bg-surface-850 text-brand-500 focus:ring-brand-400/20 focus:outline-none"
          />
          <div className="text-sm select-none">
            <span className="font-medium text-surface-100">Email Notifications</span>
            <span className="block text-xs text-surface-200/50">
              Receive automated updates, law firm matter triggers, and invoices.
            </span>
          </div>
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t border-surface-800">
        <Button
          type="submit"
          isLoading={isPending}
          className="!w-auto px-8"
        >
          Save Preferences
        </Button>
      </div>
    </form>
  );
}
export default UserPreferencesForm;
