
import { useNavigate, useParams } from "react-router-dom";
import { useNote, useDeleteNote, usePinNote } from "../hooks/useNotes";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function NoteDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const { data: note, isLoading } = useNote(id!);
  const deleteMutation = useDeleteNote();
  const pinMutation = usePinNote();

  const canView = permissions.includes("NOTES_VIEW");
  const canManage = permissions.includes("NOTES_MANAGE");

  const handleDelete = () => {
    if (!note) return;
    if (confirm(`Are you sure you want to delete note "${note.title || "Untitled"}"?`)) {
      deleteMutation.mutate(note.id, {
        onSuccess: () => {
          navigate("/notes");
        },
      });
    }
  };

  const handleTogglePin = () => {
    if (!note) return;
    pinMutation.mutate({ id: note.id, isPinned: !note.isPinned });
  };

  if (isLoading || isPermsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canView || !note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied or Note not found. You do not have permissions to view this note.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate("/notes")}
            className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
          >
            &larr; Back to Notes Timeline
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {note.title || "Untitled Note"}
            </h1>
            {note.isPinned && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-brand-500/10 border-brand-500/30 text-brand-300">
                Pinned Note
              </span>
            )}
          </div>
        </div>

        {canManage && (
          <div className="flex gap-3">
            <button
              onClick={handleTogglePin}
              className="px-4 py-2 bg-surface-900 border border-white/[0.06] text-surface-200 hover:text-white text-sm font-semibold rounded-xl transition-all"
            >
              {note.isPinned ? "Unpin Note" : "Pin Note"}
            </button>
            <button
              onClick={() => navigate(`/notes/${note.id}/edit`)}
              className="px-4 py-2 bg-surface-900 border border-white/[0.06] text-brand-400 hover:text-brand-300 text-sm font-semibold rounded-xl transition-all"
            >
              Edit Note
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 text-sm font-semibold rounded-xl transition-all"
            >
              Delete Note
            </button>
          </div>
        )}
      </div>

      {/* Main Details Panel */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/[0.04] pb-6">
          <div>
            <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
              Author
            </span>
            <span className="text-white text-sm font-semibold">
              {note.authorId?.displayName || "System User"}
            </span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
              Associated Entity
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded font-bold border bg-surface-950 text-brand-300 border-white/5 uppercase">
                {note.entityType}
              </span>
              <span className="text-xs text-surface-200/50 truncate max-w-[120px]" title={note.entityId}>
                {note.entityId}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
              Created / Updated
            </span>
            <div className="text-xs text-surface-200/60 leading-relaxed">
              <div>Created: {new Date(note.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(note.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Notes Body content (sanitized Rich Text HTML display) */}
        <div>
          <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-3">
            Note Content
          </span>
          <div
            className="prose prose-invert max-w-none text-sm text-surface-200/90 leading-relaxed bg-surface-950/40 border border-white/[0.04] p-5 rounded-xl whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      </div>
    </div>
  );
}
