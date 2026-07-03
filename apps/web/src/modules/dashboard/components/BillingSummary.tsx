import { Link } from "react-router-dom";
import { DollarSign, ArrowUpRight, AlertCircle, FileText } from "lucide-react";
import { BillingSummaryData } from "../types/dashboard.types";

interface BillingSummaryProps {
  billingSummary: BillingSummaryData | null;
  isLoading: boolean;
}

export function BillingSummary({ billingSummary, isLoading }: BillingSummaryProps) {
  if (billingSummary === null) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-success" />
          <h3 className="font-semibold text-white">Billing & Invoices</h3>
        </div>
        <Link
          to="/invoices"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          View Invoices <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="animate-pulse space-y-4 py-4">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Outstanding (including overdue) */}
            <div className="flex items-center justify-between bg-surface-950/40 border border-white/[0.03] p-3.5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/15 text-success rounded-lg border border-success/20">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                    Outstanding
                  </h4>
                  <p className="text-xs text-surface-200/40 mt-0.5">
                    {billingSummary.outstandingCount} unpaid invoices
                  </p>
                </div>
              </div>
              <span className="text-md font-bold text-white">
                {formatCurrency(billingSummary.outstandingTotal)}
              </span>
            </div>

            {/* Overdue */}
            <div className="flex items-center justify-between bg-surface-950/40 border border-white/[0.03] p-3.5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger/15 text-danger rounded-lg border border-danger/20">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                    Overdue
                  </h4>
                  <p className="text-xs text-surface-200/40 mt-0.5">
                    {billingSummary.overdueCount} past due date
                  </p>
                </div>
              </div>
              <span className="text-md font-bold text-danger">
                {formatCurrency(billingSummary.overdueTotal)}
              </span>
            </div>

            {/* Drafts */}
            <div className="flex items-center justify-between bg-surface-950/40 border border-white/[0.03] p-3.5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 text-surface-200/60 rounded-lg border border-white/10">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                    Draft Invoices
                  </h4>
                  <p className="text-xs text-surface-200/40 mt-0.5">
                    {billingSummary.draftCount} draft state
                  </p>
                </div>
              </div>
              <span className="text-md font-bold text-white">
                {formatCurrency(billingSummary.draftTotal)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-end">
          <Link
            to="/invoices/new"
            className="text-xs text-brand-400 font-semibold hover:text-brand-300 transition-colors"
          >
            + Create New Invoice
          </Link>
        </div>
      </div>
    </div>
  );
}
export default BillingSummary;
