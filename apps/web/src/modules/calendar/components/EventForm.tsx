import React, { useState, useEffect } from "react";
import { CreateEventRequest, EventType, EventStatus } from "../types/calendar.types";
import { useMatters } from "@/modules/matters";
import { useUsers } from "@/modules/users";
import ReminderEditor from "./ReminderEditor";

interface EventFormProps {
  initialData?: Partial<CreateEventRequest>;
  onSubmit: (data: CreateEventRequest) => void;
  isLoading: boolean;
  submitLabel?: string;
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

function formatDateTimeLocal(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function EventForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Save Event",
}: EventFormProps) {
  // Fetch matters and users for form dropdowns
  const { matters, isLoading: isMattersLoading } = useMatters({ limit: 100 });
  const { users, isLoading: isUsersLoading } = useUsers({ limit: 100 });

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [eventType, setEventType] = useState<EventType>(initialData?.eventType || "MEETING");
  const [startDateTime, setStartDateTime] = useState(
    formatDateTimeLocal(initialData?.startDateTime) ||
      formatDateTimeLocal(new Date().toISOString())
  );
  const [endDateTime, setEndDateTime] = useState(
    formatDateTimeLocal(initialData?.endDateTime) ||
      formatDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000).toISOString())
  );
  const [allDay, setAllDay] = useState(initialData?.allDay || false);
  const [location, setLocation] = useState(initialData?.location || "");
  const [matterId, setMatterId] = useState<string | null>(initialData?.matterId || null);
  const [assignedUsers, setAssignedUsers] = useState<string[]>(initialData?.assignedUsers || []);
  const [reminderOffsets, setReminderOffsets] = useState<number[]>(
    initialData?.reminderOffsets || []
  );
  const [status, setStatus] = useState<EventStatus>(initialData?.status || "UPCOMING");

  useEffect(() => {
    if (initialData) {
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (initialData.eventType !== undefined) setEventType(initialData.eventType);
      if (initialData.startDateTime !== undefined)
        setStartDateTime(formatDateTimeLocal(initialData.startDateTime));
      if (initialData.endDateTime !== undefined)
        setEndDateTime(formatDateTimeLocal(initialData.endDateTime));
      if (initialData.allDay !== undefined) setAllDay(initialData.allDay);
      if (initialData.location !== undefined) setLocation(initialData.location);
      if (initialData.matterId !== undefined) setMatterId(initialData.matterId);
      if (initialData.assignedUsers !== undefined) setAssignedUsers(initialData.assignedUsers);
      if (initialData.reminderOffsets !== undefined)
        setReminderOffsets(initialData.reminderOffsets);
      if (initialData.status !== undefined) setStatus(initialData.status);
    }
  }, [initialData]);

  const handleCheckboxChange = (userId: string) => {
    setAssignedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert("Please provide valid start and end dates.");
      return;
    }

    if (end < start) {
      alert("End date must be on or after start date.");
      return;
    }

    onSubmit({
      title,
      description,
      eventType,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      allDay,
      location,
      matterId: matterId || null,
      assignedUsers,
      reminderOffsets,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-white mb-2">
            Event Title <span className="text-danger">*</span>
          </label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Trial for Case #4950"
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Event Type</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            {EVENT_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start DateTime */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Start Date/Time</label>
          <input
            required
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          />
        </div>

        {/* End DateTime */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">End Date/Time</label>
          <input
            required
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          />
        </div>

        {/* All Day & Location */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-white mt-2">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.08] bg-surface-950 text-brand-500 focus:ring-brand-500/80"
            />
            All Day Event
          </label>

          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-white mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Room 402, Federal Courthouse"
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Linked Matter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-white mb-2">Linked Legal Matter</label>
          <select
            value={matterId || ""}
            onChange={(e) => setMatterId(e.target.value || null)}
            disabled={isMattersLoading}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 disabled:opacity-50"
          >
            <option value="">None (Standalone Event)</option>
            {matters.map((matter) => (
              <option key={matter.id} value={matter.id}>
                {matter.matterNumber} - {matter.title}
              </option>
            ))}
          </select>
          {isMattersLoading && (
            <span className="text-xs text-surface-200/40 mt-1 block">Loading matters list...</span>
          )}
        </div>

        {/* Assigned Users checkboxes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-white mb-2">Assigned Staff Members</label>
          {isUsersLoading ? (
            <div className="text-sm text-surface-200/40">Loading directory...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-surface-950 border border-white/[0.08] rounded-xl p-4 max-h-48 overflow-y-auto">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-3 cursor-pointer text-sm text-surface-200/80 hover:text-white">
                  <input
                    type="checkbox"
                    checked={assignedUsers.includes(u.id)}
                    onChange={() => handleCheckboxChange(u.id)}
                    className="h-4 w-4 rounded border-white/[0.08] bg-surface-950 text-brand-500 focus:ring-brand-500/80"
                  />
                  {u.displayName || `${u.firstName} ${u.lastName}`}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Reminders Editor */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-white mb-2">Scheduled Reminders</label>
          <div className="bg-surface-950 border border-white/[0.08] rounded-xl p-4">
            <ReminderEditor offsets={reminderOffsets} onChange={setReminderOffsets} />
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-white mb-2">Event Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add calendar event notes, dial-in information, and context..."
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] text-sm font-semibold text-white transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center min-w-[120px]"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
export default EventForm;
