import { Link } from "react-router-dom";
import { useRoles } from "../hooks/useRoles";

export function RoleListPage() {
  const { roles, isLoading, error, deleteRole } = useRoles();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the role "${name}"?`)) return;
    try {
      await deleteRole(id);
      alert("Role deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete role.");
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Roles & Permissions</h1>
          <p className="text-sm text-surface-200/50">
            Define system roles, create custom roles, and configure feature access permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/roles/permissions"
            className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            Permission Matrix
          </Link>
          <Link
            to="/roles/new"
            className="rounded-xl bg-brand-500 hover:bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Create Role
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center text-danger text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-900/20 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-surface-200">
              <thead className="border-b border-white/[0.06] bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-surface-100/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Role Name</th>
                  <th scope="col" className="px-6 py-4">Description</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-white/[0.01] transition-all duration-150">
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-white">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-surface-200/70">
                      {role.description || <span className="text-surface-200/30">No description provided</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {role.isSystemRole ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 border border-blue-500/20">
                          System Role
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/20">
                          Custom Role
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success border border-success/20">
                        Active
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/roles/${role.id}`}
                        className="text-brand-300 hover:text-brand-200 transition-colors"
                      >
                        View Details
                      </Link>
                      {!role.isSystemRole && (
                        <>
                          <Link
                            to={`/roles/${role.id}/edit`}
                            className="text-surface-200/60 hover:text-white transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(role.id, role.name)}
                            className="text-danger/60 hover:text-danger transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleListPage;
