import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText, DollarSign, ArrowRight, ShieldCheck } from "lucide-react";
import { usePortalProfile, usePortalMatters, usePortalDocuments, usePortalInvoices } from "../hooks/usePortal";
import { formatCurrency } from "../../../modules/time-tracking/utils/format.utils";

export const DashboardPage: React.FC = () => {
  const { data: profile } = usePortalProfile();
  const { data: matters = [] } = usePortalMatters();
  const { data: documents = [] } = usePortalDocuments();
  const { data: invoices = [] } = usePortalInvoices();

  const clientName = profile
    ? profile.clientType === "INDIVIDUAL"
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : profile.companyName
    : "Client";

  const outstandingInvoices = invoices.filter((i) => i.balanceDue > 0);
  const totalOutstandingBalance = outstandingInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-surface-900 border border-white/[0.06] p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/15 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure Connection Active
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back, {clientName}</h1>
          <p className="text-sm text-surface-400 max-w-xl">
            Access your secure self-service portal to monitor active matters, download documents shared by your legal team, and view statement summaries.
          </p>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Matters Metric */}
        <Link
          to="/portal/matters"
          className="bg-surface-900 border border-white/[0.06] hover:border-brand-500/30 p-6 rounded-2xl transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-400">Active Matters</span>
              <div className="text-3xl font-extrabold text-white">{matters.length}</div>
            </div>
            <div className="p-3 bg-surface-950 border border-white/[0.04] rounded-xl text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
              <Briefcase className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1 text-xs text-brand-400 font-semibold">
            View matters list <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Documents Metric */}
        <Link
          to="/portal/documents"
          className="bg-surface-900 border border-white/[0.06] hover:border-brand-500/30 p-6 rounded-2xl transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-400">Shared Files</span>
              <div className="text-3xl font-extrabold text-white">{documents.length}</div>
            </div>
            <div className="p-3 bg-surface-950 border border-white/[0.04] rounded-xl text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
              <FileText className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1 text-xs text-brand-400 font-semibold">
            Access documents vault <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Invoices Metric */}
        <Link
          to="/portal/invoices"
          className="bg-surface-900 border border-white/[0.06] hover:border-brand-500/30 p-6 rounded-2xl transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-400">Outstanding Balance</span>
              <div className="text-3xl font-extrabold text-white">{formatCurrency(totalOutstandingBalance)}</div>
            </div>
            <div className="p-3 bg-surface-950 border border-white/[0.04] rounded-xl text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
              <DollarSign className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1 text-xs text-brand-400 font-semibold">
            {outstandingInvoices.length} invoices pending payment <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Split details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Matters widget */}
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-brand-400" /> Recent Matters
            </h3>
            <Link to="/portal/matters" className="text-xs font-bold text-brand-400 hover:text-brand-300">
              View All
            </Link>
          </div>
          {matters.length === 0 ? (
            <div className="p-8 text-center text-sm text-surface-500 bg-surface-950/40 rounded-xl border border-dashed border-white/[0.06]">
              No active matters reported.
            </div>
          ) : (
            <div className="space-y-2.5">
              {matters.slice(0, 3).map((m) => (
                <Link
                  key={m.id}
                  to={`/portal/matters/${m.id}`}
                  className="block p-4 bg-surface-950 hover:bg-surface-850 border border-white/[0.04] rounded-xl transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">{m.title}</div>
                      <div className="text-xs text-surface-400 mt-1">Number: {m.matterNumber}</div>
                    </div>
                    <span className="px-2 py-1 text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/15 rounded-full uppercase">
                      {m.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Invoices widget */}
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-brand-400" /> Pending Invoices
            </h3>
            <Link to="/portal/invoices" className="text-xs font-bold text-brand-400 hover:text-brand-300">
              View All
            </Link>
          </div>
          {outstandingInvoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-surface-500 bg-surface-950/40 rounded-xl border border-dashed border-white/[0.06]">
              No outstanding invoices.
            </div>
          ) : (
            <div className="space-y-2.5">
              {outstandingInvoices.slice(0, 3).map((i) => (
                <Link
                  key={i._id}
                  to="/portal/invoices"
                  className="block p-4 bg-surface-950 hover:bg-surface-850 border border-white/[0.04] rounded-xl transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">{i.invoiceNumber}</div>
                      <div className="text-xs text-surface-400 mt-1">
                        Due: {i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-500">{formatCurrency(i.balanceDue)}</div>
                      <span className="text-[10px] text-surface-400">Due Balance</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
