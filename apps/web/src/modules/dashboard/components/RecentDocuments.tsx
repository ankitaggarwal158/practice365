import { Link } from "react-router-dom";
import { FileText, ArrowUpRight } from "lucide-react";

interface RecentDocumentsProps {
  documents: any[] | null;
  isLoading: boolean;
}

export function RecentDocuments({ documents, isLoading }: RecentDocumentsProps) {
  if (documents === null) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-400" />
          <h3 className="font-semibold text-white">Recent Documents</h3>
        </div>
        <Link
          to="/documents"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          View All Documents <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto max-h-[380px]">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-surface-200/40">No documents found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {documents.map((doc) => {
              const uploader = doc.createdBy
                ? `${doc.createdBy.firstName} ${doc.createdBy.lastName}`
                : "System";

              return (
                <div key={doc._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between group">
                  <div className="min-w-0 pr-4">
                    <Link
                      to={`/documents/${doc._id}`}
                      className="text-sm font-semibold text-white hover:text-brand-400 transition-colors truncate block"
                    >
                      {doc.documentName}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-surface-200/60 border border-white/[0.03]">
                        {doc.category || "Uncategorized"}
                      </span>
                      <span className="text-xs text-surface-200/30">•</span>
                      <span className="text-xs text-surface-200/40">
                        {formatBytes(doc.fileSize)}
                      </span>
                      <span className="text-xs text-surface-200/30">•</span>
                      <span className="text-xs text-surface-200/40 truncate max-w-[120px]" title={uploader}>
                        by {uploader}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-surface-200/30 shrink-0">
                    {formatDate(doc.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default RecentDocuments;
