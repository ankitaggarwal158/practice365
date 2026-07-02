import { Link } from "react-router-dom";
import { CalendarEvent, EventType } from "../types/calendar.types";

interface AgendaListProps {
  events: CalendarEvent[];
}

const EVENT_TYPE_STYLES: Record<EventType, string> = {
  COURT_DATE: "border-l-4 border-danger bg-danger/10 text-danger-300",
  HEARING: "border-l-4 border-warning bg-warning/10 text-warning-300",
  MEETING: "border-l-4 border-brand-500 bg-brand-500/10 text-brand-300",
  DEADLINE: "border-l-4 border-purple-500 bg-purple-500/10 text-purple-300",
  APPOINTMENT: "border-l-4 border-success bg-success/10 text-success-300",
  REMINDER: "border-l-4 border-amber-500 bg-amber-500/10 text-amber-300",
  INTERNAL_EVENT: "border-l-4 border-surface-200 bg-surface-800 text-surface-300",
  OTHER: "border-l-4 border-white/20 bg-white/5 text-surface-200",
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  COURT_DATE: "Court Date",
  HEARING: "Hearing",
  MEETING: "Meeting",
  DEADLINE: "Deadline",
  APPOINTMENT: "Appointment",
  REMINDER: "Reminder",
  INTERNAL_EVENT: "Internal Event",
  OTHER: "Other",
};

export function AgendaList({ events }: AgendaListProps) {
  // Group events by YYYY-MM-DD
  const groupEventsByDay = () => {
    const groups: Record<string, CalendarEvent[]> = {};
    
    events.forEach((event) => {
      const dateStr = new Date(event.startDateTime).toISOString().split("T")[0] || "";
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(event);
    });

    // Sort days chronologically
    return Object.keys(groups)
      .sort()
      .map((day) => ({
        day,
        date: new Date(day + "T00:00:00"),
        events: (groups[day] || []).sort(
          (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        ),
      }));
  };

  const formattedDayTitle = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return "Today";
    }

    if (
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate()
    ) {
      return "Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) return "All Day";
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const formatTime = (d: Date) =>
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const dayGroups = groupEventsByDay();

  if (dayGroups.length === 0) {
    return (
      <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-12 text-center text-surface-200/40">
        <svg className="h-12 w-12 mx-auto opacity-35 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm">No agenda events matches active filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dayGroups.map(({ day, date, events: dayEvents }) => (
        <div key={day} className="space-y-3">
          {/* Day Header */}
          <h2 className="text-sm font-bold text-white/60 border-b border-white/[0.04] pb-1 uppercase tracking-wider">
            {formattedDayTitle(date)}
          </h2>

          {/* Day Events */}
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <Link
                key={event.id}
                to={`/calendar/${event.id}`}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border select-none transition-all duration-150 hover:bg-white/[0.02] ${
                  EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.OTHER
                } ${event.status === "COMPLETED" ? "opacity-50 line-through" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
                    <span className="font-bold uppercase tracking-wide">
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </span>
                    <span>•</span>
                    <span>{formatEventTime(event)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">{event.title}</h3>
                  {event.description && (
                    <p className="text-xs text-surface-200/50 line-clamp-1 mt-1 font-normal">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end gap-1 mt-2 md:mt-0 text-[11px] text-surface-200/40 shrink-0 font-normal">
                  {event.location && <span>📍 {event.location}</span>}
                  {event.assignedUsers?.length > 0 && (
                    <span>
                      👥 {event.assignedUsers.map((u) => u.displayName).join(", ")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export default AgendaList;
