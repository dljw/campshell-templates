import { useEffect, useRef } from "react";
import type { ValidationErrorDetail } from "./types";

export interface ValidationToastProps {
  toasts: ValidationErrorDetail[];
  onView: (file: string) => void;
  onDismiss: (file: string) => void;
}

const AUTO_DISMISS_MS = 8000;
const MAX_VISIBLE = 3;

export function ValidationToast({ toasts, onView, onDismiss }: ValidationToastProps) {
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // Set auto-dismiss timers for each toast
  useEffect(() => {
    const timers = timersRef.current;
    for (const toast of toasts) {
      if (!timers.has(toast.file)) {
        const timer = setTimeout(() => {
          timers.delete(toast.file);
          onDismiss(toast.file);
        }, AUTO_DISMISS_MS);
        timers.set(toast.file, timer);
      }
    }

    // Clean up timers for toasts that were removed
    for (const [file, timer] of timers) {
      if (!toasts.some((t) => t.file === file)) {
        clearTimeout(timer);
        timers.delete(file);
      }
    }
  }, [toasts, onDismiss]);

  // Clean up all timers on unmount only
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  const visible = toasts.slice(-MAX_VISIBLE);

  if (visible.length === 0) return null;

  return (
    <div className="kb-toast-container">
      {visible.map((toast) => {
        const firstError = toast.errors[0];
        const summary = firstError
          ? `${firstError.instancePath || "/"}: ${firstError.message ?? firstError.keyword}`
          : "Invalid data";

        return (
          <div key={toast.file} className="kb-toast" role="alert">
            <div className="kb-toast-header">
              <span className="kb-toast-icon">!</span>
              <span className="kb-toast-title">Validation Error &mdash; {toast.template}</span>
              <button
                type="button"
                className="kb-toast-close"
                onClick={() => onDismiss(toast.file)}
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
            <div className="kb-toast-summary">
              {toast.file}: {summary}
            </div>
            <div className="kb-toast-actions">
              <button type="button" className="kb-toast-btn" onClick={() => onView(toast.file)}>
                View
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
