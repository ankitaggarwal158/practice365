import { Link } from "react-router-dom";
import { UserResponseData } from "../types/user.types";
import { UserAvatar } from "./UserAvatar";
import { UserStatusBadge } from "./UserStatusBadge";

interface UserTableProps {
  users: UserResponseData[];
  sortBy: string;
  order: "asc" | "desc";
  onSort: (field: string) => void;
}

export function UserTable({ users, sortBy, order, onSort }: UserTableProps) {
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return (
        <svg className="ml-1 h-3 w-3 opacity-30 group-hover:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      );
    }
    return order === "asc" ? (
      <svg className="ml-1 h-3 w-3 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    ) : (
      <svg className="ml-1 h-3 w-3 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  };

  const headers = [
    { label: "Name", field: "lastName" },
    { label: "Email Address", field: "email" },
    { label: "Job Title", field: "jobTitle" },
    { label: "Status", field: "status" },
    { label: "Date Joined", field: "createdAt" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-800 bg-surface-900/40 backdrop-blur-md">
      <table className="w-full border-collapse text-left text-sm text-surface-200">
        <thead className="border-b border-surface-800 bg-surface-900/60 text-xs font-semibold uppercase tracking-wider text-surface-200/50">
          <tr>
            {headers.map(({ label, field }) => (
              <th
                key={field}
                scope="col"
                onClick={() => onSort(field)}
                className="group cursor-pointer px-6 py-4 select-none transition-colors hover:text-white"
              >
                <div className="flex items-center">
                  {label}
                  {renderSortIcon(field)}
                </div>
              </th>
            ))}
            <th scope="col" className="px-6 py-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-800/40">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-surface-200/40">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="group/row transition-all hover:bg-surface-800/20"
              >
                {/* Name */}
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatarUrl={user.avatarUrl}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      size="sm"
                    />
                    <div>
                      <Link
                        to={`/users/${user.id}`}
                        className="font-medium text-white transition-colors hover:text-brand-300"
                      >
                        {user.firstName} {user.lastName}
                      </Link>
                      {user.displayName && (
                        <span className="block text-xs text-surface-200/40">
                          "{user.displayName}"
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="whitespace-nowrap px-6 py-4 text-surface-200/70">
                  {user.email}
                </td>

                {/* Job Title */}
                <td className="whitespace-nowrap px-6 py-4 text-surface-200/70">
                  {user.jobTitle || <span className="opacity-30">—</span>}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-6 py-4">
                  <UserStatusBadge status={user.status} />
                </td>

                {/* Date Joined */}
                <td className="whitespace-nowrap px-6 py-4 text-surface-200/50">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>

                {/* Action Link */}
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Link
                    to={`/users/${user.id}`}
                    className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-400 bg-brand-500/5 border border-brand-500/10 transition-all group-hover/row:opacity-100 hover:bg-brand-500/10 hover:text-brand-300"
                  >
                    Manage
                    <svg className="ml-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
export default UserTable;
