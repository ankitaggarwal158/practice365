import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeads } from "../hooks/useLeads";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { ListLeadsParams } from "../api/lead.api";

export default function LeadListPage() {
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const [filters, setFilters] = useState<ListLeadsParams>({
    page: 1,
    limit: 10,
    status: "",
    source: "",
    q: "",
  });

  const { leads, pagination, isLoading, error } = useLeads(filters);

  const canCreate = permissions.includes("LEADS_CREATE");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, source: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "CONTACTED":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "CONSULTATION_SCHEDULED":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "CONSULTATION_COMPLETED":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      case "ENGAGEMENT_SENT":
        return "bg-warning/10 text-warning border border-warning/20";
      case "QUALIFIED":
        return "bg-success/10 text-success border border-success/20";
      case "LOST":
        return "bg-danger/10 text-danger border border-danger/20";
      case "CONVERTED":
        return "bg-brand-500/10 text-brand-300 border border-brand-500/20";
      default:
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Lead Management</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Track, nurture, and qualify prospective business opportunities for the firm.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate("/leads/new")}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 cursor-pointer"
          >
            Create Lead
          </button>
        )}
      </div>

      {/* Filters section */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search number, name, email..."
            value={filters.q}
            onChange={handleSearchChange}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONSULTATION_SCHEDULED">Consultation Scheduled</option>
            <option value="CONSULTATION_COMPLETED">Consultation Completed</option>
            <option value="ENGAGEMENT_SENT">Engagement Sent</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="LOST">Lost</option>
            <option value="CONVERTED">Converted</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Source
          </label>
          <select
            value={filters.source}
            onChange={handleSourceChange}
            className="bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
          >
            <option value="">All Sources</option>
            <option value="INTAKE">Intake Conversion</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Table grid */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            <span className="ml-3 text-surface-200/60 text-sm">Loading leads...</span>
          </div>
        ) : !leads || leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <span className="text-surface-200/40 text-lg mb-2 font-semibold">No Leads Found</span>
            <span className="text-surface-200/30 text-sm text-center">
              Try adjusting your search criteria or create a new lead opportunity.
            </span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/[0.04]">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Subject / Practice Area
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-transparent">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-400">
                        {lead.leadNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {lead.firstName} {lead.lastName}
                        </div>
                        {lead.companyName && (
                          <div className="text-xs text-surface-200/50">{lead.companyName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white truncate max-w-xs">
                          {lead.subject}
                        </div>
                        <div className="text-xs text-surface-200/50">{lead.practiceArea || "Unassigned Practice Area"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-200/60 font-medium">
                        {lead.ownerName || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            lead.status
                          )}`}
                        >
                          {lead.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-200/60">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.id}`);
                          }}
                          className="text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="bg-white/[0.02] border-t border-white/[0.04] px-6 py-4 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-surface-200/50">
                      Showing page <span className="font-semibold text-white">{pagination.page}</span> of{" "}
                      <span className="font-semibold text-white">{pagination.pages}</span> (
                      <span className="font-semibold text-white">{pagination.total}</span> total leads)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex gap-1" aria-label="Pagination">
                      <button
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Previous
                      </button>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                            p === pagination.page
                              ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                              : "bg-surface-950 border-white/[0.08] text-surface-200/60 hover:bg-white/[0.02] hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
