import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreateRole } from "../hooks/useCreateRole";

export function CreateRolePage() {
  const navigate = useNavigate();
  const { createRole, isLoading, error } = useCreateRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);

    if (!name.trim()) {
      setValidationErrors("Role name is required.");
      return;
    }

    try {
      await createRole({ name, description });
      navigate("/roles");
    } catch (err: any) {
      // Handled by the hook, but we catch so redirect doesn't happen
    }
  };

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs / Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-surface-200/50 uppercase tracking-wider mb-2">
          <Link to="/roles" className="hover:text-brand-300 transition-colors">Roles & Permissions</Link>
          <span>/</span>
          <span className="text-white">Create Role</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Custom Role</h1>
        <p className="text-sm text-surface-200/50">
          Create a new customized role for your firm. You will configure its permissions next.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-surface-900/20 backdrop-blur-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || validationErrors) && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
              {error || validationErrors}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-white">
              Role Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Senior Associate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-white">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the responsibilities and scope of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/roles"
              className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20 flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Save Role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRolePage;
