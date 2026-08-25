"use client";

import { useEffect } from "react";
import { TriangleAlert, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="h-11 w-11 rounded-lg border border-line bg-[var(--danger-wash)] flex items-center justify-center">
          <TriangleAlert size={20} strokeWidth={1.75} className="text-danger" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-fg">
            The page stopped responding
          </h2>
          <p className="mt-1 text-base text-fg-muted">
            Reload to start over. Your code is still in this tab.
          </p>
          <pre className="mt-3 px-3 py-2 rounded-md border border-line bg-surface-sunk text-xs text-fg-muted text-left whitespace-pre-wrap break-words">
            {error.message}
          </pre>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-md bg-accent text-accent-fg text-base font-medium hover:bg-accent-hover transition-colors"
        >
          <RefreshCw size={13} strokeWidth={2} />
          Reload
        </button>
      </div>
    </div>
  );
}
