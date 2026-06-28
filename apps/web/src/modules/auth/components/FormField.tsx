import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

/**
 * Styled form input with label, icon, and error state.
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, error, icon, id, className = "", ...props }, ref) {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-surface-200/80"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-200/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={fieldId}
            className={`
              block w-full rounded-xl border bg-surface-850 px-4 py-3 text-sm text-surface-100
              placeholder:text-surface-200/30
              transition-all duration-200
              ${icon ? "pl-10" : ""}
              ${
                error
                  ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                  : "border-white/[0.08] focus:border-brand-400/50 focus:ring-brand-400/10"
              }
              focus:ring-4 focus:outline-none
              ${className}
            `}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${fieldId}-error`}
            className="text-xs text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
