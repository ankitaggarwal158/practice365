import React, { useState } from "react";
import { AuditLogFilters } from "../types";
import { useExportAuditLogs } from "../hooks/useAuditLogs";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: AuditLogFilters;
}

const MODULES = [
  "Auth",
  "Users",
  "Roles",
  "Firm",
  "Intake",
  "Lead",
  "Conflict Check",
  "Clients",
  "Matters",
  "Practice Areas",
  "Opposing Parties",
  "Matter Contacts",
  "Notes",
  "Calendar",
  "Documents",
  "Time Tracking",
  "Billing",
  "Electronic Signatures",
];

export function ExportDialog({ isOpen, onClose, activeFilters }: ExportDialogProps) {
  const [filters, setFilters] = useState<AuditLogFilters>({
    module: activeFilters.module || "",
    startDate: activeFilters.startDate || "",
    endDate: activeFilters.endDate || "",
    userId: activeFilters.userId || "",
  });

  const exportMutation = useExportAuditLogs();

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    await exportMutation.mutateAsync(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] flex justify-between items-center">
          <h3 className="text-base font-bold text-white">Export Audit Logs</h3>
          <button
            onClick={onClose}
            className="text-surface-200/40 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleExport} className="p-6 space-y-4">
          <p className="text-xs text-surface-200/60 leading-relaxed">
            Download an immutable CSV file of system audit logs matching the chosen criteria. (Max 10,000 records)
          </p>

          {/* Module Select */}
          <div>
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
              Filter by Module
            </label>
            <select
              value={filters.module || ""}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 text-surface-100"
            >
              <option value="">All Modules</option>
              {MODULES.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* User ID filter */}
          <div>
            <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
              Filter by User ID (Optional)
            </label>
            <input
              type="text"
              placeholder="Paste User ObjectID..."
              value={filters.userId || ""}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
            />
          </div>

          {/* Date range grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 text-surface-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 text-surface-100"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/[0.06] flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-white/[0.08] bg-surface-950 hover:bg-surface-900 active:scale-95 text-surface-200 text-sm font-semibold rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={exportMutation.isPending}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {exportMutation.isPending ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ExportDialog;
