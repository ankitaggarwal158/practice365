import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";

export function ErrorFallback() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  console.error("Application runtime error caught by boundary:", error);

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : error?.statusText || error?.message || "An unexpected error occurred.";

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-md w-full bg-surface-900 border border-surface-800 rounded-xl p-8 shadow-xl backdrop-blur-md">
        {/* Error Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger mb-6">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-white mb-2">Unexpected Application Error</h2>
        
        {/* Message */}
        <p className="text-surface-200/70 text-sm mb-6">
          Something went wrong while rendering this page. We've logged the error, and you can try reloading or navigating back to safety.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 transition-colors focus:outline-none cursor-pointer"
          >
            Reload Page
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center px-4 py-2 border border-surface-800 text-sm font-medium rounded-md text-surface-100 bg-surface-850 hover:bg-surface-800 transition-colors focus:outline-none cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Error Details Collapsible (Nice for debugging) */}
        {errorMessage && (
          <details className="text-left bg-surface-950 border border-surface-800 rounded-md p-3 select-text group cursor-pointer">
            <summary className="text-xs text-surface-200/50 hover:text-surface-200/70 transition-colors font-medium flex justify-between items-center select-none">
              <span>View Error Details</span>
              <svg
                className="w-4 h-4 transform group-open:rotate-180 transition-transform text-surface-200/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 text-xs font-mono text-danger overflow-x-auto whitespace-pre-wrap break-all border-t border-surface-800 pt-2 cursor-text">
              {errorMessage}
              {error?.stack && (
                <div className="text-[10px] text-surface-200/40 mt-1 max-h-32 overflow-y-auto select-text">
                  {error.stack}
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default ErrorFallback;
