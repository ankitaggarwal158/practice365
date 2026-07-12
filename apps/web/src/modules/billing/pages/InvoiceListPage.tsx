import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, Download, Trash2, Edit, CircleAlert } from "lucide-react";
import { useInvoices, useDeleteInvoice } from "../hooks/useInvoices";
import { invoiceApi } from "../api/invoice.api";
import { InvoiceStatus } from "../types/invoice.types";
import { toast } from "sonner";

export const InvoiceListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");

  const { data: invoicesData, isLoading, refetch } = useInvoices({
    page,
    limit: 25,
    status: statusFilter || undefined,
    searchText: searchText || undefined,
  });

  const deleteMutation = useDeleteInvoice();

  const handleDelete = async (id: string, number: string) => {
    if (window.confirm(`Are you sure you want to delete draft invoice ${number}?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleDownloadPDF = async (id: string, number: string) => {
    try {
      toast.info(`Generating PDF for ${number}...`);
      await invoiceApi.downloadPDF(id, number);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            Draft
          </span>
        );
      case InvoiceStatus.ISSUED:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            Issued
          </span>
        );
      case InvoiceStatus.PARTIALLY_PAID:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-100">
            Partially Paid
          </span>
        );
      case InvoiceStatus.PAID:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-100">
            Paid
          </span>
        );
      case InvoiceStatus.CANCELLED:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-100">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Helper formatting functions
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate high-level stats from current list (mock aggregates)
  const invoices = invoicesData?.data || [];
  const totalOutstanding = invoices
    .filter((inv) => inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.PARTIALLY_PAID)
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const draftSum = invoices
    .filter((inv) => inv.status === InvoiceStatus.DRAFT)
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const paidSum = invoices
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.amountPaid, 0);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Billing & Invoices</h1>
          <p className="text-sm text-surface-400 mt-1">Generate invoices, record payments, and manage outstanding balances.</p>
        </div>
        <Link
          to="/billing/create"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Invoice
        </Link>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Total Outstanding</span>
          <span className="text-2xl font-bold mt-2 text-amber-500">{formatCurrency(totalOutstanding)}</span>
        </div>
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Paid Amount</span>
          <span className="text-2xl font-bold mt-2 text-green-500">{formatCurrency(paidSum)}</span>
        </div>
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Draft Invoices</span>
          <span className="text-2xl font-bold mt-2 text-gray-300">{formatCurrency(draftSum)}</span>
        </div>
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Total Invoiced</span>
          <span className="text-2xl font-bold mt-2 text-white">
            {formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by invoice number..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-surface-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-950 border border-white/[0.08] text-sm text-white rounded-xl px-4 py-2 outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ISSUED">Issued</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-surface-900 border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-surface-400 font-medium">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <CircleAlert className="h-8 w-8 text-surface-400" />
            <p className="text-surface-400 font-medium">No invoices found matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-surface-400">Invoice Number</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-surface-400">Client / Matter</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-surface-400">Dates</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-surface-400">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-surface-400 text-right">Totals</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-surface-400 text-right">Balance Due</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-surface-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invoices.map((inv) => {
                  const clientName = inv.clientId
                    ? inv.clientId.name || `${inv.clientId.firstName || ""} ${inv.clientId.lastName || ""}`.trim()
                    : "Unknown Client";

                  return (
                    <tr key={inv._id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/billing/${inv._id}`} className="font-semibold text-brand-400 hover:text-brand-300">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{clientName}</div>
                        {inv.matterId && (
                          <div className="text-xs text-surface-400 mt-0.5">Matter: {inv.matterId.title}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-300">
                        <div>Issued: {formatDate(inv.issueDate)}</div>
                        <div className="text-xs text-surface-400 mt-0.5">Due: {formatDate(inv.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(inv.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-white">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-amber-500">
                        {formatCurrency(inv.balanceDue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                        <Link
                          to={`/billing/${inv._id}`}
                          className="text-surface-300 hover:text-white inline-flex items-center gap-1"
                          title="View Invoice Details"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        {inv.status === InvoiceStatus.DRAFT && (
                          <>
                            <Link
                              to={`/billing/${inv._id}/edit`}
                              className="text-blue-500 hover:text-blue-400 inline-flex items-center gap-1"
                              title="Edit Draft"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                              className="text-red-500 hover:text-red-400 inline-flex items-center gap-1 cursor-pointer"
                              title="Delete Draft"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {inv.status !== InvoiceStatus.DRAFT && (
                          <button
                            onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                            className="text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {invoicesData?.pagination && invoicesData.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <span className="text-sm text-surface-400 font-medium">
              Showing page {invoicesData.pagination.page} of {invoicesData.pagination.pages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-1.5 border border-white/[0.08] bg-surface-950 rounded-xl text-sm disabled:opacity-50 font-semibold hover:bg-surface-900 transition-all text-surface-200 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page === invoicesData.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1.5 border border-white/[0.08] bg-surface-950 rounded-xl text-sm disabled:opacity-50 font-semibold hover:bg-surface-900 transition-all text-surface-200 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
