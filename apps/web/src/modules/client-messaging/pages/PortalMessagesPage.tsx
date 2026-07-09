import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMessages, useSendMessage, useUploadAttachment } from "../hooks/useClientMessaging";
import MessageThread from "../components/MessageThread";
import MessageComposer from "../components/MessageComposer";

export const PortalMessagesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const matterId = id || "";

  // Retrieve current client's clientId from local storage
  const portalUserStr = localStorage.getItem("portalUser");
  const portalUser = portalUserStr ? JSON.parse(portalUserStr) : null;
  const currentClientId = portalUser?.clientId || "";

  const { data: messages = [], isLoading, error } = useMessages(matterId, true);
  const { mutateAsync: sendMessage } = useSendMessage(matterId, true);
  const { mutateAsync: uploadAttachment } = useUploadAttachment(matterId, true);

  const handleSend = async (message: string) => {
    await sendMessage(message);
  };

  const handleUpload = async (file: File) => {
    await uploadAttachment(file);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-white space-y-4">
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl">
          <p className="text-sm text-danger">Failed to load messages. {error.message}</p>
        </div>
        <Link to={`/portal/matters/${matterId}`} className="text-brand-400 font-semibold flex items-center justify-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to Case Details
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/portal/matters/${matterId}`}
          className="p-2 border border-white/[0.08] hover:bg-surface-900 rounded-xl text-surface-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Case Messages</h1>
          <p className="text-xs text-surface-200/50 mt-0.5">Secure messaging thread with your attorney.</p>
        </div>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end">
        <MessageThread
          messages={messages}
          currentUserIdOrClientId={currentClientId}
          isLoading={isLoading}
          isPortal={true}
        />
      </div>

      {/* Composer Input Area */}
      <div className="border-t border-white/[0.06] pt-4 shrink-0">
        <MessageComposer
          onSend={handleSend}
          onUpload={handleUpload}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default PortalMessagesPage;
