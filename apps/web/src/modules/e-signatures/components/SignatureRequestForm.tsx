import React, { useState, useEffect } from "react";
import { documentApi } from "../../documents/api/document.api";
import { CreateSignatureRequestPayload } from "../types/signature.types";

interface SignatureRequestFormProps {
  initialDocumentId?: string;
  onSubmit: (payload: CreateSignatureRequestPayload) => void;
  isLoading: boolean;
}

interface SignerInput {
  fullName: string;
  email: string;
  signingOrder: number;
}

export default function SignatureRequestForm({
  initialDocumentId,
  onSubmit,
  isLoading,
}: SignatureRequestFormProps) {
  const [requestTitle, setRequestTitle] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(initialDocumentId || "");
  const [signingMode, setSigningMode] = useState<"PARALLEL" | "SEQUENTIAL">("PARALLEL");
  const [expiresAt, setExpiresAt] = useState("");
  const [signers, setSigners] = useState<SignerInput[]>([
    { fullName: "", email: "", signingOrder: 1 },
  ]);

  // Documents list for dropdown
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  useEffect(() => {
    if (!initialDocumentId) {
      setIsDocsLoading(true);
      documentApi
        .searchDocuments({})
        .then((res) => {
          setDocuments(res.data || []);
        })
        .catch(console.error)
        .finally(() => setIsDocsLoading(false));
    }
  }, [initialDocumentId]);

  const handleAddSigner = () => {
    setSigners((prev) => [
      ...prev,
      { fullName: "", email: "", signingOrder: prev.length + 1 },
    ]);
  };

  const handleRemoveSigner = (index: number) => {
    if (signers.length === 1) return;
    setSigners((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      // Re-assign orders sequentially
      return updated.map((s, idx) => ({ ...s, signingOrder: idx + 1 }));
    });
  };

  const handleSignerChange = (index: number, field: keyof SignerInput, value: string | number) => {
    setSigners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value } as SignerInput;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) {
      alert("Please select a document.");
      return;
    }

    // Basic validation
    const emptySigner = signers.some((s) => !s.fullName.trim() || !s.email.trim());
    if (emptySigner) {
      alert("Please fill in all signer names and emails.");
      return;
    }

    const payload: CreateSignatureRequestPayload = {
      documentId: selectedDocId,
      requestTitle: requestTitle.trim() || undefined as any,
      signingMode,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      signers: signers.map((s) => ({
        fullName: s.fullName.trim(),
        email: s.email.trim(),
        signingOrder: signingMode === "SEQUENTIAL" ? s.signingOrder : undefined,
      })),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Selection */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Select Document for Signature <span className="text-danger">*</span>
        </label>
        {initialDocumentId ? (
          <div className="bg-surface-950 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-surface-200/60">
            Locked to initial document choice (ID: {initialDocumentId})
          </div>
        ) : (
          <select
            required
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            disabled={isDocsLoading}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="">-- Choose a Document --</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.documentName} ({doc.category})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Request Title <span className="text-danger">*</span>
        </label>
        <input
          required
          type="text"
          value={requestTitle}
          onChange={(e) => setRequestTitle(e.target.value)}
          placeholder="e.g. Mutual Non-Disclosure Agreement"
          className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-200/30 transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signing Mode */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Signing Order Mode
          </label>
          <select
            value={signingMode}
            onChange={(e) => setSigningMode(e.target.value as any)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          >
            <option value="PARALLEL">Parallel (Anyone can sign anytime)</option>
            <option value="SEQUENTIAL">Sequential (Sign one by one in order)</option>
          </select>
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Expiration Date (Optional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Signers list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <h3 className="text-md font-semibold text-white">Signers</h3>
          <button
            type="button"
            onClick={handleAddSigner}
            className="text-xs text-brand-400 font-semibold hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            + Add Signer
          </button>
        </div>

        <div className="space-y-3">
          {signers.map((signer, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-4 bg-surface-950/40 p-4 rounded-xl border border-white/[0.04]"
            >
              {signingMode === "SEQUENTIAL" && (
                <div className="w-full md:w-16">
                  <label className="block md:hidden text-xs text-surface-200/40 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={signer.signingOrder}
                    onChange={(e) =>
                      handleSignerChange(index, "signingOrder", parseInt(e.target.value) || 1)
                    }
                    className="w-full text-center bg-surface-950 border border-white/[0.08] rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              <div className="flex-1 w-full">
                <label className="block md:hidden text-xs text-surface-200/40 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Signer's full name"
                  value={signer.fullName}
                  onChange={(e) => handleSignerChange(index, "fullName", e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="block md:hidden text-xs text-surface-200/40 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="signer@example.com"
                  value={signer.email}
                  onChange={(e) => handleSignerChange(index, "email", e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              {signers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSigner(index)}
                  className="text-sm text-danger hover:underline font-medium md:mt-0 mt-2 focus:outline-none"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.06] flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            "Create Signature Request"
          )}
        </button>
      </div>
    </form>
  );
}
