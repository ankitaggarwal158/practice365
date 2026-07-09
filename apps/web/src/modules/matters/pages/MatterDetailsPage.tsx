import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMatter } from "../hooks/useMatter";
import { useMatterTeam } from "../hooks/useMatterTeam";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";
import { useUsers } from "@/modules/users/hooks/useUsers";
import { useAuth } from "@/modules/auth";
import { matterApi } from "../api/matter.api";
import MatterDashboardPage from "./MatterDashboardPage";
import { MatterMessagesPage } from "../../client-messaging";

type Tab = "overview" | "team" | "notes" | "attachments" | "messages";

export default function MatterDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { permissions } = useCurrentUserPermissions();
  const { users } = useUsers({ limit: 100 });
  const { matter, isLoading: loadingMatter, error: loadError, refetch } = useMatter(id);
  const { updateTeam, isLoading: teamLoading } = useMatterTeam();

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Notes state
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  // Team Assignment State
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState("Assisting Attorney");

  // Attachment upload simulation
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canUpdate = permissions.includes("MATTERS_UPDATE");
  const isArchived = matter?.status === "ARCHIVED";

  if (loadError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl">
          <p className="text-sm text-danger">{loadError}</p>
        </div>
      </div>
    );
  }

  if (loadingMatter || !matter) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-3 w-full">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-surface-200/50 text-sm">Loading matter details...</span>
      </div>
    );
  }

  // Notes operations
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await matterApi.addNote(matter.id, noteText);
      setNoteText("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditNoteSave = async (noteId: string) => {
    if (!editNoteText.trim()) return;
    try {
      await matterApi.updateNote(matter.id, noteId, editNoteText);
      setEditingNoteId(null);
      setEditNoteText("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await matterApi.deleteNote(matter.id, noteId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  // Team sync operations
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) return;

    // Check if duplicate
    const exists = matter.teamMembers?.some((m) => m.userId === assignUserId);
    if (exists) {
      alert("User is already assigned to this matter.");
      return;
    }

    const currentMembers = matter.teamMembers || [];
    const newMembers = [
      ...currentMembers.map((m) => ({ userId: m.userId, role: m.role })),
      { userId: assignUserId, role: assignRole },
    ];

    try {
      await updateTeam(matter.id, newMembers);
      setAssignUserId("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTeamMember = async (userIdToRemove: string) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    const currentMembers = matter.teamMembers || [];
    const newMembers = currentMembers
      .filter((m) => m.userId !== userIdToRemove)
      .map((m) => ({ userId: m.userId, role: m.role }));

    try {
      await updateTeam(matter.id, newMembers);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  // Attachment upload picker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation checks
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("Files must be smaller than 25MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Simulate storage key generation
      const mockKey = `matters/${matter.id}/${Date.now()}-${file.name}`;
      await matterApi.uploadAttachment(matter.id, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        key: mockKey,
      });
      refetch();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    try {
      await matterApi.deleteAttachment(matter.id, attachmentId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in space-y-6">
      {/* Header Cards */}
      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="space-y-2">
          <button
            onClick={() => navigate("/matters")}
            className="flex items-center gap-2 text-xs font-semibold text-surface-200/40 hover:text-white transition-colors uppercase tracking-wider"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Matters
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{matter.title}</h1>
              <span className="text-xs font-medium text-surface-200/40 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                {matter.matterNumber}
              </span>
            </div>
            <p className="text-sm text-surface-200/60 mt-1">Client: {matter.clientName}</p>
          </div>
        </div>

        {canUpdate && !isArchived && (
          <button
            onClick={() => navigate(`/matters/${matter.id}/edit`)}
            className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] active:scale-95 text-white text-xs font-semibold rounded-xl transition-all duration-200"
          >
            Edit Matter
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] gap-1 overflow-x-auto pb-px">
        {(["overview", "team", "notes", "attachments", "messages"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 capitalize transition-all duration-200 ${
              activeTab === tab
                ? "border-brand-400 text-brand-300 bg-brand-500/[0.02]"
                : "border-transparent text-surface-200/50 hover:text-surface-100 hover:bg-white/[0.01]"
            }`}
          >
            {tab === "overview" ? "Dashboard Overview" : tab === "team" ? "Matter Team" : tab === "messages" ? "Client Portal Messages" : tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="w-full">
        {activeTab === "overview" && (
          <MatterDashboardPage matter={matter} refetch={refetch} />
        )}

        {activeTab === "team" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">
                  Matter Team Members
                </h3>
                {matter.teamMembers?.length === 0 ? (
                  <p className="text-sm text-surface-200/40">No additional team members assigned.</p>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {matter.teamMembers?.map((m) => (
                      <div key={m.id} className="py-4 flex justify-between items-center">
                        <div>
                          <div className="text-sm font-semibold text-white">{m.userName}</div>
                          <div className="text-xs text-surface-200/50">{m.userEmail}</div>
                          <div className="text-xs text-surface-200/40 mt-1 font-semibold">Role: {m.role}</div>
                        </div>
                        {canUpdate && !isArchived && (
                          <button
                            onClick={() => handleRemoveTeamMember(m.userId)}
                            className="text-xs font-semibold text-danger/80 hover:text-danger transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Team Member sidebar */}
            {canUpdate && !isArchived && (
              <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl h-fit">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">
                  Assign Staff
                </h3>
                <form onSubmit={handleAddTeamMember} className="space-y-4">
                  <div>
                    <label htmlFor="assignUserId" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                      User
                    </label>
                    <select
                      id="assignUserId"
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      required
                      className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-3 py-2 text-sm text-white transition-all duration-200"
                    >
                      <option value="">Select Staff...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assignRole" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                      Role
                    </label>
                    <select
                      id="assignRole"
                      value={assignRole}
                      onChange={(e) => setAssignRole(e.target.value)}
                      className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-3 py-2 text-sm text-white transition-all duration-200"
                    >
                      <option value="Assisting Attorney">Assisting Attorney</option>
                      <option value="Paralegal">Paralegal</option>
                      <option value="Legal Assistant">Legal Assistant</option>
                      <option value="Reviewer">Reviewer</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={teamLoading}
                    className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    Add Assignment
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">
                  Notes Logs
                </h3>

                {matter.notes?.length === 0 ? (
                  <p className="text-sm text-surface-200/40">No internal notes captured for this matter.</p>
                ) : (
                  <div className="space-y-4">
                    {matter.notes?.map((n) => {
                      const isAuthor = n.userId === user?.id;
                      const isEditing = editingNoteId === n.id;

                      return (
                        <div key={n.id} className="p-4 bg-surface-950/40 border border-white/[0.04] rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-semibold text-white">{n.userName}</div>
                            <div className="text-[10px] text-surface-200/30">
                              {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500/80 rounded-lg p-2 text-xs text-white"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingNoteId(null)}
                                  className="px-2 py-1 bg-surface-950 border border-white/[0.08] text-[10px] text-white rounded"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleEditNoteSave(n.id)}
                                  className="px-2 py-1 bg-brand-500 text-white text-[10px] rounded"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-surface-200/80 whitespace-pre-wrap">{n.note}</p>
                          )}

                          {isAuthor && !isEditing && !isArchived && (
                            <div className="flex gap-3 justify-end pt-1">
                              <button
                                onClick={() => {
                                  setEditingNoteId(n.id);
                                  setEditNoteText(n.note);
                                }}
                                className="text-[10px] font-semibold text-brand-400 hover:text-brand-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteNote(n.id)}
                                className="text-[10px] font-semibold text-danger/80 hover:text-danger"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Note creation sidebar */}
            {canUpdate && !isArchived && (
              <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl h-fit">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">
                  Add Note
                </h3>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <textarea
                    rows={4}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write case progress notes, billing reminders..."
                    required
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500/80 rounded-xl px-3 py-2 text-sm text-white transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Add Note
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">
                  Case Files & Attachments
                </h3>

                {matter.attachments?.length === 0 ? (
                  <p className="text-sm text-surface-200/40">No file attachments upload records for this matter.</p>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {matter.attachments?.map((a) => (
                      <div key={a.id} className="py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {/* File Icon */}
                          <svg className="h-8 w-8 text-surface-200/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
                          </svg>
                          <div>
                            <div className="text-sm font-semibold text-white">{a.fileName}</div>
                            <div className="text-xs text-surface-200/40">
                              {(a.fileSize / 1024).toFixed(1)} KB • Uploaded by {a.uploadedByName} on {new Date(a.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          {/* Simulation Download */}
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Simulating file download for ${a.fileName} (key: ${a.key})`);
                            }}
                            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            Download
                          </a>
                          {canUpdate && !isArchived && (
                            <button
                              onClick={() => handleDeleteAttachment(a.id)}
                              className="text-xs font-semibold text-danger/80 hover:text-danger transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Document Upload panel */}
            {canUpdate && !isArchived && (
              <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl h-fit space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">
                  Upload Attachment
                </h3>

                {uploadError && (
                  <div className="bg-danger/10 border border-danger/20 p-3 rounded-lg text-xs text-danger">
                    {uploadError}
                  </div>
                )}

                <div className="flex flex-col items-center justify-center border border-dashed border-white/[0.08] hover:border-brand-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer relative bg-surface-950/20">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <svg className="h-8 w-8 text-surface-200/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span className="text-xs font-semibold text-white">
                    {isUploading ? "Uploading file..." : "Choose a file to upload"}
                  </span>
                  <span className="text-[10px] text-surface-200/30 mt-1">Max file size: 25MB</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <MatterMessagesPage matterId={matter.id} />
        )}
      </div>
    </div>
  );
}
