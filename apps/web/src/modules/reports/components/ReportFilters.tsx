
import { ReportType } from "../types";
import { useUsers } from "@/modules/users";
import { useClients } from "@/modules/clients/hooks/useClients";
import { useMatters } from "@/modules/matters/hooks/useMatters";
import { usePracticeAreas } from "@/modules/practice-areas/hooks/usePracticeAreas";

interface ReportFiltersProps {
  type: ReportType;
  filters: any;
  onChange: (newFilters: any) => void;
}

export function ReportFilters({ type, filters, onChange }: ReportFiltersProps) {
  // Load lookup data conditionally to prevent extra requests when not needed
  const loadUsers = type === "matters" || type === "time" || type === "user-activity";
  const loadClients = type === "matters" || type === "invoices";
  const loadMatters = type === "time" || type === "invoices";
  

  const { users = [] } = useUsers(loadUsers ? { limit: 100 } : {});
  const { clients = [] } = useClients(loadClients ? { limit: 100 } : {});
  const { matters = [] } = useMatters(loadMatters ? { limit: 100 } : {});
  const { data: practiceAreas = [] } = usePracticeAreas();

  const handleFilterChange = (key: string, value: any) => {
    onChange({
      ...filters,
      [key]: value === "" ? undefined : value,
      page: 1, // Reset page on filter changes
    });
  };

  const renderDateField = (key: string, label: string) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="date"
        value={filters[key] || ""}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white placeholder-surface-200/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-6 shadow-md mb-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {/* Date Filters (Common) */}
        {renderDateField("fromDate", "From Date")}
        {renderDateField("toDate", "To Date")}

        {/* Matter Report Specific */}
        {type === "matters" && (
          <>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Practice Area
              </label>
              <select
                value={filters.practiceAreaId || ""}
                onChange={(e) => handleFilterChange("practiceAreaId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Practice Areas</option>
                {practiceAreas.map((pa: any) => (
                  <option key={pa._id} value={pa._id}>
                    {pa.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Attorney
              </label>
              <select
                value={filters.responsibleAttorneyId || ""}
                onChange={(e) => handleFilterChange("responsibleAttorneyId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Attorneys</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Client
              </label>
              <select
                value={filters.clientId || ""}
                onChange={(e) => handleFilterChange("clientId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Clients</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.clientType === "INDIVIDUAL" ? `${c.firstName} ${c.lastName}`.trim() : c.companyName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Client Report Specific */}
        {type === "clients" && (
          <>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Client Type
              </label>
              <select
                value={filters.clientType || ""}
                onChange={(e) => handleFilterChange("clientType", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Types</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="ORGANIZATION">Organization</option>
              </select>
            </div>
          </>
        )}

        {/* Time Report Specific */}
        {type === "time" && (
          <>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Billing Type
              </label>
              <select
                value={filters.billingType || ""}
                onChange={(e) => handleFilterChange("billingType", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Billing Types</option>
                <option value="BILLABLE">Billable</option>
                <option value="NON_BILLABLE">Non-Billable</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                User
              </label>
              <select
                value={filters.userId || ""}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Users</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Matter Reference
              </label>
              <select
                value={filters.matterId || ""}
                onChange={(e) => handleFilterChange("matterId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Matters</option>
                {matters.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} - {m.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Invoice Report Specific */}
        {type === "invoices" && (
          <>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Invoice Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Client
              </label>
              <select
                value={filters.clientId || ""}
                onChange={(e) => handleFilterChange("clientId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Clients</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.clientType === "INDIVIDUAL" ? `${c.firstName} ${c.lastName}`.trim() : c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Matter Reference
              </label>
              <select
                value={filters.matterId || ""}
                onChange={(e) => handleFilterChange("matterId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Matters</option>
                {matters.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} - {m.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Revenue Report Specific */}
        {type === "revenue" && (
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod || ""}
              onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
              className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Methods</option>
              <option value="STRIPE">Stripe</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Check</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        )}

        {/* User Activity Report Specific */}
        {type === "user-activity" && (
          <>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                User
              </label>
              <select
                value={filters.userId || ""}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Users</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Module
              </label>
              <input
                type="text"
                placeholder="e.g. Matters"
                value={filters.module || ""}
                onChange={(e) => handleFilterChange("module", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white placeholder-surface-200/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Action
              </label>
              <input
                type="text"
                placeholder="e.g. UPDATE_MATTER"
                value={filters.action || ""}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white placeholder-surface-200/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </>
        )}

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={() => onChange({ page: 1, limit: filters.limit })}
          className="rounded-xl border border-white/10 hover:bg-white/[0.04] text-white px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer h-[42px] select-none"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
