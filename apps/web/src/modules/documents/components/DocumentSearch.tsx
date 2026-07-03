import React from "react";
import { Search, X } from "lucide-react";

interface DocumentSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full sm:max-w-xs">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <Search className="h-4 w-4" />
      </span>
      <input
        type="text"
        placeholder="Search documents by name, tags, description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm text-gray-700 transition-all placeholder:text-gray-400"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
export default DocumentSearch;
