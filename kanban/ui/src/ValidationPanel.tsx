import { useEffect, useState } from "react";
import type { ValidationErrorDetail } from "./types";

export interface ValidationPanelProps {
  errors: ValidationErrorDetail[];
  selectedFile: string | null;
  onClose: () => void;
  apiBase?: string;
}

function resolveJsonPath(data: unknown, path: string): unknown {
  if (!path) return undefined;
  const parts = path.split("/").filter(Boolean);
  let current: unknown = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function ValidationPanel({
  errors,
  selectedFile,
  onClose,
  apiBase = "",
}: ValidationPanelProps) {
  const [fetchedData, setFetchedData] = useState<Map<string, unknown>>(new Map());

  // Auto-close if selected error has been resolved
  useEffect(() => {
    if (selectedFile && !errors.some((e) => e.file === selectedFile)) {
      onClose();
    }
  }, [errors, selectedFile, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch rejectedData for errors that don't have it
  useEffect(() => {
    if (errors.length === 0) return;

    const needsFetch = errors.some((e) => e.rejectedData === undefined && !fetchedData.has(e.file));
    if (!needsFetch) return;

    let cancelled = false;
    const template = errors[0].template;

    fetch(`${apiBase}/api/${template}/errors`)
      .then((r) => (r.ok ? r.json() : []))
      .then((records: ValidationErrorDetail[]) => {
        if (cancelled) return;
        setFetchedData((prev) => {
          const next = new Map(prev);
          for (const rec of records) {
            if (rec.rejectedData !== undefined) {
              next.set(rec.file, rec.rejectedData);
            }
          }
          return next;
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [errors, fetchedData, apiBase]);

  if (errors.length === 0) return null;

  return (
    <>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape handled via document listener */}
      <div className="kb-panel-overlay" onClick={onClose} role="presentation" />
      <dialog className="kb-panel" open aria-label="Validation Errors">
        <div className="kb-panel-header">
          <span className="kb-panel-title">Validation Errors ({errors.length})</span>
          <button
            type="button"
            className="kb-panel-close"
            onClick={onClose}
            aria-label="Close panel"
          >
            &times;
          </button>
        </div>

        <div className="kb-panel-body">
          {errors.map((error) => {
            const rejectedData = error.rejectedData ?? fetchedData.get(error.file);

            return (
              <div
                key={error.file}
                className={`kb-panel-section${error.file === selectedFile ? " kb-panel-section--selected" : ""}`}
              >
                <div className="kb-panel-file">{error.file}</div>
                {error.errors.map((err, i) => {
                  const expected =
                    err.params?.type ?? err.params?.missingProperty ?? err.params?.format;
                  const got =
                    rejectedData !== undefined && err.instancePath
                      ? resolveJsonPath(rejectedData, err.instancePath)
                      : undefined;

                  return (
                    <div className="kb-panel-error-row" key={`${error.file}-${i}`}>
                      <div className="kb-panel-error-summary">
                        <span className="kb-panel-field">{err.instancePath || "/"}</span>
                        <span className="kb-panel-message">{err.message ?? err.keyword}</span>
                      </div>
                      {expected !== undefined && (
                        <div className="kb-panel-expected">Expected: {String(expected)}</div>
                      )}
                      {got !== undefined && (
                        <div className="kb-panel-got">Got: {JSON.stringify(got)}</div>
                      )}
                    </div>
                  );
                })}

                {rejectedData !== undefined && (
                  <div className="kb-panel-data">
                    <div className="kb-panel-data-label">Rejected data:</div>
                    <pre className="kb-panel-data-pre">{JSON.stringify(rejectedData, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </dialog>
    </>
  );
}
