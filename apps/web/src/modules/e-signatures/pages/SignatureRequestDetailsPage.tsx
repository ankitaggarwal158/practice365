import { useParams, useNavigate } from "react-router-dom";
import {
  useSignatureRequest,
  useSendRequest,
  useCancelRequest,
  useSendReminders,
} from "../hooks/useSignature";
import SignerList from "../components/SignerList";
import SigningTimeline from "../components/SigningTimeline";
import CompletionSummary from "../components/CompletionSummary";
import { format } from "date-fns";

export default function SignatureRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useSignatureRequest(id || "");
  const sendMutation = useSendRequest();
  const cancelMutation = useCancelRequest();
  const remindMutation = useSendReminders();

  const handleSend = () => {
    if (confirm("Are you sure you want to dispatch this request to signers?")) {
      sendMutation.mutate(id || "");
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this signature request? This action is permanent.")) {
      cancelMutation.mutate(id || "");
    }
  };

  const handleRemind = () => {
    remindMutation.mutate(id || "");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Signature request not found.
      </div>
    );
  }

  const { request, signers, events } = data;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-success/10 text-success border-success/20";
      case "PARTIALLY_SIGNED":
      case "VIEWED":
        return "bg-brand-500/10 text-brand-400 border-brand-500/20";
      case "SENT":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "CANCELLED":
      case "DECLINED":
      case "EXPIRED":
        return "bg-danger/10 text-danger border-danger/20";
      case "DRAFT":
      default:
        return "bg-surface-200/5 text-surface-200/50 border-white/[0.04]";
    }
  };

  const isActive = ["SENT", "VIEWED", "PARTIALLY_SIGNED"].includes(request.status);

  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto animate-fade-in space-y-8">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate("/signature-requests")}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4 cursor-pointer"
        >
          &larr; Back to Signature Requests
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{request.requestTitle}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(request.status)}`}>
                {request.status}
              </span>
            </div>
            <p className="text-xs text-surface-200/40 mt-1">
              Mode: {request.signingMode} • Created {format(new Date(request.createdAt), "PPP p")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {request.status === "DRAFT" && (
              <button
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Send Request
              </button>
            )}

            {isActive && (
              <>
                <button
                  onClick={handleRemind}
                  disabled={remindMutation.isPending}
                  className="bg-brand-500/10 hover:bg-brand-500 hover:text-white border border-brand-500/20 text-brand-400 font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Send Reminders
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="bg-danger/10 hover:bg-danger hover:text-white border border-danger/20 text-danger font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cancel Request
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main pane */}
        <div className="lg:col-span-2 space-y-8">
          {request.status === "COMPLETED" && (
            <CompletionSummary request={request} />
          )}

          <div className="bg-surface-900/40 border border-white/[0.06] rounded-2xl p-6">
            <SignerList signers={signers} signingMode={request.signingMode} />
          </div>
        </div>

        {/* Right side pane (Audit logs & Info) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-surface-900/40 border border-white/[0.06] rounded-2xl p-5 space-y-3.5">
            <h3 className="text-sm font-semibold text-white">Execution details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-surface-200/40">Expires At</span>
                <span className="text-surface-200/80">
                  {request.expiresAt ? format(new Date(request.expiresAt), "PPP") : "No expiry"}
                </span>
              </div>
              {request.completedAt && (
                <div className="flex justify-between">
                  <span className="text-surface-200/40">Completed At</span>
                  <span className="text-success font-medium">
                    {format(new Date(request.completedAt), "PPP")}
                  </span>
                </div>
              )}
              {request.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-surface-200/40">Cancelled At</span>
                  <span className="text-danger font-medium">
                    {format(new Date(request.cancelledAt), "PPP")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-surface-900/40 border border-white/[0.06] rounded-2xl p-5">
            <SigningTimeline events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
