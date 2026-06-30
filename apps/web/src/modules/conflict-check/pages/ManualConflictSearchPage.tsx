import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManualConflictSearch } from "../hooks/useManualConflictSearch";
import { ManualSearchRequest, MatchRecord } from "../types/conflict-check.types";

export default function ManualConflictSearchPage() {
  const navigate = useNavigate();
  const { search, isLoading, error } = useManualConflictSearch();

  const [formData, setFormData] = useState<ManualSearchRequest>({
    personName: "",
    organizationName: "",
    email: "",
    phone: "",
  });

  const [searchResults, setSearchResults] = useState<{
    overallResult: string;
    matches: MatchRecord[];
  } | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSearchResults(null);

    const hasCriteria =
      formData.personName?.trim() ||
      formData.organizationName?.trim() ||
      formData.email?.trim() ||
      formData.phone?.trim();

    if (!hasCriteria) {
      setValidationError("Please fill out at least one search field to execute a conflict query.");
      return;
    }

    try {
      const result = await search(formData);
      setSearchResults(result);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manual Conflict Search</h1>
          <p className="mt-2 text-sm text-surface-200/60">Perform an ad-hoc query on firm databases before accepting a client.</p>
        </div>
        <button
          onClick={() => navigate("/conflict-checks")}
          className="px-5 py-2.5 border border-white/[0.08] rounded-xl text-sm font-semibold text-surface-200/80 hover:bg-white/[0.02] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          Clearance History
        </button>
      </div>

      <div className="space-y-8">
        {/* Search Criteria Form */}
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
          <form onSubmit={handleSearchSubmit} className="space-y-6">
            {validationError && (
              <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-sm text-danger">{validationError}</div>
            )}
            {error && <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-sm text-danger">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="personName" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Full Name / Contact Name
                </label>
                <input
                  type="text"
                  name="personName"
                  id="personName"
                  placeholder="e.g. John Smith"
                  value={formData.personName}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="organizationName" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Organization / Corporate Name
                </label>
                <input
                  type="text"
                  name="organizationName"
                  id="organizationName"
                  placeholder="e.g. ABC Holdings"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="e.g. client@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  placeholder="e.g. +15551234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Searching Engine..." : "Search Firm Records"}
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Match Results Render */}
        {searchResults && (
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl space-y-6">
            <div className={`p-4 rounded-xl border flex justify-between items-center ${getResultBadgeClass(searchResults.overallResult)}`}>
              <div>
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Engine Clearance Assessment</h3>
                <span className="text-lg font-bold block mt-1.5">{searchResults.overallResult.replace("_", " ")}</span>
              </div>
              <span className="text-xs font-semibold max-w-[280px] text-right">
                {searchResults.overallResult === "NO_CONFLICT"
                  ? "Cleared for representation."
                  : `${searchResults.matches.length} matching hits flagged.`}
              </span>
            </div>

            <div>
              <h4 className="text-md font-semibold text-white border-b border-white/[0.04] pb-3 mb-4">Matches Found</h4>
              {searchResults.matches.length === 0 ? (
                <p className="text-sm text-surface-200/30 py-4 text-center">No conflicting record hits identified.</p>
              ) : (
                <div className="space-y-4">
                  {searchResults.matches.map((match, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-white/[0.06] bg-surface-950/40 flex justify-between items-start hover:border-white/[0.1] transition-colors">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/10 text-brand-300 border border-brand-500/20">
                            {match.entityType.replace("_", " ")}
                          </span>
                          <h5 className="text-sm font-bold text-white">{match.entityName}</h5>
                        </div>
                        <p className="text-xs text-surface-200/50 mt-2">
                          Matched on <span className="font-semibold text-surface-200">{match.matchedField}</span>: {match.matchedValue}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-surface-200/40 uppercase tracking-wider block">Similarity</span>
                        <span className="text-sm font-bold text-white block mt-0.5">{Math.round(match.similarityScore * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
