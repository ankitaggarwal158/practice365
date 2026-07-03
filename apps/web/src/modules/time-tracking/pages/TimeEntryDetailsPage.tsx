import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTimeEntry, useDeleteTimeEntry } from "../hooks/useTimeEntries.js";
import { formatDuration, formatCurrency } from "../utils/format.utils.js";
import { toast } from "sonner";
import { ArrowLeft, Clock, DollarSign, Briefcase, User, Calendar, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

export const TimeEntryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: entry, isLoading } = useTimeEntry(id!);
  const deleteMutation = useDeleteTimeEntry();

  const handleDelete = () => {
    if (entry?.isBilled) {
      return toast.error("Cannot delete a billed time entry.");
    }
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      deleteMutation.mutate(id!, {
        onSuccess: () => {
          navigate("/time-tracking");
        },
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!entry) return <div className="p-8 text-center text-red-500">Time entry not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/time-tracking" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Time Entries
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={`/time-tracking/${entry._id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm gap-1.5"
          >
            <Edit className="h-4 w-4 text-gray-500" /> Edit Entry
          </Link>
          {!entry.isBilled && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-semibold rounded-xl text-red-600 bg-white hover:bg-red-50 transition-all shadow-sm gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md p-8 space-y-8">
        <div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            entry.isBilled ? "bg-green-50 text-green-700 border border-green-100" : "bg-blue-50 text-blue-700 border border-blue-100"
          }`}>
            {entry.isBilled ? "Billed" : "Unbilled"}
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-3 break-words">
            {entry.description || "Time Entry Details"}
          </h1>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</dt>
              <dd className="text-base font-black text-gray-900">{formatDuration(entry.durationMinutes)}</dd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Value</dt>
              <dd className="text-base font-black text-gray-900">
                {entry.billingType === "BILLABLE" ? formatCurrency(entry.billableAmount) : "NON-BILLABLE"}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Work Date</dt>
              <dd className="text-base font-black text-gray-900">
                {format(new Date(entry.date), "MMM d, yyyy")}
              </dd>
            </div>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">
              Timekeeper & Associations
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recorded By</h5>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.userId?.firstName} {entry.userId?.lastName} ({entry.userId?.email})
                  </p>
                </div>
              </div>

              {entry.matterId && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Matter Target</h5>
                    <p className="text-sm font-semibold text-gray-800">
                      {entry.matterId.title}
                    </p>
                  </div>
                </div>
              )}

              {entry.clientId && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client Target</h5>
                    <p className="text-sm font-semibold text-gray-800">
                      {entry.clientId.firstName || entry.clientId.name} {entry.clientId.lastName || ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">
              Billing Ledger Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing Status</h5>
                <p className="text-sm font-semibold text-gray-800 capitalize mt-0.5">
                  {entry.billingType.replace("_", " ").toLowerCase()}
                </p>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing Hourly Rate</h5>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {formatCurrency(entry.hourlyRate)} / hr
                </p>
              </div>

              {entry.timerStatus && (
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tracking Entry Source</h5>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize mt-1">
                    {entry.timerStatus.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TimeEntryDetailsPage;
