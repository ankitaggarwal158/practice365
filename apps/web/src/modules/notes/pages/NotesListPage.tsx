import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotes, useDeleteNote, usePinNote } from "../hooks/useNotes";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function NotesListPage() {
  const navigate = useNavigate();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [entityType, setEntityType] = useState<string>("");
  const [entityId, setEntityId] = useState("");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { data: result, isLoading } = useNotes({
    page,
    limit,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    search: searchTerm || undefined,
  });

  const deleteMutation = useDeleteNote();
  const pinMutation = usePinNote();

  const canView = permissions.includes("NOTES_VIEW");
  const canManage = permissions.includes("NOTES_MANAGE");

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete note "${title || "Untitled"}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePin = (id: string, currentPinned: boolean) => {
    pinMutation.mutate({ id, isPinned: !currentPinned });
  };

  if (isLoading || isPermsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to view internal notes.
      </div>
    );
  }

  const notes = result?.data || [];
  const pagination = result?.pagination || { page: 1, total: 0, pages: 1 };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Internal Notes</h1>
          <p className="mt-2 text-sm text-surface-200/60">
            Unified notes timeline for matters, leads, clients, and intakes.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/notes/new")}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Create Note
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl mb-8">
        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Search Content
          </label>
          <input
            type="text"
            placeholder="Search titles or bodies..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Filter by Entity Type
          </label>
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">All Entities</option>
            <option value="MATTER">Matter</option>
            <option value="CLIENT">Client</option>
            <option value="LEAD">Lead</option>
            <option value="INTAKE">Intake</option>
            <option value="DOCUMENT">Document</option>
            <option value="TASK">Task</option>
            <option value="CALENDAR_EVENT">Calendar Event</option>
            <option value="TIME_ENTRY">Time Entry</option>
            <option value="EXPENSE">Expense</option>
            <option value="INVOICE">Invoice</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
            Entity ID (Optional)
          </label>
          <input
            type="text"
            placeholder="Paste entity ObjectID..."
            value={entityId}
            onChange={(e) => {
              setEntityId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
          />
        </div>
      </div>

      {/* Notes Timeline Container */}
      <div className="space-y-6">
        {notes.length === 0 ? (
          <div className="bg-surface-900/30 border border-white/[0.04] rounded-2xl p-12 text-center text-surface-200/50">
            No notes found. Create a new note to get started.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`bg-surface-900/40 backdrop-blur-md border rounded-2xl p-6 shadow-xl transition-all hover:border-white/[0.08] ${
                note.isPinned ? "border-brand-500/30 bg-brand-500/[0.02]" : "border-white/[0.04]"
              }`}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white leading-snug">
                      {note.title || "Untitled Note"}
                    </h2>
                    {note.isPinned && (
                      <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Pinned
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-surface-200/50">
                    <span className="font-semibold text-white">
                      {note.authorId?.displayName || "System"}
                    </span>
                    <span>&bull;</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                    <span>&bull;</span>
                    <span className="bg-surface-950 border border-white/5 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide text-brand-300">
                      {note.entityType}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {canManage && (
                    <button
                      onClick={() => handleTogglePin(note.id, note.isPinned)}
                      className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-surface-200/60 hover:text-white transition-colors"
                      title={note.isPinned ? "Unpin Note" : "Pin Note"}
                    >
                      <svg
                        className="h-4 w-4"
                        fill={note.isPinned ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/notes/${note.id}`)}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-surface-950 hover:bg-surface-900 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    View
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => navigate(`/notes/${note.id}/edit`)}
                        className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-surface-950 hover:bg-surface-900 text-xs font-semibold text-surface-200 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id, note.title)}
                        className="px-3 py-1.5 rounded-lg border border-danger/10 bg-danger/5 hover:bg-danger/10 text-xs font-semibold text-danger transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Note Content (HTML display) */}
              <div
                className="prose prose-invert max-w-none text-sm text-surface-200/80 leading-relaxed border-t border-white/[0.02] pt-4"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-xs text-surface-200/40 font-medium">
            Showing Page {pagination.page} of {pagination.pages} (Total: {pagination.total} notes)
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-white/[0.06] text-surface-100 hover:bg-surface-800 disabled:opacity-50 disabled:hover:bg-surface-900 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-white/[0.06] text-surface-100 hover:bg-surface-800 disabled:opacity-50 disabled:hover:bg-surface-900 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
