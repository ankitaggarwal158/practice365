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
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "AWAITING_RESPONSE":
        return "bg-orange-100 text-orange-800";
      case "QUALIFIED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CONVERTED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intake Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and process prospective client inquiries before they become leads.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate("/intakes/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            Create Intake
          </button>
        )}
      </div>

      {/* Filters section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search name, email, subject..."
            value={filters.q}
            onChange={handleSearchChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Source
          </label>
          <select
            value={filters.source}
            onChange={handleSourceChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading intakes list...</p>
        </div>
      ) : intakes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No intakes found matching the criteria.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {intakes.map((item) => (
              <li key={item.id}>
                <div
                  onClick={() => navigate(`/intakes/${item.id}`)}
                  className="block hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-indigo-600 truncate">
                          {item.intakeNumber}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-900 font-medium truncate">
                          {item.firstName} {item.lastName}
                          {item.companyName && (
                            <span className="text-gray-500 font-normal"> ({item.companyName})</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">{item.subject}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page! - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page === pagination.pages}
                  onClick={() => handlePageChange(filters.page! + 1)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.page}</span> of{" "}
                    <span className="font-medium">{pagination.pages}</span> (
                    <span className="font-medium">{pagination.total}</span> total records)
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page! - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span>Previous</span>
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          filters.page === p
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={filters.page === pagination.pages}
                      onClick={() => handlePageChange(filters.page! + 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span>Next</span>
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
