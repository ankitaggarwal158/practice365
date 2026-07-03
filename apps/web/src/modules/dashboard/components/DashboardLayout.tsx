import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-auto max-w-7xl mx-auto w-full animate-fade-in">
      {children}
    </div>
  );
}
export default DashboardLayout;
