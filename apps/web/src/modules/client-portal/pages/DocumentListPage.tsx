import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, FileText, Download, AlertCircle } from "lucide-react";
import { usePortalDocuments } from "../hooks/usePortal";
import { PortalApiClient } from "../api/portal.api";
import { formatBytes } from "../../../modules/time-tracking/utils/format.utils";
import { toast } from "sonner";

export const DocumentListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const { data: documents = [], isLoading } = usePortalDocuments(search || undefined);

  const handleDownload = async (id: string, name: string) => {
    try {
      toast.info(`Downloading document...`);
      await PortalApiClient.downloadDocument(id, name);
      toast.success("Download completed successfully.");
    } catch (err) {
      toast.error("Failed to download document.");
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Shared Documents</h1>
          <p className="text-sm text-surface-400 mt-1">Access and download legal files shared securely by your attorney.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full bg-surface-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-white">Loading files...</div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center text-surface-500 bg-surface-900 border border-dashed border-white/[0.06] rounded-2xl">
          <AlertCircle className="h-8 w-8 mx-auto text-surface-650 mb-2" />
          No documents found matching your search.
        </div>
      ) : (
        <div className="bg-surface-900 border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Document Name</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Linked Case</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">Date Shared</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400">File Size</th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-surface-400 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3 max-w-xs truncate" title={doc.documentName}>
                      <FileText className="h-5 w-5 text-brand-400 shrink-0" />
                      <span>{doc.documentName}</span>
                    </td>
                    <td className="px-6 py-4 text-surface-300">
                      {doc.matterId ? (
                        <Link to={`/portal/matters/${doc.matterId._id}`} className="text-brand-400 hover:text-brand-300 font-medium">
                          {doc.matterId.title}
                        </Link>
                      ) : (
                        <span className="text-surface-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-350">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-surface-350">
                      {formatBytes(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(doc._id, doc.documentName)}
                        className="p-2 border border-white/[0.08] hover:bg-brand-500 hover:text-white rounded-xl text-surface-400 hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center"
                      >
                        <Download className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentListPage;
