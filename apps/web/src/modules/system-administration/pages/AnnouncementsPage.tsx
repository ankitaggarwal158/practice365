import { useState } from "react";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { SystemAnnouncement, AnnouncementSeverity } from "../types";
import { AnnouncementForm } from "../components/AnnouncementForm";
import { toast } from "sonner";

export function AnnouncementsPage() {
  const {
    announcements,
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAnnouncements();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SystemAnnouncement | null>(null);

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (announcement: SystemAnnouncement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingAnnouncement) {
      await updateAnnouncement({ id: editingAnnouncement._id, data });
    } else {
      await createAnnouncement(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteAnnouncement(id);
        toast.success("Announcement deleted successfully.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete announcement.");
      }
    }
  };

  const getSeverityBadgeClass = (severity: AnnouncementSeverity) => {
    switch (severity) {
      case AnnouncementSeverity.ERROR:
        return "bg-danger/10 text-danger border-danger/20";
      case AnnouncementSeverity.WARNING:
        return "bg-warning/10 text-warning border-warning/20";
      case AnnouncementSeverity.INFO:
      default:
        return "bg-brand-500/10 text-brand-300 border-brand-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            System Announcements
          </h2>
          <p className="text-sm text-surface-200/50 mt-1">
            Broadcast information banners to all users on login portals and dashboard panels.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 text-sm font-semibold transition cursor-pointer select-none"
        >
          Add Announcement
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-8 text-center text-surface-200/50">
          No announcements published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => {
            const isFuture = new Date(ann.startsAt) > new Date();
            const isExpired = new Date(ann.expiresAt) < new Date();
            const isActive = !isFuture && !isExpired;

            return (
              <div
                key={ann._id}
                className="rounded-xl border border-white/[0.06] bg-surface-900/40 p-5 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadgeClass(
                        ann.severity
                      )}`}
                    >
                      {ann.severity}
                    </span>
                    <span className="text-[11px] text-surface-200/40 font-medium">
                      {isActive ? (
                        <span className="text-success">● Active</span>
                      ) : isFuture ? (
                        <span className="text-warning">Scheduled</span>
                      ) : (
                        <span className="text-surface-200/30">Expired</span>
                      )}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white tracking-tight">
                    {ann.title}
                  </h4>
                  <p className="text-sm text-surface-200/70 mt-2 whitespace-pre-wrap">
                    {ann.message}
                  </p>
                </div>

                <div className="border-t border-white/[0.04] pt-4 mt-4 flex items-center justify-between text-xs text-surface-200/40">
                  <div className="flex flex-col gap-0.5">
                    <span>
                      Start: {new Date(ann.startsAt).toLocaleString()}
                    </span>
                    <span>
                      End: {new Date(ann.expiresAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="text-brand-300 hover:text-brand-400 font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="text-danger hover:text-danger-400 font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isFormOpen && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onSubmit={handleSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
export default AnnouncementsPage;
