import { Signer } from "../types/signature.types";
import { formatDistanceToNow } from "date-fns";

interface SignerListProps {
  signers: Signer[];
  signingMode: "PARALLEL" | "SEQUENTIAL";
}

export default function SignerList({ signers, signingMode }: SignerListProps) {
  const getStatusBadge = (status: Signer["status"]) => {
    switch (status) {
      case "SIGNED":
        return "bg-success/10 text-success border-success/20";
      case "VIEWED":
        return "bg-brand-500/10 text-brand-400 border-brand-500/20";
      case "DECLINED":
        return "bg-danger/10 text-danger border-danger/20";
      case "PENDING":
      default:
        return "bg-surface-200/5 text-surface-200/50 border-white/[0.04]";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-white">Signers Progress</h3>
      <div className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-surface-950/20">
        {signers.map((signer) => (
          <div
            key={signer.id}
            className="flex items-center justify-between p-4 bg-surface-900/10 hover:bg-surface-900/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              {signingMode === "SEQUENTIAL" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-950 border border-white/[0.08] text-xs font-semibold text-surface-200/80">
                  {signer.signingOrder}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{signer.fullName}</p>
                <p className="text-xs text-surface-200/40">{signer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                {signer.signedAt && (
                  <p className="text-xs text-success font-medium">
                    Signed {formatDistanceToNow(new Date(signer.signedAt))} ago
                  </p>
                )}
                {!signer.signedAt && signer.viewedAt && (
                  <p className="text-xs text-brand-400 font-medium">
                    Viewed {formatDistanceToNow(new Date(signer.viewedAt))} ago
                  </p>
                )}
                {!signer.signedAt && !signer.viewedAt && (
                  <p className="text-xs text-surface-200/30">Not viewed yet</p>
                )}
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusBadge(
                  signer.status
                )}`}
              >
                {signer.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
