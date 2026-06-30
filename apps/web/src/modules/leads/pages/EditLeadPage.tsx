import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLead } from "../hooks/useLead";
import { useUpdateLead } from "../hooks/useUpdateLead";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { UpdateLeadRequest } from "../types/lead.types";

export default function EditLeadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const { lead, isLoading: isLoadingLead, error: loadError } = useLead(id);
  const { update, isLoading: isSaving, error: saveError } = useUpdateLead(id || "");

  const [formData, setFormData] = useState<UpdateLeadRequest>({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    preferredContactMethod: "EMAIL",
    practiceArea: "",
    subject: "",
    description: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const canUpdate = permissions.includes("LEADS_UPDATE");

  useEffect(() => {
    if (lead) {
      setFormData({
        firstName: lead.firstName,
        lastName: lead.lastName,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        preferredContactMethod: lead.preferredContactMethod,
        practiceArea: lead.practiceArea,
        subject: lead.subject,
        description: lead.description,
      });
    }
  }, [lead]);

  if (!canUpdate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to modify lead records.
      </div>
    );
  }

  if (isLoadingLead) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        <span className="ml-3 text-surface-200/60 text-sm">Loading lead profile...</span>
      </div>
    );
  }

  if (loadError || !lead) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl">
          <p className="text-sm text-danger">{loadError || "Lead record not found."}</p>
        </div>
      </div>
    );
  }

  if (lead.status === "CONVERTED") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-brand-500/10 p-4 rounded-xl border border-brand-500/20">
          <p className="text-sm text-brand-300 font-semibold mb-3">
            Locked Record: This lead has been converted into a client and cannot be modified.
          </p>
          <button
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="px-4 py-2 border border-white/[0.08] rounded-xl text-xs font-semibold text-surface-200/80 hover:bg-white/[0.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Go back to profile
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setValidationError("First name and last name are required.");
      return;
    }
    if (!formData.subject?.trim()) {
      setValidationError("Subject is required.");
      return;
    }

    try {
      await update(formData);
      navigate(`/leads/${lead.id}`);
    } catch (err) {
      // Handled by hook
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/leads/${lead.id}`)}
          className="flex items-center gap-2 text-sm font-medium text-surface-200/50 hover:text-white mb-4 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cancel
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Lead Details</h1>
        <p className="mt-2 text-sm text-surface-200/60">Update contact or requirements for lead {lead.leadNumber}.</p>
      </div>

      {(validationError || saveError) && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{validationError || saveError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl space-y-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">Lead Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="preferredContactMethod" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Preferred Contact Method
              </label>
              <select
                name="preferredContactMethod"
                id="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
              >
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone</option>
                <option value="SMS">SMS / Text</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="practiceArea" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Practice Area
              </label>
              <input
                type="text"
                name="practiceArea"
                id="practiceArea"
                placeholder="Family Law, Corporate, Real Estate..."
                value={formData.practiceArea}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
              Subject / Opportunity Summary *
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
              Detailed Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              placeholder="Provide background information, timeline, and core query details..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="px-5 py-2.5 border border-white/[0.08] rounded-xl text-sm font-semibold text-surface-200/80 hover:bg-white/[0.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Saving changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
