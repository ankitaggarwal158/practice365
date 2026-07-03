import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateSignatureRequest } from "../hooks/useSignature";
import SignatureRequestForm from "../components/SignatureRequestForm";

export default function CreateSignatureRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get("documentId");

  const createMutation = useCreateSignatureRequest();

  const handleSubmit = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        navigate("/signature-requests");
      },
    });
  };

  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/signature-requests")}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4 cursor-pointer"
        >
          &larr; Back to Requests
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Signature Request</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Prepare a new document for execution by adding signers and choosing execution mode.
        </p>
      </div>

      <div className="bg-surface-900/40 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
        <SignatureRequestForm
          initialDocumentId={docIdParam || undefined}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
