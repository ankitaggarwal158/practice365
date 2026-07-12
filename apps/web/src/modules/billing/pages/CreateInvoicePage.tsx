import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Calendar, FileText, Clock, Clipboard } from "lucide-react";
import { clientApi } from "../../clients/api/client.api";
import { matterApi } from "../../matters/api/matter.api";
import { Client } from "../../clients/types/client.types";
import { Matter } from "../../matters/types/matter.types";
import { useTimeEntries } from "../../time-tracking/hooks/useTimeEntries";
import { useCreateInvoice } from "../hooks/useInvoices";
import { formatCurrency } from "../../../modules/time-tracking/utils/format.utils";
import { toast } from "sonner";

interface ManualLineItem {
  description: string;
  quantity: number;
  rate: number;
}

export const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateInvoice();

  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMatterId, setSelectedMatterId] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days due
    return date.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");

  // Time entries list selection
  const [selectedTimeEntryIds, setSelectedTimeEntryIds] = useState<string[]>([]);
  // Manual line items
  const [manualItems, setManualItems] = useState<ManualLineItem[]>([]);

  // Fetch clients and matters
  useEffect(() => {
    clientApi.listClients({ limit: 100 }).then((res) => setClients(res.data)).catch(console.error);
    matterApi.listMatters({ limit: 100 }).then((res) => setMatters(res.data)).catch(console.error);
  }, []);

  // Fetch unbilled time entries when client/matter changes
  // Using string "false" for isBilled query filter
  const { data: entriesData, isLoading: isLoadingEntries } = useTimeEntries({
    clientId: selectedClientId || undefined,
    matterId: selectedMatterId || undefined,
    billingType: "BILLABLE",
    isBilled: "false" as any,
    limit: 100,
  });

  const availableEntries = entriesData?.data || [];

  // Reset selected time entries and matters when client changes
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedMatterId("");
    setSelectedTimeEntryIds([]);
  };

  const handleSelectEntry = (id: string) => {
    setSelectedTimeEntryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllEntries = () => {
    if (selectedTimeEntryIds.length === availableEntries.length) {
      setSelectedTimeEntryIds([]);
    } else {
      setSelectedTimeEntryIds(availableEntries.map((e) => e._id));
    }
  };

  const handleAddManualItem = () => {
    setManualItems((prev) => [...prev, { description: "", quantity: 1, rate: 0 }]);
  };

  const handleRemoveManualItem = (index: number) => {
    setManualItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleManualItemChange = (index: number, field: keyof ManualLineItem, value: any) => {
    setManualItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Live subtotals calculation
  const selectedEntriesAmount = availableEntries
    .filter((e) => selectedTimeEntryIds.includes(e._id))
    .reduce((sum, e) => sum + (e.billableAmount || 0), 0);

  const manualItemsAmount = manualItems.reduce((sum, item) => sum + (item.quantity * item.rate || 0), 0);

  const totalCalculated = selectedEntriesAmount + manualItemsAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      return toast.error("Client is required.");
    }
    if (selectedTimeEntryIds.length === 0 && manualItems.length === 0) {
      return toast.error("Please add at least one manual item or select one time entry to invoice.");
    }

    // Validate manual items
    for (const item of manualItems) {
      if (!item.description.trim()) {
        return toast.error("Description is required for all manual items.");
      }
      if (item.quantity <= 0) {
        return toast.error("Quantity must be greater than 0 for all manual items.");
      }
      if (item.rate < 0) {
        return toast.error("Rate cannot be negative for manual items.");
      }
    }

    createMutation.mutate(
      {
        clientId: selectedClientId,
        matterId: selectedMatterId || undefined,
        timeEntryIds: selectedTimeEntryIds,
        manualItems,
        dueDate,
        notes,
      },
      {
        onSuccess: () => navigate("/billing"),
      }
    );
  };

  const filteredMatters = selectedClientId
    ? matters.filter((m) => m.clientId === selectedClientId)
    : matters;

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/billing"
          className="p-2 border border-white/[0.08] hover:bg-surface-900 rounded-xl text-surface-400 hover:text-white transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">New Invoice</h1>
          <p className="text-sm text-surface-400 mt-1">Generate a draft invoice for billable hours or custom charges.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Configurations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client / Matter Settings */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-brand-400" /> Invoice Recipient
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="block w-full bg-surface-950 border border-white/[0.08] text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => {
                    const clientName = c.clientType === "INDIVIDUAL" 
                      ? `${c.firstName || ""} ${c.lastName || ""}`.trim() 
                      : c.companyName || "Unnamed Company";
                    return (
                      <option key={c.id} value={c.id}>
                        {clientName} ({c.clientNumber})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                  Matter (Optional)
                </label>
                <select
                  disabled={!selectedClientId}
                  value={selectedMatterId}
                  onChange={(e) => setSelectedMatterId(e.target.value)}
                  className="block w-full bg-surface-950 border border-white/[0.08] text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Select Matter</option>
                  {filteredMatters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.matterNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Time entries list */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-400" /> Billable Time Entries
            </h2>
            <p className="text-xs text-surface-400 mb-4">
              Select the time entries to lock and include as line items on this invoice.
            </p>

            {!selectedClientId ? (
              <div className="p-8 text-center text-sm text-surface-500 bg-surface-950/50 rounded-xl border border-dashed border-white/[0.06]">
                Select a client first to load unbilled time entries.
              </div>
            ) : isLoadingEntries ? (
              <div className="p-8 text-center text-sm text-surface-400">Loading entries...</div>
            ) : availableEntries.length === 0 ? (
              <div className="p-8 text-center text-sm text-surface-500 bg-surface-950/50 rounded-xl border border-dashed border-white/[0.06]">
                No unbilled time entries found for this client.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-surface-950/40 rounded-xl border border-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={selectedTimeEntryIds.length === availableEntries.length}
                    onChange={handleSelectAllEntries}
                    className="h-4 w-4 rounded border-white/[0.15] text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white">Select All ({availableEntries.length})</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {availableEntries.map((e) => (
                    <div
                      key={e._id}
                      onClick={() => handleSelectEntry(e._id)}
                      className={`flex items-center justify-between p-3.5 bg-surface-950 border rounded-xl cursor-pointer transition-all hover:border-brand-500/50 ${
                        selectedTimeEntryIds.includes(e._id) ? "border-brand-500 bg-brand-500/[0.02]" : "border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTimeEntryIds.includes(e._id)}
                          onChange={() => {}} // click handled by parent div
                          className="h-4 w-4 mt-0.5 rounded border-white/[0.15] text-brand-500 focus:ring-brand-500 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {e.description || "Billable Time Record"}
                          </div>
                          <div className="text-xs text-surface-400 mt-0.5 flex gap-3">
                            <span>Date: {new Date(e.date).toLocaleDateString()}</span>
                            {e.matterId && <span>Matter: {e.matterId.title}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right pl-4">
                        <div className="text-sm font-bold text-white">{formatCurrency(e.billableAmount || 0)}</div>
                        <div className="text-xs text-surface-400 mt-0.5">
                          {Math.round((e.durationMinutes / 60) * 100) / 100}h @ {formatCurrency(e.hourlyRate)}/h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Manual Charges */}
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-400" /> Manual Adjustments
              </h2>
              <button
                type="button"
                onClick={handleAddManualItem}
                className="inline-flex items-center gap-1 bg-surface-950 hover:bg-surface-800 border border-white/[0.08] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Charge
              </button>
            </div>

            {manualItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-surface-500 bg-surface-950/50 rounded-xl border border-dashed border-white/[0.06]">
                No manual adjustments added.
              </div>
            ) : (
              <div className="space-y-3">
                {manualItems.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-surface-950 border border-white/[0.06] p-4 rounded-xl relative group">
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Description</label>
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleManualItemChange(index, "description", e.target.value)}
                        placeholder="e.g. Filing fee, postage, admin support..."
                        className="w-full bg-surface-900 border border-white/[0.08] focus:border-brand-500 rounded-xl px-3 py-1.5 text-sm text-white placeholder-surface-600 outline-none transition-all"
                      />
                    </div>
                    <div className="w-24 w-full md:w-24">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) => handleManualItemChange(index, "quantity", Number(e.target.value))}
                        className="w-full bg-surface-900 border border-white/[0.08] focus:border-brand-500 rounded-xl px-3 py-1.5 text-sm text-white outline-none transition-all"
                      />
                    </div>
                    <div className="w-28 w-full md:w-28">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Rate ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={item.rate}
                        onChange={(e) => handleManualItemChange(index, "rate", Number(e.target.value))}
                        className="w-full bg-surface-900 border border-white/[0.08] focus:border-brand-500 rounded-xl px-3 py-1.5 text-sm text-white outline-none transition-all"
                      />
                    </div>
                    <div className="w-24 text-right pr-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5">Amount</div>
                      <div className="text-sm font-bold text-white py-1">
                        {formatCurrency(item.quantity * item.rate || 0)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveManualItem(index)}
                      className="p-2 border border-white/[0.08] hover:bg-red-500/10 hover:border-red-500/30 rounded-xl text-red-500 transition-all cursor-pointer mb-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Invoice terms & Actions */}
        <div className="space-y-6">
          <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-400" /> Invoice Summary
            </h2>

            {/* Total breakdown */}
            <div className="space-y-3 bg-surface-950 p-4 rounded-xl border border-white/[0.04]">
              <div className="flex justify-between text-sm text-surface-300">
                <span>Time Entries:</span>
                <span className="font-semibold text-white">{formatCurrency(selectedEntriesAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-surface-300">
                <span>Manual Adjustments:</span>
                <span className="font-semibold text-white">{formatCurrency(manualItemsAmount)}</span>
              </div>
              <div className="border-t border-white/[0.08] pt-3 flex justify-between text-base font-bold text-white">
                <span>Total Draft Amount:</span>
                <span className="text-brand-400 text-lg">{formatCurrency(totalCalculated)}</span>
              </div>
            </div>

            {/* Invoicing terms */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                  Invoice Terms/Notes
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Thank you for your business! Please make payments to account XXXXXX..."
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-600 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/10 transition-all cursor-pointer flex justify-center items-center disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating Draft..." : "Save Invoice Draft"}
              </button>
              <Link
                to="/billing"
                className="block w-full text-center border border-white/[0.08] hover:bg-surface-950/40 text-surface-300 py-3 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
