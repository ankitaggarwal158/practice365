import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import { useUpdateRole } from "../hooks/useUpdateRole";

export function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { role, isLoading: isRoleLoading, error: roleError } = useRole(id);
  const { updateRole, isLoading: isUpdateLoading, error: updateError } = useUpdateRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);

    if (!id) return;
    if (!name.trim()) {
      setValidationErrors("Role name is required.");
      return;
    }

    try {
      await updateRole(id, { name, description });
      navigate("/roles");
    } catch (err: any) {
      // Catch so redirect doesn't happen
    }
  };

  const isPageLoading = isRoleLoading;
  const isButtonLoading = isUpdateLoading;
  const displayError = roleError || updateError || validationErrors;

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs / Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-surface-200/50 uppercase tracking-wider mb-2">
          <Link to="/roles" className="hover:text-brand-300 transition-colors">Roles & Permissions</Link>
          <span>/</span>
          <span className="text-white">Edit Role</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-white">Edit Custom Role</h1>
        <p className="text-sm text-surface-200/50">
          Modify details for your custom role. Permissions can be assigned in the Matrix.
        </p>
      </div>

      {isPageLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-surface-900/20 backdrop-blur-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {displayError && (
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                {displayError}
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
                disabled={isButtonLoading}
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
                disabled={isButtonLoading}
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
                disabled={isButtonLoading}
                className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20 flex items-center justify-center min-w-[120px]"
              >
                {isButtonLoading ? (
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default EditRolePage;
