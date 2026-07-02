import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMatterContact, useUpdateMatterContact } from "../hooks/useMatterContacts";
import { checkDuplicates } from "../api/matter-contact.api";
import { UpdateMatterContactRequest, Duplicate } from "../types/matter-contact.types";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function EditMatterContactPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: contact, isLoading: isContactLoading } = useMatterContact(id!);
  const updateMutation = useUpdateMatterContact();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const [formData, setFormData] = useState<UpdateMatterContactRequest>({
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

  // Load existing data
  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        organizationName: contact.organizationName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        alternatePhone: contact.alternatePhone || "",
        website: contact.website || "",
        addressLine1: contact.addressLine1 || "",
        addressLine2: contact.addressLine2 || "",
        city: contact.city || "",
        state: contact.state || "",
        postalCode: contact.postalCode || "",
        country: contact.country || "",
        notes: contact.notes || "",
      });
    }
  }, [contact]);

  // Check duplicates on input changes (debounced)
  useEffect(() => {
    if (!contact) return;
    const nameInput = contact.contactType === "INDIVIDUAL" ? `${formData.firstName} ${formData.lastName}`.trim() : formData.organizationName?.trim();
    if (!nameInput && !formData.email && !formData.phone) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const result = await checkDuplicates({
          contactType: contact.contactType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          organizationName: formData.organizationName,
          email: formData.email,
          phone: formData.phone,
        }, id);
        setDuplicates(result.duplicates || []);
      } catch (err) {
        console.error("Duplicate check failed:", err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    contact,
    formData.firstName,
    formData.lastName,
    formData.organizationName,
    formData.email,
    formData.phone,
    id,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          navigate(`/matter-contacts/${id}`);
        },
      }
    );
  };

  if (isContactLoading || isPermsLoading) {
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
          onClick={() => navigate(`/matter-contacts/${id}`)}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          &larr; Back to Contact Details
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Matter Contact</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Modify contact details and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
          {/* Read-Only type banner */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
              Contact Type (Immutable)
            </label>
            <div className="bg-surface-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-brand-300 font-bold">
              {contact?.contactType}
            </div>
            <p className="text-[10px] text-surface-200/35 mt-1.5">
              Contact classification cannot be changed after creation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {contact?.contactType === "INDIVIDUAL" ? (
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
                onClick={() => navigate(`/matter-contacts/${id}`)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-surface-950 border border-white/[0.06] text-surface-200 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
              >
                {updateMutation.isPending ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Real-time duplicate check alert panel */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex justify-between items-center">
              <span>Potential Duplicates</span>
              {isCheckingDuplicates && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-400" />
              )}
            </h3>
            <p className="text-xs text-surface-200/50 mb-4">
              Real-time check to verify attributes do not overlap with other records.
            </p>
            {duplicates.length === 0 ? (
              <div className="text-xs text-success bg-success/5 border border-success/10 rounded-xl p-4 text-center font-medium">
                No potential duplicates detected.
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
