import React from "react";
import { ReportType } from "../types";

interface SummaryCardsProps {
  type: ReportType;
  summary?: any;
}

export function SummaryCards({ type, summary }: SummaryCardsProps) {
  if (!summary) return null;

  const renderCard = (title: string, value: string | number, subtext?: string) => (
    <div key={title} className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-white/[0.1]">
      <span className="text-xs font-medium text-surface-200/60 uppercase tracking-wider block mb-2">
        {title}
      </span>
      <div>
        <span className="text-3xl font-bold text-white tracking-tight block">
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-surface-200/40 mt-1 block">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );

  switch (type) {
    case "matters":
      const openCount = summary.statusBreakdown?.OPEN || 0;
      const closedCount = summary.statusBreakdown?.CLOSED || 0;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {renderCard("Total Matters", summary.totalCount || 0)}
          {renderCard("Active / Open", openCount, `${((openCount / (summary.totalCount || 1)) * 100).toFixed(0)}% of total`)}
          {renderCard("Total Est. Value", `$${(summary.totalEstimatedValue || 0).toLocaleString()}`)}
          {renderCard("Closed Matters", closedCount)}
        </div>
      );

    case "clients":
      const activeCount = summary.statusBreakdown?.ACTIVE || 0;
      const indCount = summary.clientTypeBreakdown?.INDIVIDUAL || 0;
      const orgCount = summary.clientTypeBreakdown?.ORGANIZATION || 0;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {renderCard("Total Clients", summary.totalCount || 0)}
          {renderCard("Active Clients", activeCount, `${((activeCount / (summary.totalCount || 1)) * 100).toFixed(0)}% active`)}
          {renderCard(
            "Client Demographics",
            `${indCount} / ${orgCount}`,
            "Individuals / Organizations"
          )}
        </div>
      );

    case "time":
      const totalHrs = ((summary.totalRecordedMinutes || 0) / 60).toFixed(1);
      const billableHrs = ((summary.totalBillableMinutes || 0) / 60).toFixed(1);
      const nonBillableHrs = ((summary.totalNonBillableMinutes || 0) / 60).toFixed(1);
      const totalAmt = summary.totalBillableAmount || 0;
      const avgRate = summary.averageHourlyRate || 0;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {renderCard("Total Hours", `${totalHrs} hrs`, `Billable: ${billableHrs} hrs`)}
          {renderCard("Non-Billable Hours", `${nonBillableHrs} hrs`)}
          {renderCard("Billable Amount", `$${totalAmt.toLocaleString()}`)}
          {renderCard("Avg Hourly Rate", `$${avgRate.toFixed(2)}/hr`)}
        </div>
      );

    case "invoices":
      const invTotal = summary.totalInvoiced || 0;
      const paidTotal = summary.totalPaid || 0;
      const dueTotal = summary.totalBalanceDue || 0;
      const overdueCount = summary.statusBreakdown?.OVERDUE || 0;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {renderCard("Total Invoiced", `$${invTotal.toLocaleString()}`)}
          {renderCard("Total Collected", `$${paidTotal.toLocaleString()}`, `${((paidTotal / (invTotal || 1)) * 100).toFixed(0)}% recovery rate`)}
          {renderCard("Balance Outstanding", `$${dueTotal.toLocaleString()}`)}
          {renderCard("Overdue Invoices", overdueCount, "Requires follow-up")}
        </div>
      );

    case "revenue":
      const revTotal = summary.totalRevenue || 0;
      const stripeTotal = summary.paymentMethodBreakdown?.STRIPE || 0;
      const checkTotal = summary.paymentMethodBreakdown?.CHECK || 0;
      const bankTotal = summary.paymentMethodBreakdown?.BANK_TRANSFER || 0;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {renderCard("Total Revenue", `$${revTotal.toLocaleString()}`)}
          {renderCard("Stripe payments", `$${stripeTotal.toLocaleString()}`)}
          {renderCard("Bank Transfers", `$${bankTotal.toLocaleString()}`)}
          {renderCard("Check / Cash / Other", `$${(revTotal - stripeTotal - bankTotal).toLocaleString()}`)}
        </div>
      );

    case "user-activity":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {renderCard("Total Activity Actions", summary.totalCount || 0)}
          {renderCard(
            "Distinct Modules Logged",
            Object.keys(summary.moduleBreakdown || {}).length,
            "Areas with configuration/timeline changes"
          )}
        </div>
      );

    default:
      return null;
  }
}
