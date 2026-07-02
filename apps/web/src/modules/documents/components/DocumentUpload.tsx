import React, { useState } from "react";
import { useUploadDocument } from "../hooks/useDocuments.js";
import { toast } from "sonner";

interface DocumentUploadProps {
  currentFolderId: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ currentFolderId, onSuccess, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  
  const uploadMutation = useUploadDocument();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    uploadMutation.mutate(
      { file, folderId: currentFolderId, category, description },
      {
        onSuccess: () => {
          toast.success("Document uploaded successfully");
          if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to upload document");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Upload New Document</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">File</label>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="General">General</option>
          <option value="Evidence">Evidence</option>
          <option value="Pleading">Pleading</option>
          <option value="Correspondence">Correspondence</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Brief description of the document"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={uploadMutation.isPending || !file}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </form>
  );
};
