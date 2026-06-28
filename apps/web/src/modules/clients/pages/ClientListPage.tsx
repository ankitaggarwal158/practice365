import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "../hooks/useClients";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { ListClientsParams } from "../api/client.api";

export default function ClientListPage() {
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const [filters, setFilters] = useState<ListClientsParams>({
    page: 1,
    limit: 10,
    status: "",
    clientType: "",
    q: "",
  });

  const { clients, pagination, isLoading, error } = useClients(filters);
  const canCreate = permissions.includes("CLIENTS_CREATE");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, clientType: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-success/10 text-success border border-success/20";
      case "INACTIVE":
        return "bg-warning/10 text-warning border border-warning/20";
      case "ARCHIVED":
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
      default:
        return "bg-white/[0.02] text-surface-200/40 border border-white/[0.04]";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Client Directory</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Manage active client relationships, track profile records, and consolidate histories.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate("/clients/new")}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Add Client
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or client ID..."
              value={filters.q}
              onChange={handleSearchChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
            />
          </div>
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Client Type
          </label>
          <select
            value={filters.clientType}
            onChange={handleTypeChange}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="ORGANIZATION">Organization</option>
          </select>
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
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
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-surface-200/50 text-sm">Fetching client directory...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg className="h-12 w-12 text-surface-200/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21" />
            </svg>
            <span className="text-white font-medium mb-1">No Clients Found</span>
            <span className="text-surface-200/40 text-sm text-center max-w-sm">
              Adjust search options or add a new client record.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/[0.04]">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Client ID / Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Client Name / Org
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Contact Details
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
                {clients.map((client) => {
                  const clientName = client.clientType === "INDIVIDUAL" 
                    ? `${client.firstName || ""} ${client.lastName || ""}`.trim()
                    : client.companyName || "";

                  return (
                    <tr
                      key={client.id}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-white">
                          {client.clientNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{clientName}</div>
                        {client.clientType === "INDIVIDUAL" && client.companyName && (
                          <div className="text-xs text-surface-200/40">{client.companyName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-surface-200/60 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
                          {client.clientType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-surface-200/80">{client.email || "-"}</div>
                        <div className="text-xs text-surface-200/40">{client.phone || ""}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="text-brand-400 hover:text-brand-300 font-semibold transition-colors duration-150"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="bg-white/[0.02] border-t border-white/[0.04] px-6 py-4 flex items-center justify-between">
                <div className="text-xs text-surface-200/40">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total items)
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
