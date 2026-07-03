import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSigningSession, useSubmitSignature } from "../hooks/useSignature";
import SignaturePad from "../components/SignaturePad";

export default function SigningPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [signatureData, setSignatureData] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { data, isLoading, error } = useSigningSession(token || "");
  const submitMutation = useSubmitSignature(token || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("You must accept the terms before signing.");
      return;
    }
    if (!signatureData) {
      alert("Please draw your signature in the box.");
      return;
    }

    submitMutation.mutate(
      {
        signature: signatureData,
        acceptedTerms,
      },
      {
        onSuccess: () => {
          navigate("/sign/completed");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-surface-900/40 border border-danger/25 p-8 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-danger/10 text-danger text-2xl flex items-center justify-center mx-auto">
            !
          </div>
          <h2 className="text-xl font-bold text-white">Invalid or Expired Link</h2>
          <p className="text-sm text-surface-200/50">
            {error?.message || "This signing invitation is invalid, has expired, or was cancelled."}
          </p>
        </div>
      </div>
    );
  }

  const { request, signer, documentName } = data;

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col w-full">
      {/* Brand Header */}
      <header className="border-b border-white/[0.06] bg-surface-900/20 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-white">
            Practice<span className="text-brand-400">365</span>
          </span>
          <span className="text-[10px] text-surface-200/30 font-mono tracking-wider uppercase border border-white/[0.08] px-1.5 py-0.5 rounded">
            Signing Portal
          </span>
        </div>
        <span className="text-xs text-surface-200/40 hidden sm:block">
          Secure Session: {signer.fullName}
        </span>
      </header>

      {/* Main Grid split */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Document Preview Simulation */}
        <div className="lg:col-span-3 flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Agreement File Preview</h2>
            <span className="text-xs text-surface-200/40 font-mono">{documentName}</span>
          </div>

          <div className="flex-1 min-h-[350px] bg-white border border-white/[0.08] rounded-2xl shadow-2xl p-8 flex flex-col text-slate-900 overflow-y-auto max-h-[600px] prose prose-sm select-none">
            {/* Header simulated page */}
            <div className="border-b-2 border-slate-200 pb-4 mb-6 text-center">
              <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                {request.requestTitle}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">DOCUMENT ID: {request.id}</p>
            </div>

            {/* Document contents simulation */}
            <div className="flex-1 space-y-4 text-xs leading-relaxed text-slate-600">
              <p className="font-bold text-slate-700">MEMORANDUM OF AGREEMENT</p>
              <p>
                This document serves as an execution agreement entered into between the participating parties as named under the electronic signature request.
              </p>
              <p>
                By applying your signature below, you certify that you have read, understood, and agreed to the contents, rights, and obligations defined within this execution file.
              </p>
              <p>
                The transaction is certified under secure IP logging and browser audit trails. A final copies ledger will be saved within the firm archives for compliance.
              </p>
              <p className="border-t border-dashed border-slate-200 pt-6 mt-8 font-bold text-slate-500">
                End of Document Preview
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Signing Actions & Pad */}
        <div className="lg:col-span-2 flex flex-col justify-start">
          <div className="bg-surface-900/40 border border-white/[0.06] rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Execute Document</h2>
              <p className="text-xs text-surface-200/50">
                Please review the document details and draw your signature below.
              </p>
            </div>

            {/* Request Info card */}
            <div className="bg-surface-950 p-4 rounded-xl border border-white/[0.04] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-200/40">Request Title</span>
                <span className="text-white font-semibold">{request.requestTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-200/40">Your Name</span>
                <span className="text-white font-semibold">{signer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-200/40">Email Address</span>
                <span className="text-white font-semibold">{signer.email}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Terms Acceptance */}
              <div className="flex gap-3 items-start select-none">
                <input
                  required
                  id="terms-check"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 bg-surface-950 border border-white/[0.08] text-brand-500 focus:ring-brand-500/80 rounded cursor-pointer"
                />
                <label htmlFor="terms-check" className="text-xs text-surface-200/60 cursor-pointer leading-relaxed">
                  I agree to the Electronic Record and Signature Disclosure terms and consent to execute this document electronically.
                </label>
              </div>

              {/* Signature Pad */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  Drawn Signature <span className="text-danger">*</span>
                </label>
                <SignaturePad
                  onSave={(dataUrl) => setSignatureData(dataUrl)}
                  onClear={() => setSignatureData("")}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!acceptedTerms || !signatureData || submitMutation.isPending}
                className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all flex items-center justify-center cursor-pointer"
              >
                {submitMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Submit Electronic Signature"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
