import React, { useState } from "react";
import { Search, DollarSign, Download, AlertCircle } from "lucide-react";
import { usePortalInvoices } from "../hooks/usePortal";
import { PortalApiClient } from "../api/portal.api";
import { formatCurrency } from "../../../modules/time-tracking/utils/format.utils";
import { InvoiceStatus } from "../../billing/types/invoice.types";
import { toast } from "sonner";

export const InvoiceListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const { data: invoices = [], isLoading } = usePortalInvoices(search || undefined);

  const handleDownloadPDF = async (id: string, number: string) => {
    try {
      toast.info("Generating statement PDF...");
      await PortalApiClient.downloadInvoicePDF(id, number);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download invoice PDF.");
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.ISSUED:
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">Issued</span>;
      case InvoiceStatus.PARTIALLY_PAID:
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">Partially Paid</span>;
      case InvoiceStatus.PAID:
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Paid</span>;
      case InvoiceStatus.CANCELLED:
        return <span className="px-2.5 py-1 text-[10px] font-bold bg-red-500/10 text-red-400 rounded-full border border-red-500/20">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Invoices & Billing</h1>
          <p className="text-sm text-surface-400 mt-1">Review billings statements and download invoice PDFs.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices by number..."
            className="w-full bg-surface-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-white">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center text-surface-500 bg-surface-900 border border-dashed border-white/[0.06] rounded-2xl">
          <AlertCircle className="h-8 w-8 mx-auto text-surface-650 mb-2" />
          No invoices found.
        </div>
      ) : (
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Invoice Number</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Date Issued</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Due Date</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Total Amount</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Balance Due</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      <DollarSign className="h-4.5 w-4.5 text-brand-400 shrink-0" />
                      <span>{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-surface-300">
                      {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-surface-300">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className={`px-6 py-4 font-bold ${inv.balanceDue > 0 ? "text-amber-500" : "text-green-400"}`}>
                      {formatCurrency(inv.balanceDue)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                        className="p-2 border border-white/[0.08] hover:bg-brand-500 hover:text-white rounded-xl text-surface-400 hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center"
                      >
                        <Download className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default InvoiceListPage;
