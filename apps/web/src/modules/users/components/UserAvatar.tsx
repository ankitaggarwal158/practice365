interface UserAvatarProps {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function UserAvatar({ avatarUrl, firstName, lastName, size = "md" }: UserAvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };

  // Generate a premium looking gradient background based on the user's name
  const getGradient = () => {
    const charCodeSum = firstName.charCodeAt(0) + (lastName.charCodeAt(0) || 0);
    const gradients = [
      "from-brand-400 to-brand-600 text-white",
      "from-teal-400 to-teal-600 text-white",
      "from-indigo-400 to-indigo-600 text-white",
      "from-emerald-400 to-emerald-600 text-white",
      "from-purple-400 to-purple-600 text-white",
      "from-rose-400 to-rose-600 text-white",
    ];
    return gradients[charCodeSum % gradients.length];
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className={`rounded-full object-cover ring-1 ring-surface-200/10 shadow-sm ${sizeClasses[size]}`}
        onError={(e) => {
          // If image load fails, hide img and show fallback initials
          (e.target as HTMLElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br font-semibold tracking-wider ring-1 ring-surface-200/10 shadow-sm ${sizeClasses[size]} ${getGradient()}`}
    >
      {initials}
    </div>
  );
}
export default UserAvatar;
