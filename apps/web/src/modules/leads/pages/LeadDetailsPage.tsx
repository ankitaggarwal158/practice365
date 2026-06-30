import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLead } from "../hooks/useLead";
import { useAssignLead } from "../hooks/useAssignLead";
import { useConvertLead } from "../hooks/useConvertLead";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { useUsers } from "../../users/hooks/useUsers";
import { leadApi } from "../api/lead.api";
import { conflictCheckApi } from "../../conflict-check/api/conflict-check.api";

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const { lead, isLoading, error, refetch } = useLead(id);
  const { users } = useUsers({ limit: 100 });

  const { assign, isLoading: isAssigning } = useAssignLead();
  const { convert, isLoading: isConverting } = useConvertLead();

  const [activeTab, setActiveTab] = useState<"details" | "notes" | "attachments" | "activities">("details");
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const canUpdate = permissions.includes("LEADS_UPDATE");
  const canAssign = permissions.includes("LEADS_ASSIGN");
  const canConvert = permissions.includes("LEADS_CONVERT");

  const isConverted = lead?.status === "CONVERTED";

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!id || !lead) return;
    const newStatus = e.target.value;
    if (!newStatus) return;

    try {
      if (newStatus === "CONVERTED") {
        if (window.confirm("Are you sure you want to convert this lead to a Client?")) {
          await convert(id);
        }
      } else {
        let lostReason = undefined;
        let consultationDate = undefined;

        if (newStatus === "LOST") {
          lostReason = window.prompt("Please enter a reason for marking this lead as lost:") || "Not specified";
        } else if (newStatus === "CONSULTATION_SCHEDULED") {
          const dateStr = window.prompt("Enter consultation date & time (YYYY-MM-DD HH:MM):", new Date().toISOString().slice(0, 16).replace("T", " "));
          if (dateStr) {
            consultationDate = new Date(dateStr).toISOString();
          }
        }

        await leadApi.changeStatus(id, newStatus, { lostReason, consultationDate });
      }
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to update lead status.");
    }
  };

  const handleAssignChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!id) return;
    const targetUserId = e.target.value;
    if (!targetUserId) return;

    try {
      await assign(id, targetUserId);
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to assign lead.");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;

    setIsAddingNote(true);
    setNoteError(null);
    try {
      await leadApi.addNote(id, noteText.trim());
      setNoteText("");
      refetch();
    } catch (err: any) {
      setNoteError(err.message || "Failed to add internal note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSimulateAttachment = async () => {
    if (!id) return;
    setIsAddingAttachment(true);
    setAttachmentError(null);
    try {
      // Generate a mock 24-character hexadecimal ObjectId representation
      const mockDocId = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      await leadApi.uploadAttachment(id, mockDocId);
      refetch();
      alert("Mock document uploaded successfully!");
    } catch (err: any) {
      setAttachmentError(err.message || "Failed to attach mock document.");
    } finally {
      setIsAddingAttachment(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "CONTACTED":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "CONSULTATION_SCHEDULED":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "CONSULTATION_COMPLETED":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      case "ENGAGEMENT_SENT":
        return "bg-warning/10 text-warning border border-warning/20";
      case "QUALIFIED":
        return "bg-success/10 text-success border border-success/20";
      case "LOST":
        return "bg-danger/10 text-danger border border-danger/20";
      case "CONVERTED":
        return "bg-brand-500/10 text-brand-300 border border-brand-500/20";
      default:
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        <p className="mt-2 text-sm text-surface-200/60">Loading lead details...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-center">
          <p className="text-sm text-danger">{error || "Lead not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header breadcrumb & Edit */}
      <div className="md:flex md:items-center md:justify-between mb-8 border-b border-white/[0.06] pb-6">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate("/leads")}
            className="flex items-center gap-2 text-sm font-medium text-surface-200/50 hover:text-white mb-4 transition-colors animate-fade-in"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Leads
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
              {lead.leadNumber}
            </span>
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                lead.status
              )}`}
            >
              {lead.status.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            {lead.firstName} {lead.lastName}
          </h1>
          {lead.companyName && (
            <p className="text-sm text-surface-200/50 font-medium mt-1">{lead.companyName}</p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          {canUpdate && !isConverted && (
            <button
              onClick={() => navigate(`/leads/${lead.id}/edit`)}
              className="px-5 py-2.5 border border-white/[0.08] rounded-xl text-sm font-semibold text-surface-200/80 hover:bg-white/[0.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Edit Details
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Tab Selector */}
          <div className="border-b border-white/[0.06] mb-6">
            <nav className="flex -mb-px space-x-8" aria-label="Tabs">
              {(["details", "notes", "attachments", "activities"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === tab
                      ? "border-brand-500 text-brand-400"
                      : "border-transparent text-surface-200/40 hover:text-surface-200/70 hover:border-white/[0.12]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Panes */}
          {activeTab === "details" && (
            <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl space-y-6 shadow-xl">
              <div>
                <h3 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">Opportunity Overview</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4">
                  <div>
                    <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Subject</dt>
                    <dd className="text-sm font-medium text-brand-400 mt-1.5">{lead.subject}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Practice Area</dt>
                    <dd className="text-sm font-medium text-white mt-1.5">{lead.practiceArea || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Lead Source</dt>
                    <dd className="text-sm font-medium text-white mt-1.5">{lead.source}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Preferred Contact Method</dt>
                    <dd className="text-sm font-medium text-white mt-1.5">{lead.preferredContactMethod}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3">Client Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4">
                  <div>
                    <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Email</dt>
                    <dd className="text-sm font-medium text-white mt-1.5">{lead.email || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Phone</dt>
                    <dd className="text-sm font-medium text-white mt-1.5">{lead.phone || "N/A"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Detailed Description</dt>
                    <dd className="text-sm text-surface-200/80 whitespace-pre-wrap leading-relaxed mt-2 bg-surface-950/40 p-4 rounded-xl border border-white/[0.04]">
                      {lead.description || "No description provided."}
                    </dd>
                  </div>
                </dl>
              </div>

              {lead.status === "LOST" && lead.lostReason && (
                <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-danger">Reason Lost</h4>
                  <p className="text-sm text-white mt-1 leading-relaxed">{lead.lostReason}</p>
                </div>
              )}

              {lead.consultationDate && (
                <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-brand-300">Consultation Scheduled</h4>
                  <p className="text-sm text-white mt-1">
                    {new Date(lead.consultationDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              {canUpdate && !isConverted && (
                <form onSubmit={handleAddNote} className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
                  <label htmlFor="note" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                    Add Internal Note
                  </label>
                  <textarea
                    id="note"
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter private consultation note..."
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
                  />
                  {noteError && <p className="text-xs text-danger mt-2">{noteError}</p>}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingNote || !noteText.trim()}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isAddingNote ? "Saving..." : "Add Note"}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {!lead.notes || lead.notes.length === 0 ? (
                  <p className="text-sm text-surface-200/30 text-center py-6">No notes added to this lead yet.</p>
                ) : (
                  lead.notes.map((note) => (
                    <div key={note.id} className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-4 rounded-xl shadow-xl hover:border-white/[0.1] transition-colors">
                      <div className="flex justify-between items-center text-xs text-surface-200/40 mb-2">
                        <span className="font-semibold text-brand-400">{note.userName || "Unknown Staff"}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl space-y-6 shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                <h3 className="text-lg font-semibold text-white">Lead Files & Attachments</h3>
                {canUpdate && !isConverted && (
                  <button
                    onClick={handleSimulateAttachment}
                    disabled={isAddingAttachment}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isAddingAttachment ? "Uploading..." : "Simulate File Upload"}
                  </button>
                )}
              </div>

              {attachmentError && <p className="text-xs text-danger">{attachmentError}</p>}

              <ul className="divide-y divide-white/[0.04]">
                {!lead.attachments || lead.attachments.length === 0 ? (
                  <p className="text-sm text-surface-200/30 text-center py-6">No attachments uploaded yet.</p>
                ) : (
                  lead.attachments.map((att) => (
                    <li key={att.id} className="py-4 flex justify-between items-center hover:bg-white/[0.01] transition-colors px-2 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold font-mono">
                          PDF
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Document_Ref_{att.documentId.slice(-6).toUpperCase()}.pdf
                          </p>
                          <p className="text-xs text-surface-200/40 mt-0.5">
                            Uploaded by {att.uploadedByName || "Staff"} on{" "}
                            {new Date(att.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full font-semibold">Uploaded</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-semibold text-white border-b border-white/[0.04] pb-3 mb-6">Activity Timeline</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {!lead.activities || lead.activities.length === 0 ? (
                    <p className="text-sm text-surface-200/30 text-center py-6">No activity history logged.</p>
                  ) : (
                    lead.activities.map((act, actIdx) => (
                      <li key={act.id}>
                        <div className="relative pb-8">
                          {actIdx !== lead.activities!.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/[0.04]" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-surface-950 flex items-center justify-center border border-white/[0.06] text-brand-400 text-xs font-bold">
                                {act.activityType.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-white">
                                  {act.description}{" "}
                                  <span className="text-xs text-surface-200/40 font-normal ml-1">
                                    by {act.userName || "System"}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right text-xs whitespace-nowrap text-surface-200/40">
                                {new Date(act.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls Panel */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
            <h3 className="text-md font-semibold text-white pb-3 border-b border-white/[0.04] mb-4">Lead Status & Controls</h3>

            {isConverted ? (
              <div className="space-y-4">
                <div className="bg-brand-500/10 text-brand-300 p-4 rounded-xl border border-brand-500/20 text-sm font-semibold">
                  This lead has been successfully converted into Client Ref: {lead.convertedClientId}.
                </div>
                <div className="text-xs text-surface-200/40">
                  Converted on {new Date(lead.convertedAt || "").toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Switcher */}
                <div>
                  <label htmlFor="status" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                    Transition Status
                  </label>
                  <select
                    id="status"
                    onChange={handleStatusChange}
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>Select status...</option>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CONSULTATION_SCHEDULED">Consultation Scheduled</option>
                    <option value="CONSULTATION_COMPLETED">Consultation Completed</option>
                    <option value="ENGAGEMENT_SENT">Engagement Sent</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="LOST">Lost</option>
                    <option value="CONVERTED">Converted to Client</option>
                  </select>
                </div>

                {/* Owner Assignee Dropdown */}
                <div>
                  <label htmlFor="assignee" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                    Lead Owner
                  </label>
                  <select
                    id="assignee"
                    value={lead.ownerId || ""}
                    disabled={!canAssign || isAssigning}
                    onChange={handleAssignChange}
                    className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
                  >
                    <option value="" disabled>Select owner...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.jobTitle || "Lawyer"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conflict Clearance Check */}
                <div className="pt-3 border-t border-white/[0.04] mt-2">
                  <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                    Conflict Check Status
                  </label>
                  <button
                    onClick={async () => {
                      if (!lead) return;
                      try {
                        const check = await conflictCheckApi.runConflictCheck(lead.id);
                        navigate(`/conflict-checks/${check.id}`);
                      } catch (err: any) {
                        alert(err.message || "Failed to initiate conflict check.");
                      }
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-white/[0.08] rounded-xl text-sm font-semibold text-surface-200/80 hover:bg-white/[0.02] active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Run Conflict Search
                  </button>
                </div>

                {/* Action Shortcuts */}
                {canConvert && lead.status === "QUALIFIED" && (
                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to convert this lead to a Client?")) {
                          try {
                            await convert(id!);
                            refetch();
                          } catch (err: any) {
                            alert(err.message || "Failed to convert lead.");
                          }
                        }
                      }}
                      disabled={isConverting}
                      className="w-full inline-flex justify-center items-center px-4 py-2.5 bg-success/10 border border-success/20 hover:bg-success/20 text-success active:scale-95 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md cursor-pointer"
                    >
                      {isConverting ? "Converting..." : "Convert to Client"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-surface-900/40 p-5 rounded-2xl border border-white/[0.04] text-xs text-surface-200/50 space-y-2 leading-relaxed">
            <h4 className="font-bold text-surface-200/40 uppercase tracking-wider mb-1.5">Module Compliance Info</h4>
            <p>• Lead conversion produces a permanent Client representation.</p>
            <p>• Converted records are archived as read-only for compliance audits.</p>
            <p>• Chronological activity logs cannot be removed or updated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
