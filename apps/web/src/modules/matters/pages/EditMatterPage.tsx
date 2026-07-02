import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMatter } from "../hooks/useMatter";
import { useUpdateMatter } from "../hooks/useUpdateMatter";
import { matterApi } from "../api/matter.api";
import { PracticeArea } from "../types/matter.types";

export default function EditMatterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matter, isLoading: loadingMatter, error: loadError } = useMatter(id);
  const { update, isLoading: isUpdating, error: updateError } = useUpdateMatter();

  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [loadingPA, setLoadingPA] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    practiceAreaId: "",
    matterType: "LITIGATION",
    description: "",
    priority: "NORMAL",
    clientReference: "",
    courtFileNumber: "",
    statuteOfLimitations: "",
    estimatedValue: "",
    billingMethod: "HOURLY",
    customHourlyRate: "",
    flatFeeAmount: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPA() {
      try {
        const data = await matterApi.listPracticeAreas();
        setPracticeAreas(data);
      } catch (err) {
        console.error("Failed to load practice areas:", err);
      } finally {
        setLoadingPA(false);
      }
    }
    loadPA();
  }, []);

  useEffect(() => {
    if (matter) {
      setFormData({
        title: matter.title || "",
        practiceAreaId: matter.practiceAreaId || "",
        matterType: matter.matterType || "LITIGATION",
        description: matter.description || "",
        priority: matter.priority || "NORMAL",
        clientReference: matter.clientReference || "",
        courtFileNumber: matter.courtFileNumber || "",
        statuteOfLimitations: matter.statuteOfLimitations
          ? new Date(matter.statuteOfLimitations).toISOString().slice(0, 10)
          : "",
        estimatedValue: matter.estimatedValue ? String(matter.estimatedValue) : "",
        billingMethod: matter.billingMethod || "HOURLY",
        customHourlyRate: matter.customHourlyRate ? String(matter.customHourlyRate) : "",
        flatFeeAmount: matter.flatFeeAmount ? String(matter.flatFeeAmount) : "",
      });
    }
  }, [matter]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!id) return;
    if (!formData.title.trim()) {
      setValidationError("Title is required.");
      return;
    }
    if (!formData.practiceAreaId) {
      setValidationError("Practice Area is required.");
      return;
    }

    try {
      const payload: any = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue as string) : undefined,
        billingMethod: formData.billingMethod as "HOURLY" | "FLAT_FEE" | "CONTINGENCY",
        customHourlyRate: formData.customHourlyRate ? parseFloat(formData.customHourlyRate as string) : undefined,
        flatFeeAmount: formData.flatFeeAmount ? parseFloat(formData.flatFeeAmount as string) : undefined,
        statuteOfLimitations: formData.statuteOfLimitations || undefined,
      };

      await update(id, payload);
      navigate(`/matters/${id}`);
    } catch (err) {
      // Error handled by hook
    }
  };

  const isLoading = loadingMatter || loadingPA || isUpdating;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/matters/${id}`)}
          className="flex items-center gap-2 text-sm font-medium text-surface-200/50 hover:text-white mb-4 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Matter Settings</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Modify the configuration, priority, or case info for Matter {matter?.matterNumber}.
        </p>
      </div>

      {(loadError || updateError || validationError) && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{loadError || updateError || validationError}</p>
        </div>
      )}

      {loadingMatter ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-surface-200/50 text-sm">Loading matter profile...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl space-y-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">Primary Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Client (Immutable)
                </label>
                <div className="w-full bg-surface-950/40 border border-white/[0.04] rounded-xl px-4 py-2.5 text-sm text-surface-200/60 font-semibold select-none">
                  {matter?.clientName}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Matter Number (Immutable)
                </label>
                <div className="w-full bg-surface-950/40 border border-white/[0.04] rounded-xl px-4 py-2.5 text-sm text-surface-200/60 font-semibold select-none">
                  {matter?.matterNumber}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Matter Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Description / Scope
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="practiceAreaId" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Practice Area *
                </label>
                <select
                  id="practiceAreaId"
                  name="practiceAreaId"
                  value={formData.practiceAreaId}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                >
                  <option value="">Select Practice Area...</option>
                  {practiceAreas.map((pa) => (
                    <option key={pa.id} value={pa.id}>
                      {pa.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="matterType" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Matter Type
                </label>
                <select
                  id="matterType"
                  name="matterType"
                  value={formData.matterType}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                >
                  <option value="LITIGATION">Litigation</option>
                  <option value="TRANSACTIONAL">Transactional</option>
                  <option value="CONSULTATION">Consultation</option>
                  <option value="ADVISORY">Advisory</option>
                  <option value="REGULATORY">Regulatory</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl space-y-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">References & Values (Optional)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="clientReference" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Client Reference ID
                </label>
                <input
                  type="text"
                  id="clientReference"
                  name="clientReference"
                  value={formData.clientReference}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="courtFileNumber" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Court File Number
                </label>
                <input
                  type="text"
                  id="courtFileNumber"
                  name="courtFileNumber"
                  value={formData.courtFileNumber}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="statuteOfLimitations" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Statute of Limitations
                </label>
                <input
                  type="date"
                  id="statuteOfLimitations"
                  name="statuteOfLimitations"
                  value={formData.statuteOfLimitations}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="estimatedValue" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Estimated Matter Value ($)
                </label>
                <input
                  type="number"
                  id="estimatedValue"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
          </div>
        </div>

        {/* Billing Details */}
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white tracking-tight">Billing & Rates</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="billingMethod" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Billing Method <span className="text-brand-400">*</span>
              </label>
              <select
                id="billingMethod"
                name="billingMethod"
                value={formData.billingMethod}
                onChange={handleChange}
                required
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              >
                <option value="HOURLY">Hourly</option>
                <option value="FLAT_FEE">Flat Fee</option>
                <option value="CONTINGENCY">Contingency</option>
              </select>
            </div>

            {formData.billingMethod === "HOURLY" && (
              <div>
                <label htmlFor="customHourlyRate" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Matter-Level Hourly Rate Override ($)
                </label>
                <input
                  type="number"
                  id="customHourlyRate"
                  name="customHourlyRate"
                  value={formData.customHourlyRate}
                  onChange={handleChange}
                  placeholder="Leave blank to use default rates"
                  min="0"
                  step="0.01"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
            )}

            {formData.billingMethod === "FLAT_FEE" && (
              <div>
                <label htmlFor="flatFeeAmount" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Flat Fee Amount ($)
                </label>
                <input
                  type="number"
                  id="flatFeeAmount"
                  name="flatFeeAmount"
                  value={formData.flatFeeAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
                />
              </div>
            )}
          </div>
        </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/matters/${id}`)}
              className="px-5 py-2.5 bg-surface-950 hover:bg-white/[0.02] border border-white/[0.08] text-sm font-semibold rounded-xl text-white transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
