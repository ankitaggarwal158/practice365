import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePracticeArea, useUpdatePracticeArea } from "../hooks/usePracticeAreas";
import { UpdatePracticeAreaRequest } from "../types/practice-area.types";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";

export default function EditPracticeAreaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: practiceArea, isLoading } = usePracticeArea(id!);
  const updatePA = useUpdatePracticeArea();
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const canManage = permissions.includes("PRACTICE_AREAS_MANAGE");

  const [formData, setFormData] = useState<UpdatePracticeAreaRequest>({
    name: "",
    description: "",
    color: "#5520F0",
    defaultHourlyRate: 0,
  });

  useEffect(() => {
    if (practiceArea) {
      setFormData({
        name: practiceArea.name,
        description: practiceArea.description || "",
        color: practiceArea.color || "#5520F0",
        defaultHourlyRate: practiceArea.defaultHourlyRate || 0,
      });
    }
  }, [practiceArea]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    updatePA.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          navigate("/practice-areas");
        },
      }
    );
  };

  if (isLoading || isPermsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to manage practice areas.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => navigate("/practice-areas")}
          className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          &larr; Back to Practice Areas
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Practice Area</h1>
        <p className="mt-2 text-sm text-surface-200/60">
          Update details for {practiceArea?.name} ({practiceArea?.code}).
        </p>
      </div>

      <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Name <span className="text-danger">*</span>
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Default Hourly Rate ($)</label>
            <input
              type="number"
              name="defaultHourlyRate"
              value={formData.defaultHourlyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full sm:w-1/2 bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all duration-200"
            />
            <p className="mt-1 text-xs text-surface-200/50">Used to override firm-wide default rates when creating time entries.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Color Label</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-20 rounded cursor-pointer bg-surface-950 border border-white/[0.08]"
              />
              <span className="text-sm text-surface-200/50">Used for visual identification</span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.06] flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/practice-areas")}
              className="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatePA.isPending}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
            >
              {updatePA.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
