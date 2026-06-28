import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useClient } from "../hooks/useClient";
import { useUpdateClient } from "../hooks/useUpdateClient";
import { useMergeClients } from "../hooks/useMergeClients";
import { clientApi } from "../api/client.api";
import { Client } from "../types/client.types";
import { useCurrentUserPermissions } from "../../roles/hooks/useCurrentUserPermissions";

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();

  const { client, isLoading: isClientLoading, error: clientError, refetch } = useClient(id);
  const { addNote, uploadAttachment, isLoading: isSavingAction } = useUpdateClient();
  const { merge, isLoading: isMerging } = useMergeClients();

  const [activeTab, setActiveTab] = useState<"notes" | "files">("notes");
  const [noteContent, setNoteContent] = useState("");
  const [fileIdInput, setFileIdInput] = useState("");

  // Merge modal state
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSearch, setMergeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedTargetClient, setSelectedTargetClient] = useState<Client | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const canEdit = permissions.includes("CLIENTS_UPDATE");

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteContent.trim()) return;
    try {
      await addNote(id, noteContent.trim());
      setNoteContent("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !fileIdInput.trim()) return;
    try {
      await uploadAttachment(id, fileIdInput.trim());
      setFileIdInput("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchTargetClients = async () => {
    if (!mergeSearch.trim()) return;
    setSearchLoading(true);
    try {
      const results = await clientApi.listClients({ q: mergeSearch.trim(), limit: 10 });
      // Exclude self
      setSearchResults(results.data.filter((c) => c.id !== id && c.status !== "ARCHIVED"));
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleExecuteMerge = async () => {
    if (!id || !selectedTargetClient) return;
    setMergeError(null);
    try {
      await merge(id, selectedTargetClient.id);
      setShowMergeModal(false);
      // Redirect to target client details
      navigate(`/clients/${selectedTargetClient.id}`);
    } catch (err: any) {
      setMergeError(err.message || "Failed to complete merge.");
    }
  };

  if (isClientLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-surface-200/50 text-sm">Loading client profile details...</span>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl">
          <p className="text-sm text-danger">{clientError || "Client record not found."}</p>
        </div>
      </div>
    );
  }

  const clientName = client.clientType === "INDIVIDUAL"
    ? `${client.firstName || ""} ${client.lastName || ""}`.trim()
    : client.companyName || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 text-xs font-semibold text-surface-200/50 hover:text-white mb-3 transition-colors duration-150"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{clientName}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              client.status === "ACTIVE"
                ? "bg-success/10 text-success border border-success/20"
                : client.status === "INACTIVE"
                ? "bg-warning/10 text-warning border border-warning/20"
                : "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]"
            }`}>
              {client.status}
            </span>
          </div>
          <div className="text-xs text-surface-200/40 mt-1 font-mono">
            Client Ref: {client.clientNumber}
          </div>
        </div>

        <div className="flex gap-3">
          {client.status !== "ARCHIVED" && (
            <button
              onClick={() => {
                setSelectedTargetClient(null);
                setSearchResults([]);
                setMergeSearch("");
                setShowMergeModal(true);
              }}
              className="px-4 py-2 bg-surface-950 border border-white/[0.08] text-white hover:bg-white/[0.02] text-xs font-semibold rounded-lg transition-all duration-200"
            >
              Merge Client Profile
            </button>
          )}
          {canEdit && client.status !== "ARCHIVED" && (
            <button
              onClick={() => navigate(`/clients/${client.id}/edit`)}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all duration-200"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Merged Banner */}
      {client.status === "ARCHIVED" && client.mergedIntoClientId && (
        <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl flex items-center gap-3">
          <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          <div className="text-sm text-surface-200/80">
            This client profile has been merged into a different record.{" "}
            <Link
              to={`/clients/${client.mergedIntoClientId}`}
              className="text-brand-400 font-bold hover:underline"
            >
              View Consolidated Client Profile
            </Link>
          </div>
        </div>
      )}

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-4">Profile Card Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Client Type</dt>
                <dd className="text-sm font-medium text-white">{client.clientType}</dd>
              </div>

              {client.email && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Email Address</dt>
                  <dd className="text-sm font-medium text-white">{client.email}</dd>
                </div>
              )}

              {client.phone && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Phone Number</dt>
                  <dd className="text-sm font-medium text-white">{client.phone}</dd>
                </div>
              )}

              {client.website && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Website</dt>
                  <dd className="text-sm font-medium text-brand-400">
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {client.website}
                    </a>
                  </dd>
                </div>
              )}

              {client.address && (client.address.street1 || client.address.city) && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Physical Address</dt>
                  <dd className="text-sm font-medium text-white space-y-0.5">
                    {client.address.street1 && <div>{client.address.street1}</div>}
                    {client.address.street2 && <div>{client.address.street2}</div>}
                    <div>
                      {client.address.city || ""}, {client.address.state || ""} {client.address.zip || ""}
                    </div>
                    {client.address.country && <div>{client.address.country}</div>}
                  </dd>
                </div>
              )}

              {client.leadId && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Originating Lead</dt>
                  <dd className="text-sm font-medium text-brand-400">
                    <Link to={`/leads/${client.leadId}`} className="hover:underline">
                      View Lead Conversion Source
                    </Link>
                  </dd>
                </div>
              )}

              <div className="border-t border-white/[0.04] pt-4">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Created At</dt>
                <dd className="text-xs font-medium text-surface-200/60">
                  {new Date(client.createdAt).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-200/40">Last Updated</dt>
                <dd className="text-xs font-medium text-surface-200/60">
                  {new Date(client.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Notes & Attachments Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Tabs Selector */}
            <div className="flex border-b border-white/[0.04] bg-white/[0.01]">
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "notes"
                    ? "border-brand-500 text-brand-300"
                    : "border-transparent text-surface-200/40 hover:text-surface-100 hover:bg-white/[0.01]"
                }`}
              >
                Notes History ({client.notes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "files"
                    ? "border-brand-500 text-brand-300"
                    : "border-transparent text-surface-200/40 hover:text-surface-100 hover:bg-white/[0.01]"
                }`}
              >
                Attachments & Documents ({client.attachments?.length || 0})
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {activeTab === "notes" ? (
                <div className="space-y-6">
                  {/* Create Note */}
                  {client.status !== "ARCHIVED" && (
                    <form onSubmit={handleAddNote} className="space-y-3">
                      <textarea
                        rows={3}
                        placeholder="Type a note entry for this client..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingAction || !noteContent.trim()}
                          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-colors"
                        >
                          {isSavingAction ? "Posting..." : "Add Note"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Notes List */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 divide-y divide-white/[0.04]">
                    {!client.notes || client.notes.length === 0 ? (
                      <div className="text-center py-8 text-sm text-surface-200/35">
                        No note logs found on this client record.
                      </div>
                    ) : (
                      client.notes.map((note, index) => (
                        <div key={note.id} className={`pt-4 ${index === 0 ? "pt-0" : ""}`}>
                          <div className="flex justify-between items-center text-xs font-semibold mb-1">
                            <span className="text-white">{note.userName || "System / Staff"}</span>
                            <span className="text-surface-200/30">{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-surface-200/80 leading-relaxed whitespace-pre-line">
                            {note.note}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Create Attachment */}
                  {client.status !== "ARCHIVED" && (
                    <form onSubmit={handleUploadFile} className="space-y-4 bg-surface-950 p-4 rounded-xl border border-white/[0.04]">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Link Existing Document</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Document Object ID"
                          required
                          value={fileIdInput}
                          onChange={(e) => setFileIdInput(e.target.value)}
                          className="bg-surface-900 border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-surface-200/30"
                        />
                        <button
                          type="submit"
                          disabled={isSavingAction || !fileIdInput.trim()}
                          className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-colors"
                        >
                          {isSavingAction ? "Attaching..." : "Attach Document"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Attachments List */}
                  <div className="space-y-3">
                    {!client.attachments || client.attachments.length === 0 ? (
                      <div className="text-center py-8 text-sm text-surface-200/35">
                        No attachments found on this client record.
                      </div>
                    ) : (
                      client.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex justify-between items-center p-3 bg-surface-950 border border-white/[0.04] rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-surface-200/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <div>
                              <div className="text-xs font-semibold text-white truncate max-w-xs">{file.fileName || `Doc-${file.documentId.substring(0, 8)}`}</div>
                              <div className="text-[10px] text-surface-200/40">Uploaded by {file.uploadedByName || "Staff"} on {new Date(file.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-surface-200/30 font-mono">ID: {file.documentId.substring(0, 8)}...</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Consolidate Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-900 border border-white/[0.08] p-6 rounded-2xl max-w-lg w-full space-y-6 shadow-2xl animate-slide-up">
            <div>
              <h3 className="text-lg font-bold text-white">Merge Client Records</h3>
              <p className="mt-2 text-xs text-surface-200/50 leading-relaxed">
                Consolidate notes, logs, and files from this client profile into a different target client. 
                This action is <strong className="text-danger">irreversible</strong>: once completed, this profile ({client.clientNumber}) will be locked and archived.
              </p>
            </div>

            {mergeError && (
              <div className="bg-danger/10 border border-danger/20 p-3 rounded-lg text-xs text-danger">
                {mergeError}
              </div>
            )}

            {/* Search Target Client */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-surface-200/40 uppercase">Find Target Client</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter client number, name, or email..."
                  value={mergeSearch}
                  onChange={(e) => setMergeSearch(e.target.value)}
                  className="flex-1 bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSearchTargetClients}
                  className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Search results list */}
            {searchLoading ? (
              <div className="text-center py-4 text-xs text-surface-200/40">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {searchResults.map((result) => {
                  const targetName = result.clientType === "INDIVIDUAL"
                    ? `${result.firstName || ""} ${result.lastName || ""}`.trim()
                    : result.companyName || "";

                  return (
                    <button
                      type="button"
                      key={result.id}
                      onClick={() => setSelectedTargetClient(result)}
                      className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-left transition-colors duration-150 ${
                        selectedTargetClient?.id === result.id
                          ? "bg-brand-500/10 border-brand-500/50"
                          : "bg-surface-950 border-white/[0.04] hover:border-white/[0.08]"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{targetName}</div>
                        <div className="text-[10px] text-surface-200/40">ID: {result.clientNumber} | Email: {result.email || "No email"}</div>
                      </div>
                      {selectedTargetClient?.id === result.id && (
                        <span className="text-[10px] font-bold text-brand-400">Selected</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : mergeSearch.trim() !== "" ? (
              <div className="text-center py-4 text-xs text-surface-200/40">No matching clients found.</div>
            ) : null}

            {/* Confirmation details */}
            {selectedTargetClient && (
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-white">Target Client Summary:</div>
                <div className="text-surface-200/60">
                  Name: {selectedTargetClient.clientType === "INDIVIDUAL" 
                    ? `${selectedTargetClient.firstName || ""} ${selectedTargetClient.lastName || ""}`.trim()
                    : selectedTargetClient.companyName}
                </div>
                <div className="text-surface-200/60">Client ID: {selectedTargetClient.clientNumber}</div>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isMerging}
                onClick={() => setShowMergeModal(false)}
                className="px-4 py-2 bg-transparent hover:bg-white/[0.02] border border-white/[0.08] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isMerging || !selectedTargetClient}
                onClick={handleExecuteMerge}
                className="px-4 py-2 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMerging ? "Merging Profiles..." : "Confirm & Merge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
