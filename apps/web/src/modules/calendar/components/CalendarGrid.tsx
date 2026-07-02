import { Link } from "react-router-dom";
import { CalendarEvent, EventType } from "../types/calendar.types";

interface CalendarGridProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: "month" | "week" | "day";
  onNavigate: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_TYPE_STYLES: Record<EventType, string> = {
  COURT_DATE: "border-l-4 border-danger bg-danger/10 text-danger-300 hover:bg-danger/20",
  HEARING: "border-l-4 border-warning bg-warning/10 text-warning-300 hover:bg-warning/20",
  MEETING: "border-l-4 border-brand-500 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20",
  DEADLINE: "border-l-4 border-purple-500 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20",
  APPOINTMENT: "border-l-4 border-success bg-success/10 text-success-300 hover:bg-success/20",
  REMINDER: "border-l-4 border-amber-500 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
  INTERNAL_EVENT: "border-l-4 border-surface-200 bg-surface-800 text-surface-300 hover:bg-surface-700",
  OTHER: "border-l-4 border-white/20 bg-white/5 text-surface-200 hover:bg-white/10",
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

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export function CalendarGrid({ events, currentDate, view, onNavigate }: CalendarGridProps) {
  // Navigation helpers
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (view === "month") nextDate.setMonth(currentDate.getMonth() - 1);
    else if (view === "week") nextDate.setDate(currentDate.getDate() - 7);
    else if (view === "day") nextDate.setDate(currentDate.getDate() - 1);
    onNavigate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (view === "month") nextDate.setMonth(currentDate.getMonth() + 1);
    else if (view === "week") nextDate.setDate(currentDate.getDate() + 7);
    else if (view === "day") nextDate.setDate(currentDate.getDate() + 1);
    onNavigate(nextDate);
  };

  const handleToday = () => {
    onNavigate(new Date());
  };

  // Month calculation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Date[] = [];

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    // Next month padding to fill grid (42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  // Week calculation
  const getDaysInWeek = (date: Date) => {
    const currentDay = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDay);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // Formatting header titles
  const getHeaderTitle = () => {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (view === "week") {
      const weekDays = getDaysInWeek(currentDate);
      const start = weekDays[0] as Date;
      const end = weekDays[6] as Date;
      if (start.getFullYear() !== end.getFullYear()) {
        return `${start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}, ${start.getFullYear()} - ${end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}, ${end.getFullYear()}`;
      }
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", year: "numeric" }
      )}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const getFilteredEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const start = new Date(event.startDateTime);
      const end = new Date(event.endDateTime);
      // Event spans across this day if day is between start and end
      const d = new Date(day);
      d.setHours(0, 0, 0, 0);
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      const e = new Date(end);
      e.setHours(0, 0, 0, 0);

      return d >= s && d <= e;
    });
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) return "All Day";
    const start = new Date(event.startDateTime);
    return start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ─── Render View: Month ─────────────────────────────────────
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="grid grid-cols-7 border-t border-l border-white/[0.06] rounded-b-2xl overflow-hidden bg-surface-900/30">
        {/* Weekday columns headers */}
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="border-r border-b border-white/[0.06] bg-surface-950/80 py-3 text-center text-xs font-semibold text-surface-200/50 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}

        {/* Days grid cells */}
        {days.map((day, idx) => {
          const dayEvents = getFilteredEventsForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isTodayDay = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={`min-h-[120px] p-2 border-r border-b border-white/[0.06] transition-all flex flex-col justify-between ${
                isCurrentMonth ? "bg-transparent" : "bg-white/[0.01]"
              } ${isTodayDay ? "bg-brand-500/[0.02]" : ""}`}
            >
              {/* Day Number Header */}
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center ${
                    isTodayDay
                      ? "bg-brand-500 text-white font-bold"
                      : isCurrentMonth
                      ? "text-surface-100"
                      : "text-surface-200/30"
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-surface-200/40 font-medium">
                    {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                  </span>
                )}
              </div>

              {/* Day Events list */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                {dayEvents.slice(0, 3).map((event) => (
                  <Link
                    key={event.id}
                    to={`/calendar/${event.id}`}
                    className={`block text-[11px] px-2 py-1 rounded font-medium truncate select-none transition-all duration-150 ${
                      EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.OTHER
                    } ${event.status === "COMPLETED" ? "opacity-50 line-through" : ""}`}
                    title={`${event.title} (${EVENT_TYPE_LABELS[event.eventType]})`}
                  >
                    {!event.allDay && (
                      <span className="text-[10px] opacity-75 mr-1 font-normal">
                        {formatEventTime(event)}
                      </span>
                    )}
                    {event.title}
                  </Link>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-center text-brand-400 font-semibold py-0.5">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render View: Week ──────────────────────────────────────
  const renderWeekView = () => {
    const days = getDaysInWeek(currentDate);

    return (
      <div className="grid grid-cols-7 border-t border-l border-white/[0.06] rounded-b-2xl overflow-hidden bg-surface-900/30">
        {days.map((day, idx) => {
          const dayEvents = getFilteredEventsForDay(day);
          const isTodayDay = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={`min-h-[350px] border-r border-white/[0.06] flex flex-col ${
                isTodayDay ? "bg-brand-500/[0.02]" : ""
              }`}
            >
              {/* Day Header */}
              <div className="bg-surface-950/80 border-b border-white/[0.06] py-3 text-center">
                <span className="block text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                  {WEEKDAYS[day.getDay()]}
                </span>
                <span
                  className={`inline-flex items-center justify-center rounded-full h-7 w-7 mt-1 text-sm font-bold ${
                    isTodayDay ? "bg-brand-500 text-white" : "text-surface-100"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Day Events list */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                {dayEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] text-surface-200/20 text-center py-8 select-none">
                    Free
                  </div>
                ) : (
                  dayEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/calendar/${event.id}`}
                      className={`block text-xs p-2.5 rounded-lg border font-medium select-none shadow-sm transition-all duration-150 ${
                        EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.OTHER
                      } ${event.status === "COMPLETED" ? "opacity-50 line-through" : ""}`}
                    >
                      <div className="flex justify-between text-[10px] opacity-75 mb-1 font-normal">
                        <span>{EVENT_TYPE_LABELS[event.eventType]}</span>
                        <span>{formatEventTime(event)}</span>
                      </div>
                      <div className="truncate font-semibold">{event.title}</div>
                      {event.location && (
                        <div className="text-[10px] opacity-50 truncate mt-1">
                          📍 {event.location}
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render View: Day ───────────────────────────────────────
  const renderDayView = () => {
    const dayEvents = getFilteredEventsForDay(currentDate);

    return (
      <div className="bg-surface-900/30 border border-white/[0.06] rounded-b-2xl p-6 min-h-[300px]">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-surface-200/40">
            <svg className="h-12 w-12 opacity-35 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
            <p className="text-sm">No events scheduled for this day.</p>
            <Link
              to="/calendar/new"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold mt-2 hover:underline"
            >
              + Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayEvents.map((event) => (
              <Link
                key={event.id}
                to={`/calendar/${event.id}`}
                className={`block p-4 rounded-2xl border font-medium select-none shadow-sm transition-all duration-150 ${
                  EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.OTHER
                } ${event.status === "COMPLETED" ? "opacity-50 line-through" : ""}`}
              >
                <div className="flex justify-between items-center text-xs opacity-75 mb-2 font-normal">
                  <span className="uppercase font-bold tracking-wider">
                    {EVENT_TYPE_LABELS[event.eventType]}
                  </span>
                  <span>{formatEventTime(event)}</span>
                </div>
                <h3 className="text-lg font-bold truncate mb-1">{event.title}</h3>
                {event.description && (
                  <p className="text-xs opacity-60 line-clamp-2 mb-3">{event.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs opacity-50">
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
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl flex flex-col w-full shadow-2xl">
      {/* Calendar Grid Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-surface-950/40 rounded-t-2xl border-b border-white/[0.06]">
        <h1 className="text-lg font-bold text-white tracking-tight">{getHeaderTitle()}</h1>

        {/* Navigation Toolbar */}
        <div className="flex items-center gap-1.5 bg-surface-950 border border-white/[0.08] p-1 rounded-xl">
          <button
            onClick={handlePrev}
            className="p-2 text-surface-200/60 hover:text-white bg-transparent hover:bg-white/[0.03] rounded-lg transition-colors"
            title="Previous"
          >
            &larr;
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs text-white hover:text-brand-300 font-semibold bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 text-surface-200/60 hover:text-white bg-transparent hover:bg-white/[0.03] rounded-lg transition-colors"
            title="Next"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
    </div>
  );
}
export default CalendarGrid;
