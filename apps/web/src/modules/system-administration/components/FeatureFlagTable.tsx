
import { FeatureFlag } from "../types";
import { toast } from "sonner";

interface FeatureFlagTableProps {
  flags: FeatureFlag[];
  onToggle: (id: string, enabled: boolean) => Promise<any>;
  isToggling: boolean;
}

export function FeatureFlagTable({ flags, onToggle, isToggling }: FeatureFlagTableProps) {
  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      await onToggle(id, !currentEnabled);
      toast.success("Feature flag toggle recorded.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to toggle feature flag.");
    }
  };

  if (!flags || flags.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md p-8 text-center text-surface-200/50">
        No feature flags seeded in the system.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-900/40 backdrop-blur-md overflow-hidden shadow-lg flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-200/60">
                Feature Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-200/60">
                Key Identifier
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-200/60">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-200/60">
                Last Updated
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-surface-200/60">
                Enabled
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {flags.map((flag, idx) => {
              const rowClass = idx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent";
              const borderClass = "border-b border-white/[0.04] text-sm text-surface-200/80";

              return (
                <tr key={flag._id} className={`${rowClass} hover:bg-white/[0.03] transition-colors`}>
                  <td className={`px-6 py-4 font-semibold text-white ${borderClass}`}>
                    {flag.displayName}
                  </td>
                  <td className={`px-6 py-4 font-mono text-xs text-brand-300 ${borderClass}`}>
                    {flag.featureKey}
                  </td>
                  <td className={`px-6 py-4 ${borderClass}`}>
                    {flag.description || "No description provided."}
                  </td>
                  <td className={`px-6 py-4 text-xs ${borderClass}`}>
                    {new Date(flag.updatedAt).toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 text-right ${borderClass}`}>
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggle(flag._id, flag.enabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        flag.enabled ? "bg-success" : "bg-white/[0.08]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          flag.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default FeatureFlagTable;
