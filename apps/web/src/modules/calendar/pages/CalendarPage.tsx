import { useState } from "react";
import { Link } from "react-router-dom";
import { useCalendarEvents } from "../hooks/useCalendar";
import CalendarGrid from "../components/CalendarGrid";
import AgendaList from "../components/AgendaList";
import Filters from "../components/Filters";

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  
  const [filters, setFilters] = useState<{
    start?: string;
    end?: string;
    matterId?: string;
    assignedUserId?: string;
    eventType?: string;
    status?: string;
    search?: string;
  }>({});

  // Query events using the active filters
  const { data, isLoading, error } = useCalendarEvents({
    start: filters.start,
    end: filters.end,
    matterId: filters.matterId,
    assignedUserId: filters.assignedUserId,
    eventType: filters.eventType,
    status: filters.status,
    search: filters.search,
    limit: 200, // retrieve a good batch of events for calendar display
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendar & Deadlines</h1>
          <p className="text-sm text-surface-200/60 mt-1">
            Centralized firm scheduler for legal cases, court dates, meetings, and team deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/calendar/new"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/50 text-xs font-semibold text-white transition-all duration-200 shadow-md flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>
      </div>

      {/* Main Workspace with Filter Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-72 lg:border-r border-b lg:border-b-0 border-white/[0.06] p-6 shrink-0 overflow-y-auto">
          <Filters filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
        </aside>

        {/* Calendar Workspace */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {/* Views Toggler */}
          <div className="flex justify-end">
            <div className="flex items-center bg-surface-950 border border-white/[0.08] p-1 rounded-xl">
              {(["month", "week", "day", "agenda"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    view === v
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-surface-200/50 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Loader or Content */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent animate-spin rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-danger/10 border border-danger/20 rounded-2xl p-6 text-center text-danger font-semibold">
              Failed to load calendar events. Please try again.
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {view === "agenda" ? (
                <AgendaList events={data?.data || []} />
              ) : (
                <CalendarGrid
                  events={data?.data || []}
                  currentDate={currentDate}
                  view={view}
                  onNavigate={setCurrentDate}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default CalendarPage;
