"use client";

import { X, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface ErrorModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ open, message, onClose }: ErrorModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-anthro-dark/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-anthro-border dark:border-anthro-dark-border">
          <div className="flex items-center gap-2 text-anthro-orange">
            <AlertCircle size={17} />
            <h2 className="font-semibold font-heading text-anthro-dark dark:text-anthro-light">
              {t("errorModalTitle")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-anthro-mid hover:text-anthro-dark hover:bg-anthro-border dark:hover:text-anthro-light dark:hover:bg-anthro-dark-border transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-anthro-dark dark:text-anthro-light font-mono break-all leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-anthro-border dark:border-anthro-dark-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium font-heading bg-anthro-border dark:bg-anthro-dark-border text-anthro-dark dark:text-anthro-light rounded-lg hover:bg-anthro-mid/20 transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
