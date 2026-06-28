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
        return "bg-green-100 text-green-800 border-green-200";
      case "POSSIBLE_CONFLICT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED_CONFLICT":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDecisionBadgeClass = (dec: string) => {
    switch (dec) {
      case "CLEARED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "WAIVED":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-500 border-dashed border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500 text-sm">Loading conflict check report...</span>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error || "Clearance report not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Execution ID: {check.id}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Conflict Clearance Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Executed on {new Date(check.createdAt).toLocaleString()} by {check.requestedByName || "System"}
          </p>
        </div>
        <button
          onClick={() => navigate("/conflict-checks")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Clearance History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matches and Engine Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Card Banner */}
          <div className={`p-6 rounded-lg border shadow-sm ${getResultBadgeClass(check.overallResult)}`}>
            <h2 className="text-lg font-bold uppercase tracking-wider">
              {check.overallResult.replace("_", " ")}
            </h2>
            <p className="text-sm mt-1">
              {check.overallResult === "NO_CONFLICT"
                ? "The clearance search did not identify any matching contacts in Leads or simulated Clients/Matters."
                : `The clearance search flagged ${check.matches.length} matching entity record(s) requiring attorney review.`}
            </p>
          </div>

          {/* Matches List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-150 p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Search Match Details</h3>

            {check.matches.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No matching entities found.</p>
            ) : (
              <div className="space-y-4">
                {check.matches.map((match, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                          {match.entityType.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900">{match.entityName}</h4>
                      </div>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                        <div>
                          <dt className="text-gray-400 font-semibold">Matched Field:</dt>
                          <dd className="text-gray-800">{match.matchedField}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-400 font-semibold">Matched Value:</dt>
                          <dd className="text-gray-800">{match.matchedValue}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-semibold block">Similarity</span>
                      <span className={`text-sm font-bold ${match.similarityScore >= 0.95 ? "text-red-600" : "text-yellow-600"}`}>
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-150">
            <h3 className="text-md font-semibold text-gray-900 pb-3 border-b mb-4">Attorney Determination</h3>

            {isPending ? (
              canReview ? (
                <form onSubmit={handleDecisionSubmit} className="space-y-4">
                  {saveError && (
                    <div className="bg-red-50 p-3 rounded text-xs text-red-700 mb-2">{saveError}</div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Record Decision
                    </label>
                    <div className="space-y-2">
                      {(["CLEARED", "WAIVED", "REJECTED"] as const).map((dec) => (
                        <label key={dec} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="decision"
                            value={dec}
                            checked={decision === dec}
                            onChange={() => setDecision(dec)}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{dec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reviewNotes" className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Attorney Clearance Notes
                    </label>
                    <textarea
                      id="reviewNotes"
                      rows={4}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add justifications, conflict waivers, or reasons for rejection..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingDecision}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSavingDecision ? "Recording..." : "Record Final Decision"}
                  </button>
                </form>
              ) : (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded border border-yellow-200 text-xs font-medium">
                  Determination Pending: Only users with attorney privileges may record clearance decisions.
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded border ${getDecisionBadgeClass(check.finalDecision)}`}>
                  <span className="block text-xs font-bold uppercase tracking-wider">Determination</span>
                  <span className="text-lg font-bold">{check.finalDecision}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Reviewing Attorney</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{check.reviewedByName || "System"}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Clearance Notes</span>
                  <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{check.reviewNotes || "No notes recorded."}</p>
                </div>
                {check.completedAt && (
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase">Finalized Date</span>
                    <p className="text-xs text-gray-500 mt-1">{new Date(check.completedAt).toLocaleString()}</p>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded text-[11px] text-gray-400 border">
                  Locked Log: This conflict decision is permanently finalized for regulatory compliance.
                </div>
              </div>
            )}
          </div>

          {check.leadId && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-150 space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase pb-2 border-b">Associated Lead Profile</h4>
              <div>
                <span className="text-xs font-semibold text-gray-400 block">Lead Reference</span>
                <Link
                  to={`/leads/${(check as any).leadId?._id}`}
                  className="text-sm font-semibold text-indigo-600 hover:underline block"
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
