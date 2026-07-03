import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, CheckCircle, Ban, CreditCard, Download, Clock, DollarSign, Calendar, Clipboard, History, X } from "lucide-react";
import { useInvoice, useIssueInvoice, useCancelInvoice, useDeleteInvoice, useRecordPayment, useInvoicePayments } from "../hooks/useInvoices";
import { invoiceApi } from "../api/invoice.api";
import { InvoiceStatus, PaymentMethod } from "../types/invoice.types";
import { formatCurrency } from "../../../modules/time-tracking/utils/format.utils";
import { toast } from "sonner";

export const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoiceData, isLoading, refetch } = useInvoice(id || "");
  const { data: payments = [] } = useInvoicePayments(id || "");

  const issueMutation = useIssueInvoice();
  const cancelMutation = useCancelInvoice();
  const deleteMutation = useDeleteInvoice();
  const recordPaymentMutation = useRecordPayment(id || "");

  // Payment Form States
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);

  if (isLoading) {
    return <div className="p-12 text-center text-white">Loading invoice details...</div>;
  }

  if (!invoiceData) {
    return (
      <div className="p-12 text-center text-white">
        <p>Invoice not found.</p>
        <Link to="/billing" className="text-brand-400 mt-4 block">Back to Invoices</Link>
      </div>
    );
  }

  const { items = [] } = invoiceData;

  const handleIssue = () => {
    if (window.confirm("Are you sure you want to finalize and issue this invoice? Once issued, line items cannot be modified.")) {
      issueMutation.mutate(id || "", {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this invoice? Any linked time entries will be unlocked and released.")) {
      cancelMutation.mutate(id || "", {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this draft invoice? Any linked time entries will be unlocked.")) {
      deleteMutation.mutate(id || "", {
        onSuccess: () => navigate("/billing"),
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info(`Generating PDF...`);
      await invoiceApi.downloadPDF(invoiceData._id, invoiceData.invoiceNumber);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      return toast.error("Please enter a valid payment amount.");
    }
    if (amount > invoiceData.balanceDue) {
      if (!window.confirm("The entered payment amount exceeds the balance due. Do you want to proceed?")) {
        return;
      }
    }

    recordPaymentMutation.mutate(
      {
        amount,
        paymentMethod,
        paymentDate,
        referenceNumber: referenceNumber || undefined,
        notes: paymentNotes || undefined,
      },
      {
        onSuccess: () => {
          setShowPaymentForm(false);
          setPaymentAmount("");
          setReferenceNumber("");
          setPaymentNotes("");
          refetch();
        },
      }
    );
  };

  const openPaymentForm = () => {
    setPaymentAmount(invoiceData.balanceDue.toString());
    setShowPaymentForm(true);
  };

  const client = invoiceData.clientId;
  const clientName = client
    ? client.name || `${client.firstName || ""} ${client.lastName || ""}`.trim()
    : "Unknown Client";

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return <span className="px-3 py-1.5 text-xs font-bold bg-gray-500/10 text-gray-400 rounded-full border border-gray-500/20">Draft</span>;
      case InvoiceStatus.ISSUED:
        return <span className="px-3 py-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">Issued</span>;
      case InvoiceStatus.PARTIALLY_PAID:
        return <span className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">Partially Paid</span>;
      case InvoiceStatus.PAID:
        return <span className="px-3 py-1.5 text-xs font-bold bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Paid</span>;
      case InvoiceStatus.CANCELLED:
        return <span className="px-3 py-1.5 text-xs font-bold bg-red-500/10 text-red-400 rounded-full border border-red-500/20">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/billing"
            className="p-2 border border-white/[0.08] hover:bg-surface-900 rounded-xl text-surface-400 hover:text-white transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">{invoiceData.invoiceNumber}</h1>
              {getStatusBadge(invoiceData.status)}
            </div>
            <p className="text-sm text-surface-400 mt-1">Invoice details, billing records, and transactions.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          {invoiceData.status === InvoiceStatus.DRAFT && (
            <>
              <Link
                to={`/billing/${invoiceData._id}/edit`}
                className="inline-flex items-center gap-2 bg-surface-950 hover:bg-surface-850 border border-white/[0.08] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <Edit className="h-4 w-4" /> Edit Draft
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Delete Draft
              </button>
              <button
                onClick={handleIssue}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/15 transition-all cursor-pointer"
              >
                <CheckCircle className="h-4.5 w-4.5" /> Issue Invoice
              </button>
            </>
          )}

          {(invoiceData.status === InvoiceStatus.ISSUED || invoiceData.status === InvoiceStatus.PARTIALLY_PAID) && (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 bg-surface-950 hover:bg-surface-850 border border-white/[0.08] text-red-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                <Ban className="h-4 w-4" /> Cancel Invoice
              </button>
              <button
                onClick={openPaymentForm}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/15 transition-all cursor-pointer"
              >
                <CreditCard className="h-4.5 w-4.5" /> Record Payment
              </button>
            </>
          )}

          {invoiceData.status !== InvoiceStatus.DRAFT && (
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/15 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main section: Info & Items */}
        <div className="md:col-span-2 space-y-6">
          {/* Billing Info cards */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2 flex items-center gap-1.5">
                <Clipboard className="h-3.5 w-3.5 text-brand-400" /> Billed To
              </h3>
              <div className="text-sm font-bold text-white">{clientName}</div>
              {client?.email && <div className="text-xs text-surface-400 mt-1">{client.email}</div>}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-400" /> Key Dates
              </h3>
              <div className="text-sm text-white">
                <span className="font-semibold text-surface-300">Issued:</span>{" "}
                {invoiceData.issueDate ? new Date(invoiceData.issueDate).toLocaleDateString() : "Draft"}
              </div>
              <div className="text-sm text-white mt-1">
                <span className="font-semibold text-surface-300">Due:</span>{" "}
                {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : "Upon Receipt"}
              </div>
            </div>

            {invoiceData.matterId && (
              <div className="sm:col-span-2 border-t border-white/[0.06] pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-1">Matter Reference</h3>
                <Link to={`/matters/${invoiceData.matterId._id}`} className="text-sm font-semibold text-brand-400 hover:text-brand-300">
                  {invoiceData.matterId.title}
                </Link>
              </div>
            )}
          </div>

          {/* Line items Table */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invoice Line Items</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-surface-400">Description</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-surface-400">Type</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-surface-400 text-right">Quantity</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-surface-400 text-right">Rate</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-surface-400 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {items.map((item) => (
                  <tr key={item._id} className="text-sm">
                    <td className="px-6 py-4 text-white font-medium">{item.description}</td>
                    <td className="px-6 py-4 text-surface-400">
                      {item.sourceType === "TIME_ENTRY" ? "Time Entry" : "Adjustment"}
                    </td>
                    <td className="px-6 py-4 text-right text-surface-300">{item.quantity.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-surface-300">{formatCurrency(item.rate)}</td>
                    <td className="px-6 py-4 text-right text-white font-semibold">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payments list / Transaction logs */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-brand-400" /> Payment History
              </h3>
              {invoiceData.status !== InvoiceStatus.DRAFT && (
                <Link to={`/billing/${invoiceData._id}/payments`} className="text-xs font-semibold text-brand-400 hover:text-brand-300">
                  Detailed Logs
                </Link>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-sm text-surface-500">No payments recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                      <th className="px-6 py-2.5 text-[9px] font-bold uppercase tracking-wider text-surface-400">Date</th>
                      <th className="px-6 py-2.5 text-[9px] font-bold uppercase tracking-wider text-surface-400">Method</th>
                      <th className="px-6 py-2.5 text-[9px] font-bold uppercase tracking-wider text-surface-400">Ref #</th>
                      <th className="px-6 py-2.5 text-[9px] font-bold uppercase tracking-wider text-surface-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {payments.map((p) => (
                      <tr key={p._id} className="text-xs">
                        <td className="px-6 py-3.5 text-surface-300">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="px-6 py-3.5 text-surface-300 uppercase">{p.paymentMethod.replace("_", " ")}</td>
                        <td className="px-6 py-3.5 text-surface-400">{p.referenceNumber || "N/A"}</td>
                        <td className="px-6 py-3.5 text-right text-green-400 font-bold">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side column: Totals, balance, payment form */}
        <div className="space-y-6">
          {/* Invoice financial statement summary */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Financial Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-surface-300">
                <span>Subtotal:</span>
                <span className="font-medium text-white">{formatCurrency(invoiceData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-surface-300">
                <span>Tax:</span>
                <span className="font-medium text-white">{formatCurrency(invoiceData.taxAmount)}</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2.5 flex justify-between text-base font-bold text-white">
                <span>Total:</span>
                <span className="text-white">{formatCurrency(invoiceData.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-surface-300">
                <span>Amount Paid:</span>
                <span className="font-semibold text-green-400">{formatCurrency(invoiceData.amountPaid)}</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2.5 flex justify-between text-lg font-extrabold text-amber-500">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoiceData.balanceDue)}</span>
              </div>
            </div>

            {invoiceData.notes && (
              <div className="border-t border-white/[0.06] pt-4 mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-1">Invoice Notes</h4>
                <p className="text-xs text-surface-300 leading-relaxed bg-surface-950 p-3 rounded-xl border border-white/[0.04] max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {invoiceData.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment slide-over panel */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-surface-900 border-l border-white/[0.08] h-full p-6 shadow-2xl space-y-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5.5 w-5.5 text-brand-400" /> Record Payment
                </h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="p-1.5 border border-white/[0.08] hover:bg-surface-800 rounded-lg text-surface-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-surface-950 border border-white/[0.08] text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card Payment</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                    Payment Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                  <div className="text-right text-[10px] text-surface-400 mt-1.5">
                    Remaining balance: {formatCurrency(invoiceData.balanceDue)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. TXN987654"
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                    Transaction Notes
                  </label>
                  <textarea
                    rows={3}
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Memo details, bank branch etc..."
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 border border-white/[0.08] hover:bg-surface-950 text-surface-300 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordPaymentMutation.isPending}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/10 transition-all cursor-pointer flex justify-center items-center disabled:opacity-50"
                  >
                    {recordPaymentMutation.isPending ? "Submitting..." : "Post Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
