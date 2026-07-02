import React, { useState } from "react";
import { FolderTree } from "../components/FolderTree.js";
import { DocumentTable } from "../components/DocumentTable.js";
import { DocumentUpload } from "../components/DocumentUpload.js";
import { useFolders, useDocuments, useDeleteDocument } from "../hooks/useDocuments.js";
import { toast } from "sonner";

export const DocumentListPage: React.FC = () => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");

  const { data: folders = [] } = useFolders();
  const { data: docData, isLoading: isLoadingDocs } = useDocuments({ folderId: selectedFolderId, search });
  const deleteMutation = useDeleteDocument();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Document deleted"),
        onError: () => toast.error("Failed to delete document")
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-white">
      {/* Sidebar for folders */}
      <FolderTree 
        folders={folders} 
        selectedFolderId={selectedFolderId} 
        onSelectFolder={setSelectedFolderId} 
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {selectedFolderId 
                ? folders.find((f: any) => f._id === selectedFolderId)?.folderName 
                : "All Documents"}
            </h1>
          </div>
          <div className="flex space-x-3">
            <input 
              type="text" 
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-64 sm:text-sm border-gray-300 rounded-md"
            />
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Upload Document
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {showUpload && (
            <div className="mb-6">
              <DocumentUpload 
                currentFolderId={selectedFolderId} 
                onSuccess={() => setShowUpload(false)}
                onCancel={() => setShowUpload(false)}
              />
            </div>
          )}

          <DocumentTable 
            documents={docData?.data || []} 
            isLoading={isLoadingDocs} 
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};
