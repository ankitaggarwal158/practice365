import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUploadDocument, useFolders } from "../hooks/useDocuments.js";
import { clientApi } from "../../clients/api/client.api.js";
import { matterApi } from "../../matters/api/matter.api.js";
import { Client } from "../../clients/types/client.types.js";
import { Matter } from "../../matters/types/matter.types.js";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

export const UploadDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [folderId, setFolderId] = useState("");
  const [clientId, setClientId] = useState("");
  const [matterId, setMatterId] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const { data: folders = [] } = useFolders();
  const uploadMutation = useUploadDocument();

  useEffect(() => {
    clientApi.listClients({ limit: 100 })
      .then((res) => setClients(res.data))
      .catch((err) => console.error("Failed to load clients", err));

    matterApi.listMatters({ limit: 100 })
      .then((res) => setMatters(res.data))
      .catch((err) => console.error("Failed to load matters", err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    uploadMutation.mutate(
      {
        file,
        folderId: folderId || null,
        category,
        description,
        matterId: matterId || undefined,
        clientId: clientId || undefined,
        tags: parsedTags,
      },
      {
        onSuccess: () => {
          toast.success("Document uploaded successfully");
          navigate("/documents");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to upload document");
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/documents" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          &larr; Back to Documents
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md p-8">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-2xl font-black text-gray-900">Upload New Document</h1>
          <p className="text-sm text-gray-500 mt-1">Configure metadata and associate file with firm records.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Picker */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Document File</label>
            <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center transition-colors bg-gray-50/50 cursor-pointer relative">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-gray-900">
                {file ? file.name : "Click to select or drag & drop file"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Supports any file up to 50MB"}
              </p>
            </div>
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

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Client (Optional)</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clientType === "INDIVIDUAL" ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : c.companyName || "Unnamed Company"} ({c.clientNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Matter Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Matter (Optional)</label>
              <select
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Matter</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.matterNumber})
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
              placeholder="Provide a detailed summary of the document contents..."
              className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/documents")}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending || !file}
              className="px-5 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UploadDocumentPage;
