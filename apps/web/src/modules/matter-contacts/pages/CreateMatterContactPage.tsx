import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateMatterContact as useCreateContact } from "../hooks/useMatterContacts";
import { checkDuplicates } from "../api/matter-contact.api";
import { CreateMatterContactRequest, Duplicate } from "../types/matter-contact.types";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function CreateMatterContactPage() {
  const navigate = useNavigate();
  const createMutation = useCreateContact();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const [contactType, setContactType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");
  const [formData, setFormData] = useState<CreateMatterContactRequest>({
    contactType: "INDIVIDUAL",
    firstName: "",
    lastName: "",
    organizationName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    notes: "",
  });

  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const canManage = permissions.includes("MATTER_CONTACTS_MANAGE");

  // Check duplicates on input changes (debounced)
  useEffect(() => {
    const nameInput = contactType === "INDIVIDUAL" ? `${formData.firstName} ${formData.lastName}`.trim() : formData.organizationName?.trim();
    if (!nameInput && !formData.email && !formData.phone) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const result = await checkDuplicates({
          contactType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          organizationName: formData.organizationName,
          email: formData.email,
          phone: formData.phone,
        });
        setDuplicates(result.duplicates || []);
      } catch (err) {
        console.error("Duplicate check failed:", err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    contactType,
    formData.firstName,
    formData.lastName,
    formData.organizationName,
    formData.email,
    formData.phone,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: "INDIVIDUAL" | "ORGANIZATION") => {
    setContactType(type);
    setFormData((prev) => ({
      ...prev,
      contactType: type,
      firstName: "",
      lastName: "",
      organizationName: "",
    }));
    setDuplicates([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/matter-contacts");
      },
    });
  };

  if (isPermsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to manage matter contacts.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/matter-contacts")}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          &larr; Back to Matter Contacts
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Add Matter Contact</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Create a new reusable individual or organization contact record.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
          {/* Contact Type Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-3">
              Contact Type <span className="text-danger">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("INDIVIDUAL")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                  contactType === "INDIVIDUAL"
                    ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                    : "bg-surface-950 border-white/[0.04] text-surface-200/50 hover:text-white"
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("ORGANIZATION")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                  contactType === "ORGANIZATION"
                    ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                    : "bg-surface-950 border-white/[0.04] text-surface-200/50 hover:text-white"
                }`}
              >
                Organization
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Fields */}
            {contactType === "INDIVIDUAL" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Doe"
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Organization Name <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/[0.04]">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. contact@example.com"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +15551234567"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Alternate Phone</label>
                <input
                  type="text"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  placeholder="e.g. +15551238888"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="e.g. https://example.com"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-2 border-t border-white/[0.04]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide text-surface-200/50">Address</h3>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Street Address"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Suite, Unit, Floor, etc."
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Postal / ZIP Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-2 border-t border-white/[0.04]">
              <label className="block text-sm font-semibold text-white mb-2">Internal Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t border-white/[0.04]">
              <button
                type="button"
                onClick={() => navigate("/matter-contacts")}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-surface-950 border border-white/[0.06] text-surface-200 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
              >
                {createMutation.isPending ? "Creating..." : "Save Contact"}
              </button>
            </div>
          </form>
        </div>

        {/* Real-time duplicate alerts panel */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex justify-between items-center">
              <span>Potential Duplicates</span>
              {isCheckingDuplicates && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-400" />
              )}
            </h3>
            <p className="text-xs text-surface-200/50 mb-4">
              Real-time duplicates scanner checks for exact matching names, emails, or phone numbers in your firm's database.
            </p>
            {duplicates.length === 0 ? (
              <div className="text-xs text-success bg-success/5 border border-success/10 rounded-xl p-4 text-center font-medium">
                No potential duplicates detected. Safe to create.
              </div>
            ) : (
              <div className="space-y-3">
                {duplicates.map((dup) => (
                  <div key={dup.id} className="text-xs border border-warning/10 bg-warning/5 rounded-xl p-3">
                    <div
                      onClick={() => navigate(`/matter-contacts/${dup.id}`)}
                      className="font-bold text-white hover:underline cursor-pointer mb-1"
                    >
                      {dup.name} ({dup.contactType})
                    </div>
                    <ul className="list-disc list-inside text-[10px] text-surface-200/70 space-y-0.5 mt-2">
                      {dup.matchReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
