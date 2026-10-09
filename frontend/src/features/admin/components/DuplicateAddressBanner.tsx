"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { DuplicateAddressAlert } from "../types";
import { useTranslations } from "next-intl";

export interface DuplicateAddressBannerProps {
  alert: DuplicateAddressAlert;
  locale: string;
}

export function DuplicateAddressBanner({ alert, locale }: DuplicateAddressBannerProps) {
  const t = useTranslations("adminListingReviews");

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-3 animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-200/70 dark:bg-amber-900/60 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-800 dark:text-amber-300" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm">
            {t("duplicateAlertTitle")}
          </h4>
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            {t("duplicateAlertDesc", {
              dupId: alert.duplicateListingId,
              dupTitle: alert.duplicateListingTitle,
              dupHost: alert.duplicateHostName,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-xs">
        <Link
          href={`/${locale}/admin/listing-reviews/${alert.duplicateListingId}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 hover:underline"
        >
          <span>{t("viewDuplicateListing", { dupId: alert.duplicateListingId })}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <span className="text-[11px] text-amber-700 dark:text-amber-400">
          {t("duplicateAddressReference", { address: alert.exactAddress })}
        </span>
      </div>
    </div>
  );
}
