import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFolders, useCreateFolder, useUpdateFolder, useDeleteFolder } from "../hooks/useDocuments.js";
import { toast } from "sonner";
import { Folder } from "lucide-react";

export const FolderManagementPage: React.FC = () => {
  const { data: folders = [], isLoading } = useFolders();
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();

  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState("");

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return toast.error("Folder name is required");

    createFolderMutation.mutate(
      {
        folderName: newFolderName.trim(),
        parentFolderId: parentFolderId || null,
      },
      {
        onSuccess: () => {
          toast.success("Folder created successfully");
          setNewFolderName("");
          setParentFolderId("");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create folder");
        },
      }
    );
  };

  const handleUpdate = (id: string) => {
    if (!editFolderName.trim()) return toast.error("Folder name cannot be empty");

    updateFolderMutation.mutate(
      {
        id,
        data: { folderName: editFolderName.trim() },
      },
      {
        onSuccess: () => {
          toast.success("Folder renamed successfully");
          setEditingFolderId(null);
          setEditFolderName("");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to rename folder");
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this folder? Documents inside this folder will not be deleted but moved to Root.")) {
      deleteFolderMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Folder deleted successfully");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to delete folder");
        },
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading folder hierarchy...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/documents" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          &larr; Back to Documents
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Create Folder Form */}
        <div className="md:col-span-1 bg-white rounded-3xl border border-gray-200/80 shadow-md p-6 h-fit">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-4">Create Folder</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Evidence Files"
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Parent Folder (Optional)</label>
              <select
                value={parentFolderId}
                onChange={(e) => setParentFolderId(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Root (No Parent)</option>
                {folders.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.folderName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={createFolderMutation.isPending}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {createFolderMutation.isPending ? "Creating..." : "+ Add Folder"}
            </button>
          </form>
        </div>

        {/* Right Column: Folders List */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200/80 shadow-md p-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-4">Logical Folders</h2>
          {folders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No custom folders created yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {folders.map((folder) => {
                const parent = folders.find((f) => f._id === folder.parentFolderId);
                const isEditing = editingFolderId === folder._id;

                return (
                  <li key={folder._id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editFolderName}
                            onChange={(e) => setEditFolderName(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleUpdate(folder._id)}
                            disabled={updateFolderMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingFolderId(null)}
                            className="bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-gray-900 flex items-center">
                            <Folder className="h-4 w-4 text-gray-400 mr-2" />
                            {folder.folderName}
                          </p>
                          {parent && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Parent: <span className="font-semibold text-gray-500">{parent.folderName}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingFolderId(folder._id);
                            setEditFolderName(folder.folderName);
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-all"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(folder._id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
export default FolderManagementPage;
