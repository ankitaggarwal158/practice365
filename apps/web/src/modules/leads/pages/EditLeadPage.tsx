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
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-red-600 font-semibold">
        Access Denied. You do not have permissions to modify lead records.
      </div>
    );
  }

  if (isLoadingLead) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500 text-sm">Loading lead profile...</span>
      </div>
    );
  }

  if (loadError || !lead) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{loadError || "Lead record not found."}</p>
        </div>
      </div>
    );
  }

  if (lead.status === "CONVERTED") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-sm text-yellow-800 font-semibold">
            Locked Record: This lead has been converted into a client and cannot be modified.
          </p>
          <button
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="mt-3 inline-flex items-center px-4 py-1.5 border border-gray-300 text-xs font-semibold rounded text-gray-700 bg-white hover:bg-gray-50"
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Lead details</h1>
        <p className="mt-1 text-sm text-gray-500">Update contact or requirements for lead {lead.leadNumber}.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-150">
        <form onSubmit={handleSubmit} className="space-y-6">
          {validationError && (
            <div className="bg-red-50 p-3 rounded-md text-sm text-red-700">{validationError}</div>
          )}
          {saveError && (
            <div className="bg-red-50 p-3 rounded-md text-sm text-red-700">{saveError}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                required
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700">
                Preferred Contact Method
              </label>
              <select
                name="preferredContactMethod"
                id="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              >
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone</option>
                <option value="SMS">SMS / Text</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="practiceArea" className="block text-sm font-medium text-gray-700">
                Practice Area
              </label>
              <input
                type="text"
                name="practiceArea"
                id="practiceArea"
                placeholder="Family Law, Corporate, Real Estate..."
                value={formData.practiceArea}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject / Opportunity Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-350 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Detailed Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-350 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
            >
              {isSaving ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
