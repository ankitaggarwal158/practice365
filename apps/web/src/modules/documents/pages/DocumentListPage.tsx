import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FolderTree } from "../components/FolderTree.js";
import { DocumentTable } from "../components/DocumentTable.js";
import { DocumentCard } from "../components/DocumentCard.js";
import { DocumentFilters } from "../components/DocumentFilters.js";
import { DocumentSearch } from "../components/DocumentSearch.js";
import { useFolders, useDocuments, useDeleteDocument } from "../hooks/useDocuments.js";
import { toast } from "sonner";
import { Settings } from "lucide-react";

export const DocumentListPage: React.FC = () => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: folders = [] } = useFolders();
  const { data: docData, isLoading: isLoadingDocs } = useDocuments({
    folderId: selectedFolderId,
    search,
    category: category || undefined,
  });
  const deleteMutation = useDeleteDocument();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Document deleted"),
        onError: () => toast.error("Failed to delete document"),
      });
    }
  };

  // Perform client-side sorting
  const getSortedDocuments = () => {
    if (!docData?.data) return [];
    const docs = [...docData.data];

    return docs.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "documentName") {
        comparison = a.documentName.localeCompare(b.documentName);
      } else if (sortBy === "fileSize") {
        comparison = a.fileSize - b.fileSize;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });
  };

  const sortedDocuments = getSortedDocuments();

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50 text-gray-800">
      {/* Sidebar for folders */}
      <div className="flex flex-col border-r border-gray-200 bg-white">
        <div className="flex-1 overflow-y-auto">
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Link
            to="/documents/folders"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-200 shadow-sm text-xs font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all gap-1"
          >
            <Settings className="h-3.5 w-3.5" />
            Manage Folders
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header toolbar */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-gray-900 truncate">
              {selectedFolderId
                ? folders.find((f: any) => f._id === selectedFolderId)?.folderName
                : "Document Management"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* List / Grid View Toggles */}
            <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "list" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "grid" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Grid View
              </button>
            </div>

            <DocumentSearch value={search} onChange={setSearch} />

            <Link
              to="/documents/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              Upload Document
            </Link>
          </div>
        </div>

        {/* Filters and List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <DocumentFilters
            category={category}
            setCategory={setCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          {viewMode === "list" ? (
            <DocumentTable
              documents={sortedDocuments}
              isLoading={isLoadingDocs}
              onDelete={handleDelete}
            />
          ) : (
            <>
              {isLoadingDocs ? (
                <div className="text-center text-gray-500 py-12">Loading documents grid...</div>
              ) : sortedDocuments.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-gray-300 rounded-3xl bg-white">
                  <h3 className="text-sm font-medium text-gray-900">No documents</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading a new file.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedDocuments.map((doc) => (
                    <DocumentCard key={doc._id} doc={doc} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default DocumentListPage;
