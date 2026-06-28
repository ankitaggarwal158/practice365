import { UserStatus } from "../types/user.types";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "bg-success/10 text-success border-success/30";
      case UserStatus.PENDING_INVITATION:
        return "bg-warning/10 text-warning border-warning/30";
      case UserStatus.SUSPENDED:
        return "bg-danger/10 text-danger/80 border-danger/20";
      case UserStatus.DEACTIVATED:
        return "bg-surface-800 text-surface-200/50 border-surface-200/10";
      default:
        return "bg-surface-800 text-surface-200 border-surface-200/20";
    }
  };

  const getLabel = () => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "Active";
      case UserStatus.PENDING_INVITATION:
        return "Pending Invitation";
      case UserStatus.SUSPENDED:
        return "Suspended";
      case UserStatus.DEACTIVATED:
        return "Deactivated";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-xs transition-all duration-300 ${getStyles()}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse-subtle" />
      {getLabel()}
    </span>
  );
}
export default UserStatusBadge;
