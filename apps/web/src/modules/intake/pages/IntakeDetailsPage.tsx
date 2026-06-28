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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm text-gray-500">Loading intake details...</p>
      </div>
    );
  }

  if (error || !intake) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600 font-medium">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8 border-b border-gray-200 pb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {intake.firstName} {intake.lastName}
            </h1>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {intake.intakeNumber}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on {new Date(intake.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          {canUpdate && !isConverted && (
            <button
              onClick={() => navigate(`/intakes/${intake.id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
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
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Prospective Client Details</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">First Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.firstName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.lastName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.companyName || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Practice Area</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.practiceArea || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.email || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.phone || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Preferred Contact Method</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.preferredContactMethod}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Intake Source</dt>
                <dd className="mt-1 text-sm text-gray-900">{intake.source}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Subject / Title</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{intake.subject}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Detailed Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {intake.description || "No description provided."}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes Feed */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Internal Discussion & Notes</h2>

            {!isConverted && canUpdate ? (
              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type an internal note... (visible to staff only)"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {noteError && <p className="text-sm text-red-600 mt-1">{noteError}</p>}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isAddingNote || !noteText.trim()}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isAddingNote ? "Adding..." : "Post Note"}
                  </button>
                </div>
              </form>
            ) : isConverted ? (
              <p className="text-sm text-gray-500 italic mb-6">Notes locked for converted intakes.</p>
            ) : null}

            {intake.notes && intake.notes.length > 0 ? (
              <div className="space-y-4">
                {intake.notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{note.userName || "System User"}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{note.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No notes added yet.</p>
            )}
          </div>
        </div>

        {/* Right Section - Operations/Status Panels */}
        <div className="space-y-6">
          {/* Status lifecycle panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-md font-bold text-gray-900 mb-4">Intake Lifecycle Status</h3>
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
                Current Status
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-md font-bold bg-indigo-100 text-indigo-900">
                {intake.status}
              </span>
            </div>

            {isConverted ? (
              <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                <p className="text-sm text-purple-900 font-semibold">Converted to Lead</p>
                <p className="text-xs text-purple-700 mt-1">
                  Lead Ref: <span className="font-mono">{intake.convertedLeadId}</span>
                </p>
              </div>
            ) : isRejected ? (
              <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-red-900 font-semibold">Rejected Intake</p>
                <p className="text-xs text-red-700 mt-1">
                  Reason: {intake.rejectedReason || "No reason specified."}
                </p>
              </div>
            ) : canUpdate && allowedTransitions.length > 0 ? (
              <div className="mt-4">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Transition Status
                </label>
                <select
                  onChange={handleStatusChange}
                  value=""
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-md font-bold text-gray-900 mb-4">Assignee Delegation</h3>
            {isConverted ? (
              <p className="text-sm text-gray-500">
                Assigned to: <span className="font-semibold">{intake.assignedToName || "Unassigned"}</span>
              </p>
            ) : canAssign ? (
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Assign To
                </label>
                <select
                  onChange={handleAssignChange}
                  value={intake.assignedTo || "unassigned"}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <p className="text-sm text-gray-500">
                Assigned to: <span className="font-semibold">{intake.assignedToName || "Unassigned"}</span>
              </p>
            )}
          </div>

          {/* Attachments panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-bold text-gray-900">Attachments</h3>
              {!isConverted && canUpdate && (
                <button
                  onClick={handleAddAttachment}
                  disabled={isAddingAttachment}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                >
                  {isAddingAttachment ? "Uploading..." : "Attach File"}
                </button>
              )}
            </div>

            {attachmentError && (
              <p className="text-xs text-red-600 mb-3">{attachmentError}</p>
            )}

            {intake.attachments && intake.attachments.length > 0 ? (
              <ul className="divide-y divide-gray-200 border border-gray-100 rounded-lg">
                {intake.attachments.map((att) => (
                  <li key={att.id} className="p-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-mono text-xs truncate max-w-[140px]">
                        Doc: {att.documentId}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(att.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">No documents attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
