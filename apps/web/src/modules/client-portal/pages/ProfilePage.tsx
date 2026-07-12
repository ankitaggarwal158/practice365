import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Mail, ShieldAlert } from "lucide-react";
import { usePortalProfile, usePortalUpdateProfile } from "../hooks/usePortal";

export const ProfilePage: React.FC = () => {
  const { data: profile, isLoading } = usePortalProfile();
  const updateMutation = usePortalUpdateProfile();

  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  // Populate form values when profile is loaded
  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setStreet(profile.address?.street1 || "");
      setCity(profile.address?.city || "");
      setState(profile.address?.state || "");
      setZipCode(profile.address?.zip || "");
      setCountry(profile.address?.country || "");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
    });
  };

  if (isLoading) {
    return <div className="p-12 text-center text-white">Loading profile details...</div>;
  }

  const legalName = profile
    ? profile.clientType === "INDIVIDUAL"
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : profile.companyName
    : "";

  return (
    <div className="space-y-8 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile Settings</h1>
        <p className="text-sm text-surface-400 mt-1">Review contact settings and manage update details below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Read-Only Legal Info Card */}
        <div className="bg-surface-900 border border-white/[0.06] p-6 rounded-2xl md:col-span-1 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
            <ShieldAlert className="h-4 w-4 text-brand-400" /> Account Security
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block">Client ID</span>
              <span className="text-xs font-mono text-white block mt-0.5">{profile?.clientNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block">Legal Name</span>
              <span className="text-sm font-semibold text-white block mt-0.5">{legalName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block">Primary Email</span>
              <div className="flex items-center gap-1.5 text-xs text-surface-300 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-surface-500" />
                <span className="truncate">{profile?.email}</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-brand-500/[0.03] border border-brand-500/10 rounded-xl text-xs text-surface-400 leading-relaxed">
            Legal identity parameters are read-only. To modify name or email information, please contact your attorney directly.
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="bg-surface-900 border border-white/[0.06] p-6 rounded-2xl md:col-span-2 space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
            <User className="h-4 w-4 text-brand-400" /> Contact Details
          </h2>

          <div className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Address Header */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <MapPin className="h-3.5 w-3.5 text-brand-400" /> Mailing Address
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 123 Law Lane"
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">State / Province</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProfilePage;
