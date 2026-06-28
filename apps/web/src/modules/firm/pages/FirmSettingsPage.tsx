import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFirmSettings } from "../hooks/useFirmSettings";
import { useUpdateFirmSettings } from "../hooks/useUpdateFirmSettings";
import { useCurrentUserPermissions } from "@/modules/roles";

export function FirmSettingsPage() {
  const { settings, isLoading: isSettingsLoading, error: settingsError, refetch } = useFirmSettings();
  const { updateFirmSettings, isLoading: isUpdating, error: updateError } = useUpdateFirmSettings();
  const { hasPermission, isLoading: isAuthLoading } = useCurrentUserPermissions();

  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrency] = useState("USD");
  const [locale, setLocale] = useState("en-US");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<"12" | "24">("24");
  const [defaultBillingRate, setDefaultBillingRate] = useState(0);
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [matterPrefix, setMatterPrefix] = useState("MAT-");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setTimezone(settings.timezone || "UTC");
      setCurrency(settings.currency || "USD");
      setLocale(settings.locale || "en-US");
      setDateFormat(settings.dateFormat || "YYYY-MM-DD");
      setTimeFormat(settings.timeFormat || "24");
      setDefaultBillingRate(settings.defaultBillingRate || 0);
      setInvoicePrefix(settings.invoicePrefix || "");
      setMatterPrefix(settings.matterPrefix || "");
    }
  }, [settings]);

  const canUpdate = hasPermission("FIRM_UPDATE");
  const isLoading = isSettingsLoading || isAuthLoading;
  const isDisabled = !canUpdate || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!timezone.trim()) {
      setValidationError("Timezone is required.");
      return;
    }
    if (!currency.trim()) {
      setValidationError("Currency is required.");
      return;
    }
    if (!locale.trim()) {
      setValidationError("Locale is required.");
      return;
    }
    if (!dateFormat.trim()) {
      setValidationError("Date format is required.");
      return;
    }

    try {
      await updateFirmSettings({
        timezone,
        currency,
        locale,
        dateFormat,
        timeFormat,
        defaultBillingRate,
        invoicePrefix,
        matterPrefix,
      });
      setSuccessMessage("Settings updated successfully.");
      refetch();
    } catch (err: any) {
      setValidationError(err.message || "Failed to update regional settings.");
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Regional & Default Settings</h1>
          <p className="text-sm text-surface-200/50">
            Configure system-wide timezone formats, currencies, invoice prefixes, and default billing rates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/firm"
            className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            Firm Profile
          </Link>
          <Link
            to="/firm/branding"
            className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            Firm Branding
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <div className="max-w-4xl rounded-2xl border border-white/[0.06] bg-surface-900/20 backdrop-blur-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!canUpdate && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300">
                You are in read-only mode. Requires the FIRM_UPDATE permission to modify settings.
              </div>
            )}

            {(validationError || updateError || settingsError) && (
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                {validationError || updateError || settingsError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
                {successMessage}
              </div>
            )}

            {/* Regional Settings */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">Regional Localization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="timezone" className="block text-sm font-semibold text-white">
                    Primary Timezone *
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  >
                    <option value="UTC" className="bg-surface-900 text-white">UTC (GMT)</option>
                    <option value="America/New_York" className="bg-surface-900 text-white">Eastern Time (EST/EDT)</option>
                    <option value="America/Chicago" className="bg-surface-900 text-white">Central Time (CST/CDT)</option>
                    <option value="America/Denver" className="bg-surface-900 text-white">Mountain Time (MST/MDT)</option>
                    <option value="America/Los_Angeles" className="bg-surface-900 text-white">Pacific Time (PST/PDT)</option>
                    <option value="Europe/London" className="bg-surface-900 text-white">London (GMT/BST)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="currency" className="block text-sm font-semibold text-white">
                    Default Currency Code *
                  </label>
                  <input
                    type="text"
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={isDisabled}
                    placeholder="e.g. USD"
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="locale" className="block text-sm font-semibold text-white">
                    Default System Locale *
                  </label>
                  <input
                    type="text"
                    id="locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    disabled={isDisabled}
                    placeholder="e.g. en-US"
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dateFormat" className="block text-sm font-semibold text-white">
                    Default Date Format *
                  </label>
                  <select
                    id="dateFormat"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  >
                    <option value="YYYY-MM-DD" className="bg-surface-900 text-white">YYYY-MM-DD (ISO)</option>
                    <option value="MM/DD/YYYY" className="bg-surface-900 text-white">MM/DD/YYYY (US)</option>
                    <option value="DD/MM/YYYY" className="bg-surface-900 text-white">DD/MM/YYYY (UK/EU)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="timeFormat" className="block text-sm font-semibold text-white">
                    Default Time Format *
                  </label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="radio"
                        id="timeFormat12"
                        name="timeFormat"
                        value="12"
                        checked={timeFormat === "12"}
                        onChange={() => setTimeFormat("12")}
                        disabled={isDisabled}
                        className="h-4 w-4 border-white/[0.15] bg-surface-900/40 text-brand-500 checked:bg-brand-500 focus:outline-none transition-all cursor-pointer"
                      />
                      12 Hour (AM/PM)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="radio"
                        id="timeFormat24"
                        name="timeFormat"
                        value="24"
                        checked={timeFormat === "24"}
                        onChange={() => setTimeFormat("24")}
                        disabled={isDisabled}
                        className="h-4 w-4 border-white/[0.15] bg-surface-900/40 text-brand-500 checked:bg-brand-500 focus:outline-none transition-all cursor-pointer"
                      />
                      24 Hour (Military)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-white/[0.06]" />

            {/* Invoicing and Billing Settings */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">Billing & Reference Defaults</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="defaultBillingRate" className="block text-sm font-semibold text-white">
                    Default Hourly Billing Rate ($) *
                  </label>
                  <input
                    type="number"
                    id="defaultBillingRate"
                    value={defaultBillingRate}
                    onChange={(e) => setDefaultBillingRate(parseFloat(e.target.value) || 0)}
                    disabled={isDisabled}
                    min="0"
                    placeholder="0.00"
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="invoicePrefix" className="block text-sm font-semibold text-white">
                    Invoice Prefix Identifier
                  </label>
                  <input
                    type="text"
                    id="invoicePrefix"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    disabled={isDisabled}
                    placeholder="e.g. INV-"
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="matterPrefix" className="block text-sm font-semibold text-white">
                    Matter Reference Prefix
                  </label>
                  <input
                    type="text"
                    id="matterPrefix"
                    value={matterPrefix}
                    onChange={(e) => setMatterPrefix(e.target.value)}
                    disabled={isDisabled}
                    placeholder="e.g. MAT-"
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {canUpdate && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20 flex items-center justify-center min-w-[120px]"
                >
                  {isUpdating ? (
                    <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default FirmSettingsPage;
