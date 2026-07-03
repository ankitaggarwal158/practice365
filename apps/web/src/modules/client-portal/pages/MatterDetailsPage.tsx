import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Briefcase, Calendar, FileText, Download, User, Info } from "lucide-react";
import { usePortalMatterDetails, usePortalDocuments } from "../hooks/usePortal";
import { PortalApiClient } from "../api/portal.api";
import { formatBytes } from "../../../modules/time-tracking/utils/format.utils";
import { toast } from "sonner";

export const MatterDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: matter, isLoading: isLoadingMatter } = usePortalMatterDetails(id || "");
  const { data: documents = [], isLoading: isLoadingDocs } = usePortalDocuments();

  const handleDownload = async (docId: string, name: string) => {
    try {
      toast.info("Downloading file...");
      await PortalApiClient.downloadDocument(docId, name);
      toast.success("Download complete");
    } catch (err) {
      toast.error("Failed to download document.");
    }
  };

  if (isLoadingMatter) {
    return <div className="p-12 text-center text-white">Loading case details...</div>;
  }

  if (!matter) {
    return (
      <div className="p-12 text-center text-white space-y-4">
        <p>Matter not found.</p>
        <Link to="/portal/matters" className="text-brand-400 font-semibold flex items-center justify-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to Matters
        </Link>
      </div>
    );
  }

  // Filter documents to only show files linked to this matter
  const linkedDocs = documents.filter((d) => d.matterId?._id === id);

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Header breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link
          to="/portal/matters"
          className="p-2 border border-white/[0.08] hover:bg-surface-900 rounded-xl text-surface-400 hover:text-white transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{matter.title}</h1>
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
              matter.status === "OPEN" 
                ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
            }`}>
              {matter.status}
            </span>
          </div>
          <p className="text-sm text-surface-400 mt-1">Matter Reference: {matter.matterNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Details Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-surface-900 border border-white/[0.06] p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Info className="h-4.5 w-4.5 text-brand-400" /> Case Overview & Details
            </h2>
            <div className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">
              {matter.description || "No description provided."}
            </div>
          </div>

          {/* Linked Shared Documents */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-brand-400" /> Case Documents ({linkedDocs.length})
              </h3>
            </div>

            {isLoadingDocs ? (
              <div className="p-8 text-center text-xs text-surface-400">Loading documents...</div>
            ) : linkedDocs.length === 0 ? (
              <div className="p-8 text-center text-sm text-surface-500 bg-surface-950/20">
                No documents have been shared for this case yet.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04] bg-surface-950/20">
                {linkedDocs.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-start gap-3 min-w-0 pr-4">
                      <FileText className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate" title={doc.documentName}>
                          {doc.documentName}
                        </div>
                        <div className="text-xs text-surface-400 mt-0.5">
                          Size: {formatBytes(doc.fileSize)} • Shared: {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(doc._id, doc.documentName)}
                      className="p-2 border border-white/[0.08] hover:bg-brand-500 hover:text-white rounded-xl text-surface-450 transition-all cursor-pointer shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Key parameters */}
        <div className="space-y-6">
          <div className="bg-surface-900 border border-white/[0.06] p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Case Parameters</h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400 font-semibold">Date Opened:</span>
                <span className="text-white">{new Date(matter.openedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400 font-semibold">Practice Area:</span>
                <span className="text-white">
                  {matter.practiceAreaName || (matter.practiceAreaId as any)?.name || "General Law"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400 font-semibold">Case Type:</span>
                <span className="text-white uppercase">{matter.matterType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400 font-semibold">Priority:</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                  matter.priority === "HIGH" || matter.priority === "URGENT"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-surface-950 text-surface-300 border border-white/[0.04]"
                }`}>
                  {matter.priority}
                </span>
              </div>
            </div>

            {matter.responsibleAttorneyName && (
              <div className="border-t border-white/[0.06] pt-4 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-2">Assigned Lead Attorney</span>
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <div className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center text-[10px] font-bold text-brand-400 uppercase">
                    {matter.responsibleAttorneyName.substring(0, 2)}
                  </div>
                  <span>{matter.responsibleAttorneyName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MatterDetailsPage;
