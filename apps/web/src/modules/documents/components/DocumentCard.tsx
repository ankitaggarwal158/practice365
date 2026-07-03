import React from "react";
import { Link } from "react-router-dom";
import { DocumentMeta } from "../types/document.types.js";
import { API_BASE_URL } from "../../../services/http-client.js";
import { FileText, FileImage, FileCode, File } from "lucide-react";

interface DocumentCardProps {
  doc: DocumentMeta;
  onDelete: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onDelete }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Determine file icon
  const renderIcon = (mime: string) => {
    const className = "h-8 w-8 transition-colors";
    if (mime.includes("pdf")) return <FileText className={`${className} text-red-500 group-hover:text-red-600`} />;
    if (mime.includes("image")) return <FileImage className={`${className} text-green-500 group-hover:text-green-600`} />;
    if (mime.includes("text") || mime.includes("plain")) return <FileCode className={`${className} text-amber-500 group-hover:text-amber-600`} />;
    return <File className={`${className} text-gray-500 group-hover:text-blue-500`} />;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group h-full">
      <div>
        <div className="flex items-start justify-between">
          <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-200">
            {renderIcon(doc.mimeType)}
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {doc.category}
          </span>
        </div>

        <div className="mt-4">
          <Link
            to={`/documents/${doc._id}`}
            className="block text-base font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {doc.documentName}
          </Link>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.originalFileName}</p>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[2.5rem]">
            {doc.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatBytes(doc.fileSize)}</span>
          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>By: {doc.createdBy?.displayName || "System"}</span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-50 mt-1">
          <a
            href={`${API_BASE_URL}/documents/${doc._id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-all"
          >
            Download
          </a>
          <button
            onClick={() => onDelete(doc._id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default DocumentCard;
