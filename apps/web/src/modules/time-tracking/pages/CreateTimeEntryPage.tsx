import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreateTimeEntry } from "../hooks/useTimeEntries.js";
import { clientApi } from "../../clients/api/client.api.js";
import { matterApi } from "../../matters/api/matter.api.js";
import { Client } from "../../clients/types/client.types.js";
import { Matter } from "../../matters/types/matter.types.js";
import { BillingType } from "../types/time-entry.types.js";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const CreateTimeEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateTimeEntry();

  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0] || "");
  const [clientId, setClientId] = useState("");
  const [matterId, setMatterId] = useState("");
  const [billingType, setBillingType] = useState<BillingType>(BillingType.BILLABLE);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [description, setDescription] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);

  useEffect(() => {
    clientApi.listClients({ limit: 100 }).then((res) => setClients(res.data)).catch(console.error);
    matterApi.listMatters({ limit: 100 }).then((res) => setMatters(res.data)).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matterId && !clientId) {
      return toast.error("Please associate this entry with either a Client or a Matter");
    }

    const durationMinutes = hours * 60 + minutes;
    if (durationMinutes <= 0) {
      return toast.error("Duration must be greater than 0 minutes");
    }

    createMutation.mutate(
      {
        date: new Date(date).toISOString(),
        clientId: clientId || undefined,
        matterId: matterId || undefined,
        billingType,
        durationMinutes,
        description,
      },
      {
        onSuccess: () => {
          navigate("/time-tracking");
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link to="/time-tracking" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Time Entries
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md p-8">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-2xl font-black text-gray-900">Add Manual Time Entry</h1>
          <p className="text-sm text-gray-500 mt-1">Manually log billable or non-billable time keepers spent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Work Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Billing Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Billing Method</label>
              <select
                value={billingType}
                onChange={(e) => setBillingType(e.target.value as BillingType)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value={BillingType.BILLABLE}>Billable</option>
                <option value={BillingType.NON_BILLABLE}>Non-Billable</option>
              </select>
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Client (Optional)</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clientType === "INDIVIDUAL" ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : c.companyName || "Unnamed Company"} ({c.clientNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Matter Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Matter (Optional)</label>
              <select
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
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

            {/* Duration */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Time Spent (Hours & Minutes)</label>
              <div className="flex gap-4 items-center">
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={hours || ""}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-sm text-gray-800 focus:outline-none bg-transparent"
                  />
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider ml-2">Hours</span>
                </div>
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={minutes || ""}
                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full text-sm text-gray-800 focus:outline-none bg-transparent"
                  />
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider ml-2">Minutes</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Description / Notes of Work</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter details of work performed..."
                className="block w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-6">
            <Link
              to="/time-tracking"
              className="inline-flex justify-center items-center px-6 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex justify-center items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save Time Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateTimeEntryPage;
