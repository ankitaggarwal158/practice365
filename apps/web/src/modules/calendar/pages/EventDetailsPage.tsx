import { useNavigate, useParams, Link } from "react-router-dom";
import { useCalendarEvent, useDeleteEvent, useCompleteEvent } from "../hooks/useCalendar";
import { EventType, EventStatus, CalendarEvent } from "../types/calendar.types";

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

const STATUS_BADGES: Record<EventStatus, string> = {
  UPCOMING: "bg-brand-500/10 text-brand-300 border-brand-500/20",
  COMPLETED: "bg-success/10 text-success-300 border-success/20",
  MISSED: "bg-danger/10 text-danger-300 border-danger/20",
  CANCELLED: "bg-white/5 text-surface-300 border-white/10",
};

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useCalendarEvent(id || "");
  const event = data as CalendarEvent;
  const deleteMutation = useDeleteEvent();
  const completeMutation = useCompleteEvent();

  const handleDelete = () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this calendar event?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          navigate("/calendar");
        },
      });
    }
  };

  const handleToggleComplete = () => {
    if (!id || !event) return;
    const nextStatus = event.status === "COMPLETED" ? "UPCOMING" : "COMPLETED";
    completeMutation.mutate({ id, status: nextStatus });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Calendar event not found or access denied.
      </div>
    );
  }

  const formatEventDateTime = () => {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    if (event.allDay) {
      return start.toLocaleDateString("en-US", dateOptions) + " (All Day)";
    }

    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString("en-US", dateOptions)} • ${start.toLocaleTimeString(
        "en-US",
        timeOptions
      )} - ${end.toLocaleTimeString("en-US", timeOptions)}`;
    }

    return `${start.toLocaleDateString("en-US", dateOptions)} ${start.toLocaleTimeString(
      "en-US",
      timeOptions
    )} - ${end.toLocaleDateString("en-US", dateOptions)} ${end.toLocaleTimeString(
      "en-US",
      timeOptions
    )}`;
  };

  const formatReminder = (minutes: number) => {
    if (minutes === 0) return "At time of event";
    if (minutes < 60) return `${minutes} minutes before`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours} hours before`;
    const days = hours / 24;
    if (days < 7) return `${days} days before`;
    return `${days / 7} weeks before`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate("/calendar")}
            className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
          >
            &larr; Back to Calendar
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{event.title}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                STATUS_BADGES[event.status]
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            disabled={completeMutation.isPending}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 select-none ${
              event.status === "COMPLETED"
                ? "border-success/30 hover:bg-success/5 text-success-300"
                : "border-white/[0.08] hover:bg-white/[0.04] text-white"
            }`}
          >
            {event.status === "COMPLETED" ? "✓ Completed" : "Mark Completed"}
          </button>

          <Link
            to={`/calendar/${event.id}/edit`}
            className="px-4 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-xs font-semibold text-white transition-all duration-200"
          >
            Edit
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2.5 rounded-xl bg-danger/10 hover:bg-danger/25 border border-danger/30 text-xs font-semibold text-danger-300 transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8 space-y-6">
            {/* Date & Time */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-200/40 mb-1.5">
                Date & Time
              </h3>
              <p className="text-base text-white font-medium">{formatEventDateTime()}</p>
            </div>

            {/* Location */}
            {event.location && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-200/40 mb-1.5">
                  Location
                </h3>
                <p className="text-sm text-white flex items-center gap-1.5">
                  <span>📍</span> {event.location}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-200/40 mb-1.5">
                Description
              </h3>
              {event.description ? (
                <p className="text-sm text-surface-100 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              ) : (
                <p className="text-sm text-surface-200/30 italic">No description provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 space-y-6">
            {/* Meta Attributes */}
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-surface-200/40 mb-1">
                  Event Category
                </span>
                <span className="text-sm text-white font-medium">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </span>
              </div>

              {/* Linked Matter */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-surface-200/40 mb-1">
                  Linked Matter
                </span>
                {event.matterId ? (
                  <Link
                    to={`/matters/${event.matterId}`}
                    className="text-sm text-brand-400 hover:text-brand-300 font-semibold hover:underline block truncate"
                  >
                    Matter Link &rarr;
                  </Link>
                ) : (
                  <span className="text-sm text-surface-200/30 italic">Standalone Event</span>
                )}
              </div>
            </div>

            {/* Assigned Staff */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-200/40 border-b border-white/[0.06] pb-2 mb-3">
                Assigned Staff
              </h3>
              {event.assignedUsers && event.assignedUsers.length > 0 ? (
                <ul className="space-y-2.5">
                  {event.assignedUsers.map((u: any) => (
                    <li key={u.id} className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-brand-500/10 flex items-center justify-center text-[10px] font-bold text-brand-400">
                        {u.firstName.charAt(0)}
                        {u.lastName.charAt(0)}
                      </div>
                      <span className="text-xs text-white font-medium">
                        {u.displayName || `${u.firstName} ${u.lastName}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-surface-200/30 italic">No assigned staff members</p>
              )}
            </div>

            {/* Reminders List */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-200/40 border-b border-white/[0.06] pb-2 mb-3">
                Reminders
              </h3>
              {event.reminderOffsets && event.reminderOffsets.length > 0 ? (
                <ul className="space-y-2">
                  {event.reminderOffsets.map((offset: number) => (
                    <li key={offset} className="text-xs text-surface-200/80 flex items-center gap-1.5 font-medium">
                      <span>⏰</span> {formatReminder(offset)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-surface-200/30 italic">No notifications configured</p>
              )}
            </div>

            {/* Created By details */}
            <div className="border-t border-white/[0.06] pt-4 text-[10px] text-surface-200/40 space-y-1">
              <div>Created by: {event.createdBy.displayName}</div>
              <div>Created on: {new Date(event.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EventDetailsPage;
