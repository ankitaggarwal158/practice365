import { type ReactNode } from "react";

/**
 * Centered auth layout with a subtle gradient background and glass card.
 * Used for login, forgot-password, reset-password, and verify-email pages.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Background gradient orbs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "var(--color-brand-500)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full opacity-15 blur-[100px]"
        style={{ background: "var(--color-brand-400)" }}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="animate-slide-up relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Practice
            <span className="text-brand-400">365</span>
          </h1>
          <p className="mt-1 text-sm text-surface-200/60">
            Legal Practice Management
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl border border-white/[0.06] bg-surface-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
