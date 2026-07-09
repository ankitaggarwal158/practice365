import React from "react";
import { useAuth } from "../../auth";
import { useMessages, useSendMessage, useUploadAttachment } from "../hooks/useClientMessaging";
import MessageThread from "../components/MessageThread";
import MessageComposer from "../components/MessageComposer";

interface MatterMessagesPageProps {
  matterId: string;
}

export const MatterMessagesPage: React.FC<MatterMessagesPageProps> = ({ matterId }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || "";

  const { data: messages = [], isLoading, error } = useMessages(matterId, false);
  const { mutateAsync: sendMessage } = useSendMessage(matterId, false);
  const { mutateAsync: uploadAttachment } = useUploadAttachment(matterId, false);

  const handleSend = async (message: string) => {
    await sendMessage(message);
  };

  const handleUpload = async (file: File) => {
    await uploadAttachment(file);
  };

  if (error) {
    return (
      <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
        Failed to load messages. {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-surface-900/40 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
      {/* Header Info */}
      <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          Secure Portal Communications
        </h3>
        <p className="text-xs text-surface-200/50 mt-0.5">
          Messages sent here are visible in the Client Portal for this Matter.
        </p>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end p-4">
        <MessageThread
          messages={messages}
          currentUserIdOrClientId={currentUserId}
          isLoading={isLoading}
          isPortal={false}
        />
      </div>

      {/* Composer Input Area */}
      <div className="p-4 border-t border-white/[0.06]">
        <MessageComposer
          onSend={handleSend}
          onUpload={handleUpload}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default MatterMessagesPage;
