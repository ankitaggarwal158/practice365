
import { useParams, useNavigate } from "react-router-dom";
import { useUserActivity } from "../hooks/useAuditLogs";
import ActivityTimeline from "../components/ActivityTimeline";

export default function UserActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: result, isLoading, error } = useUserActivity(id || "");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        {(error as any)?.response?.data?.message || "Failed to load user activity."}
      </div>
    );
  }

  const logs = result?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-xs font-semibold text-surface-200/50 hover:text-white transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Staff Member Activity Timeline</h1>
        <p className="mt-2 text-sm text-surface-200/60 font-mono">
          User ID: {id}
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="bg-surface-900/40 border border-white/[0.06] p-6 rounded-2xl shadow-xl">
        <ActivityTimeline logs={logs} />
      </div>
    </div>
  );
}
