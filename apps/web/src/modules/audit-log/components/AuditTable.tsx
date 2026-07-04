import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuditLog } from "../types";

interface AuditTableProps {
  logs: AuditLog[];
}

export function AuditTable({ logs }: AuditTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const getEntityLink = (entityType: string, entityId: string): string | null => {
    const type = entityType.toUpperCase();
    switch (type) {
      case "MATTER":
        return `/matters/${entityId}`;
      case "CLIENT":
        return `/clients/${entityId}`;
      case "LEAD":
        return `/leads/${entityId}`;
      case "INTAKE":
        return `/intakes/${entityId}`;
      case "DOCUMENT":
        return `/documents/${entityId}`;
      case "TIME_ENTRY":
        return `/time-tracking/${entityId}`;
      case "INVOICE":
        return `/billing/${entityId}`;
      case "NOTE":
        return `/notes/${entityId}`;
      default:
        return null;
    }
  };

  const renderStateDiff = (prev: any, curr: any) => {
    if (!prev && !curr) return <span className="text-surface-200/40">No state recorded.</span>;

    const prevObj = typeof prev === "string" ? JSON.parse(prev) : prev || {};
    const currObj = typeof curr === "string" ? JSON.parse(curr) : curr || {};

    const allKeys = Array.from(new Set([...Object.keys(prevObj), ...Object.keys(currObj)]));

    const changes = allKeys.filter((key) => {
      const pVal = prevObj[key];
      const cVal = currObj[key];
      // Compare values
      return JSON.stringify(pVal) !== JSON.stringify(cVal);
    });

    if (changes.length === 0) {
      return <span className="text-surface-200/50">No properties changed.</span>;
    }

    return (
      <div className="space-y-1.5 text-xs">
        {changes.map((key) => {
          const pVal = prevObj[key];
          const cVal = currObj[key];

          return (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-white/[0.02]">
              <span className="font-semibold text-surface-200/60 truncate">{key}</span>
              <span className="text-danger-400 bg-danger/5 px-2 py-0.5 rounded border border-danger/10 truncate font-mono">
                {pVal === undefined || pVal === null ? (
                  <span className="italic">undefined</span>
                ) : typeof pVal === "object" ? (
                  JSON.stringify(pVal)
                ) : (
                  String(pVal)
                )}
              </span>
              <span className="text-brand-300 bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/10 truncate font-mono">
                {cVal === undefined || cVal === null ? (
                  <span className="italic">undefined</span>
                ) : typeof cVal === "object" ? (
                  JSON.stringify(cVal)
                ) : (
                  String(cVal)
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-surface-900/40 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01] text-xs font-semibold text-surface-200/40 uppercase tracking-wider">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Module</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02] text-sm text-surface-200/80">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-surface-200/50">
                  No audit logs found matching criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedRowId === log.id;
                const userDisplayName = log.userId?.displayName || "System";
                const userEmail = log.userId?.email || "";
                const entityLink = log.entityId && log.entityType ? getEntityLink(log.entityType, log.entityId) : null;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        isExpanded ? "bg-white/[0.01]" : ""
                      }`}
                      onClick={() => toggleRow(log.id)}
                    >
                      <td className="px-6 py-4 text-xs font-medium text-surface-200/60 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-white">{userDisplayName}</div>
                          {userEmail && <div className="text-xs text-surface-200/40">{userEmail}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-surface-950 border border-white/5 text-brand-300 uppercase tracking-wide">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.entityType && log.entityId ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-surface-200/50 font-mono">
                              {log.entityType}
                            </span>
                            {entityLink ? (
                              <Link
                                to={entityLink}
                                onClick={(e) => e.stopPropagation()}
                                className="text-brand-400 hover:text-brand-300 font-medium text-xs underline truncate max-w-[150px]"
                              >
                                {log.entityId}
                              </Link>
                            ) : (
                              <span className="text-surface-200/80 font-mono text-xs truncate max-w-[150px]">
                                {log.entityId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-surface-200/30">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-surface-200/60 whitespace-nowrap">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(log.id);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-surface-950 hover:bg-surface-900 text-xs font-semibold text-surface-200 hover:text-white transition-colors"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {isExpanded && (
                      <tr className="bg-surface-950/40">
                        <td colSpan={7} className="px-6 py-6 border-t border-white/[0.04]">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                            {/* State Changes */}
                            <div className="bg-surface-950 border border-white/[0.04] p-5 rounded-xl">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                                <span>Property State Changes</span>
                                <span className="text-[10px] text-surface-200/40 font-normal normal-case">
                                  Previous Value &rarr; New Value
                                </span>
                              </h4>
                              {renderStateDiff(log.previousState, log.currentState)}
                            </div>

                            {/* Metadata & Context */}
                            <div className="bg-surface-950 border border-white/[0.04] p-5 rounded-xl flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                  Request Context & Metadata
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between border-b border-white/[0.02] py-1">
                                    <span className="text-surface-200/40">Client Browser:</span>
                                    <span className="text-surface-200/80 text-right truncate max-w-[250px]" title={log.userAgent || ""}>
                                      {log.userAgent || "Unknown"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-white/[0.02] py-1">
                                    <span className="text-surface-200/40">Audit Record ID:</span>
                                    <span className="font-mono text-surface-200/60">{log.id}</span>
                                  </div>
                                  {log.metadata && (
                                    <div className="mt-3">
                                      <span className="text-surface-200/40 block mb-1">Additional Payload:</span>
                                      <pre className="bg-surface-900 border border-white/[0.04] p-3 rounded-lg text-[10px] font-mono overflow-auto max-h-32 text-brand-300">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AuditTable;
