import React, { useState, useEffect } from "react";
import { useFirmSettings, useUpdateFirmSettings } from "../hooks/useFirmSettings";
import { LogoUploader } from "./LogoUploader";

interface BrandingSectionProps {
  disabled?: boolean;
}

export function BrandingSection({ disabled }: BrandingSectionProps) {
  const { data: settings } = useFirmSettings();
  const updateSettingsMutation = useUpdateFirmSettings();

  const [primaryColor, setPrimaryColor] = useState("#5520F0");
  const [secondaryColor, setSecondaryColor] = useState("#000000");

  useEffect(() => {
    if (settings) {
      setPrimaryColor(settings.primaryColor || "#5520F0");
      setSecondaryColor(settings.secondaryColor || "#000000");
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(primaryColor) || !hexRegex.test(secondaryColor)) {
      alert("Please enter a valid Hex color code (e.g. #FF5733).");
      return;
    }
    updateSettingsMutation.mutate({
      primaryColor,
      secondaryColor,
    });
  };

  return (
    <div className="space-y-8">
      {/* Logo Uploader */}
      <LogoUploader currentLogoUrl={settings?.firmLogo} disabled={disabled} />

      <hr className="border-white/[0.06]" />

      {/* Colors Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">Theme Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div className="space-y-2">
            <label htmlFor="primaryColor" className="block text-sm font-semibold text-white">Primary Theme Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={disabled}
                className="h-11 w-14 shrink-0 rounded-xl border border-white/[0.08] bg-surface-900/40 p-1 cursor-pointer"
              />
              <input
                type="text"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={disabled}
                placeholder="#5520F0"
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <label htmlFor="secondaryColor" className="block text-sm font-semibold text-white">Secondary Accent Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={disabled}
                className="h-11 w-14 shrink-0 rounded-xl border border-white/[0.08] bg-surface-900/40 p-1 cursor-pointer"
              />
              <input
                type="text"
                id="secondaryColor"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={disabled}
                placeholder="#000000"
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
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
                "Save Branding"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
export default BrandingSection;
