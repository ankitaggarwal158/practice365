import React from "react";
import ReadReceipt from "./ReadReceipt";
import AttachmentList from "./AttachmentList";
import { MatterMessage } from "../types";

interface MessageBubbleProps {
  msg: MatterMessage;
  currentUserIdOrClientId: string;
  isPortal?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  currentUserIdOrClientId,
  isPortal = false,
}) => {
  // Determine if the message was sent by the currently logged-in context user
  const isMe = msg.senderId === currentUserIdOrClientId;



  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar for other user */}
        {!isMe && (
          <div className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-surface-200 uppercase select-none shrink-0 mb-1">
            {msg.senderType === "CLIENT" ? "C" : "A"}
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* Sender label for other user */}
          {!isMe && (
            <span className="text-[10px] text-surface-200/40 font-semibold uppercase tracking-wider ml-1 select-none">
              {msg.senderType === "CLIENT" ? "Client" : "Attorney / Staff"}
            </span>
          )}

          {/* Bubble wrapper */}
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-md border ${
              isMe
                ? "bg-brand-500/10 border-brand-500/25 text-white rounded-br-none"
                : "bg-surface-900/60 backdrop-blur-sm border-white/[0.06] text-surface-100 rounded-bl-none"
            }`}
          >
            {/* Text message */}
            <p className="text-sm font-sans whitespace-pre-wrap break-words leading-relaxed select-text">
              {msg.message}
            </p>

            {/* Render attachment if flagged */}
            {msg.hasAttachments && (
              <AttachmentList messageId={msg.id} isPortal={isPortal} />
            )}

            {/* Read / Delivery details */}
            <div className="mt-1">
              <ReadReceipt status={msg.deliveryStatus} time={msg.createdAt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
