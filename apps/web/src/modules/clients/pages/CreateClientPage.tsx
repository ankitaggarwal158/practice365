import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateClient } from "../hooks/useCreateClient";
import { useDuplicateCheck } from "../hooks/useDuplicateCheck";

export default function CreateClientPage() {
  const navigate = useNavigate();
  const { create, isLoading: isCreating, error: createError } = useCreateClient();
  const { checkDuplicates, matches, isLoading: isChecking } = useDuplicateCheck();

  const [clientType, setClientType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });

  const [duplicateWarningSeen, setDuplicateWarningSeen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check duplicate first if not already confirmed by user
    if (!duplicateWarningSeen) {
      try {
        const queryParams = {
          firstName: clientType === "INDIVIDUAL" ? formData.firstName : undefined,
          lastName: clientType === "INDIVIDUAL" ? formData.lastName : undefined,
          companyName: clientType === "ORGANIZATION" ? formData.companyName : undefined,
          email: formData.email || undefined,
        };
        const dupes = await checkDuplicates(queryParams);
        if (dupes.length > 0) {
          setDuplicateWarningSeen(true);
          return; // Stop and display warning
        }
      } catch (err) {
        console.error("Duplicate check failed:", err);
      }
    }

    // Proceed to create
    try {
      const payload = {
        clientType,
        firstName: clientType === "INDIVIDUAL" ? formData.firstName : undefined,
        lastName: clientType === "INDIVIDUAL" ? formData.lastName : undefined,
        companyName: formData.companyName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        address: {
          street1: formData.street1 || undefined,
          street2: formData.street2 || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
          country: formData.country || undefined,
        },
      };

      const result = await create(payload);
      if (result && result.id) {
        navigate(`/clients/${result.id}`);
      } else {
        navigate("/clients");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => navigate("/clients")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-surface-200/50 hover:text-white mb-4 transition-colors duration-150"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Add Client Record</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Create a fresh Individual or Corporate client profile inside the practice directory.
        </p>
      </div>

      {createError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{createError}</p>
        </div>
      )}

      {/* Duplicate warning notification */}
      {duplicateWarningSeen && matches.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 p-5 rounded-2xl mb-8 animate-slide-up">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-warning mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">Advisory Duplicate Match Alert</h3>
              <p className="mt-1 text-xs text-surface-200/60">
                We found existing clients with similar names or contact information in the directory:
              </p>
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
                {matches.map((dupe) => (
                  <div
                    key={dupe.clientId}
                    className="flex justify-between items-center bg-surface-950 p-2.5 rounded-xl border border-white/[0.04]"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{dupe.clientName}</div>
                      <div className="text-[10px] text-surface-200/40">ID: {dupe.clientNumber} | Matched: {dupe.matchedField}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/clients/${dupe.clientId}`)}
                      className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="px-3.5 py-2 bg-warning text-surface-950 text-xs font-bold rounded-lg hover:bg-warning/90 transition-all duration-150"
                >
                  Create Anyway
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateWarningSeen(false)}
                  className="px-3.5 py-2 bg-surface-950 text-white text-xs font-semibold rounded-lg hover:bg-white/[0.02] border border-white/[0.08] transition-all duration-150"
                >
                  Cancel & Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleCreateSubmit} className="space-y-8 bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-8 rounded-3xl">
        {/* Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-3">
            Client Profile Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setClientType("INDIVIDUAL");
                setDuplicateWarningSeen(false);
              }}
              className={`flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                clientType === "INDIVIDUAL"
                  ? "bg-brand-500/10 text-brand-300 border-brand-500/50"
                  : "bg-surface-950 text-surface-200/60 border-white/[0.08] hover:border-white/[0.12] hover:text-white"
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Individual Client
            </button>
            <button
              type="button"
              onClick={() => {
                setClientType("ORGANIZATION");
                setDuplicateWarningSeen(false);
              }}
              className={`flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                clientType === "ORGANIZATION"
                  ? "bg-brand-500/10 text-brand-300 border-brand-500/50"
                  : "bg-surface-950 text-surface-200/60 border-white/[0.08] hover:border-white/[0.12] hover:text-white"
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a1 1 0 011-1h3a1 1 0 011 1v3m-6 0h6" />
              </svg>
              Corporate Entity / Org
            </button>
          </div>
        </div>

        {/* Identity Details */}
        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-base font-bold text-white mb-4">Identity Details</h2>
          {clientType === "INDIVIDUAL" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  First Name <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Last Name <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Associated Company Name (Optional)
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Company / Organization Name <span className="text-brand-400">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-base font-bold text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Website
              </label>
              <input
                type="text"
                name="website"
                placeholder="https://"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-base font-bold text-white mb-4">Physical Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Street Address Line 1
              </label>
              <input
                type="text"
                name="street1"
                value={formData.street1}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Street Address Line 2
              </label>
              <input
                type="text"
                name="street2"
                value={formData.street2}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                State / Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-white/[0.06] pt-6 flex justify-end gap-4">
          <button
            type="button"
            disabled={isCreating}
            onClick={() => navigate("/clients")}
            className="px-5 py-2.5 bg-transparent hover:bg-white/[0.02] border border-white/[0.08] rounded-xl text-sm font-semibold text-white transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isChecking}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? "Checking Duplicates..." : isCreating ? "Saving Record..." : "Create Client"}
          </button>
        </div>
      </form>
    </div>
  );
}
