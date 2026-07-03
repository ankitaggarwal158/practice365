import React, { useState, useEffect } from "react";
import { DocumentMeta } from "../types/document.types.js";
import { API_BASE_URL } from "../../../services/http-client.js";

interface DocumentPreviewProps {
  doc: DocumentMeta;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc }) => {
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);

  const previewUrl = `${API_BASE_URL}/documents/${doc._id}/download?preview=true`;

  useEffect(() => {
    if (doc.mimeType.includes("text") || doc.mimeType.includes("plain")) {
      setLoadingText(true);
      fetch(previewUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load text preview");
          return res.text();
        })
        .then((text) => {
          setTextPreview(text);
          setLoadingText(false);
        })
        .catch((err) => {
          console.error(err);
          setTextPreview("Failed to load preview.");
          setLoadingText(false);
        });
    } else {
      setTextPreview(null);
    }
  }, [doc._id, doc.mimeType, previewUrl]);

  if (doc.mimeType.includes("pdf")) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">PDF Preview</span>
        </div>
        <iframe src={previewUrl} className="w-full h-[600px] border-0" title={doc.documentName} />
      </div>
    );
  }

  if (doc.mimeType.includes("image")) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Image Preview</span>
        </div>
        <div className="p-6 flex justify-center bg-gray-50/50">
          <img src={previewUrl} alt={doc.documentName} className="max-h-[500px] max-w-full rounded-lg shadow-sm border border-gray-200 object-contain" />
        </div>
      </div>
    );
  }

  if (doc.mimeType.includes("text") || doc.mimeType.includes("plain")) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Text Preview</span>
        </div>
        <div className="p-4 bg-gray-50/50">
          {loadingText ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading text...</div>
          ) : (
            <pre className="p-4 bg-white border border-gray-200 rounded-lg overflow-auto max-h-[500px] text-xs font-mono text-gray-800 leading-relaxed">
              {textPreview}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
      <div className="text-4xl mb-4">📂</div>
      <h4 className="text-base font-semibold text-gray-900 mb-1">Preview not available</h4>
      <p className="text-sm text-gray-500 max-w-xs mb-4">
        Previews are only supported for PDFs, Images, and Text files. You can download the file to view it.
      </p>
      <a
        href={`${API_BASE_URL}/documents/${doc._id}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
      >
        Download File
      </a>
    </div>
  );
};
export default DocumentPreview;
