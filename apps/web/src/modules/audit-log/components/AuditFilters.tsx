import React from "react";
import { AuditLogFilters } from "../types";

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onChange: (newFilters: AuditLogFilters) => void;
  onClear: () => void;
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

const ENTITY_TYPES = [
  "MATTER",
  "CLIENT",
  "LEAD",
  "INTAKE",
  "DOCUMENT",
  "TASK",
  "CALENDAR_EVENT",
  "TIME_ENTRY",
  "EXPENSE",
  "INVOICE",
  "NOTE",
];

export function AuditFilters({ filters, onChange, onClear }: AuditFiltersProps) {
  const handleChange = (field: keyof AuditLogFilters, value: any) => {
    onChange({
      ...filters,
      [field]: value || undefined,
      page: 1, // Reset page when filters change
    });
  };

  return (
    <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl mb-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Search Logs
          </label>
          <input
            type="text"
            placeholder="Search action, IP, metadata..."
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>

        {/* Module */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Source Module
          </label>
          <select
            value={filters.module || ""}
            onChange={(e) => handleChange("module", e.target.value)}
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

        {/* Entity Type */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Entity Type
          </label>
          <select
            value={filters.entityType || ""}
            onChange={(e) => handleChange("entityType", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 text-surface-100"
          >
            <option value="">All Entities</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Entity ID */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Entity ID
          </label>
          <input
            type="text"
            placeholder="Paste entity ObjectID..."
            value={filters.entityId || ""}
            onChange={(e) => handleChange("entityId", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 text-surface-100"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 text-surface-100"
          />
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Action Keyword
          </label>
          <input
            type="text"
            placeholder="e.g. CREATE, LOGIN..."
            value={filters.action || ""}
            onChange={(e) => handleChange("action", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>

        {/* Clear Button */}
        <div className="flex gap-2 justify-end sm:justify-start">
          <button
            onClick={onClear}
            className="w-full px-5 py-2.5 border border-white/[0.08] bg-surface-950 hover:bg-surface-900 active:scale-95 text-surface-200 text-sm font-semibold rounded-xl transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
export default AuditFilters;
