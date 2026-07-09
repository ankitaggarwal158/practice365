import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { MatterMessage } from "../types";

interface MessageThreadProps {
  messages: MatterMessage[];
  currentUserIdOrClientId: string;
  isLoading?: boolean;
  isPortal?: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserIdOrClientId,
  isLoading = false,
  isPortal = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on mount or when messages length updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px]">
        {/* Shimmer loading list */}
        {[1, 2, 3].map((n) => (
          <div key={n} className={`flex w-full ${n % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}>
            <div className="flex gap-2 max-w-[60%]">
              <div className="h-7 w-7 rounded bg-white/[0.04] shrink-0" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/[0.04] rounded" />
                <div className="h-10 w-48 bg-white/[0.03] border border-white/[0.04] rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-surface-950/20 rounded-2xl border border-white/[0.04] min-h-[300px]">
        <div className="p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20 text-brand-400 mb-4 animate-bounce">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No Messages Yet</h4>
        <p className="text-xs text-surface-200/40 max-w-xs leading-relaxed">
          Case communications are secure, permanent, and matter-specific. Type a message below to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[480px] min-h-[300px] custom-scrollbar rounded-2xl bg-surface-950/10 border border-white/[0.04] shadow-inner">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          currentUserIdOrClientId={currentUserIdOrClientId}
          isPortal={isPortal}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageThread;
