import React, { useRef, useState } from "react";
import { Paperclip, Loader2, X } from "lucide-react";

interface AttachmentUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ onUpload, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert("Files must be smaller than 25MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to upload attachment.");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />
      {!selectedFile ? (
        <button
          type="button"
          onClick={handleTriggerClick}
          disabled={disabled}
          className="p-2 border border-white/[0.08] hover:bg-white/[0.04] text-surface-200/60 hover:text-white rounded-xl active:scale-95 transition-all cursor-pointer"
          title="Attach File"
        >
          <Paperclip className="h-4.5 w-4.5" />
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs max-w-xs sm:max-w-md animate-fade-in">
          <span className="truncate text-white font-medium max-w-[120px] sm:max-w-[200px]">
            {selectedFile.name}
          </span>
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin text-brand-400" />
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleUploadClick}
                className="text-[10px] text-brand-300 hover:text-brand-200 font-bold uppercase tracking-wider px-1.5 py-0.5 hover:bg-white/[0.04] rounded transition-all cursor-pointer"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-surface-200/50 hover:text-danger rounded p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
