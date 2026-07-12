import { useState } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";
import AuditFilters from "../components/AuditFilters";
import AuditTable from "../components/AuditTable";
import ExportDialog from "../components/ExportDialog";
import { AuditLogFilters } from "../types";

export default function AuditLogPage() {
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 25,
  });

  const [isExportOpen, setIsExportOpen] = useState(false);

  const { data: result, isLoading: isLogsLoading } = useAuditLogs(filters);

  const canView = permissions.includes("AUDIT_VIEW");
  const canExport = permissions.includes("AUDIT_EXPORT");

  const handleFilterChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 25,
    });
  };

  if (isPermsLoading || isLogsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to view system audit logs.
      </div>
    );
  }

  const logs = result?.data || [];
  const pagination = result?.pagination || { page: 1, total: 0, pages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Audit Trail</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Centralized, immutable history of all significant events and actions across the system.
          </p>
        </div>
        {canExport && (
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Export Logs
          </button>
        )}
      </div>

      {/* Filters */}
      <AuditFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Audit Log Table */}
      <AuditTable logs={logs} />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-xs text-surface-200/40 font-medium">
            Showing Page {pagination.page} of {pagination.pages} (Total: {pagination.total} entries)
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setFilters({ ...filters, page: Math.max(pagination.page - 1, 1) })}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-white/[0.06] text-surface-100 hover:bg-surface-800 disabled:opacity-50 disabled:hover:bg-surface-900 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters({ ...filters, page: Math.min(pagination.page + 1, pagination.pages) })}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-white/[0.06] text-surface-100 hover:bg-surface-800 disabled:opacity-50 disabled:hover:bg-surface-900 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeFilters={filters}
      />
    </div>
  );
}
