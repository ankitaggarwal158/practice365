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
        return "bg-green-100 text-green-800 border-green-200";
      case "POSSIBLE_CONFLICT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED_CONFLICT":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manual Conflict Search</h1>
          <p className="mt-1 text-sm text-gray-500">Perform an ad-hoc query on firm databases before accepting a client.</p>
        </div>
        <button
          onClick={() => navigate("/conflict-checks")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Clearance History
        </button>
      </div>

      <div className="space-y-8">
        {/* Search Criteria Form */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-150">
          <form onSubmit={handleSearchSubmit} className="space-y-6">
            {validationError && (
              <div className="bg-red-50 p-3 rounded-md text-sm text-red-700">{validationError}</div>
            )}
            {error && <div className="bg-red-50 p-3 rounded-md text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="personName" className="block text-sm font-medium text-gray-700">
                  Full Name / Contact Name
                </label>
                <input
                  type="text"
                  name="personName"
                  id="personName"
                  placeholder="e.g. John Smith"
                  value={formData.personName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                  Organization / Corporate Name
                </label>
                <input
                  type="text"
                  name="organizationName"
                  id="organizationName"
                  placeholder="e.g. ABC Holdings"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="e.g. client@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  placeholder="e.g. +15551234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-305 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? "Searching Engine..." : "Search Firm Records"}
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Match Results Render */}
        {searchResults && (
          <div className="bg-white shadow rounded-lg p-6 border border-gray-150 space-y-6">
            <div className={`p-4 rounded border flex justify-between items-center ${getResultBadgeClass(searchResults.overallResult)}`}>
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase">Engine Clearance Assessment</h3>
                <span className="text-lg font-bold block mt-1">{searchResults.overallResult.replace("_", " ")}</span>
              </div>
              <span className="text-xs font-semibold max-w-[280px] text-right">
                {searchResults.overallResult === "NO_CONFLICT"
                  ? "Cleared for representation."
                  : `${searchResults.matches.length} matching hits flagged.`}
              </span>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 border-b pb-2 mb-4">Matches Found</h4>
              {searchResults.matches.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No conflicting record hits identified.</p>
              ) : (
                <div className="space-y-4">
                  {searchResults.matches.map((match, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-gray-100 flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                            {match.entityType.replace("_", " ")}
                          </span>
                          <h5 className="text-sm font-bold text-gray-900">{match.entityName}</h5>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Matched on <span className="font-semibold text-gray-700">{match.matchedField}</span>: {match.matchedValue}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Similarity</span>
                        <span className="text-sm font-bold text-gray-800">{Math.round(match.similarityScore * 100)}%</span>
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
