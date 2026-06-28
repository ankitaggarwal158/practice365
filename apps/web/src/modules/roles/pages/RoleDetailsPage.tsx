import { useParams, Link } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import { usePermissions } from "../hooks/usePermissions";

export function RoleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { role, isLoading: isRoleLoading, error: roleError } = useRole(id);
  const { permissions, isLoading: isPermsLoading, error: permsError } = usePermissions();

  const isLoading = isRoleLoading || isPermsLoading;
  const error = roleError || permsError;

  // Filter permission documents that are assigned to this role
  const assignedPermissions = role && role.permissionIds && permissions.length > 0
    ? permissions.filter((p) => role.permissionIds?.includes(p.id))
    : [];

  // Group assigned permissions by module
  const groupedPermissions = assignedPermissions.reduce((acc, p) => {
    if (!acc[p.module]) {
      acc[p.module] = [];
    }
    acc[p.module]!.push(p);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs / Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-surface-200/50 uppercase tracking-wider mb-2">
          <Link to="/roles" className="hover:text-brand-300 transition-colors">Roles & Permissions</Link>
          <span>/</span>
          <span className="text-white">Role Details</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {role?.name || "Loading Role..."}
            </h1>
            <p className="text-sm text-surface-200/50 mt-1">
              {role?.description || "No description provided."}
            </p>
          </div>
          {role && !role.isSystemRole && (
            <Link
              to={`/roles/${role.id}/edit`}
              className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
            >
              Edit Details
            </Link>
          )}
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
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-surface-900/20 backdrop-blur-md p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="block text-xs font-semibold text-surface-200/45 uppercase tracking-wider mb-1">Role Type</span>
              {role?.isSystemRole ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 border border-blue-500/20">
                  System Role (Read-only)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/20">
                  Custom Role
                </span>
              )}
            </div>
            <div>
              <span className="block text-xs font-semibold text-surface-200/45 uppercase tracking-wider mb-1">Status</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success border border-success/20">
                Active
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-surface-200/45 uppercase tracking-wider mb-1">Permissions Granted</span>
              <span className="text-sm font-semibold text-white">
                {role?.permissionIds?.length || 0} / {permissions.length}
              </span>
            </div>
          </div>

          {/* Permissions Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Assigned Permissions</h2>
            {assignedPermissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-surface-200/40 text-sm">
                No permissions have been assigned to this role yet. Configure permissions in the{" "}
                <Link to="/roles/permissions" className="text-brand-400 hover:underline">Permission Matrix</Link>.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                  <div
                    key={moduleName}
                    className="rounded-2xl border border-white/[0.06] bg-surface-900/10 p-5 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-brand-300 uppercase tracking-wider border-b border-white/[0.04] pb-2">
                      {moduleName} Module
                    </h3>
                    <ul className="space-y-3.5">
                      {perms.map((p) => (
                        <li key={p.id} className="flex flex-col">
                          <span className="text-sm font-semibold text-white flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                            {p.name}
                          </span>
                          <span className="text-xs text-surface-200/50 pl-3.5 mt-0.5">
                            {p.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleDetailsPage;
