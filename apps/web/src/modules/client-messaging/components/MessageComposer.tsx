import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import AttachmentUploader from "./AttachmentUploader";

interface MessageComposerProps {
  onSend: (message: string) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onUpload,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      await onSend(text.trim());
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-4 rounded-2xl shadow-xl shadow-black/10"
    >
      <AttachmentUploader onUpload={onUpload} disabled={disabled || sending} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Shift + Enter for new line)"
        disabled={disabled || sending}
        rows={1}
        className="flex-1 max-h-36 min-h-[38px] bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/50 focus:bg-white/[0.04] text-white text-sm rounded-xl py-2 px-3 focus:outline-none transition-all placeholder-surface-200/30 resize-none font-sans"
      />

      <button
        type="submit"
        disabled={disabled || sending || !text.trim()}
        className="p-2.5 bg-brand-500 hover:bg-brand-400 disabled:bg-white/[0.02] text-white disabled:text-surface-200/20 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0"
      >
        {sending ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        ) : (
          <Send className="h-4.5 w-4.5" />
        )}
      </button>
    </form>
  );
};

export default MessageComposer;
