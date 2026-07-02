import { useNavigate } from "react-router-dom";
import { useCreateEvent } from "../hooks/useCalendar";
import EventForm from "../components/EventForm";

export function CreateEventPage() {
  const navigate = useNavigate();
  const createMutation = useCreateEvent();

  const handleSubmit = (formData: any) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/calendar");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/calendar")}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          &larr; Back to Calendar
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Calendar Event</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Add case-linked tasks, court dates, meetings, or custom deadlines to the schedule.
        </p>
      </div>

      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
        <EventForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </div>
    </div>
  );
}
export default CreateEventPage;
