import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDocument, useUpdateDocument, useFolders } from "../hooks/useDocuments.js";
import { toast } from "sonner";

export const EditDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doc, isLoading } = useDocument(id!);
  const { data: folders = [] } = useFolders();
  const updateMutation = useUpdateDocument();

  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [folderId, setFolderId] = useState("");

  useEffect(() => {
    if (doc) {
      setDocumentName(doc.documentName);
      setCategory(doc.category);
      setDescription(doc.description || "");
      setTagsInput(doc.tags ? doc.tags.join(", ") : "");
      setFolderId(doc.folderId || "");
    }
  }, [doc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim()) {
      toast.error("Document Name is required");
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    updateMutation.mutate(
      {
        id: id!,
        data: {
          documentName,
          category,
          description,
          folderId: folderId || null,
          tags: parsedTags,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success("Document updated successfully");
          navigate(`/documents/${id}`);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update document");
        },
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading document metadata...</div>;
  if (!doc) return <div className="p-8 text-center text-red-500">Document not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to={`/documents/${id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          &larr; Back to Details
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md p-8">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-2xl font-black text-gray-900">Edit Document Metadata</h1>
          <p className="text-sm text-gray-500 mt-1">Modify category, logical folder, or tag keywords.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Document Name</label>
            <input
              type="text"
              required
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="General">General</option>
                <option value="Evidence">Evidence</option>
                <option value="Pleading">Pleading</option>
                <option value="Correspondence">Correspondence</option>
                <option value="Contract">Contract</option>
                <option value="Uncategorized">Uncategorized</option>
              </select>
            </div>

            {/* Folder Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Folder</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Root / No Folder</option>
                {folders.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.folderName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              placeholder="e.g. agreement, signed, draft (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/documents/${id}`)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditDocumentPage;
