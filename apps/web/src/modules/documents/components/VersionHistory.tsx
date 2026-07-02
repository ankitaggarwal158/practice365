import React from "react";
import { DocumentVersion } from "../types/document.types.js";

interface VersionHistoryProps {
  versions: DocumentVersion[];
  isLoading: boolean;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading version history...</div>;
  }

  if (versions.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No version history available.</div>;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flow-root mt-6">
      <ul className="-mb-8">
        {versions.map((version, versionIdx) => (
          <li key={version._id}>
            <div className="relative pb-8">
              {versionIdx !== versions.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <span className="text-white text-xs font-bold">v{version.versionNumber}</span>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Uploaded by <span className="font-medium text-gray-900">User</span> {/* Needs populated user info if added */}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatBytes(version.fileSize)} • {version.notes || "No notes"}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={version.uploadedAt}>{new Date(version.uploadedAt).toLocaleDateString()}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
