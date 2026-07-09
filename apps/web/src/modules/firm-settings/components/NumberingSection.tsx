import React, { useState, useEffect } from "react";
import { useFirmSettings, useUpdateFirmSettings } from "../hooks/useFirmSettings";

interface NumberingSectionProps {
  disabled?: boolean;
}

export function NumberingSection({ disabled }: NumberingSectionProps) {
  const { data: settings } = useFirmSettings();
  const updateSettingsMutation = useUpdateFirmSettings();

  const [matterNumberPrefix, setMatterNumberPrefix] = useState("MAT-");
  const [matterNextNumber, setMatterNextNumber] = useState(1001);
  const [clientNumberPrefix, setClientNumberPrefix] = useState("CLI-");
  const [clientNextNumber, setClientNextNumber] = useState(1);
  const [invoiceNumberPrefix, setInvoiceNumberPrefix] = useState("INV-");
  const [invoiceNextNumber, setInvoiceNextNumber] = useState(1);

  useEffect(() => {
    if (settings) {
      setMatterNumberPrefix(settings.matterNumberPrefix || "MAT-");
      setMatterNextNumber(settings.matterNextNumber || 1001);
      setClientNumberPrefix(settings.clientNumberPrefix || "CLI-");
      setClientNextNumber(settings.clientNextNumber || 1);
      setInvoiceNumberPrefix(settings.invoiceNumberPrefix || "INV-");
      setInvoiceNextNumber(settings.invoiceNextNumber || 1);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matterNextNumber < 1 || clientNextNumber < 1 || invoiceNextNumber < 1) {
      alert("Next Sequence Numbers must be positive integers starting from 1.");
      return;
    }
    updateSettingsMutation.mutate({
      matterNumberPrefix,
      matterNextNumber,
      clientNumberPrefix,
      clientNextNumber,
      invoiceNumberPrefix,
      invoiceNextNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Matter Numbering */}
        <div className="space-y-4 bg-surface-950 border border-white/[0.04] p-5 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">Matter Reference Numbering</h3>
          <div className="space-y-2">
            <label htmlFor="matterPrefix" className="block text-sm font-semibold text-white">Prefix Identifier</label>
            <input
              type="text"
              id="matterPrefix"
              value={matterNumberPrefix}
              onChange={(e) => setMatterNumberPrefix(e.target.value)}
              disabled={disabled}
              placeholder="e.g. MAT-"
              className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="matterNext" className="block text-sm font-semibold text-white">Next Sequence Number</label>
            <input
              type="number"
              id="matterNext"
              value={matterNextNumber}
              onChange={(e) => setMatterNextNumber(parseInt(e.target.value) || 1)}
              disabled={disabled}
              min="1"
              className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Client Numbering */}
        <div className="space-y-4 bg-surface-950 border border-white/[0.04] p-5 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">Client Reference Numbering</h3>
          <div className="space-y-2">
            <label htmlFor="clientPrefix" className="block text-sm font-semibold text-white">Prefix Identifier</label>
            <input
              type="text"
              id="clientPrefix"
              value={clientNumberPrefix}
              onChange={(e) => setClientNumberPrefix(e.target.value)}
              disabled={disabled}
              placeholder="e.g. CLI-"
              className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="clientNext" className="block text-sm font-semibold text-white">Next Sequence Number</label>
            <input
              type="number"
              id="clientNext"
              value={clientNextNumber}
              onChange={(e) => setClientNextNumber(parseInt(e.target.value) || 1)}
              disabled={disabled}
              min="1"
              className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Invoice Numbering */}
        <div className="space-y-4 bg-surface-950 border border-white/[0.04] p-5 rounded-2xl md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">Invoice Reference Numbering</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="invoicePrefix" className="block text-sm font-semibold text-white">Prefix Identifier</label>
              <input
                type="text"
                id="invoicePrefix"
                value={invoiceNumberPrefix}
                onChange={(e) => setInvoiceNumberPrefix(e.target.value)}
                disabled={disabled}
                placeholder="e.g. INV-"
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="invoiceNext" className="block text-sm font-semibold text-white">Next Sequence Number</label>
              <input
                type="number"
                id="invoiceNext"
                value={invoiceNextNumber}
                onChange={(e) => setInvoiceNextNumber(parseInt(e.target.value) || 1)}
                disabled={disabled}
                min="1"
                className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
              />
            </div>
          </div>
        </div>

      </div>

      {!disabled && (
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20 min-w-[120px] flex items-center justify-center"
          >
            {updateSettingsMutation.isPending ? (
              <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Save Numbering Configuration"
            )}
          </button>
        </div>
      )}
    </form>
  );
}
export default NumberingSection;
