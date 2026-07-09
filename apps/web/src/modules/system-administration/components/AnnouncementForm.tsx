import React, { useState, useEffect } from "react";
import { SystemAnnouncement, AnnouncementSeverity } from "../types";
import { toast } from "sonner";

interface AnnouncementFormProps {
  announcement?: SystemAnnouncement | null;
  onSubmit: (data: any) => Promise<any>;
  onClose: () => void;
}

export function AnnouncementForm({ announcement, onSubmit, onClose }: AnnouncementFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AnnouncementSeverity>(AnnouncementSeverity.INFO);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setMessage(announcement.message);
      setSeverity(announcement.severity);
      // Format Dates to datetime-local local input format (YYYY-MM-DDTHH:mm)
      setStartsAt(new Date(announcement.startsAt).toISOString().slice(0, 16));
      setExpiresAt(new Date(announcement.expiresAt).toISOString().slice(0, 16));
    } else {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setTitle("");
      setMessage("");
      setSeverity(AnnouncementSeverity.INFO);
      setStartsAt(now.toISOString().slice(0, 16));
      setExpiresAt(nextWeek.toISOString().slice(0, 16));
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        message,
        severity,
        startsAt: new Date(startsAt).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
      });
      toast.success(announcement ? "Announcement updated." : "Announcement published.");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="rounded-2xl border border-white/[0.06] bg-surface-900/90 shadow-2xl p-6 sm:p-8 max-w-lg w-full animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {announcement ? "Edit Announcement" : "Publish Announcement"}
            </h3>
            <p className="text-sm text-surface-200/50 mt-1">
              Announcements will be displayed to all users during the specified timeline.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-surface-200/50 hover:text-white rounded-lg p-1.5 hover:bg-white/[0.04] transition cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white placeholder-surface-200/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="e.g. Scheduled System Upgrades"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
              Message
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white placeholder-surface-200/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Provide a detailed message detailing the notice or updates..."
            />
          </div>

          {/* Severity & Date grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AnnouncementSeverity)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={AnnouncementSeverity.INFO}>Info (Blue)</option>
                <option value={AnnouncementSeverity.WARNING}>Warning (Yellow)</option>
                <option value={AnnouncementSeverity.ERROR}>Critical (Red)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Starts At
              </label>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
                Expires At
              </label>
              <input
                type="datetime-local"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="rounded-xl border border-white/[0.06] bg-surface-900/50 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 hover:bg-white/[0.04] text-white px-4 py-2.5 text-sm font-semibold transition cursor-pointer select-none disabled:opacity-45"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-semibold transition cursor-pointer select-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                announcement ? "Update Announcement" : "Publish Announcement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AnnouncementForm;
