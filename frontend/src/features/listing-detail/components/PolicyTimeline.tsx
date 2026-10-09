"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Clock, ShieldAlert, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { CancellationPolicyDetail } from "../types";

interface PolicyTimelineProps {
  policy: CancellationPolicyDetail;
  listingId?: string;
}

export function PolicyTimeline({ policy, listingId }: PolicyTimelineProps) {
  const t = useTranslations("listingDetail.policy");
  const locale = useLocale();

  return (
    <div className="py-6 border-b border-[var(--color-border-subtle)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
          {t("title")}
        </h3>

        <Link
          href={`/${locale}/cancellation-policies#${policy.key.toLowerCase()}${
            listingId ? `?fromListing=${listingId}` : ""
          }`}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>{t("viewFullPolicyBtn")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-[var(--color-border-subtle)] space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            {policy.name}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {policy.summary}
        </p>

        {/* Visual Timeline Bar */}
        <div className="pt-2 space-y-2">
          <div className="relative flex items-center justify-between text-[11px] font-bold text-[var(--color-text-secondary)]">
            <span>{policy.milestones[0]?.label || "≥ 24h trước nhận phòng"}</span>
            <span className="text-rose-500 font-extrabold">{policy.milestones[1]?.label || "< 24h"}</span>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 flex overflow-hidden">
            <div className="w-2/3 h-full bg-emerald-500" />
            <div className="w-1/3 h-full bg-rose-400" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {t("refundFull")}
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              {t("forfeitFirstNight")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
