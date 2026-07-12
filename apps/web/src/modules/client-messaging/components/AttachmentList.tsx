import React, { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../../services/http-client";

interface AttachmentListProps {
  messageId: string;
  isPortal?: boolean;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ messageId, isPortal = false }) => {
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAttachments = async () => {
      setLoading(true);
      try {
        // Fetch message attachments from repository/service (using shared endpoint or we can mock/call local fetch)
      } catch (err) {
        console.error("Error loading attachments:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAttachments();
    return () => {
      active = false;
    };
  }, [messageId, isPortal]);

  const handleDownload = async (docId: string, name: string) => {
    setDownloadingId(docId);
    try {
      const token = localStorage.getItem(isPortal ? "portalAccessToken" : "accessToken");
      const url = `${API_BASE_URL}${isPortal ? "/portal" : ""}/documents/${docId}/download`;

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download document.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-surface-200/50 p-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading files...</span>
      </div>
    );
  }

  return (
    <div className="mt-2.5 space-y-1.5 border-t border-white/[0.06] pt-2">
      <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.04] text-xs hover:bg-white/[0.04] transition-all">
        <div className="flex items-center gap-2 min-w-0 pr-4">
          <FileText className="h-4 w-4 text-brand-400 shrink-0" />
          <span className="truncate text-white/80 font-medium">Attachment</span>
        </div>
        <button
          onClick={() => handleDownload("mock-doc-id", "file.pdf")}
          disabled={downloadingId !== null}
          className="p-1 text-surface-200 hover:text-white hover:bg-white/[0.06] rounded cursor-pointer transition-all disabled:opacity-50"
        >
          {downloadingId === "mock-doc-id" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AttachmentList;
