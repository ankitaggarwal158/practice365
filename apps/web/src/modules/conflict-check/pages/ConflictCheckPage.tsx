import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConflictChecks } from "../hooks/useConflictChecks";

export default function ConflictCheckPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { checks, pagination, isLoading, error } = useConflictChecks({ page, limit: 10 });

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Conflict Clearance</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Review potential conflicts of interest history, manual clearance logs, and decisions.
          </p>
        </div>
        <button
          onClick={() => navigate("/conflict-checks/manual")}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 cursor-pointer"
        >
          Run Manual Search
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mb-6">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Table listing */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            <span className="ml-3 text-surface-200/60 text-sm">Loading clearance history...</span>
          </div>
        ) : !checks || checks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <span className="text-surface-200/40 text-lg mb-2 font-semibold">No Clearances Found</span>
            <span className="text-surface-200/30 text-sm">
              Initiate a check directly from a Lead details page, or start an ad-hoc manual search.
            </span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/[0.04]">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Execution Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Lead / Target
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Engine Result
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Final Decision
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Reviewer
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-transparent">
                  {checks.map((check) => (
                    <tr
                      key={check.id}
                      onClick={() => navigate(`/conflict-checks/${check.id}`)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-200/60">
                        {new Date(check.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">
                          {check.leadId ? `Lead: ${(check as any).leadId?.firstName} ${(check as any).leadId?.lastName}` : "Ad-hoc Target"}
                        </div>
                        {check.leadId && (
                          <div className="text-xs text-brand-400 mt-0.5">{(check as any).leadId?.leadNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-200/60">
                        {check.requestedByName || "System"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultBadgeClass(
                            check.overallResult
                          )}`}
                        >
                          {check.overallResult.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDecisionBadgeClass(
                            check.finalDecision
                          )}`}
                        >
                          {check.finalDecision}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-200/60 font-medium">
                        {check.reviewedByName || "Pending Attorney"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/conflict-checks/${check.id}`);
                          }}
                          className="text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
                        >
                          Review Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="bg-white/[0.02] border-t border-white/[0.04] px-6 py-4 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
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
                      <span className="font-semibold text-white">{pagination.total}</span> logs)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex gap-1" aria-label="Pagination">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Previous
                      </button>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                            p === page
                              ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                              : "bg-surface-950 border-white/[0.08] text-surface-200/60 hover:bg-white/[0.02] hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        disabled={page >= pagination.pages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
