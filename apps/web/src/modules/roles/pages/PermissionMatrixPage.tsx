import { useState } from "react";
import { Link } from "react-router-dom";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import { useAssignPermissions } from "../hooks/useAssignPermissions";

export function PermissionMatrixPage() {
  const { roles, isLoading: isRolesLoading, error: rolesError, refetch: refetchRoles } = useRoles();
  const { permissions, isLoading: isPermsLoading, error: permsError } = usePermissions();
  const { assignPermissions, isLoading: isAssigning, error: assignError } = useAssignPermissions();

  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  const isLoading = isRolesLoading || isPermsLoading;
  const error = rolesError || permsError || assignError;

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, p) => {
    if (!acc[p.module]) {
      acc[p.module] = [];
    }
    acc[p.module]!.push(p);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const handleCheckboxChange = async (roleId: string, permissionId: string, isChecked: boolean) => {
    const roleObj = roles.find((r) => r.id === roleId);
    if (!roleObj || roleObj.isSystemRole) return;

    setSavingRoleId(roleId);
    try {
      const currentPerms = roleObj.permissionIds || [];
      const updatedPerms = isChecked
        ? [...currentPerms, permissionId]
        : currentPerms.filter((id: string) => id !== permissionId);

      await assignPermissions(roleId, { permissionIds: updatedPerms });
      await refetchRoles();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRoleId(null);
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header section */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-surface-200/50 uppercase tracking-wider mb-2">
          <Link to="/roles" className="hover:text-brand-300 transition-colors">Roles & Permissions</Link>
          <span>/</span>
          <span className="text-white">Permission Matrix</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-white">Permission Matrix</h1>
        <p className="text-sm text-surface-200/50 mt-1">
          Review permission mappings across all roles. Click checkboxes to customize permissions for custom roles (System roles are read-only).
        </p>
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
              <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                <tr className="text-xs font-semibold uppercase tracking-wider text-surface-100/50">
                  <th scope="col" className="px-6 py-4 min-w-[280px]">Module & Permission</th>
                  {roles.map((role) => (
                    <th key={role.id} scope="col" className="px-6 py-4 text-center min-w-[120px]">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-bold">{role.name}</span>
                        <span className="text-[10px] text-surface-200/30 mt-0.5 capitalize">
                          {role.isSystemRole ? "System" : "Custom"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                  <tr key={moduleName} className="contents">
                    {/* Module Section Header */}
                    <tr className="bg-white/[0.01]">
                      <td colSpan={roles.length + 1} className="px-6 py-3 font-semibold text-brand-300 text-xs uppercase tracking-wider">
                        {moduleName} Module
                      </td>
                    </tr>
                    {perms.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.01] transition-all duration-150">
                        <td className="px-6 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{p.name}</span>
                            <span className="text-xs text-surface-200/40 mt-0.5">{p.description}</span>
                          </div>
                        </td>
                        {roles.map((role) => {
                          const isAssigned = role.permissionIds?.includes(p.id) || false;
                          const isSystem = role.isSystemRole;
                          const isSaving = savingRoleId === role.id || isAssigning;

                          return (
                            <td key={role.id} className="px-6 py-3.5 text-center whitespace-nowrap">
                              <label className="inline-flex items-center justify-center cursor-pointer p-2">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  disabled={isSystem || isSaving}
                                  onChange={(e) => handleCheckboxChange(role.id, p.id, e.target.checked)}
                                  className="h-4.5 w-4.5 rounded-lg border-white/[0.15] bg-surface-900/40 text-brand-500 checked:bg-brand-500 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-40 transition-all cursor-pointer"
                                />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
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

export default PermissionMatrixPage;
