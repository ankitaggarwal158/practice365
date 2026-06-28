import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useClient } from "../hooks/useClient";
import { useUpdateClient } from "../hooks/useUpdateClient";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { client, isLoading: isClientLoading, error: clientError } = useClient(id);
  const { update, isLoading: isSaving, error: updateError } = useUpdateClient();

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
    country: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "ARCHIVED",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        companyName: client.companyName || "",
        email: client.email || "",
        phone: client.phone || "",
        website: client.website || "",
        street1: client.address?.street1 || "",
        street2: client.address?.street2 || "",
        city: client.address?.city || "",
        state: client.address?.state || "",
        zip: client.address?.zip || "",
        country: client.address?.country || "",
        status: client.status,
      });
    }
  }, [client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const payload = {
        firstName: client?.clientType === "INDIVIDUAL" ? formData.firstName : undefined,
        lastName: client?.clientType === "INDIVIDUAL" ? formData.lastName : undefined,
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
        status: formData.status,
      };

      await update(id, payload);
      navigate(`/clients/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (isClientLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-surface-200/50 text-sm">Loading client profile...</span>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl">
          <p className="text-sm text-danger">{clientError || "Client record not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/clients/${id}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-surface-200/50 hover:text-white mb-4 transition-colors duration-150"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Edit Client: {client.clientNumber}
        </h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Modify core information fields. Please note that changing client type is immutable and forbidden.
        </p>
      </div>

      {updateError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{updateError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-8 rounded-3xl">
        {/* Type Selection - Immutable Warning */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Client Profile Type
          </label>
          <div className="flex items-center gap-3 bg-surface-950 p-4 rounded-xl border border-white/[0.06] opacity-75">
            <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-sm font-semibold text-white">
              {client.clientType} CLIENT (Locked / Immutable)
            </span>
          </div>
        </div>

        {/* Identity Details */}
        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-base font-bold text-white mb-4">Identity Details</h2>
          {client.clientType === "INDIVIDUAL" ? (
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

        {/* Address & Status */}
        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-base font-bold text-white mb-4">Physical Address & Status</h2>
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
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Relationship Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white"
              >
                <option value="ACTIVE">Active Relationship</option>
                <option value="INACTIVE">Inactive Relationship</option>
                <option value="ARCHIVED">Archived / Closed Profile</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-white/[0.06] pt-6 flex justify-end gap-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => navigate(`/clients/${id}`)}
            className="px-5 py-2.5 bg-transparent hover:bg-white/[0.02] border border-white/[0.08] rounded-xl text-sm font-semibold text-white transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
