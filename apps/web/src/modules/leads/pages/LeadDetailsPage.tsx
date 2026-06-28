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
        return "bg-blue-100 text-blue-800";
      case "CONTACTED":
        return "bg-cyan-100 text-cyan-800";
      case "CONSULTATION_SCHEDULED":
        return "bg-purple-100 text-purple-800";
      case "CONSULTATION_COMPLETED":
        return "bg-teal-100 text-teal-800";
      case "ENGAGEMENT_SENT":
        return "bg-yellow-100 text-yellow-800";
      case "QUALIFIED":
        return "bg-green-100 text-green-800";
      case "LOST":
        return "bg-red-100 text-red-800";
      case "CONVERTED":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500 text-sm">Loading lead profile...</span>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error || "Lead not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header breadcrumb & Edit */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {lead.leadNumber}
            </span>
            <span
              className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                lead.status
              )}`}
            >
              {lead.status.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            {lead.firstName} {lead.lastName}
          </h1>
          {lead.companyName && (
            <p className="text-sm text-gray-500 font-medium">{lead.companyName}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/leads")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to List
          </button>
          {canUpdate && !isConverted && (
            <button
              onClick={() => navigate(`/leads/${lead.id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
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
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px space-x-8" aria-label="Tabs">
              {(["details", "notes", "attachments", "activities"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors uppercase tracking-wider ${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Panes */}
          {activeTab === "details" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-150 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Opportunity Overview</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4">
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase">Subject</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{lead.subject}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase">Practice Area</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{lead.practiceArea || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase">Lead Source</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{lead.source}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase">Preferred Contact Method</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{lead.preferredContactMethod}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Client Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4">
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase">Email</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{lead.email || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{lead.phone || "N/A"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold text-gray-400 uppercase">Detailed Description</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1 whitespace-pre-wrap">
                      {lead.description || "No description provided."}
                    </dd>
                  </div>
                </dl>
              </div>

              {lead.status === "LOST" && lead.lostReason && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <h4 className="text-sm font-bold text-red-800">Reason Lost</h4>
                  <p className="text-sm text-red-700 mt-1">{lead.lostReason}</p>
                </div>
              )}

              {lead.consultationDate && (
                <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                  <h4 className="text-sm font-bold text-purple-800">Consultation Scheduled</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    {new Date(lead.consultationDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              {canUpdate && !isConverted && (
                <form onSubmit={handleAddNote} className="bg-white p-4 rounded-lg shadow-sm border border-gray-150">
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Add Internal Note
                  </label>
                  <textarea
                    id="note"
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter private consultation note..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {noteError && <p className="text-xs text-red-600 mt-1">{noteError}</p>}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingNote || !noteText.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isAddingNote ? "Saving..." : "Add Note"}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {!lead.notes || lead.notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No notes added to this lead yet.</p>
                ) : (
                  lead.notes.map((note) => (
                    <div key={note.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                        <span className="font-semibold text-gray-600">{note.userName || "Unknown Staff"}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-150 space-y-6">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Lead Files & Attachments</h3>
                {canUpdate && !isConverted && (
                  <button
                    onClick={handleSimulateAttachment}
                    disabled={isAddingAttachment}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-semibold rounded text-indigo-600 bg-white hover:bg-indigo-50"
                  >
                    {isAddingAttachment ? "Uploading..." : "Simulate File Upload"}
                  </button>
                )}
              </div>

              {attachmentError && <p className="text-xs text-red-600">{attachmentError}</p>}

              <ul className="divide-y divide-gray-200">
                {!lead.attachments || lead.attachments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No attachments uploaded yet.</p>
                ) : (
                  lead.attachments.map((att) => (
                    <li key={att.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded bg-indigo-50 text-indigo-600 text-xs font-bold">
                          PDF
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Document_Ref_{att.documentId.slice(-6).toUpperCase()}.pdf
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded by {att.uploadedByName || "Staff"} on{" "}
                            {new Date(att.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Uploaded</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-150">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-6">Activity Timeline</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {!lead.activities || lead.activities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No activity history logged.</p>
                  ) : (
                    lead.activities.map((act, actIdx) => (
                      <li key={act.id}>
                        <div className="relative pb-8">
                          {actIdx !== lead.activities!.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center ring-8 ring-white text-indigo-500 text-xs font-bold">
                                {act.activityType.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-800">
                                  {act.description}{" "}
                                  <span className="text-xs text-gray-400 font-normal">
                                    by {act.userName || "System"}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right text-xs whitespace-nowrap text-gray-400">
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-150">
            <h3 className="text-md font-semibold text-gray-900 pb-3 border-b mb-4">Lead Status & Controls</h3>

            {isConverted ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-md border border-emerald-200 text-sm font-semibold">
                  This lead has been successfully converted into Client Ref: {lead.convertedClientId}.
                </div>
                <div className="text-xs text-gray-400">
                  Converted on {new Date(lead.convertedAt || "").toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Switcher */}
                <div>
                  <label htmlFor="status" className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Transition Status
                  </label>
                  <select
                    id="status"
                    onChange={handleStatusChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  <label htmlFor="assignee" className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Lead Owner
                  </label>
                  <select
                    id="assignee"
                    value={lead.ownerId || ""}
                    disabled={!canAssign || isAssigning}
                    onChange={handleAssignChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                <div className="pt-2 border-t mt-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
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
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      {isConverting ? "Converting..." : "Convert to Client"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border text-xs text-gray-400 space-y-2">
            <h4 className="font-semibold text-gray-500 uppercase tracking-wider">Module Compliance Info</h4>
            <p>• Lead conversion produces a permanent Client representation.</p>
            <p>• Converted records are archived as read-only for compliance audits.</p>
            <p>• Chronological activity logs cannot be removed or updated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
