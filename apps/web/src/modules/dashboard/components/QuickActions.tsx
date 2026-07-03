import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { dashboardApi } from "../api/dashboard.api";
import { QuickActionItem } from "../types/dashboard.types";

export function QuickActions() {
  const [actions, setActions] = useState<QuickActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getQuickActions()
      .then((res) => setActions(res || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Map icon string to Lucide React component
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-5 w-5 shrink-0" />;
    }
    return <Icons.Plus className="h-5 w-5 shrink-0" />;
  };

  if (isLoading) {
    return (
      <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse bg-white/5 h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (actions.length === 0) return null;

  return (
    <div className="bg-surface-900 border border-white/[0.06] rounded-2xl p-6 shadow-xl">
      <h3 className="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.path}
            className="flex flex-col items-center justify-center text-center p-4 bg-surface-950/40 hover:bg-brand-500/10 border border-white/[0.03] hover:border-brand-500/30 rounded-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-surface-800 text-surface-200/80 group-hover:text-brand-400 group-hover:bg-brand-500/15 border border-white/[0.03] group-hover:border-brand-500/20 transition-all duration-300">
              {renderIcon(action.icon)}
            </div>
            <span className="text-xs font-semibold text-surface-200/80 group-hover:text-white mt-2.5 transition-colors leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export default QuickActions;
