import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateMatter } from "../hooks/useCreateMatter";
import { useClients } from "@/modules/clients/hooks/useClients";
import { useUsers } from "@/modules/users/hooks/useUsers";
import { matterApi } from "../api/matter.api";
import { PracticeArea } from "../types/matter.types";

export default function CreateMatterPage() {
  const navigate = useNavigate();
  const { create, isLoading: isCreating, error: createError } = useCreateMatter();
  const { clients, isLoading: loadingClients } = useClients({ limit: 100, status: "ACTIVE" });
  const { users, isLoading: loadingUsers } = useUsers({ limit: 100 });

  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [loadingPA, setLoadingPA] = useState(true);

  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    practiceAreaId: "",
    matterType: "LITIGATION",
    responsibleAttorneyId: "",
    description: "",
    priority: "NORMAL",
    clientReference: "",
    courtFileNumber: "",
    statuteOfLimitations: "",
    estimatedValue: "",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.clientId) {
      setValidationError("Client is required.");
      return;
    }
    if (!formData.title.trim()) {
      setValidationError("Title is required.");
      return;
    }
    if (!formData.practiceAreaId) {
      setValidationError("Practice Area is required.");
      return;
    }
    if (!formData.responsibleAttorneyId) {
      setValidationError("Responsible Attorney is required.");
      return;
    }

    try {
      const payload: any = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        statuteOfLimitations: formData.statuteOfLimitations || undefined,
      };

      const created = await create(payload);
      navigate(`/matters/${created.id}`);
    } catch (err) {
      // Error handled by hook
    }
  };

  const isLoading = loadingClients || loadingUsers || loadingPA || isCreating;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => navigate("/matters")}
          className="flex items-center gap-2 text-sm font-medium text-surface-200/50 hover:text-white mb-4 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Matters
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Create New Matter</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Open a new legal matter file, assign the responsible attorney, and define general scope.
        </p>
      </div>

      {(createError || validationError) && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{createError || validationError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl space-y-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">Primary Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientId" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Client *
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              >
                <option value="">Select Client...</option>
                {clients.map((client) => {
                  const clientName = client.clientType === "INDIVIDUAL"
                    ? `${client.firstName || ""} ${client.lastName || ""}`.trim()
                    : client.companyName || "";
                  return (
                    <option key={client.id} value={client.id}>
                      {clientName} ({client.clientNumber})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="responsibleAttorneyId" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Responsible Attorney *
              </label>
              <select
                id="responsibleAttorneyId"
                name="responsibleAttorneyId"
                value={formData.responsibleAttorneyId}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
              >
                <option value="">Select Attorney...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
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
              placeholder="e.g. Smith Divorce Representation"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
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
              placeholder="Outline the matter details, background, and expected work..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
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
                placeholder="External account reference..."
                value={formData.clientReference}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
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
                placeholder="e.g. CV-2026-0032"
                value={formData.courtFileNumber}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
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
                placeholder="e.g. 15000"
                value={formData.estimatedValue}
                onChange={handleChange}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/matters")}
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
            Create Matter
          </button>
        </div>
      </form>
    </div>
  );
}
