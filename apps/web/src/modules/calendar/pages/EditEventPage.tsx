import { useNavigate, useParams } from "react-router-dom";
import { useCalendarEvent, useUpdateEvent } from "../hooks/useCalendar";
import EventForm from "../components/EventForm";

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading: isFetching, error } = useCalendarEvent(id || "");
  const updateMutation = useUpdateEvent();

  const handleSubmit = (formData: any) => {
    if (!id) return;
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          navigate(`/calendar/${id}`);
        },
      }
    );
  };

  if (isFetching) {
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

  // Format initialData to exclude populate details
  const initialData = {
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    allDay: event.allDay,
    location: event.location,
    matterId: event.matterId,
    assignedUsers: event.assignedUsers.map((u: { id: string }) => u.id),
    reminderOffsets: event.reminderOffsets,
    status: event.status,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/calendar/${id}`)}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          &larr; Back to Event Details
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Calendar Event</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Modify case scheduling, update details, adjust assignees, or setup reminders.
        </p>
      </div>

      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
        <EventForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
export default EditEventPage;
