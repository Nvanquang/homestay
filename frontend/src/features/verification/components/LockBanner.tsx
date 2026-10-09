"use client";

import React from "react";
import { Lock, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";

export interface LockBannerProps {
  lockedByName: string;
  lockedAt: string;
  isLockedByOther: boolean;
  onTryReacquire?: () => void;
  isLoading?: boolean;
}

export function LockBanner({
  lockedByName,
  lockedAt,
  isLockedByOther,
  onTryReacquire,
  isLoading = false,
}: LockBannerProps) {
  const t = useTranslations("verification.adminQueue");

  if (!isLockedByOther) return null;

  return (
    <div
      role="alert"
      className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[var(--shadow-1)] animate-in fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-700 flex-shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-950">
            {t("recordLockedTitle")}
          </h4>
          <p className="mt-0.5 text-xs text-amber-800">
            {t("recordLockedDesc", {
              name: lockedByName,
              time: new Date(lockedAt).toLocaleTimeString("vi-VN"),
            })}
          </p>
        </div>
      </div>

      {onTryReacquire && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onTryReacquire}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-amber-300 bg-white hover:bg-amber-100/50 text-amber-900 flex-shrink-0"
        >
          {t("reacquireLockBtn")}
        </Button>
      )}
    </div>
  );
}
