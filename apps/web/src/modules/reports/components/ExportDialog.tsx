import React, { useState } from "react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "pdf") => Promise<void>;
}

export function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    setError(null);
    try {
      await onExport(format);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to download report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="rounded-2xl border border-white/[0.06] bg-surface-900/90 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Export Report
            </h3>
            <p className="text-sm text-surface-200/50 mt-1">
              Select the file format to download the complete report data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-surface-200/50 hover:text-white rounded-lg p-1.5 hover:bg-white/[0.04] transition cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-sm text-danger mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Format Radio Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider block">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center gap-3 rounded-xl border p-4 cursor-pointer transition select-none ${
                  format === "csv"
                    ? "border-brand-500 bg-brand-500/5 text-white"
                    : "border-white/[0.06] bg-surface-900/30 text-surface-200/70 hover:border-white/10 hover:text-white"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === "csv"}
                  onChange={() => setFormat("csv")}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">CSV Spreadsheet</span>
              </label>

              <label
                className={`flex items-center justify-center gap-3 rounded-xl border p-4 cursor-pointer transition select-none ${
                  format === "pdf"
                    ? "border-brand-500 bg-brand-500/5 text-white"
                    : "border-white/[0.06] bg-surface-900/30 text-surface-200/70 hover:border-white/10 hover:text-white"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={() => setFormat("pdf")}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">PDF Document</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="rounded-xl border border-white/10 hover:bg-white/[0.04] text-white px-4 py-2.5 text-sm font-semibold transition cursor-pointer select-none disabled:opacity-45"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-semibold transition cursor-pointer select-none flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Downloading...
                </>
              ) : (
                "Download Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ExportDialog;
