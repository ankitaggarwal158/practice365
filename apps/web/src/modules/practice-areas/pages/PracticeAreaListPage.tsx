import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePracticeAreas,
  useUpdatePracticeAreaStatus,
  useDeletePracticeArea,
  } from "../hooks/usePracticeAreas";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function PracticeAreaListPage() {
  const navigate = useNavigate();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();
  const { data: practiceAreas = [], isLoading } = usePracticeAreas();
  const updateStatus = useUpdatePracticeAreaStatus();
  const deletePA = useDeletePracticeArea();
  
  const [searchTerm, setSearchTerm] = useState("");

  const canView = permissions.includes("PRACTICE_AREAS_VIEW");
  const canManage = permissions.includes("PRACTICE_AREAS_MANAGE");

  const filteredAreas = practiceAreas.filter(
    (pa) =>
      pa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pa.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deletePA.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    updateStatus.mutate({ id, isActive: !currentStatus });
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
        Access Denied. You do not have permissions to view practice areas.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Practice Areas</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Manage your firm's practice areas and categorization for legal matters.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/practice-areas/new")}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Add Practice Area
          </button>
        )}
      </div>

      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl mb-8">
        <div className="w-full md:max-w-md">
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Search Practice Areas
          </label>
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>
      </div>

      <div className="bg-surface-900/40 backdrop-blur-md border border-white/[0.04] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-surface-200/40 uppercase bg-surface-950/50 border-b border-white/[0.04]">
              <tr>
                <th className="px-6 py-4 font-semibold">Name & Code</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                {canManage && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-surface-200/50">
                    No practice areas found.
                  </td>
                </tr>
              ) : (
                filteredAreas.map((pa) => (
                  <tr key={pa.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {pa.color && (
                          <div
                            className="w-3 h-3 rounded-full shadow-inner border border-white/10"
                            style={{ backgroundColor: pa.color }}
                          />
                        )}
                        <div>
                          <div className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                            {pa.name}
                            {pa.isSystem && (
                              <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-surface-200/40 mt-1 uppercase tracking-wider">{pa.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-surface-200/60 line-clamp-2">{pa.description || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(pa.id, pa.isActive)}
                        disabled={!canManage}
                        className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                          pa.isActive
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                            : "bg-surface-800 text-surface-200/50 border-white/10 hover:bg-surface-700"
                        } ${!canManage && "opacity-80 cursor-not-allowed"}`}
                      >
                        {pa.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/practice-areas/${pa.id}/edit`)}
                            className="p-2 text-surface-200/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {!pa.isSystem && (
                            <button
                              onClick={() => handleDelete(pa.id, pa.name)}
                              className="p-2 text-surface-200/50 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
