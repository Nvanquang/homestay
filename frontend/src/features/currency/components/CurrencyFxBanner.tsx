"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useCurrency } from "../context/CurrencyContext";
import { AlertTriangle, Info } from "lucide-react";

export function CurrencyFxBanner() {
  const t = useTranslations("currency");
  const { fxStatus, currency } = useCurrency();

  if (fxStatus === "OK") return null;

  const isStale = fxStatus === "STALE";

  return (
    <div
      role="alert"
      className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
        isStale
          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60"
          : "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60"
      }`}
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>
          {isStale ? t("fxStaleBanner") : t("fxUnavailableBanner")}
        </span>
      </div>
    </div>
  );
}
