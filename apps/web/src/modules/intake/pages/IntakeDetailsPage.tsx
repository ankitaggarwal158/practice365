import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIntake } from "../hooks/useIntake";
import { useAssignIntake } from "../hooks/useAssignIntake";
import { useConvertIntake } from "../hooks/useConvertIntake";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";
import { useUsers } from "../../users/hooks/useUsers";
import { intakeApi } from "../api/intake.api";

export default function IntakeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const { intake, isLoading, error, refetch } = useIntake(id);
  const { users } = useUsers({ limit: 100 });

  const { assign } = useAssignIntake();
  const { convert, isLoading: isConverting } = useConvertIntake();

  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const canUpdate = permissions.includes("INTAKES_UPDATE");
  const canAssign = permissions.includes("INTAKES_ASSIGN");
  const canConvert = permissions.includes("INTAKES_CONVERT");

  const isConverted = intake?.status === "CONVERTED";
  const isRejected = intake?.status === "REJECTED";

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!id || !intake) return;
    const newStatus = e.target.value;
    if (!newStatus) return;

    try {
      if (newStatus === "CONVERTED") {
        if (window.confirm("Are you sure you want to convert this intake to a Lead?")) {
          await convert(id);
        }
      } else {
        let rejectedReason = undefined;
        if (newStatus === "REJECTED") {
          rejectedReason = window.prompt("Please enter a reason for rejecting this intake:") || "Not specified";
        }
        await intakeApi.updateStatus(id, newStatus, rejectedReason);
      }
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleAssignChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!id) return;
    const targetUserId = e.target.value === "unassigned" ? null : e.target.value;
    try {
      await assign(id, targetUserId);
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to assign user.");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;

    setIsAddingNote(true);
    setNoteError(null);
    try {
      await intakeApi.addNote(id, noteText);
      setNoteText("");
      refetch();
    } catch (err: any) {
      setNoteError(err.message || "Failed to add note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAddAttachment = async () => {
    if (!id) return;
    setIsAddingAttachment(true);
    setAttachmentError(null);
    try {
      // Simulate generating a unique documentId
      const simulatedDocId = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      await intakeApi.uploadAttachment(id, simulatedDocId);
      refetch();
    } catch (err: any) {
      setAttachmentError(err.message || "Failed to upload attachment.");
    } finally {
      setIsAddingAttachment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        <p className="mt-2 text-sm text-surface-200/60">Loading intake details...</p>
      </div>
    );
  }

  if (error || !intake) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-danger font-medium">
        {error || "Intake record not found."}
      </div>
    );
  }

  // Valid status transitions map
  const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
    NEW: ["IN_REVIEW", "AWAITING_RESPONSE", "REJECTED"],
    IN_REVIEW: ["AWAITING_RESPONSE", "QUALIFIED", "REJECTED"],
    AWAITING_RESPONSE: ["IN_REVIEW", "QUALIFIED", "REJECTED"],
    QUALIFIED: ["CONVERTED", "REJECTED", "IN_REVIEW"],
    REJECTED: ["IN_REVIEW"],
    CONVERTED: [],
  };

  const allowedTransitions = VALID_STATUS_TRANSITIONS[intake.status] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8 border-b border-white/[0.06] pb-6">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate("/intakes")}
            className="flex items-center gap-2 text-sm font-medium text-surface-200/50 hover:text-white mb-4 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Intakes
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {intake.firstName} {intake.lastName}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {intake.intakeNumber}
            </span>
          </div>
          <p className="mt-2 text-sm text-surface-200/60">
            Created on {new Date(intake.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          {canUpdate && !isConverted && (
            <button
              onClick={() => navigate(`/intakes/${intake.id}/edit`)}
              className="px-5 py-2.5 border border-white/[0.08] rounded-xl text-sm font-semibold text-surface-200/80 hover:bg-white/[0.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Edit Details
            </button>
          )}
          {canConvert && intake.status === "QUALIFIED" && (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to convert this intake to a Lead?")) {
                  try {
                    await convert(intake.id);
                    refetch();
                  } catch (err: any) {
                    alert(err.message || "Conversion failed.");
                  }
                }
              }}
              disabled={isConverting}
              className="px-5 py-2.5 bg-success/10 border border-success/20 hover:bg-success/20 text-success active:scale-95 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg cursor-pointer"
            >
              Convert to Lead
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Section - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/[0.04] pb-3">Prospective Client Details</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">First Name</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.firstName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Last Name</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.lastName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Company</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.companyName || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Practice Area</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.practiceArea || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Email Address</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.email || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Phone Number</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.phone || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Preferred Contact Method</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.preferredContactMethod}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Intake Source</dt>
                <dd className="mt-1.5 text-sm text-white font-medium">{intake.source}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Subject / Title</dt>
                <dd className="mt-1.5 text-sm text-brand-400 font-bold">{intake.subject}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider">Detailed Description</dt>
                <dd className="mt-1.5 text-sm text-surface-200/80 whitespace-pre-line leading-relaxed bg-surface-950/40 p-4 rounded-xl border border-white/[0.04]">
                  {intake.description || "No description provided."}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes Feed */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/[0.04] pb-3">Internal Discussion & Notes</h2>

            {!isConverted && canUpdate ? (
              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type an internal note... (visible to staff only)"
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
                />
                {noteError && <p className="text-xs text-danger mt-2">{noteError}</p>}
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={isAddingNote || !noteText.trim()}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-md shadow-brand-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isAddingNote ? "Adding..." : "Post Note"}
                  </button>
                </div>
              </form>
            ) : isConverted ? (
              <p className="text-xs text-surface-200/40 italic mb-6">Notes locked for converted intakes.</p>
            ) : null}

            {intake.notes && intake.notes.length > 0 ? (
              <div className="space-y-4">
                {intake.notes.map((note) => (
                  <div key={note.id} className="bg-surface-950/40 p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-colors duration-150">
                    <div className="flex justify-between items-center mb-2 text-xs text-surface-200/40">
                      <span className="font-semibold text-brand-400">{note.userName || "System User"}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-white whitespace-pre-line leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-200/30 text-center py-6">No notes added yet.</p>
            )}
          </div>
        </div>

        {/* Right Section - Operations/Status Panels */}
        <div className="space-y-6">
          {/* Status lifecycle panel */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <h3 className="text-md font-bold text-white mb-4 border-b border-white/[0.04] pb-3">Intake Lifecycle Status</h3>
            <div className="mb-6">
              <span className="text-xs font-semibold text-surface-200/40 uppercase tracking-wider block mb-2">
                Current Status
              </span>
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                {intake.status}
              </span>
            </div>

            {isConverted ? (
              <div className="mt-4 p-4 bg-brand-500/10 rounded-xl border border-brand-500/20">
                <p className="text-sm text-brand-300 font-semibold">Converted to Lead</p>
                <p className="text-xs text-surface-200/50 mt-1.5">
                  Lead Ref: <span className="font-mono text-white bg-surface-950 px-2 py-0.5 rounded border border-white/[0.04]">{intake.convertedLeadId}</span>
                </p>
              </div>
            ) : isRejected ? (
              <div className="mt-4 p-4 bg-danger/10 rounded-xl border border-danger/20">
                <p className="text-sm text-danger font-semibold">Rejected Intake</p>
                <p className="text-xs text-surface-200/60 mt-1.5 leading-relaxed">
                  Reason: <span className="text-white font-medium">{intake.rejectedReason || "No reason specified."}</span>
                </p>
              </div>
            ) : canUpdate && allowedTransitions.length > 0 ? (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Transition Status
                </label>
                <select
                  onChange={handleStatusChange}
                  value=""
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
                >
                  <option value="">-- Choose New Status --</option>
                  {allowedTransitions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {/* Assignment panel */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <h3 className="text-md font-bold text-white mb-4 border-b border-white/[0.04] pb-3">Assignee Delegation</h3>
            {isConverted ? (
              <p className="text-sm text-surface-200/80">
                Assigned to: <span className="font-semibold text-white">{intake.assignedToName || "Unassigned"}</span>
              </p>
            ) : canAssign ? (
              <div>
                <label className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Assign To
                </label>
                <select
                  onChange={handleAssignChange}
                  value={intake.assignedTo || "unassigned"}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 cursor-pointer"
                >
                  <option value="unassigned">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-surface-200/80">
                Assigned to: <span className="font-semibold text-white">{intake.assignedToName || "Unassigned"}</span>
              </p>
            )}
          </div>

          {/* Attachments panel */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-white/[0.04] pb-3">
              <h3 className="text-md font-bold text-white">Attachments</h3>
              {!isConverted && canUpdate && (
                <button
                  onClick={handleAddAttachment}
                  disabled={isAddingAttachment}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isAddingAttachment ? "Uploading..." : "Attach File"}
                </button>
              )}
            </div>

            {attachmentError && (
              <p className="text-xs text-danger mb-3">{attachmentError}</p>
            )}

            {intake.attachments && intake.attachments.length > 0 ? (
              <ul className="divide-y divide-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden bg-surface-950/20">
                {intake.attachments.map((att) => (
                  <li key={att.id} className="p-3.5 flex justify-between items-center text-sm hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2 text-surface-200/80 font-medium">
                      <span className="font-mono text-xs truncate max-w-[140px] text-white">
                        Doc: {att.documentId}
                      </span>
                    </div>
                    <span className="text-xs text-surface-200/40">
                      {new Date(att.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-surface-200/30 text-center py-4">No documents attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
