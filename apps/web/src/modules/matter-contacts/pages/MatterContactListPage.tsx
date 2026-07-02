import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMatterContacts,
  useDeleteMatterContact,
  useArchiveMatterContact,
} from "../hooks/useMatterContacts";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function MatterContactListPage() {
  const navigate = useNavigate();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [contactType, setContactType] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { data: result, isLoading } = useMatterContacts({
    page,
    limit,
    contactType: contactType || undefined,
    isActive,
    search: searchTerm || undefined,
  });

  const deleteMutation = useDeleteMatterContact();
  const archiveMutation = useArchiveMatterContact();

  const canView = permissions.includes("MATTER_CONTACTS_VIEW");
  const canManage = permissions.includes("MATTER_CONTACTS_MANAGE");

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will permanently remove the record.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleArchive = (id: string, currentActive: boolean) => {
    archiveMutation.mutate({ id, isActive: !currentActive });
  };

  if (isLoading || isPermsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to view matter contacts.
      </div>
    );
  }

  const contacts = result?.data || [];
  const pagination = result?.pagination || { page: 1, total: 0, pages: 1 };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Matter Contacts</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Directory of expert witnesses, judges, mediators, and other non-client case actors.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/matter-contacts/new")}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Add Contact
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl mb-8">
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Search Contacts
          </label>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Contact Type
          </label>
          <select
            value={contactType}
            onChange={(e) => {
              setContactType(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="ORGANIZATION">Organization</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Record Status
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsActive(true);
                setPage(1);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                isActive
                  ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                  : "bg-surface-950 border-white/[0.04] text-surface-200/50 hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setIsActive(false);
                setPage(1);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                !isActive
                  ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                  : "bg-surface-950 border-white/[0.04] text-surface-200/50 hover:text-white"
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-900/40 backdrop-blur-md border border-white/[0.04] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-200/40 uppercase bg-surface-950/50 border-b border-white/[0.04]">
              <tr>
                <th className="px-6 py-4 font-semibold">Name / Organization</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-200/50">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const displayName =
                    c.contactType === "INDIVIDUAL"
                      ? `${c.firstName} ${c.lastName}`
                      : c.organizationName;

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <span
                          onClick={() => navigate(`/matter-contacts/${c.id}`)}
                          className="font-semibold text-white group-hover:text-brand-300 transition-colors cursor-pointer"
                        >
                          {displayName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-surface-950 text-surface-300 border-white/5">
                          {c.contactType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-surface-200/60">
                        <div className="text-xs">{c.email || "—"}</div>
                        <div className="text-xs text-surface-200/30">{c.phone || "—"}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            c.isActive ? "bg-success" : "bg-warning"
                          }`}
                          title={c.isActive ? "Active" : "Archived"}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/matter-contacts/${c.id}`)}
                            className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-semibold"
                          >
                            View
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => navigate(`/matter-contacts/${c.id}/edit`)}
                                className="text-xs text-surface-200/50 hover:text-white transition-colors font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleArchive(c.id, c.isActive)}
                                className="text-xs text-warning hover:text-warning/80 transition-colors font-semibold"
                              >
                                {c.isActive ? "Archive" : "Activate"}
                              </button>
                              <button
                                onClick={() => handleDelete(c.id, displayName || "")}
                                className="text-xs text-danger hover:text-danger/80 transition-colors font-semibold"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-xs text-surface-200/40 font-medium">
            Showing Page {pagination.page} of {pagination.pages} (Total: {pagination.total} records)
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-white/[0.06] text-surface-100 hover:bg-surface-800 disabled:opacity-50 disabled:hover:bg-surface-900 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-white/[0.06] text-surface-100 hover:bg-surface-800 disabled:opacity-50 disabled:hover:bg-surface-900 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
