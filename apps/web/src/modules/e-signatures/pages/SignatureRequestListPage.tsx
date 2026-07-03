import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignatureRequests, useSendRequest } from "../hooks/useSignature";
import { format } from "date-fns";

export default function SignatureRequestListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSignatureRequests({
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  const sendMutation = useSendRequest();

  const handleSend = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to send this signature request to the signers?")) {
      sendMutation.mutate(id);
    }
  };

  const getStatusClass = (status: string) => {
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

  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Electronic Signatures</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Request, track, and manage digital signature executions for legal files.
          </p>
        </div>
        <button
          onClick={() => navigate("/signature-requests/new")}
          className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all cursor-pointer w-full sm:w-auto text-center"
        >
          + Create Request
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by request title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-900/40 border border-white/[0.06] hover:border-white/[0.1] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all"
          />
        </div>
        <div className="w-full md:w-60">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-900/40 border border-white/[0.06] hover:border-white/[0.1] focus:border-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="VIEWED">Viewed</option>
            <option value="PARTIALLY_SIGNED">Partially Signed</option>
            <option value="COMPLETED">Completed</option>
            <option value="DECLINED">Declined</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* List Container */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="text-center py-16 bg-surface-900/20 border border-white/[0.06] rounded-2xl">
          <p className="text-sm text-surface-200/40 italic">No signature requests found.</p>
          <button
            onClick={() => navigate("/signature-requests/new")}
            className="mt-4 text-xs text-brand-400 font-semibold hover:underline"
          >
            Create one now &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {data.data.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/signature-requests/${req.id}`)}
                className="bg-surface-900/40 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] hover:bg-surface-900/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer transition-all duration-200 group"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-md font-bold text-white group-hover:text-brand-400 transition-colors">
                      {req.requestTitle}
                    </h2>
                    <span className="text-[10px] bg-surface-950 border border-white/[0.08] text-surface-200/50 px-2 py-0.5 rounded">
                      {req.signingMode}
                    </span>
                  </div>
                  <p className="text-xs text-surface-200/40">
                    Created {format(new Date(req.createdAt), "PPP")}
                    {req.expiresAt && ` • Expires ${format(new Date(req.expiresAt), "PPP")}`}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/[0.04] sm:border-0 pt-3 sm:pt-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusClass(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>

                  <div className="flex items-center gap-3">
                    {req.status === "DRAFT" && (
                      <button
                        onClick={(e) => handleSend(req.id, e)}
                        className="bg-brand-500/10 hover:bg-brand-500 hover:text-white border border-brand-500/20 text-brand-400 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
                      >
                        Send
                      </button>
                    )}
                    <span className="text-xs text-brand-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs text-surface-200/60 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                &larr; Previous Page
              </button>
              <span className="text-xs text-surface-200/40">
                Page {page} of {data.pagination.pages}
              </span>
              <button
                disabled={page === data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs text-brand-400 hover:text-brand-300 disabled:opacity-30 cursor-pointer"
              >
                Next Page &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
