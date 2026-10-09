"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

export type SaveStatus = "saved" | "saving" | "error" | "idle";

export interface SaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: Date | null;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export function SaveIndicator({
  status,
  lastSavedAt,
  errorMessage,
  onRetry,
  className = "",
}: SaveIndicatorProps) {
  const t = useTranslations("listingWizard");

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div
      data-testid="save-indicator"
      className={`flex items-center gap-2 text-xs font-medium whitespace-nowrap shrink-0 ${className}`}
      aria-live="polite"
    >
      {status === "saving" && (
        <span className="flex items-center gap-1.5 text-[var(--color-primary)] animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span className="hidden xs:inline">{t("saving")}</span>
        </span>
      )}

      {status === "saved" && (
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>
            {t("saved")}
            {lastSavedAt && (
              <span className="hidden sm:inline ml-1 font-normal opacity-85">
                {formatTime(lastSavedAt)}
              </span>
            )}
          </span>
        </span>
      )}

      {status === "error" && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-rose-600 dark:text-rose-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{errorMessage || t("saveError")}</span>
            <span className="sm:hidden">{t("saveError")}</span>
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 underline font-semibold hover:text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-500 rounded px-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">{t("retry")}</span>
            </button>
          )}
        </div>
      )}

      {status === "idle" && lastSavedAt && (
        <span className="text-[var(--color-text-secondary)] hidden sm:inline">
          {t("saved")} {formatTime(lastSavedAt)}
        </span>
      )}
    </div>
  );
}
