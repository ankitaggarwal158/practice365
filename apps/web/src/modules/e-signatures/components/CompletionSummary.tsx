import { SignatureRequest } from "../types/signature.types";
import { SignatureApiClient } from "../api/signature.api";
import { useState } from "react";
import { toast } from "sonner";

interface CompletionSummaryProps {
  request: SignatureRequest;
}

export default function CompletionSummary({ request }: CompletionSummaryProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await SignatureApiClient.downloadSignedDocument(
        request.id,
        `Signed_${request.requestTitle.replace(/\s+/g, "_")}.pdf`
      );
      toast.success("Document downloaded successfully.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to download document.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-success/5 border border-success/15 rounded-2xl p-6 md:p-8 text-center space-y-4">
      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-success/10 text-success text-xl font-bold">
        ✓
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Document Fully Executed</h2>
        <p className="text-sm text-surface-200/60 max-w-md mx-auto">
          All signers have successfully executed this agreement. The final, secure signed document and audit log are compiled.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 bg-success hover:bg-success/90 active:scale-95 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          {isDownloading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            "Download Signed PDF"
          )}
        </button>
      </div>
    </div>
  );
}
