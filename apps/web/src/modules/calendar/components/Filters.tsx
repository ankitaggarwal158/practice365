import { useMatters } from "@/modules/matters";
import { useUsers } from "@/modules/users";
import { EventType, EventStatus } from "../types/calendar.types";

interface FiltersProps {
  filters: {
    start?: string;
    end?: string;
    matterId?: string;
    assignedUserId?: string;
    eventType?: string;
    status?: string;
    search?: string;
  };
  onChange: (filters: any) => void;
  onClear: () => void;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "COURT_DATE", label: "Court Date" },
  { value: "HEARING", label: "Hearing" },
  { value: "MEETING", label: "Meeting" },
  { value: "DEADLINE", label: "Deadline" },
  { value: "APPOINTMENT", label: "Appointment" },
  { value: "REMINDER", label: "Internal Reminder" },
  { value: "INTERNAL_EVENT", label: "Internal Event" },
  { value: "OTHER", label: "Other" },
];

const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "COMPLETED", label: "Completed" },
  { value: "MISSED", label: "Missed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function Filters({ filters, onChange, onClear }: FiltersProps) {
  const { matters, isLoading: isMattersLoading } = useMatters({ limit: 100 });
  const { users, isLoading: isUsersLoading } = useUsers({ limit: 100 });

  const handleFieldChange = (field: string, value: string) => {
    onChange({ [field]: value || undefined });
  };

  return (
    <div className="bg-surface-900/40 border border-white/[0.06] rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h2>
        <button
          onClick={onClear}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/60 uppercase mb-1.5">
            Search
          </label>
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleFieldChange("search", e.target.value)}
            placeholder="Search title, details, loc..."
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-400 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white placeholder-surface-200/20 transition-all duration-200"
          />
        </div>

        {/* Date Start */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/60 uppercase mb-1.5">
            From Date
          </label>
          <input
            type="date"
            value={filters.start || ""}
            onChange={(e) => handleFieldChange("start", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-400 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white transition-all duration-200"
          />
        </div>

        {/* Date End */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/60 uppercase mb-1.5">
            To Date
          </label>
          <input
            type="date"
            value={filters.end || ""}
            onChange={(e) => handleFieldChange("end", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-400 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white transition-all duration-200"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/60 uppercase mb-1.5">
            Event Type
          </label>
          <select
            value={filters.eventType || ""}
            onChange={(e) => handleFieldChange("eventType", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-400 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white transition-all duration-200"
          >
            <option value="">All Types</option>
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/60 uppercase mb-1.5">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleFieldChange("status", e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-400 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white transition-all duration-200"
          >
            <option value="">All Statuses</option>
            {EVENT_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Legal Matter */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/60 uppercase mb-1.5">
            Legal Matter
          </label>
          <select
            value={filters.matterId || ""}
            onChange={(e) => handleFieldChange("matterId", e.target.value)}
            disabled={isMattersLoading}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-400 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white transition-all duration-200 disabled:opacity-50"
          >
            <option value="">All Matters</option>
            <option value="none">No Matter (Standalone)</option>
            {matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.matterNumber} - {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned User */}
        <div>
          <label className="block text-xs font-semibold text-surface-200/60 uppercase mb-1.5">
            Assigned Staff
          </label>
          <select
            value={filters.assignedUserId || ""}
            onChange={(e) => handleFieldChange("assignedUserId", e.target.value)}
            disabled={isUsersLoading}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-400 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white transition-all duration-200 disabled:opacity-50"
          >
            <option value="">All Staff</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || `${u.firstName} ${u.lastName}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
export default Filters;
