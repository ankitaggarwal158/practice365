import React, { useRef, useState } from "react";
import { useUploadLogo } from "../hooks/useFirmSettings";

interface LogoUploaderProps {
  currentLogoUrl?: string;
  disabled?: boolean;
}

export function LogoUploader({ currentLogoUrl, disabled }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadLogoMutation = useUploadLogo();
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = (file: File) => {
    // Basic frontend validations
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, GIF, and WEBP image files are allowed.");
      return;
    }
    uploadLogoMutation.mutate(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-white">Firm Branding Logo</label>
      
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Logo preview */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-surface-950 overflow-hidden shadow-inner">
          {currentLogoUrl ? (
            <img 
              src={currentLogoUrl.startsWith("http") ? currentLogoUrl : `http://localhost:4000${currentLogoUrl}`} 
              alt="Firm Logo" 
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="text-xs font-semibold text-surface-200/20">No Logo</span>
          )}
          {uploadLogoMutation.isPending && (
            <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-xs flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`flex-1 flex flex-col items-center justify-center border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-brand-400 bg-brand-500/[0.02]"
              : "border-white/[0.08] hover:border-white/[0.15] bg-surface-900/10"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={disabled || uploadLogoMutation.isPending}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
          <svg className="h-6 w-6 text-surface-200/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
          <span className="text-xs font-semibold text-white">
            {uploadLogoMutation.isPending ? "Uploading..." : "Click or drag logo file to upload"}
          </span>
          <span className="text-[10px] text-surface-200/30 mt-1">
            PNG, JPEG, GIF, or WEBP (Max 2MB)
          </span>
        </div>
      </div>
    </div>
  );
}
export default LogoUploader;
