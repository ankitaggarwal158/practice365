import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Matter } from "../types/matter.types";
import { useUpdateMatter } from "../hooks/useUpdateMatter";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";
import { useUsers } from "@/modules/users/hooks/useUsers";

interface MatterDashboardPageProps {
  matter: Matter;
  refetch: () => void;
}

export default function MatterDashboardPage({ matter, refetch }: MatterDashboardPageProps) {
  const navigate = useNavigate();
  const { permissions } = useCurrentUserPermissions();
  const { users } = useUsers({ limit: 100 });
  const { updateStatus, changeResponsibleAttorney, isLoading, error } = useUpdateMatter();

  const [isEditingAttorney, setIsEditingAttorney] = useState(false);
  const [selectedAttorneyId, setSelectedAttorneyId] = useState(matter.responsibleAttorneyId);

  const canUpdate = permissions.includes("MATTERS_UPDATE");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-success/10 text-success border border-success/20";
      case "ON_HOLD":
        return "bg-warning/10 text-warning border border-warning/20";
      case "CLOSED":
        return "bg-danger/10 text-danger border border-danger/20";
      case "ARCHIVED":
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
      default:
        return "bg-white/[0.02] text-surface-200/40 border border-white/[0.04]";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-danger/20 text-danger border border-danger/30 font-bold animate-pulse-subtle";
      case "HIGH":
        return "bg-danger/10 text-danger/90 border border-danger/20";
      case "NORMAL":
        return "bg-brand-500/10 text-brand-300 border border-brand-500/20";
      case "LOW":
        return "bg-white/[0.04] text-surface-200/50 border border-white/[0.08]";
      default:
        return "bg-white/[0.02] text-surface-200/40 border border-white/[0.04]";
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!newStatus) return;
    try {
      await updateStatus(matter.id, newStatus);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttorneySave = async () => {
    try {
      await changeResponsibleAttorney(matter.id, selectedAttorneyId);
      setIsEditingAttorney(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  // Build list of valid transitions based on status validation service
  const getAllowedStatuses = (status: string) => {
    switch (status) {
      case "OPEN":
        return ["OPEN", "ON_HOLD", "CLOSED"];
      case "ON_HOLD":
        return ["ON_HOLD", "OPEN"];
      case "CLOSED":
        return ["CLOSED", "OPEN", "ARCHIVED"];
      case "ARCHIVED":
        return ["ARCHIVED", "OPEN"]; // Reopen/restore
      default:
        return [status];
    }
  };

  const allowedStatuses = getAllowedStatuses(matter.status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Primary Details Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">Matter Metadata</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Client
              </span>
              <button
                onClick={() => navigate(`/clients/${matter.clientId}`)}
                className="text-sm font-semibold text-brand-400 hover:text-brand-300 text-left transition-colors"
              >
                {matter.clientName}
              </button>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Matter ID / Number
              </span>
              <span className="text-sm font-semibold text-white">{matter.matterNumber}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Practice Area
              </span>
              <span className="text-sm font-semibold text-white">{matter.practiceAreaName || "-"}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Matter Type
              </span>
              <span className="text-sm font-semibold text-white">{matter.matterType}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Priority
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityBadgeClass(matter.priority)}`}>
                {matter.priority}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Date Opened
              </span>
              <span className="text-sm text-surface-200/80">
                {new Date(matter.openedDate).toLocaleDateString()}
              </span>
            </div>

            {matter.closedDate && (
              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Date Closed
                </span>
                <span className="text-sm text-surface-200/80">
                  {new Date(matter.closedDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {matter.archivedAt && (
              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Date Archived
                </span>
                <span className="text-sm text-surface-200/80">
                  {new Date(matter.archivedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">References</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Court File Number
              </span>
              <span className="text-sm font-semibold text-white">{matter.courtFileNumber || "N/A"}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Client Account Reference
              </span>
              <span className="text-sm font-semibold text-white">{matter.clientReference || "N/A"}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Statute of Limitations
              </span>
              <span className="text-sm font-semibold text-white">
                {matter.statuteOfLimitations
                  ? new Date(matter.statuteOfLimitations).toLocaleDateString()
                  : "None Specified"}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                Estimated Matter Value
              </span>
              <span className="text-sm font-semibold text-white">
                {matter.estimatedValue !== undefined
                  ? `$${matter.estimatedValue.toLocaleString()}`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control panel & Responsible Attorney Card */}
      <div className="space-y-6">
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">Lifecycle Control</h3>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                Current Status
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(matter.status)}`}>
                {matter.status}
              </span>
            </div>

            {canUpdate && (
              <div>
                <label htmlFor="status-select" className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-2">
                  Transition Status
                </label>
                <select
                  id="status-select"
                  value={matter.status}
                  onChange={handleStatusChange}
                  disabled={isLoading}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 disabled:opacity-50"
                >
                  {allowedStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st.replace("_", " ")}
                    </option>
                  ))}
                  {/* If closed, show Archive option */}
                  {matter.status === "CLOSED" && !allowedStatuses.includes("ARCHIVED") && (
                    <option value="ARCHIVED">ARCHIVED</option>
                  )}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-danger/10 border border-danger/20 p-3 rounded-lg">
                <p className="text-xs text-danger">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Responsible Attorney Management */}
        <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/[0.04] pb-3">Responsible Attorney</h3>

          <div className="space-y-4">
            {!isEditingAttorney ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{matter.responsibleAttorneyName}</span>
                  {canUpdate && matter.status !== "ARCHIVED" && (
                    <button
                      onClick={() => setIsEditingAttorney(true)}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedAttorneyId}
                  onChange={(e) => setSelectedAttorneyId(e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-3 py-2 text-sm text-white transition-all duration-200"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setSelectedAttorneyId(matter.responsibleAttorneyId);
                      setIsEditingAttorney(false);
                    }}
                    className="px-3 py-1.5 bg-surface-950 border border-white/[0.08] rounded-lg text-xs font-medium text-white hover:bg-white/[0.02]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAttorneySave}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-semibold hover:bg-brand-600 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
