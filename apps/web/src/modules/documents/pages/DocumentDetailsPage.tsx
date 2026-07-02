import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocument, useDocumentVersions, useUploadVersion } from "../hooks/useDocuments.js";
import { VersionHistory } from "../components/VersionHistory.js";
import { toast } from "sonner";

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
        }
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center">Loading document...</div>;
  if (!doc) return <div className="p-8 text-center text-red-500">Document not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link to="/documents" className="text-blue-600 hover:text-blue-900 text-sm font-medium">
          &larr; Back to Documents
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{doc.documentName}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{doc.description || "No description provided."}</p>
          </div>
          <div>
            <a 
              href={`http://localhost:5000/api/documents/${doc._id}/download`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Download Current Version
            </a>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">{doc.category}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">File Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{doc.mimeType}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Version upload form */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upload New Version</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Uploading a new version will replace the current file, but keep the history intact.</p>
            </div>
            <form onSubmit={handleUploadVersion} className="mt-5 sm:flex sm:items-center space-x-3">
              <div className="w-full max-w-xs">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Notes (e.g. Added signatures)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
              <button
                type="submit"
                disabled={!file || uploadVersionMutation.isPending}
                className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {uploadVersionMutation.isPending ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        </div>

        {/* Version history list */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Version History</h3>
            <VersionHistory versions={versions || []} isLoading={isLoadingVersions} />
          </div>
        </div>
      </div>
    </div>
  );
};
