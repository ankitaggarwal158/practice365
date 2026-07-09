import React, { useState, useEffect } from "react";
import { useFirmProfile, useUpdateFirmProfile } from "../hooks/useFirmSettings";

interface FirmProfileSectionProps {
  disabled?: boolean;
}

export function FirmProfileSection({ disabled }: FirmProfileSectionProps) {
  const { data: profile, isLoading } = useFirmProfile();
  const updateProfileMutation = useUpdateFirmProfile();

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setLegalName(profile.legalName || "");
      setDisplayName(profile.displayName || "");
      setWebsite(profile.website || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setAddressLine1(profile.addressLine1 || "");
      setAddressLine2(profile.addressLine2 || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setPostalCode(profile.postalCode || "");
      setCountry(profile.country || "United States");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !legalName.trim() || !displayName.trim()) {
      alert("Firm Name, Legal Name, and Display Name are required.");
      return;
    }

    updateProfileMutation.mutate({
      name,
      legalName,
      displayName,
      website: website || undefined,
      email: email || undefined,
      phone: phone || undefined,
      addressLine1: addressLine1 || undefined,
      addressLine2: addressLine2 || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country: country || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="firmName" className="block text-sm font-semibold text-white">Firm Name *</label>
          <input
            type="text"
            id="firmName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled || updateProfileMutation.isPending}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="legalName" className="block text-sm font-semibold text-white">Legal Entity Name *</label>
          <input
            type="text"
            id="legalName"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            disabled={disabled || updateProfileMutation.isPending}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-semibold text-white">Display Name *</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={disabled || updateProfileMutation.isPending}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="block text-sm font-semibold text-white">Website</label>
          <input
            type="text"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={disabled || updateProfileMutation.isPending}
            placeholder="e.g. https://myfirm.com"
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-white">General Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled || updateProfileMutation.isPending}
            placeholder="e.g. contact@myfirm.com"
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-white">Phone Number</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={disabled || updateProfileMutation.isPending}
            placeholder="e.g. +1 555-0199"
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        <div className="md:col-span-2 space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">Office Location & Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="addressLine1" className="block text-sm font-semibold text-white">Address Line 1</label>
              <input
                type="text"
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                disabled={disabled || updateProfileMutation.isPending}
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="addressLine2" className="block text-sm font-semibold text-white">Address Line 2</label>
              <input
                type="text"
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                disabled={disabled || updateProfileMutation.isPending}
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-semibold text-white">City</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={disabled || updateProfileMutation.isPending}
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-semibold text-white">State / Province</label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={disabled || updateProfileMutation.isPending}
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="postalCode" className="block text-sm font-semibold text-white">ZIP / Postal Code</label>
              <input
                type="text"
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                disabled={disabled || updateProfileMutation.isPending}
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-semibold text-white">Country</label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={disabled || updateProfileMutation.isPending}
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {!disabled && (
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20 min-w-[120px] flex items-center justify-center"
          >
            {updateProfileMutation.isPending ? (
              <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      )}
    </form>
  );
}
export default FirmProfileSection;
