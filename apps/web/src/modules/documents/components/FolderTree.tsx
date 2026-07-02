import React from "react";
import { DocumentFolder } from "../types/document.types.js";

interface FolderTreeProps {
  folders: DocumentFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ folders, selectedFolderId, onSelectFolder }) => {
  // Simple flat list for now, ideally we build a recursive tree if parentFolderId is used heavily
  const topLevelFolders = folders.filter((f) => !f.parentFolderId);

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Folders</h3>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelectFolder(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              selectedFolderId === null ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            📁 All Documents
          </button>
        </li>
        {topLevelFolders.map((folder) => (
          <li key={folder._id}>
            <button
              onClick={() => onSelectFolder(folder._id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                selectedFolderId === folder._id ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-2">📁</span>
              {folder.folderName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
