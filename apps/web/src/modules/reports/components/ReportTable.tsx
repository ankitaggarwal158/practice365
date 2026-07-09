import React from "react";
import { ReportType } from "../types";

interface ReportTableProps {
  type: ReportType;
  data: any[];
  pagination?: any;
  onPageChange?: (newPage: number) => void;
  onSortChange?: (newSort: string) => void;
  currentSort?: string;
}

export function ReportTable({
  type,
  data,
  pagination,
  onPageChange,
  onSortChange,
  currentSort,
}: ReportTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-8 text-center text-surface-200/50">
        No records found matching filters.
      </div>
    );
  }

  const renderSortHeader = (label: string, field: string) => {
    if (!onSortChange) return <span>{label}</span>;

    const isCurrent = currentSort?.replace(/^-/, "") === field;
    const isDesc = currentSort?.startsWith("-");

    const handleSort = () => {
      if (isCurrent) {
        onSortChange(isDesc ? field : `-${field}`);
      } else {
        onSortChange(`-${field}`);
      }
    };

    return (
      <button
        onClick={handleSort}
        className="flex items-center gap-1 hover:text-white font-medium select-none cursor-pointer focus:outline-none"
      >
        {label}
        <span className="text-[10px]">
          {isCurrent ? (isDesc ? "▼" : "▲") : "↕"}
        </span>
      </button>
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
      case "ACTIVE":
      case "BILLABLE":
      case "PAID":
        return "bg-success/10 text-success border-success/20";
      case "ON_HOLD":
      case "PARTIALLY_PAID":
        return "bg-warning/10 text-warning border-warning/20";
      case "CLOSED":
      case "INACTIVE":
      case "NON_BILLABLE":
      case "DRAFT":
        return "bg-white/[0.04] text-surface-200/70 border-white/[0.06]";
      case "ARCHIVED":
      case "CANCELLED":
      case "OVERDUE":
        return "bg-danger/10 text-danger border-danger/20";
      default:
        return "bg-white/5 text-white/70 border-white/10";
    }
  };

  const formatHeaderCell = (header: any, field?: string) => (
    <th
      key={field || String(header)}
      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-200/60"
    >
      {field ? renderSortHeader(header, field) : header}
    </th>
  );

  const renderTableHeaders = () => {
    switch (type) {
      case "matters":
        return (
          <tr>
            {formatHeaderCell("Matter #", "matterNumber")}
            {formatHeaderCell("Title", "title")}
            {formatHeaderCell("Status", "status")}
            {formatHeaderCell("Practice Area")}
            {formatHeaderCell("Billing Method")}
            {formatHeaderCell("Est. Value", "estimatedValue")}
            {formatHeaderCell("Responsible Attorney")}
            {formatHeaderCell("Client")}
            {formatHeaderCell("Opened Date", "openedDate")}
          </tr>
        );
      case "clients":
        return (
          <tr>
            {formatHeaderCell("Client #", "clientNumber")}
            {formatHeaderCell("Name")}
            {formatHeaderCell("Type")}
            {formatHeaderCell("Status", "status")}
            {formatHeaderCell("Email")}
            {formatHeaderCell("Phone")}
            {formatHeaderCell("Created Date", "createdAt")}
          </tr>
        );
      case "time":
        return (
          <tr>
            {formatHeaderCell("Date", "date")}
            {formatHeaderCell("User")}
            {formatHeaderCell("Duration", "durationMinutes")}
            {formatHeaderCell("Rate")}
            {formatHeaderCell("Amount", "billableAmount")}
            {formatHeaderCell("Billing Type")}
            {formatHeaderCell("Billed")}
            {formatHeaderCell("Matter Reference")}
            {formatHeaderCell("Description")}
          </tr>
        );
      case "invoices":
        return (
          <tr>
            {formatHeaderCell("Invoice #", "invoiceNumber")}
            {formatHeaderCell("Client")}
            {formatHeaderCell("Status", "status")}
            {formatHeaderCell("Issue Date", "issueDate")}
            {formatHeaderCell("Total", "totalAmount")}
            {formatHeaderCell("Paid", "amountPaid")}
            {formatHeaderCell("Due", "balanceDue")}
          </tr>
        );
      case "revenue":
        return (
          <tr>
            {formatHeaderCell("Pay Date", "paymentDate")}
            {formatHeaderCell("Amount", "amount")}
            {formatHeaderCell("Method")}
            {formatHeaderCell("Reference")}
            {formatHeaderCell("Invoice #")}
            {formatHeaderCell("Client")}
          </tr>
        );
      case "user-activity":
        return (
          <tr>
            {formatHeaderCell("Timestamp", "createdAt")}
            {formatHeaderCell("User")}
            {formatHeaderCell("Module", "module")}
            {formatHeaderCell("Action", "action")}
            {formatHeaderCell("IP Address")}
            {formatHeaderCell("User Agent")}
          </tr>
        );
    }
  };

  const renderTableRows = () => {
    return data.map((item, idx) => {
      const rowClass = idx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent";
      const borderClass = "border-b border-white/[0.04] text-sm text-surface-200/80";

      switch (type) {
        case "matters":
          return (
            <tr key={item.id} className={`${rowClass} hover:bg-white/[0.03] transition-colors`}>
              <td className={`px-6 py-4 font-semibold text-white ${borderClass}`}>{item.matterNumber}</td>
              <td className={`px-6 py-4 font-medium ${borderClass}`}>{item.title}</td>
              <td className={`px-6 py-4 ${borderClass}`}>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.practiceAreaName || "N/A"}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.billingMethod}</td>
              <td className={`px-6 py-4 ${borderClass}`}>
                {item.estimatedValue ? `$${parseFloat(item.estimatedValue.toString()).toLocaleString()}` : "$0.00"}
              </td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.responsibleAttorneyName}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.clientName}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{new Date(item.openedDate).toLocaleDateString()}</td>
            </tr>
          );

        case "clients":
          const name = item.clientType === "INDIVIDUAL" ? `${item.firstName || ""} ${item.lastName || ""}`.trim() : item.companyName;
          return (
            <tr key={item.id} className={`${rowClass} hover:bg-white/[0.03] transition-colors`}>
              <td className={`px-6 py-4 font-semibold text-white ${borderClass}`}>{item.clientNumber}</td>
              <td className={`px-6 py-4 font-medium ${borderClass}`}>{name}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.clientType}</td>
              <td className={`px-6 py-4 ${borderClass}`}>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.email || "N/A"}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.phone || "N/A"}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{new Date(item.createdAt).toLocaleDateString()}</td>
            </tr>
          );

        case "time":
          return (
            <tr key={item.id} className={`${rowClass} hover:bg-white/[0.03] transition-colors`}>
              <td className={`px-6 py-4 ${borderClass}`}>{new Date(item.date).toLocaleDateString()}</td>
              <td className={`px-6 py-4 font-medium ${borderClass}`}>{item.userName}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{(item.durationMinutes / 60).toFixed(1)} hrs</td>
              <td className={`px-6 py-4 ${borderClass}`}>${(item.hourlyRate || 0).toFixed(2)}</td>
              <td className={`px-6 py-4 font-semibold text-white ${borderClass}`}>${(item.billableAmount || 0).toFixed(2)}</td>
              <td className={`px-6 py-4 ${borderClass}`}>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusBadgeClass(item.billingType)}`}>
                  {item.billingType}
                </span>
              </td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.isBilled ? "Yes" : "No"}</td>
              <td className={`px-6 py-4 ${borderClass}`}>
                {item.matterNumber ? `${item.matterNumber} - ${item.matterTitle}` : "Non-Matter"}
              </td>
              <td className={`px-6 py-4 max-w-xs truncate ${borderClass}`} title={item.description}>
                {item.description || "N/A"}
              </td>
            </tr>
          );

        case "invoices":
          return (
            <tr key={item.id} className={`${rowClass} hover:bg-white/[0.03] transition-colors`}>
              <td className={`px-6 py-4 font-semibold text-white ${borderClass}`}>{item.invoiceNumber}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.clientName}</td>
              <td className={`px-6 py-4 ${borderClass}`}>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td className={`px-6 py-4 ${borderClass}`}>{new Date(item.issueDate).toLocaleDateString()}</td>
              <td className={`px-6 py-4 ${borderClass}`}>${(item.totalAmount || 0).toLocaleString()}</td>
              <td className={`px-6 py-4 ${borderClass}`}>${(item.amountPaid || 0).toLocaleString()}</td>
              <td className={`px-6 py-4 font-semibold text-white ${borderClass}`}>${(item.balanceDue || 0).toLocaleString()}</td>
            </tr>
          );

        case "revenue":
          return (
            <tr key={item.id} className={`${rowClass} hover:bg-white/[0.03] transition-colors`}>
              <td className={`px-6 py-4 ${borderClass}`}>{new Date(item.paymentDate).toLocaleDateString()}</td>
              <td className={`px-6 py-4 font-semibold text-white ${borderClass}`}>${(item.amount || 0).toLocaleString()}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.paymentMethod}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.referenceNumber || "N/A"}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.invoiceNumber}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.clientName}</td>
            </tr>
          );

        case "user-activity":
          return (
            <tr key={item.id} className={`${rowClass} hover:bg-white/[0.03] transition-colors`}>
              <td className={`px-6 py-4 text-xs ${borderClass}`}>{new Date(item.createdAt).toLocaleString()}</td>
              <td className={`px-6 py-4 font-medium ${borderClass}`}>{item.userName}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.module}</td>
              <td className={`px-6 py-4 ${borderClass}`}>{item.action}</td>
              <td className={`px-6 py-4 text-xs ${borderClass}`}>{item.ipAddress || "N/A"}</td>
              <td className={`px-6 py-4 max-w-xs truncate text-xs ${borderClass}`} title={item.userAgent}>
                {item.userAgent || "N/A"}
              </td>
            </tr>
          );
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md overflow-hidden shadow-lg animate-fade-in flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead>{renderTableHeaders()}</thead>
          <tbody className="divide-y divide-white/[0.06]">{renderTableRows()}</tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="border-t border-white/[0.06] px-6 py-4 flex items-center justify-between bg-surface-900/10">
          <span className="text-xs text-surface-200/50">
            Showing Page <span className="font-semibold text-white">{pagination.page}</span> of{" "}
            <span className="font-semibold text-white">{pagination.pages}</span> (Total{" "}
            <span className="font-semibold text-white">{pagination.total}</span> records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:hover:bg-white/[0.02] text-xs font-semibold px-3 py-1.5 transition cursor-pointer select-none"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 disabled:hover:bg-white/[0.02] text-xs font-semibold px-3 py-1.5 transition cursor-pointer select-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
