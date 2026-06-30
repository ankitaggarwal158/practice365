import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateIntake } from "../hooks/useCreateIntake";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { CreateIntakeRequest } from "../types/intake.types";

export default function CreateIntakePage() {
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();
  const { create, isLoading: isSaving, error: saveError } = useCreateIntake();

  const [formData, setFormData] = useState<CreateIntakeRequest>({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    preferredContactMethod: "EMAIL",
    practiceArea: "",
    subject: "",
    description: "",
    source: "MANUAL",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const canCreate = permissions.includes("INTAKES_CREATE");

  if (!canCreate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-medium">
        Access Denied. You do not have permissions to create intakes.
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

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setValidationError("First name and last name are required.");
      return;
    }
    if (!formData.subject.trim()) {
      setValidationError("Subject/summary is required.");
      return;
    }

    try {
      const created = await create(formData);
      navigate(`/intakes/${created.id}`);
    } catch (err) {
      // Handled by hook state
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => navigate("/intakes")}
          className="flex items-center gap-2 text-sm font-medium text-surface-200/50 hover:text-white mb-4 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Intakes
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">New Intake Capture</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Capture prospective client inquiries and routing information.
        </p>
      </div>

      {(validationError || saveError) && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{validationError || saveError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl space-y-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">Primary Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Phone Number</label>
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
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Preferred Contact Method</label>
              <select
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
              >
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone Call</option>
                <option value="SMS">SMS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Source *</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
              >
                <option value="WEBSITE">Website</option>
                <option value="PHONE">Phone Call</option>
                <option value="EMAIL">Email</option>
                <option value="WALK_IN">Walk-In</option>
                <option value="REFERRAL">Referral</option>
                <option value="ADVERTISEMENT">Advertisement</option>
                <option value="MANUAL">Manual Entry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Practice Area</label>
            <input
              type="text"
              name="practiceArea"
              placeholder="e.g. Criminal Defense, Family Law"
              value={formData.practiceArea}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Subject / Inquiry Title *</label>
            <input
              type="text"
              name="subject"
              required
              placeholder="Brief summary of inquiry"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">Inquiry Details / Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Outline the inquiry details, background, and expected work..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => navigate("/intakes")}
            className="px-5 py-2.5 border border-white/[0.08] rounded-xl text-sm font-semibold text-surface-200/80 hover:bg-white/[0.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Create Intake"}
          </button>
        </div>
      </form>
    </div>
  );
}
