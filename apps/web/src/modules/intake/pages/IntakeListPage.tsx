import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntakes } from "../hooks/useIntakes";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { ListIntakesParams } from "../api/intake.api";

export default function IntakeListPage() {
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const [filters, setFilters] = useState<ListIntakesParams>({
    page: 1,
    limit: 10,
    status: "",
    source: "",
    q: "",
  });

  const { intakes, pagination, isLoading, error } = useIntakes(filters);

  const canCreate = permissions.includes("INTAKES_CREATE");

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
      case "IN_REVIEW":
        return "bg-warning/10 text-warning border border-warning/20";
      case "AWAITING_RESPONSE":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "QUALIFIED":
        return "bg-success/10 text-success border border-success/20";
      case "REJECTED":
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Intake Management</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Track and process prospective client inquiries before they become leads.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate("/intakes/new")}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 cursor-pointer"
          >
            Create Intake
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
            placeholder="Search name, email, subject..."
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
            <option value="IN_REVIEW">In Review</option>
            <option value="AWAITING_RESPONSE">Awaiting Response</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="REJECTED">Rejected</option>
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
            <option value="WEBSITE">Website</option>
            <option value="PHONE">Phone Call</option>
            <option value="EMAIL">Email</option>
            <option value="WALK_IN">Walk-In</option>
            <option value="REFERRAL">Referral</option>
            <option value="ADVERTISEMENT">Advertisement</option>
            <option value="MANUAL">Manual Entry</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
          <p className="mt-2 text-sm text-surface-200/60">Loading intakes list...</p>
        </div>
      ) : !intakes || intakes.length === 0 ? (
        <div className="bg-surface-900/60 border border-white/[0.06] rounded-2xl p-12 text-center text-surface-200/40 font-medium shadow-xl">
          No intakes found matching the criteria.
        </div>
      ) : (
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
          <ul className="divide-y divide-white/[0.04]">
            {intakes.map((item) => (
              <li key={item.id}>
                <div
                  onClick={() => navigate(`/intakes/${item.id}`)}
                  className="block hover:bg-white/[0.02] cursor-pointer transition-colors duration-150"
                >
                  <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-brand-400">
                          {item.intakeNumber}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-white font-medium truncate">
                          {item.firstName} {item.lastName}
                          {item.companyName && (
                            <span className="text-surface-200/50 font-normal"> ({item.companyName})</span>
                          )}
                        </div>
                        <span className="text-xs text-surface-200/40">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-surface-200/60 truncate mt-2">{item.subject}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <div className="bg-white/[0.02] border-t border-white/[0.04] px-6 py-4 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page! - 1)}
                  className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page === pagination.pages}
                  onClick={() => handlePageChange(filters.page! + 1)}
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
                    <span className="font-semibold text-white">{pagination.total}</span> total records)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex gap-1" aria-label="Pagination">
                    <button
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page! - 1)}
                      className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                          filters.page === p
                            ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                            : "bg-surface-950 border-white/[0.08] text-surface-200/60 hover:bg-white/[0.02] hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={filters.page === pagination.pages}
                      onClick={() => handlePageChange(filters.page! + 1)}
                      className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
