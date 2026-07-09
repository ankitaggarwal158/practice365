import React, { useState } from "react";
import { useUserActivityReport } from "../hooks/useUserActivityReport";
import { SummaryCards } from "../components/SummaryCards";
import { ReportFilters } from "../components/ReportFilters";
import { ReportTable } from "../components/ReportTable";
import { ExportDialog } from "../components/ExportDialog";
import reportsApi from "../api/reports.api";
import { toast } from "sonner";

export function UserActivityReportPage() {
  const [filters, setFilters] = useState<any>({ page: 1, limit: 25, sort: "-createdAt" });
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { data, isLoading, error } = useUserActivityReport(filters);

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      await reportsApi.exportReport("user-activity", format, filters);
      toast.success("Report downloaded successfully.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download report.");
      throw err;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            User Activity Report
          </h2>
          <p className="text-sm text-surface-200/50 mt-1">
            Audit system operations, edits, configurations, and administrative permission adjustments.
          </p>
        </div>
        <button
          onClick={() => setIsExportOpen(true)}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 text-sm font-semibold transition cursor-pointer select-none"
        >
          Export Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger text-center">
          Failed to fetch reports. Please try again.
        </div>
      ) : (
        <>
          <SummaryCards type="user-activity" summary={data?.summary} />
          
          <ReportFilters
            type="user-activity"
            filters={filters}
            onChange={setFilters}
          />

          <ReportTable
            type="user-activity"
            data={data?.data || []}
            pagination={data?.pagination}
            currentSort={filters.sort}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onSortChange={(sort) => setFilters({ ...filters, sort })}
          />
        </>
      )}

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
export default UserActivityReportPage;
