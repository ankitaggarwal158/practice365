import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNote, useUpdateNote } from "../hooks/useNotes";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";
import { UpdateNoteRequest } from "../types/note.types";

export default function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: note, isLoading: isNoteLoading } = useNote(id!);
  const updateMutation = useUpdateNote();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const [formData, setFormData] = useState<UpdateNoteRequest>({
    title: "",
    content: "",
  });

  const canManage = permissions.includes("NOTES_MANAGE");

  // Load existing details
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || "",
        content: note.content || "",
      });
    }
  }, [note]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInsertFormat = (tagOpen: string, tagClose: string) => {
    const textarea = document.getElementById("note-content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + (selectedText || "formatted text") + tagClose;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + (selectedText || "formatted text").length);
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          navigate(`/notes/${id}`);
        },
      }
    );
  };

  if (isNoteLoading || isPermsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to manage notes.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/notes/${id}`)}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          &larr; Back to Note Details
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Note</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Modify the notes information and annotation tags.
        </p>
      </div>

      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
        {/* Immutable parent attributes panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-950 border border-white/5 rounded-xl mb-6 text-sm">
          <div>
            <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
              Parent Entity Type
            </span>
            <span className="text-brand-300 font-bold">{note?.entityType}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
              Parent Entity ID
            </span>
            <span className="text-surface-200 font-medium">{note?.entityId}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Note Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
            />
          </div>

          {/* Formatted Content Editor */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Note Content (Rich Text Toolbar) <span className="text-danger">*</span>
            </label>

            {/* Quick Toolbar */}
            <div className="flex flex-wrap gap-1 bg-surface-950 border-b-0 border border-white/[0.08] rounded-t-xl p-2">
              <button
                type="button"
                onClick={() => handleInsertFormat("<strong>", "</strong>")}
                className="px-2.5 py-1 text-xs bg-surface-900 border border-white/[0.04] text-white hover:bg-surface-800 rounded font-bold transition-all"
                title="Bold text"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormat("<em>", "</em>")}
                className="px-2.5 py-1 text-xs bg-surface-900 border border-white/[0.04] text-white hover:bg-surface-800 rounded italic transition-all"
                title="Italic text"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormat("<u>", "</u>")}
                className="px-2.5 py-1 text-xs bg-surface-900 border border-white/[0.04] text-white hover:bg-surface-800 rounded underline transition-all"
                title="Underlined text"
              >
                U
              </button>
              <span className="text-surface-200/20 px-1 py-1">|</span>
              <button
                type="button"
                onClick={() => handleInsertFormat("<h3>", "</h3>")}
                className="px-2 py-1 text-xs bg-surface-900 border border-white/[0.04] text-white hover:bg-surface-800 rounded font-semibold transition-all"
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormat("<p>", "</p>")}
                className="px-2 py-1 text-xs bg-surface-900 border border-white/[0.04] text-white hover:bg-surface-800 rounded transition-all"
                title="Paragraph block"
              >
                Paragraph
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormat("<ul><li>", "</li></ul>")}
                className="px-2 py-1 text-xs bg-surface-900 border border-white/[0.04] text-white hover:bg-surface-800 rounded transition-all"
                title="Bullet point list"
              >
                Bulleted List
              </button>
            </div>

            <textarea
              required
              id="note-content-textarea"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className="w-full bg-surface-950 border border-t-0 border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-0 rounded-b-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-white/[0.04]">
            <button
              type="button"
              onClick={() => navigate(`/notes/${id}`)}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-surface-950 border border-white/[0.06] text-surface-200 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
            >
              {updateMutation.isPending ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
