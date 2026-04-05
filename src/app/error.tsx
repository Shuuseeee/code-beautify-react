"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-anthro-light dark:bg-anthro-dark px-4">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-base font-bold font-heading text-anthro-dark dark:text-anthro-light">
            Something went wrong
          </h2>
          <p className="mt-2 text-xs text-anthro-mid font-mono break-all leading-relaxed">
            {error.message}
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-sm font-semibold font-heading transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    </div>
  );
}
