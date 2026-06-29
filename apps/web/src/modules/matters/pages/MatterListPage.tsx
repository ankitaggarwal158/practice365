import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMatters } from "../hooks/useMatters";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";
import { ListMattersParams, matterApi } from "../api/matter.api";
import { PracticeArea } from "../types/matter.types";

export default function MatterListPage() {
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const [filters, setFilters] = useState<ListMattersParams>({
    page: 1,
    limit: 10,
    status: "",
    priority: "",
    practiceAreaId: "",
    query: "",
  });

  const { matters, pagination, isLoading, error } = useMatters(filters);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);

  useEffect(() => {
    async function loadPA() {
      try {
        const data = await matterApi.listPracticeAreas();
        setPracticeAreas(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadPA();
  }, []);

  const canCreate = permissions.includes("MATTERS_CREATE");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, priority: e.target.value, page: 1 }));
  };

  const handlePAChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, practiceAreaId: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-success/10 text-success border border-success/20";
      case "ON_HOLD":
        return "bg-warning/10 text-warning border border-warning/20";
      case "CLOSED":
        return "bg-danger/10 text-danger border border-danger/20";
      case "ARCHIVED":
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
      default:
        return "bg-white/[0.02] text-surface-200/40 border border-white/[0.04]";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-danger/20 text-danger border border-danger/30 font-bold animate-pulse-subtle";
      case "HIGH":
        return "bg-danger/10 text-danger/90 border border-danger/20";
      case "NORMAL":
        return "bg-brand-500/10 text-brand-300 border border-brand-500/20";
      case "LOW":
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
      default:
        return "bg-white/[0.02] text-surface-200/40 border border-white/[0.04]";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Matter Management</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Create, manage, and track legal matter files, attorney assignments, and case workflows.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate("/matters/new")}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Create Matter
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by title, number, or court file..."
            value={filters.query}
            onChange={handleSearchChange}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Practice Area
          </label>
          <select
            value={filters.practiceAreaId}
            onChange={handlePAChange}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">All Areas</option>
            {practiceAreas.map((pa) => (
              <option key={pa.id} value={pa.id}>
                {pa.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[150px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={handlePriorityChange}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="w-[150px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Main Table view */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-surface-200/50 text-sm">Fetching legal files...</span>
          </div>
        ) : matters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg className="h-12 w-12 text-surface-200/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
            </svg>
            <span className="text-white font-medium mb-1">No Matters Found</span>
            <span className="text-surface-200/40 text-sm text-center max-w-sm">
              Adjust search options or open a new legal matter file.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/[0.04]">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Matter Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Matter Title / Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Practice Area / Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Responsible Attorney
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] bg-transparent">
                {matters.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => navigate(`/matters/${m.id}`)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-white">
                        {m.matterNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{m.title}</div>
                      <div className="text-xs text-surface-200/40">{m.clientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{m.practiceAreaName || "-"}</div>
                      <div className="text-xs text-surface-200/40">{m.matterType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-surface-200/80">
                        {m.responsibleAttorneyName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityBadgeClass(m.priority)}`}>
                        {m.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/matters/${m.id}`)}
                        className="text-brand-400 hover:text-brand-300 font-semibold transition-colors duration-150"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="bg-white/[0.02] border-t border-white/[0.04] px-6 py-4 flex items-center justify-between">
                <div className="text-xs text-surface-200/40">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total matters)
                </div>
                <div className="flex gap-2">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
