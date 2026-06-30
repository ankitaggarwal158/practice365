import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useConflictCheck } from "../hooks/useConflictCheck";
import { useReviewConflict } from "../hooks/useReviewConflict";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";

export default function ConflictDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const { check, isLoading, error, refetch } = useConflictCheck(id);
  const { review, isLoading: isSavingDecision, error: saveError } = useReviewConflict();

  const [decision, setDecision] = useState<"CLEARED" | "WAIVED" | "REJECTED">("CLEARED");
  const [reviewNotes, setReviewNotes] = useState("");

  const canReview = permissions.includes("CONFLICT_REVIEW");
  const isPending = check?.finalDecision === "PENDING";

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      if (window.confirm(`Are you sure you want to record the decision as ${decision}? This action is immutable.`)) {
        await review(id, decision, reviewNotes);
        refetch();
      }
    } catch (err) {
      // Handled by hook error state
    }
  };

  const getResultBadgeClass = (res: string) => {
    switch (res) {
      case "NO_CONFLICT":
        return "bg-success/10 text-success border border-success/20";
      case "POSSIBLE_CONFLICT":
        return "bg-warning/10 text-warning border border-warning/20";
      case "CONFIRMED_CONFLICT":
        return "bg-danger/10 text-danger border border-danger/20";
      default:
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
    }
  };

  const getDecisionBadgeClass = (dec: string) => {
    switch (dec) {
      case "CLEARED":
        return "bg-success/10 text-success border border-success/20";
      case "WAIVED":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "REJECTED":
        return "bg-danger/10 text-danger border border-danger/20";
      default:
        return "bg-white/[0.02] text-surface-200/40 border border-dashed border-white/[0.08]";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        <p className="mt-2 text-sm text-surface-200/60">Loading conflict check report...</p>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-center">
          <p className="text-sm text-danger">{error || "Clearance report not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8 border-b border-white/[0.06] pb-6">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate("/conflict-checks")}
            className="flex items-center gap-2 text-sm font-medium text-surface-200/50 hover:text-white mb-4 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Clearance History
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
              Execution ID: {check.id}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">Conflict Clearance Report</h1>
          <p className="text-sm text-surface-200/60 mt-2">
            Executed on {new Date(check.createdAt).toLocaleString()} by {check.requestedByName || "System"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matches and Engine Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Card Banner */}
          <div className={`p-6 rounded-2xl border shadow-sm leading-relaxed ${getResultBadgeClass(check.overallResult)}`}>
            <h2 className="text-lg font-bold uppercase tracking-wider">
              {check.overallResult.replace("_", " ")}
            </h2>
            <p className="text-sm mt-2">
              {check.overallResult === "NO_CONFLICT"
                ? "The clearance search did not identify any matching contacts in Leads or simulated Clients/Matters."
                : `The clearance search flagged ${check.matches.length} matching entity record(s) requiring attorney review.`}
            </p>
          </div>

          {/* Matches List */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3 mb-4">Search Match Details</h3>

            {check.matches.length === 0 ? (
              <p className="text-sm text-surface-200/30 py-4 text-center">No matching entities found.</p>
            ) : (
              <div className="space-y-4">
                {check.matches.map((match, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/[0.06] bg-surface-950/40 hover:border-white/[0.1] transition-colors flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/10 text-brand-300 border border-brand-500/20">
                          {match.entityType.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-bold text-white">{match.entityName}</h4>
                      </div>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs leading-relaxed">
                        <div>
                          <dt className="text-surface-200/40 font-semibold uppercase">Matched Field</dt>
                          <dd className="text-surface-200 mt-0.5">{match.matchedField}</dd>
                        </div>
                        <div>
                          <dt className="text-surface-200/40 font-semibold uppercase">Matched Value</dt>
                          <dd className="text-surface-200 mt-0.5">{match.matchedValue}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-surface-200/40 uppercase tracking-wider block">Similarity</span>
                      <span className={`text-sm font-bold mt-0.5 block ${match.similarityScore >= 0.95 ? "text-danger" : "text-warning"}`}>
                        {Math.round(match.similarityScore * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clearance Decision controls */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
            <h3 className="text-md font-semibold text-white pb-3 border-b border-white/[0.04] mb-4">Attorney Determination</h3>

            {isPending ? (
              canReview ? (
                <form onSubmit={handleDecisionSubmit} className="space-y-4">
                  {saveError && (
                    <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-xs text-danger mb-4">{saveError}</div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                      Record Decision
                    </label>
                    <div className="space-y-2.5">
                      {(["CLEARED", "WAIVED", "REJECTED"] as const).map((dec) => (
                        <label key={dec} className="flex items-center space-x-3 cursor-pointer text-white">
                          <input
                            type="radio"
                            name="decision"
                            value={dec}
                            checked={decision === dec}
                            onChange={() => setDecision(dec)}
                            className="h-4 w-4 border-white/[0.12] bg-surface-950 text-brand-500 focus:ring-brand-500/80 cursor-pointer"
                          />
                          <span className="text-sm font-semibold">{dec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reviewNotes" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                      Attorney Clearance Notes
                    </label>
                    <textarea
                      id="reviewNotes"
                      rows={4}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add justifications, conflict waivers, or reasons for rejection..."
                      className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingDecision}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingDecision ? "Recording..." : "Record Final Decision"}
                  </button>
                </form>
              ) : (
                <div className="bg-warning/10 border border-warning/20 text-warning p-4 rounded-xl text-xs font-medium leading-relaxed">
                  Determination Pending: Only users with attorney privileges may record clearance decisions.
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border leading-relaxed ${getDecisionBadgeClass(check.finalDecision)}`}>
                  <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Determination</span>
                  <span className="text-lg font-bold mt-1.5 block">{check.finalDecision}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-surface-200/40 uppercase tracking-wider">Reviewing Attorney</span>
                  <p className="text-sm font-semibold text-white mt-1">{check.reviewedByName || "System"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-surface-200/40 uppercase tracking-wider">Clearance Notes</span>
                  <p className="text-sm text-surface-200/80 mt-1 whitespace-pre-wrap leading-relaxed bg-surface-950/20 p-3 rounded-lg border border-white/[0.04]">{check.reviewNotes || "No notes recorded."}</p>
                </div>
                {check.completedAt && (
                  <div>
                    <span className="block text-[10px] font-semibold text-surface-200/40 uppercase tracking-wider">Finalized Date</span>
                    <p className="text-xs text-surface-200/60 mt-1">{new Date(check.completedAt).toLocaleString()}</p>
                  </div>
                )}
                <div className="bg-surface-950/40 p-3.5 rounded-xl border border-white/[0.04] text-[10px] text-surface-200/40 leading-relaxed">
                  Locked Log: This conflict decision is permanently finalized for regulatory compliance.
                </div>
              </div>
            )}
          </div>

          {check.leadId && (
            <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl space-y-4">
              <h4 className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider pb-2 border-b border-white/[0.04]">Associated Lead Profile</h4>
              <div>
                <span className="text-xs text-surface-200/40 block">Lead Reference</span>
                <Link
                  to={`/leads/${(check as any).leadId?._id}`}
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors block mt-1"
                >
                  {(check as any).leadId?.firstName} {(check as any).leadId?.lastName} ({(check as any).leadId?.leadNumber})
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
