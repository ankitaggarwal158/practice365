import React from "react";
import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptProps {
  status: "DELIVERED" | "READ";
  time?: string;
}

export const ReadReceipt: React.FC<ReadReceiptProps> = ({ status, time }) => {
  return (
    <div className="flex items-center gap-1.5 justify-end text-[10px] text-surface-200/40 select-none">
      {time && <span>{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
      {status === "READ" ? (
        <CheckCheck className="h-3.5 w-3.5 text-brand-400 shrink-0" />
      ) : (
        <Check className="h-3.5 w-3.5 text-surface-200/40 shrink-0" />
      )}
    </div>
  );
};

export default ReadReceipt;
