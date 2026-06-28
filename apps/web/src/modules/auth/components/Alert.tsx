interface AlertProps {
  type: "error" | "success" | "info";
  message: string;
}

const styles = {
  error: "border-danger/20 bg-danger/10 text-danger",
  success: "border-success/20 bg-success/10 text-success",
  info: "border-brand-400/20 bg-brand-400/10 text-brand-300",
};

const icons = {
  error: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  success: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

/**
 * Alert banner for form-level error/success/info messages.
 */
export function Alert({ type, message }: AlertProps) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm animate-fade-in ${styles[type]}`}
      role="alert"
    >
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}
