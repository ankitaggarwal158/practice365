import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFirm } from "../hooks/useFirm";
import { useUpdateFirm } from "../hooks/useUpdateFirm";
import { useCurrentUserPermissions } from "@/modules/roles";

export function FirmBrandingPage() {
  const { firm, isLoading: isFirmLoading, error: firmError, refetch } = useFirm();
  const { updateBranding, isLoading: isUpdating, error: updateError } = useUpdateFirm();
  const { hasPermission, isLoading: isAuthLoading } = useCurrentUserPermissions();

  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#5520F0");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (firm) {
      setLogoUrl(firm.logoUrl || "");
      setPrimaryColor(firm.primaryColor || "#5520F0");
    }
  }, [firm]);

  const canUpdate = hasPermission("FIRM_UPDATE");
  const isLoading = isFirmLoading || isAuthLoading;
  const isDisabled = !canUpdate || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // Simple hex color validator
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(primaryColor)) {
      setValidationError("Primary brand color must be a valid hex code (e.g. #5520F0).");
      return;
    }

    try {
      await updateBranding({
        logoUrl: logoUrl || undefined,
        primaryColor,
      });
      setSuccessMessage("Branding details updated successfully.");
      refetch();
    } catch (err: any) {
      setValidationError(err.message || "Failed to update branding settings.");
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Firm Branding</h1>
          <p className="text-sm text-surface-200/50">
            Customize the system UI presentation, including the firm logo and brand primary color settings.
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
            to="/firm/settings"
            className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            Regional Settings
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
                You are in read-only mode. Requires the FIRM_UPDATE permission to modify branding assets.
              </div>
            )}

            {(validationError || updateError || firmError) && (
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                {validationError || updateError || firmError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
                {successMessage}
              </div>
            )}

            {/* Logo Settings */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">Firm Logo Asset</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="logoUrl" className="block text-sm font-semibold text-white">
                    Public Logo URL
                  </label>
                  <input
                    type="text"
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={isDisabled}
                    placeholder="https://example.com/logo.png"
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                  <p className="text-xs text-surface-200/40">
                    Provide a public URL to your firm's horizontal branding asset. Ideal height is around 40px.
                  </p>
                </div>
                <div className="flex justify-center items-center h-28 border border-white/[0.06] rounded-xl bg-white/[0.02] p-4 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Firm Logo Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-surface-200/35 uppercase tracking-wider font-semibold">No Logo Selected</span>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-white/[0.06]" />

            {/* Palette Colors */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">Color Palette Settings</h2>
              <div className="flex items-center gap-6">
                <div className="space-y-2 flex-1">
                  <label htmlFor="primaryColor" className="block text-sm font-semibold text-white">
                    Primary Brand HEX Code *
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={isDisabled}
                      className="h-11 w-12 border-0 bg-transparent cursor-pointer rounded-lg"
                    />
                    <input
                      type="text"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={isDisabled}
                      placeholder="#5520F0"
                      className="block w-40 rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200 uppercase"
                    />
                  </div>
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
                    "Save Branding"
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

export default FirmBrandingPage;
