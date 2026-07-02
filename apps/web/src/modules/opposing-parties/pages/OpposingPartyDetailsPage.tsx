import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  useOpposingParty,
  useDeleteOpposingParty,
  useArchiveOpposingParty,
  useMatterOpposingParties,
  useLinkOpposingParties,
  useUnlinkOpposingParty,
} from "../hooks/useOpposingParties";
import { useMatters } from "../../matters/hooks/useMatters";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function OpposingPartyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: op, isLoading: isPartyLoading } = useOpposingParty(id!);
  const { data: linkedMatters = [], isLoading: isMattersLoading } = useMatterOpposingParties(id!);
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const deleteMutation = useDeleteOpposingParty();
  const archiveMutation = useArchiveOpposingParty();
  const linkMutation = useLinkOpposingParties(id!); // Wait, useLinkOpposingParties hooks take matterId!
  // Ah! Let's check how useLinkOpposingParties and useUnlinkOpposingParty are defined:
  // export function useLinkOpposingParties(matterId: string) { ... }
  // export function useUnlinkOpposingParty(matterId: string) { ... }
  // Yes, they take matterId as parameter.

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedMatterId, setSelectedMatterId] = useState("");
  const [searchMatterQuery, setSearchMatterQuery] = useState("");

  // Search matters for linking
  const { matters = [], isLoading: isSearchMattersLoading } = useMatters({
    q: searchMatterQuery || undefined,
    status: "OPEN",
    limit: 50,
  });

  const canView = permissions.includes("OPPOSING_PARTIES_VIEW");
  const canManage = permissions.includes("OPPOSING_PARTIES_MANAGE");

  const handleDelete = async () => {
    if (!op) return;
    const name = op.partyType === "INDIVIDUAL" ? `${op.firstName} ${op.lastName}` : op.organizationName;
    if (confirm(`Are you sure you want to delete ${name}? This will permanently remove the record.`)) {
      deleteMutation.mutate(op.id, {
        onSuccess: () => {
          navigate("/opposing-parties");
        },
      });
    }
  };

  const handleToggleArchive = () => {
    if (!op) return;
    archiveMutation.mutate({ id: op.id, isActive: !op.isActive });
  };

  // Link opposing party to matter
  const handleLinkMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatterId || !op) return;

    // Call API link directly or use custom hook.
    // Wait, the hook is useLinkOpposingParties(matterId). It returns a mutation.
    // Let's call mutation:
    const linkMutationObj = linkMutation; // Wait, linkMutation requires matterId!
    // Since selectedMatterId changes, we can link manually or define a local trigger.
    // Let's call the api directly for linkage to make it simple and clean, or we can use custom mutation.
    // Actually, calling the api directly is simple, or we can trigger refetches.
    try {
      const opposingPartyApi = await import("../api/opposing-party.api");
      await opposingPartyApi.linkOpposingParties(selectedMatterId, [op.id]);
      setShowLinkModal(false);
      setSelectedMatterId("");
      setSearchMatterQuery("");
      // Refresh linked matters
      window.location.reload(); // simple page refresh to sync queries, or invalidate.
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to link opposing party.");
    }
  };

  // Unlink opposing party from matter
  const handleUnlinkMatter = async (matterId: string) => {
    if (!op) return;
    if (confirm("Are you sure you want to unlink this opposing party from this matter?")) {
      try {
        const opposingPartyApi = await import("../api/opposing-party.api");
        await opposingPartyApi.unlinkOpposingParty(matterId, op.id);
        window.location.reload();
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to unlink opposing party.");
      }
    }
  };

  if (isPartyLoading || isPermsLoading || isMattersLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canView || !op) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to view opposing parties.
      </div>
    );
  }

  const displayName =
    op.partyType === "INDIVIDUAL" ? `${op.firstName} ${op.lastName}` : op.organizationName;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate("/opposing-parties")}
            className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
          >
            &larr; Back to Opposing Parties
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{displayName}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                op.isActive
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-warning/10 border-warning/30 text-warning"
              }`}
            >
              {op.isActive ? "Active" : "Archived"}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/opposing-parties/${op.id}/edit`)}
              className="px-4 py-2 bg-surface-900 border border-white/[0.06] text-surface-200 hover:text-white text-sm font-semibold rounded-xl transition-all"
            >
              Edit Details
            </button>
            <button
              onClick={handleToggleArchive}
              className="px-4 py-2 bg-surface-900 border border-white/[0.06] text-warning hover:text-warning/80 text-sm font-semibold rounded-xl transition-all"
            >
              {op.isActive ? "Archive" : "Activate"}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 text-sm font-semibold rounded-xl transition-all"
            >
              Delete Record
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-surface-200/50">
              Overview Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Party Type
                </span>
                <span className="text-white text-sm font-semibold">{op.partyType}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Email Address
                </span>
                <span className="text-white text-sm">{op.email || "—"}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Phone Number
                </span>
                <span className="text-white text-sm">{op.phone || "—"}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Alternate Phone
                </span>
                <span className="text-white text-sm">{op.alternatePhone || "—"}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Website
                </span>
                {op.website ? (
                  <a
                    href={op.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline text-sm font-semibold"
                  >
                    {op.website}
                  </a>
                ) : (
                  <span className="text-white text-sm">—</span>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Postal Address
                </span>
                <div className="text-white text-sm leading-relaxed">
                  {op.addressLine1 ? (
                    <>
                      <div>{op.addressLine1}</div>
                      {op.addressLine2 && <div>{op.addressLine2}</div>}
                      <div>
                        {op.city}, {op.state} {op.postalCode}
                      </div>
                      {op.country && <div>{op.country}</div>}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider text-surface-200/50">
              Internal Notes
            </h2>
            <div className="text-sm text-surface-200/80 leading-relaxed whitespace-pre-wrap">
              {op.notes || "No notes recorded for this opposing party."}
            </div>
          </div>
        </div>

        {/* Linked Matters Panel */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider text-surface-200/50">
                Linked Matters
              </h2>
              {canManage && op.isActive && (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Link Matter
                </button>
              )}
            </div>

            {linkedMatters.length === 0 ? (
              <div className="text-center py-8 text-surface-200/40 text-xs">
                No matters currently linked to this opposing party.
              </div>
            ) : (
              <div className="space-y-4">
                {linkedMatters.map((assoc: any) => {
                  const matter = assoc.matterId;
                  if (!matter) return null;

                  return (
                    <div
                      key={assoc.id}
                      className="border border-white/[0.04] bg-surface-950/40 rounded-xl p-4 flex flex-col justify-between gap-3 group hover:border-white/[0.08] transition-colors"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] uppercase font-bold text-brand-300">
                            {matter.matterNumber}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              matter.status === "OPEN" ? "bg-success" : "bg-surface-500"
                            }`}
                            title={`Status: ${matter.status}`}
                          />
                        </div>
                        <Link
                          to={`/matters/${matter._id || matter.id}`}
                          className="font-bold text-white text-sm hover:underline block mt-1 leading-snug"
                        >
                          {matter.title}
                        </Link>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/[0.04] pt-2">
                        <span className="text-[10px] text-surface-200/45">
                          Linked {new Date(assoc.createdAt).toLocaleDateString()}
                        </span>
                        {canManage && (
                          <button
                            onClick={() => handleUnlinkMatter(matter._id || matter.id)}
                            className="text-[10px] text-danger hover:text-danger/80 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Unlink
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Matter Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-2">Link Matter</h3>
            <p className="text-xs text-surface-200/50 mb-4">
              Select an open legal matter to associate with {displayName}.
            </p>

            <form onSubmit={handleLinkMatter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-200/45 uppercase tracking-wider mb-2">
                  Search Matters
                </label>
                <input
                  type="text"
                  placeholder="Filter matters..."
                  value={searchMatterQuery}
                  onChange={(e) => setSearchMatterQuery(e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2 text-sm text-white transition-all mb-3"
                />

                <select
                  required
                  value={selectedMatterId}
                  onChange={(e) => setSelectedMatterId(e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all"
                >
                  <option value="">-- Choose Matter --</option>
                  {isSearchMattersLoading ? (
                    <option disabled>Loading matters...</option>
                  ) : matters.length === 0 ? (
                    <option disabled>No open matters found</option>
                  ) : (
                    matters.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.matterNumber}] {m.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedMatterId("");
                    setSearchMatterQuery("");
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-950 border border-white/[0.06] text-surface-200 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMatterId}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Link Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
