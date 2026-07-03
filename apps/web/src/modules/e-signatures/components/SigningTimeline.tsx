import { SignatureEvent } from "../types/signature.types";
import { format } from "date-fns";

interface SigningTimelineProps {
  events: SignatureEvent[];
}

export default function SigningTimeline({ events }: SigningTimelineProps) {
  const getEventIconColor = (type: SignatureEvent["eventType"]) => {
    switch (type) {
      case "COMPLETED":
      case "SIGNED":
        return "bg-success border-success/30 ring-success/20";
      case "VIEWED":
        return "bg-brand-500 border-brand-500/30 ring-brand-500/20";
      case "CANCELLED":
      case "DECLINED":
      case "EXPIRED":
        return "bg-danger border-danger/30 ring-danger/20";
      case "CREATED":
      case "SENT":
      case "EMAIL_DELIVERED":
      default:
        return "bg-surface-200/50 border-white/[0.12] ring-white/[0.04]";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-white">Audit History Timeline</h3>
      {events.length === 0 ? (
        <p className="text-sm text-surface-200/30 italic">No events recorded yet.</p>
      ) : (
        <div className="relative pl-6 border-l border-white/[0.06] ml-2 space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              {/* Dot indicator */}
              <div
                className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ring-4 ${getEventIconColor(
                  event.eventType
                )}`}
              />

              <div>
                <span className="text-[10px] text-surface-200/40 block mb-1">
                  {format(new Date(event.createdAt), "PPP p")}
                </span>
                <p className="text-sm text-surface-200/80 leading-relaxed">
                  {event.metadata?.message || event.eventType}
                </p>
                {(event.metadata?.ip || event.metadata?.userAgent) && (
                  <p className="text-[10px] text-surface-200/30 mt-1 font-mono">
                    IP: {event.metadata.ip || "N/A"} | OS/Browser: {event.metadata.userAgent || "N/A"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
