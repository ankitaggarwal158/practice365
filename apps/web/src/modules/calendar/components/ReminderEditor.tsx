import { useState } from "react";

interface ReminderEditorProps {
  offsets: number[];
  onChange: (offsets: number[]) => void;
  disabled?: boolean;
}

const PRESETS = [
  { label: "15 minutes before", value: 15 },
  { label: "30 minutes before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "2 hours before", value: 120 },
  { label: "1 day before", value: 1440 },
  { label: "1 week before", value: 10080 },
];

export function ReminderEditor({ offsets, onChange, disabled = false }: ReminderEditorProps) {
  const [customVal, setCustomVal] = useState<string>("");

  const handleAddOffset = (offset: number) => {
    if (disabled) return;
    if (offsets.includes(offset)) return;
    onChange([...offsets, offset].sort((a, b) => a - b));
  };

  const handleRemoveOffset = (offset: number) => {
    if (disabled) return;
    onChange(offsets.filter((o) => o !== offset));
  };

  const formatOffsetLabel = (minutes: number) => {
    if (minutes === 0) return "At time of event";
    if (minutes < 60) return `${minutes}m before`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours}h before`;
    const days = hours / 24;
    if (days < 7) return `${days}d before`;
    const weeks = days / 7;
    return `${weeks}w before`;
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const mins = parseInt(customVal);
    if (!isNaN(mins) && mins >= 0) {
      handleAddOffset(mins);
      setCustomVal("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        {offsets.length === 0 ? (
          <span className="text-sm text-surface-200/40">No reminders configured</span>
        ) : (
          offsets.map((offset) => (
            <span
              key={offset}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-medium text-brand-300 transition-all"
            >
              {formatOffsetLabel(offset)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveOffset(offset)}
                  className="text-brand-400 hover:text-brand-200 transition-colors"
                  title="Remove reminder"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {!disabled && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddOffset(Number(e.target.value));
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2 text-sm text-white transition-all duration-200"
            >
              <option value="" disabled>Add reminder preset...</option>
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value} disabled={offsets.includes(p.value)}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="Custom (minutes)"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              className="w-36 bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-3 py-2 text-sm text-white transition-all duration-200"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white hover:text-brand-300 font-medium text-sm rounded-xl transition-all duration-200"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
export default ReminderEditor;
