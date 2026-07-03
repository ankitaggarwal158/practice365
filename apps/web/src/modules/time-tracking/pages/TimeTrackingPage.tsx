import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Play, Filter, Trash2, Edit, CheckCircle } from "lucide-react";
import { useTimeEntries, useTimerActions, useDeleteTimeEntry } from "../hooks/useTimeEntries.js";
import { TimerStatus, BillingType, TimeEntry } from "../types/time-entry.types.js";
import { formatDuration, formatCurrency } from "../utils/format.utils.js";
import { format } from "date-fns";
import { matterApi } from "../../matters/api/matter.api.js";
import { Matter } from "../../matters/types/matter.types.js";
import { toast } from "sonner";

export const TimeTrackingPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");

  const { data: entriesData, isLoading } = useTimeEntries({
    page,
    limit: 50,
    status: statusFilter || undefined,
  });

  const { startTimer } = useTimerActions();
  const deleteMutation = useDeleteTimeEntry();

  // Start timer modal configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedMatterId, setSelectedMatterId] = useState("");
  const [timerBillingType, setTimerBillingType] = useState<BillingType>(BillingType.BILLABLE);
  const [timerDescription, setTimerDescription] = useState("");

  useEffect(() => {
    matterApi.listMatters({ limit: 100 }).then((res) => setMatters(res.data)).catch(console.error);
  }, []);

  const handleStartTimerClick = () => {
    setIsModalOpen(true);
  };

  const handleStartTimerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatterId) return toast.error("Matter is required to start a timer");

    startTimer.mutate(
      {
        matterId: selectedMatterId,
        billingType: timerBillingType,
        description: timerDescription || undefined,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedMatterId("");
          setTimerDescription("");
          toast.success("Timer started successfully");
        },
      }
    );
  };

  const handleDelete = (id: string, isBilled: boolean) => {
    if (isBilled) {
      return toast.error("Cannot delete a billed time entry.");
    }
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Time entry deleted"),
        onError: () => toast.error("Failed to delete time entry"),
      });
    }
  };

  const getStatusBadge = (status: TimerStatus) => {
    switch (status) {
      case TimerStatus.RUNNING:
        return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full flex items-center gap-1 w-max"><Play className="w-3 h-3 fill-current" /> Running</span>;
      case TimerStatus.PAUSED:
        return <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full w-max flex">Paused</span>;
      case TimerStatus.STOPPED:
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full w-max flex">Stopped</span>;
      case TimerStatus.MANUAL:
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full w-max flex">Manual</span>;
      default:
        return null;
    }
  };

  // Perform basic client-side search query logic
  const getFilteredEntries = () => {
    if (!entriesData?.data) return [];
    if (!searchText) return entriesData.data;
    const q = searchText.toLowerCase();
    return entriesData.data.filter(
      (entry) =>
        entry.description?.toLowerCase().includes(q) ||
        entry.matterId?.title?.toLowerCase().includes(q) ||
        entry.clientId?.name?.toLowerCase().includes(q) ||
        entry.clientId?.firstName?.toLowerCase().includes(q) ||
        entry.clientId?.lastName?.toLowerCase().includes(q)
    );
  };

  const filteredEntries = getFilteredEntries();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your billable hours and active timers.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartTimerClick}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-semibold text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 mr-2 text-blue-600 fill-blue-600" />
            Start Timer
          </button>
          <Link
            to="/time-tracking/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-semibold text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Entry
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search descriptions, matters, or clients..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 text-gray-700"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border-none focus:ring-0 bg-transparent py-0 pl-1 pr-6 text-gray-700 font-semibold"
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
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Description / Matter</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Duration</th>
                <th className="px-6 py-4 font-bold text-right">Amount</th>
                <th className="px-6 py-4 font-bold text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading time entries...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Play className="w-6 h-6 text-gray-400 fill-gray-400" />
                      </div>
                      <p className="text-base font-bold text-gray-900">No time entries found</p>
                      <p className="text-sm mt-1">Start a timer or add a manual entry to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry: TimeEntry) => (
                  <tr key={entry._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-semibold">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold mr-2 border border-blue-100">
                          {entry.userId?.firstName?.charAt(0)}{entry.userId?.lastName?.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{entry.userId?.firstName} {entry.userId?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/time-tracking/${entry._id}`} className="text-gray-900 font-bold hover:underline break-words line-clamp-1">
                        {entry.description || "No description"}
                      </Link>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        {entry.matterId && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600 font-semibold">
                            Matter: {entry.matterId.title}
                          </span>
                        )}
                        {entry.clientId && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600 font-semibold">
                            Client: {entry.clientId.firstName || entry.clientId.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry.timerStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-900 font-bold">
                      {formatDuration(entry.durationMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                      {entry.billingType === BillingType.BILLABLE ? (
                        formatCurrency(entry.billableAmount)
                      ) : (
                        <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Non-Billable</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/time-tracking/${entry._id}/edit`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit Entry"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {!entry.isBilled && (
                        <button
                          onClick={() => handleDelete(entry._id, entry.isBilled)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {entriesData?.pagination && entriesData.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Showing page {entriesData.pagination.page} of {entriesData.pagination.pages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-1.5 border border-gray-200 bg-white rounded-xl text-sm disabled:opacity-50 font-semibold hover:bg-gray-50 transition-all text-gray-700"
              >
                Previous
              </button>
              <button
                disabled={page === entriesData.pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-1.5 border border-gray-200 bg-white rounded-xl text-sm disabled:opacity-50 font-semibold hover:bg-gray-50 transition-all text-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Start Timer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Configure Timer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleStartTimerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Matter</label>
                <select
                  required
                  value={selectedMatterId}
                  onChange={(e) => setSelectedMatterId(e.target.value)}
                  className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Matter</option>
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.matterNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Billing Method</label>
                <select
                  value={timerBillingType}
                  onChange={(e) => setTimerBillingType(e.target.value as BillingType)}
                  className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value={BillingType.BILLABLE}>Billable</option>
                  <option value={BillingType.NON_BILLABLE}>Non-Billable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Timer Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Phone call, drafting emails..."
                  value={timerDescription}
                  onChange={(e) => setTimerDescription(e.target.value)}
                  className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={startTimer.isPending}
                  className="px-4 py-2 border border-transparent shadow-sm text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {startTimer.isPending ? "Starting..." : "Start Timer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TimeTrackingPage;
