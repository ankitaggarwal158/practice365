import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Calendar, User, FileText, CheckCircle } from "lucide-react";
import { useInvoice, useInvoicePayments } from "../hooks/useInvoices";
import { formatCurrency } from "../../../modules/time-tracking/utils/format.utils";

export const PaymentHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: invoiceData, isLoading: isLoadingInvoice } = useInvoice(id || "");
  const { data: payments = [], isLoading: isLoadingPayments } = useInvoicePayments(id || "");

  if (isLoadingInvoice || isLoadingPayments) {
    return <div className="p-12 text-center text-white">Loading transactions...</div>;
  }

  if (!invoiceData) {
    return (
      <div className="p-12 text-center text-white">
        <p>Invoice not found.</p>
        <Link to="/billing" className="text-brand-400 mt-4 block">Back to Invoices</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
        <Link
          to={`/billing/${id}`}
          className="p-2 border border-white/[0.08] hover:bg-surface-900 rounded-xl text-surface-400 hover:text-white transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Payments & Transactions</h1>
          <p className="text-sm text-surface-400 mt-1">
            Payment history log for invoice <span className="text-brand-400 font-bold">{invoiceData.invoiceNumber}</span>.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-900 border border-white/[0.06] p-5 rounded-2xl shadow-sm">
        <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-white/[0.06] pb-4 sm:pb-0 pr-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 flex items-center justify-center sm:justify-start gap-1">
            <FileText className="h-3.5 w-3.5" /> Total Invoice Amount
          </span>
          <div className="text-xl font-bold mt-1.5 text-white">{formatCurrency(invoiceData.totalAmount)}</div>
        </div>
        <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-white/[0.06] py-4 sm:py-0 px-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 flex items-center justify-center sm:justify-start gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-400" /> Amount Collected
          </span>
          <div className="text-xl font-bold mt-1.5 text-green-400">{formatCurrency(invoiceData.amountPaid)}</div>
        </div>
        <div className="text-center sm:text-left pt-4 sm:pt-0 pl-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 flex items-center justify-center sm:justify-start gap-1">
            <CreditCard className="h-3.5 w-3.5 text-amber-500" /> Balance Outstanding
          </span>
          <div className="text-xl font-bold mt-1.5 text-amber-500">{formatCurrency(invoiceData.balanceDue)}</div>
        </div>
      </div>

      {/* Payments log table */}
      <div className="bg-surface-900 border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Posted Payment Transactions</h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-surface-500 font-medium">
            No payments have been recorded for this invoice yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Date Posted</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Method</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Reference Number</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Notes / Remarks</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-surface-400">Recorded By</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-surface-400 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {payments.map((p) => {
                  const userDisplayName = p.receivedBy
                    ? `${p.receivedBy.firstName || ""} ${p.receivedBy.lastName || ""}`.trim()
                    : "System";

                  return (
                    <tr key={p._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-surface-500" />
                        {new Date(p.paymentDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-surface-300 uppercase font-semibold">
                        {p.paymentMethod.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-surface-300 font-mono">
                        {p.referenceNumber || <span className="text-surface-500 text-xs">N/A</span>}
                      </td>
                      <td className="px-6 py-4 text-surface-300 max-w-xs truncate" title={p.notes}>
                        {p.notes || <span className="text-surface-500 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-surface-300">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-surface-400" />
                          <span>{userDisplayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-green-400 font-bold">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
