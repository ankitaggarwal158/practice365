import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocument, useDocumentVersions, useUploadVersion } from "../hooks/useDocuments.js";
import { VersionHistory } from "../components/VersionHistory.js";
import { DocumentPreview } from "../components/DocumentPreview.js";
import { toast } from "sonner";
import { API_BASE_URL } from "../../../services/http-client.js";
import { Pencil } from "lucide-react";

export const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: doc, isLoading } = useDocument(id!);
  const { data: versions, isLoading: isLoadingVersions } = useDocumentVersions(id!);
  const uploadVersionMutation = useUploadVersion();

  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const handleUploadVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Select a file first");

    uploadVersionMutation.mutate(
      { id: id!, file, notes },
      {
        onSuccess: () => {
          toast.success("New version uploaded");
          setFile(null);
          setNotes("");
        },
        onError: (err: any) => {
          toast.error(err.message || "Upload failed");
        },
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading document details...</div>;
  if (!doc) return <div className="p-8 text-center text-red-500">Document not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back & Actions header */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/documents" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          &larr; Back to Documents
        </Link>
        <Link
          to={`/documents/${doc._id}/edit`}
          className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm flex items-center gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Metadata
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive File Preview */}
        <div className="lg:col-span-2 space-y-6">
          <DocumentPreview doc={doc} />
        </div>

        {/* Right Column: Details & Lifecycle */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-4">Metadata Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Document Name</dt>
                <dd className="mt-1 text-sm font-bold text-gray-900 break-words">{doc.documentName}</dd>
              </div>
              {doc.description && (
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</dt>
                  <dd className="mt-1 text-sm text-gray-600">{doc.description}</dd>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">{doc.category}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">File Format</dt>
                  <dd className="mt-1 text-sm text-gray-900 truncate" title={doc.mimeType}>
                    {doc.fileExtension.toUpperCase()}
                  </dd>
                </div>
              </div>
              {doc.tags && doc.tags.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {doc.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <a
                href={`${API_BASE_URL}/documents/${doc._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Download Current Version
              </a>
            </div>
          </div>

          {/* Upload New Version */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-2">Upload New Version</h3>
            <p className="text-xs text-gray-400 mb-4">Replaces the current active file while preserving history.</p>

            <form onSubmit={handleUploadVersion} className="space-y-4">
              <div>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Notes (e.g. Added signature)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!file || uploadVersionMutation.isPending}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {uploadVersionMutation.isPending ? "Uploading..." : "Upload Version"}
              </button>
            </form>
          </div>

          {/* Version History List */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-4">Version History</h3>
            <VersionHistory versions={versions || []} isLoading={isLoadingVersions} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DocumentDetailsPage;
