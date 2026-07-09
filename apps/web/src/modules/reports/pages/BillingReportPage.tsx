import React, { useState } from "react";
import { useInvoiceReport, useRevenueReport } from "../hooks/useBillingReport";
import { SummaryCards } from "../components/SummaryCards";
import { ReportFilters } from "../components/ReportFilters";
import { ReportTable } from "../components/ReportTable";
import { ExportDialog } from "../components/ExportDialog";
import reportsApi from "../api/reports.api";
import { toast } from "sonner";

type BillingSubTab = "invoices" | "revenue";

export function BillingReportPage() {
  const [activeSubTab, setActiveSubTab] = useState<BillingSubTab>("invoices");
  const [invoiceFilters, setInvoiceFilters] = useState<any>({ page: 1, limit: 25, sort: "-issueDate" });
  const [revenueFilters, setRevenueFilters] = useState<any>({ page: 1, limit: 25, sort: "-paymentDate" });
  const [isExportOpen, setIsExportOpen] = useState(false);

  const isInvoiceTab = activeSubTab === "invoices";

  // Call hooks unconditionally to conform to React Hook rules
  const invoiceQuery = useInvoiceReport(invoiceFilters);
  const revenueQuery = useRevenueReport(revenueFilters);

  const query = isInvoiceTab ? invoiceQuery : revenueQuery;
  const currentFilters = isInvoiceTab ? invoiceFilters : revenueFilters;
  const setFilters = isInvoiceTab ? setInvoiceFilters : setRevenueFilters;

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      await reportsApi.exportReport(activeSubTab, format, currentFilters);
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
            Billing & Revenue Reports
          </h2>
          <p className="text-sm text-surface-200/50 mt-1">
            Track outstanding invoice balances, collections recovery, and Stripe revenue payment history.
          </p>
        </div>
        <button
          onClick={() => setIsExportOpen(true)}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 text-sm font-semibold transition cursor-pointer select-none"
        >
          Export Report
        </button>
      </div>

      {/* Sub-tabs navigation */}
      <div className="border-b border-white/[0.06]">
        <nav className="flex gap-6 -mb-px" aria-label="Billing Sub-tabs">
          {[
            { id: "invoices", name: "Invoices Summary" },
            { id: "revenue", name: "Collected Revenue" },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as BillingSubTab)}
                className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? "border-brand-400 text-brand-300"
                    : "border-transparent text-surface-200/55 hover:text-white hover:border-white/10"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {query.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : query.error ? (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger text-center">
          Failed to fetch reports. Please try again.
        </div>
      ) : (
        <>
          <SummaryCards type={activeSubTab} summary={query.data?.summary} />
          
          <ReportFilters
            type={activeSubTab}
            filters={currentFilters}
            onChange={setFilters}
          />

          <ReportTable
            type={activeSubTab}
            data={query.data?.data || []}
            pagination={query.data?.pagination}
            currentSort={currentFilters.sort}
            onPageChange={(page) => setFilters({ ...currentFilters, page })}
            onSortChange={(sort) => setFilters({ ...currentFilters, sort })}
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
export default BillingReportPage;
