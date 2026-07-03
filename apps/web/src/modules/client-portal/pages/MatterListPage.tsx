import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, Calendar, ChevronRight, AlertCircle } from "lucide-react";
import { usePortalMatters } from "../hooks/usePortal";

export const MatterListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const { data: matters = [], isLoading } = usePortalMatters(search || undefined);

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Matters</h1>
          <p className="text-sm text-surface-400 mt-1">Overview of open, pending, and past legal matters.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matters by title..."
            className="w-full bg-surface-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-white">Loading cases...</div>
      ) : matters.length === 0 ? (
        <div className="p-12 text-center text-surface-500 bg-surface-900 border border-dashed border-white/[0.06] rounded-2xl">
          <AlertCircle className="h-8 w-8 mx-auto text-surface-650 mb-2" />
          No legal matters found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matters.map((m) => (
            <Link
              key={m.id}
              to={`/portal/matters/${m.id}`}
              className="bg-surface-900 border border-white/[0.06] hover:border-brand-500/30 p-5 rounded-2xl transition-all flex justify-between items-center group cursor-pointer"
            >
              <div className="space-y-2.5 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-wider bg-surface-950 px-2 py-0.5 border border-white/[0.04] rounded-md text-surface-400">
                    {m.matterNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                    {m.practiceAreaName || (m.practiceAreaId as any)?.name || "General Law"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                  {m.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Opened: {new Date(m.openedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                  m.status === "OPEN" 
                    ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                }`}>
                  {m.status}
                </span>
                <ChevronRight className="h-5 w-5 text-surface-500 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default MatterListPage;
