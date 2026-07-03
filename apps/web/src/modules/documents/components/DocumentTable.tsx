import React from "react";
import { Link } from "react-router-dom";
import { DocumentMeta } from "../types/document.types.js";
import { API_BASE_URL } from "../../../services/http-client.js";
import { FileText, FileImage, FileCode, File } from "lucide-react";

interface DocumentTableProps {
  documents: DocumentMeta[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents, isLoading, onDelete }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderIcon = (mime: string) => {
    const className = "h-5 w-5";
    if (mime.includes("pdf")) return <FileText className={`${className} text-red-500`} />;
    if (mime.includes("image")) return <FileImage className={`${className} text-green-500`} />;
    if (mime.includes("text") || mime.includes("plain")) return <FileCode className={`${className} text-amber-500`} />;
    return <File className={`${className} text-gray-500`} />;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg bg-white mt-4">
        <h3 className="text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading a new file.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg">
                          {renderIcon(doc.mimeType)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/documents/${doc._id}`} className="hover:underline">{doc.documentName}</Link>
                          </div>
                          <div className="text-sm text-gray-500">{doc.originalFileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBytes(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <a href={`${API_BASE_URL}/documents/${doc._id}/download`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                        Download
                      </a>
                      <button onClick={() => onDelete(doc._id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
