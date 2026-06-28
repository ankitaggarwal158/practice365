import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { UserStatus } from "../types/user.types";
import { UserTable } from "../components/UserTable";
import { InviteUserModal } from "../components/InviteUserModal";
import { Button } from "@/modules/auth/components/Button";

export function UserListPage() {
  const {
    users,
    pagination,
    filters,
    isLoading,
    error,
    refetch,
    updateFilters,
  } = useUsers();

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleSort = (field: string) => {
    const isSameField = filters.sortBy === field;
    const newOrder = isSameField && filters.order === "desc" ? "asc" : "desc";
    updateFilters({ sortBy: field, order: newOrder });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ q: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value || undefined });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      updateFilters({ page: newPage });
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Staff Directory</h1>
          <p className="text-sm text-surface-200/50">
            Invite and manage permissions for all users in your law firm.
          </p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="!w-auto px-5 gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Invite User
        </Button>
      </div>

      {/* Filters section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-200/40">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.q}
            onChange={handleSearchChange}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 pl-10 pr-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={filters.status || ""}
            onChange={handleStatusChange}
            className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-2.5 text-sm text-surface-100 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
          >
            <option value="" className="bg-surface-900">All Statuses</option>
            <option value={UserStatus.ACTIVE} className="bg-surface-900">Active</option>
            <option value={UserStatus.PENDING_INVITATION} className="bg-surface-900">Pending Invitation</option>
            <option value={UserStatus.SUSPENDED} className="bg-surface-900">Suspended</option>
            <option value={UserStatus.DEACTIVATED} className="bg-surface-900">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Main content table */}
      {error ? (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center text-danger">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          <UserTable
            users={users}
            sortBy={filters.sortBy}
            order={filters.order}
            onSort={handleSort}
          />

          {/* Pagination Toolbar */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-surface-800/40 pt-4">
              <span className="text-xs text-surface-200/40 select-none">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total members)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-surface-900/40 text-surface-200 hover:bg-white/[0.03] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-surface-900/40 text-surface-200 hover:bg-white/[0.03] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
export default UserListPage;
