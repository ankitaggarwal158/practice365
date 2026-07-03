import React from "react";

interface DocumentFiltersProps {
  category: string;
  setCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  category,
  setCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-wrap items-center gap-4">
      {/* Category Filter */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 min-w-[150px]"
        >
          <option value="">All Categories</option>
          <option value="General">General</option>
          <option value="Evidence">Evidence</option>
          <option value="Pleading">Pleading</option>
          <option value="Correspondence">Correspondence</option>
          <option value="Contract">Contract</option>
          <option value="Uncategorized">Uncategorized</option>
        </select>
      </div>

      {/* Sort By Field */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 min-w-[150px]"
        >
          <option value="createdAt">Date Uploaded</option>
          <option value="documentName">Document Name</option>
          <option value="fileSize">File Size</option>
        </select>
      </div>

      {/* Sort Order */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Direction</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 min-w-[120px]"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Reset button */}
      <button
        onClick={() => {
          setCategory("");
          setSortBy("createdAt");
          setSortOrder("desc");
        }}
        className="mt-5 px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
      >
        Clear Filters
      </button>
    </div>
  );
};
export default DocumentFilters;
