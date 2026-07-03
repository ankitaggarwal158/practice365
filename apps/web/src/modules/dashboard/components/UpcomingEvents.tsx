import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ArrowUpRight } from "lucide-react";

interface UpcomingEventsProps {
  events: any[] | null;
  isLoading: boolean;
}

export function UpcomingEvents({ events, isLoading }: UpcomingEventsProps) {
  if (events === null) return null;

  const formatEventTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatEventDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString([], { month: "short", day: "numeric", weekday: "short" });
  };

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-400" />
          <h3 className="font-semibold text-white">Upcoming Events</h3>
        </div>
        <Link
          to="/calendar"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          View Calendar <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto max-h-[380px]">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2].map((n) => (
              <div key={n} className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-surface-200/40">No upcoming events scheduled.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-surface-950/40 border border-white/[0.03] hover:border-white/[0.08] p-3.5 rounded-xl transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">{event.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-brand-500/10 text-brand-400 border-brand-500/20 uppercase shrink-0">
                    {event.eventType.replace("_", " ")}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                  <div className="flex items-center text-xs text-surface-200/50 gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatEventDate(event.startDateTime)}</span>
                  </div>
                  <div className="flex items-center text-xs text-surface-200/50 gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatEventTime(event.startDateTime)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-xs text-surface-200/50 gap-1 truncate max-w-full">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                {event.matterId && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.03] flex items-center justify-between">
                    <Link
                      to={`/matters/${event.matterId._id}`}
                      className="text-[11px] font-medium text-brand-400/80 hover:text-brand-400 hover:underline truncate"
                    >
                      Ref: {event.matterId.matterNumber}
                    </Link>
                    {event.assignedUsers && event.assignedUsers.length > 0 && (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {event.assignedUsers.map((user: any) => {
                          const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
                          return (
                            <div
                              key={user._id}
                              title={`${user.firstName} ${user.lastName}`}
                              className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-surface-800 border border-surface-900 text-[9px] font-bold text-surface-200"
                            >
                              {initials}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default UpcomingEvents;
