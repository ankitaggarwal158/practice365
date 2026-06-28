import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIntake } from "../hooks/useIntake";
import { useUpdateIntake } from "../hooks/useUpdateIntake";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { UpdateIntakeRequest } from "../types/intake.types";

export default function EditIntakePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const { intake, isLoading, error: fetchError } = useIntake(id);
  const { update, isLoading: isSaving, error: saveError } = useUpdateIntake(id || "");

  const [formData, setFormData] = useState<UpdateIntakeRequest>({
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

  useEffect(() => {
    if (intake) {
      setFormData({
        firstName: intake.firstName,
        lastName: intake.lastName,
        companyName: intake.companyName,
        email: intake.email,
        phone: intake.phone,
        preferredContactMethod: intake.preferredContactMethod,
        practiceArea: intake.practiceArea,
        subject: intake.subject,
        description: intake.description,
        source: intake.source,
      });
    }
  }, [intake]);

  const canUpdate = permissions.includes("INTAKES_UPDATE");

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm text-gray-500">Loading details...</p>
      </div>
    );
  }

  if (fetchError || !intake) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-red-600 font-medium">
        {fetchError || "Intake record not found."}
      </div>
    );
  }

  // Prevent edit if already converted
  if (intake.status === "CONVERTED") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-orange-600 font-medium">
        This intake has been converted and is read-only. Edits are disabled.
      </div>
    );
  }

  if (!canUpdate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-red-600 font-medium">
        Access Denied. You do not have permissions to edit intakes.
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
      setValidationError("Subject/summary is required.");
      return;
    }

    try {
      await update(formData);
      navigate(`/intakes/${id}`);
    } catch (err) {
      // Handled by hook state
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Intake: {intake.intakeNumber}
          </h2>
        </div>
      </div>

      {(validationError || saveError) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <p className="text-sm text-red-700">{validationError || saveError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Preferred Contact Method</label>
            <select
              name="preferredContactMethod"
              value={formData.preferredContactMethod}
              onChange={handleChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone Call</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Source *</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Practice Area</label>
            <input
              type="text"
              name="practiceArea"
              placeholder="e.g. Criminal Defense, Family Law"
              value={formData.practiceArea}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Subject / Inquiry Title *</label>
            <input
              type="text"
              name="subject"
              required
              placeholder="Brief summary of inquiry"
              value={formData.subject}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Inquiry Details / Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/intakes/${id}`)}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
