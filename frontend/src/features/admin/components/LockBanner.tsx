"use client";

import React from "react";
import { Lock, Clock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export interface LockBannerProps {
  isLockedByOther: boolean;
  lockedByName?: string;
  lockedAt?: string;
  onReleaseLock?: () => void;
  isReleasing?: boolean;
}

export function LockBanner({
  isLockedByOther,
  lockedByName,
  lockedAt,
  onReleaseLock,
  isReleasing = false,
}: LockBannerProps) {
  const t = useTranslations("adminListingReviews");

  if (isLockedByOther) {
    return (
      <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-200/60 dark:bg-amber-900/50 shrink-0">
            <Lock className="w-4 h-4 text-amber-800 dark:text-amber-300" />
          </div>
          <div>
            <p className="font-bold">
              {t("lockBanner", {
                name: lockedByName || "Admin khác",
                time: lockedAt ? new Date(lockedAt).toLocaleTimeString() : "",
              })}
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              {t("lockBannerReadOnly")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between gap-4 text-xs text-emerald-900 dark:text-emerald-200">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-semibold">{t("lockAcquired")}</span>
      </div>

      {onReleaseLock && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isReleasing}
          onClick={onReleaseLock}
          className="text-xs px-3 py-1 font-medium cursor-pointer"
        >
          {t("btnReleaseLock")}
        </Button>
      )}
    </div>
  );
}
