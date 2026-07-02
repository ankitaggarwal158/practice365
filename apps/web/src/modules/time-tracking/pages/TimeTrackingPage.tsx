import React, { useState } from "react";
import { Plus, Search, Play, Filter } from "lucide-react";
import { useTimeEntries, useTimerActions } from "../hooks/useTimeEntries";
import { TimerStatus, BillingType, TimeEntry } from "../types/time-entry.types";
import { formatDuration, formatCurrency } from "../utils/format.utils";
import { format } from "date-fns";

export const TimeTrackingPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: entriesData, isLoading } = useTimeEntries({
    page,
    limit: 50,
    status: statusFilter || undefined,
  });

  const { startTimer } = useTimerActions();

  const handleStartTimer = () => {
    startTimer.mutate({
      description: "New timer",
      billingType: BillingType.BILLABLE,
    });
  };

  const getStatusBadge = (status: TimerStatus) => {
    switch (status) {
      case TimerStatus.RUNNING:
        return <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full flex items-center"><Play className="w-3 h-3 mr-1" /> Running</span>;
      case TimerStatus.PAUSED:
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Paused</span>;
      case TimerStatus.STOPPED:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Stopped</span>;
      case TimerStatus.MANUAL:
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Manual</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your billable hours and active timers.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartTimer}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <Play className="w-4 h-4 mr-2 text-indigo-600" />
            Start Timer
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search descriptions, matters, or clients..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border-none focus:ring-0 bg-transparent py-0 pl-1 pr-6 text-gray-700 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active (Running/Paused)</option>
                <option value="STOPPED">Stopped</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Description / Matter</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Duration</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading time entries...</span>
                    </div>
                  </td>
                </tr>
              ) : entriesData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Play className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-gray-900">No time entries found</p>
                      <p className="text-sm mt-1">Start a timer or add a manual entry to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                entriesData?.data.map((entry: TimeEntry) => (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mr-2">
                          {entry.userId?.firstName?.charAt(0)}{entry.userId?.lastName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{entry.userId?.firstName} {entry.userId?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium mb-0.5">{entry.description || "No description"}</div>
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        {entry.matterId && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            Matter: {entry.matterId.title}
                          </span>
                        )}
                        {entry.clientId && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            Client: {entry.clientId.firstName || entry.clientId.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry.timerStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-900">
                      {formatDuration(entry.durationMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                      {entry.billingType === BillingType.BILLABLE ? (
                        formatCurrency(entry.billableAmount)
                      ) : (
                        <span className="text-gray-400 text-xs uppercase tracking-wider">{entry.billingType.replace("_", " ")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        {entriesData?.pagination && entriesData.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page {entriesData.pagination.page} of {entriesData.pagination.pages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === entriesData.pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
