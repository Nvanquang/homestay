"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/layouts/public-shell";
import {
  getCancellationPolicies,
  CancellationPolicyDetail,
} from "@/features/listing-detail";
import {
  ShieldAlert,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function CancellationPoliciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations("cancellationPolicies");
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromListing = searchParams.get("fromListing");

  const [policies, setPolicies] = useState<CancellationPolicyDetail[]>([]);
  const [activeTab, setActiveTab] = useState<"FLEXIBLE" | "MODERATE" | "STRICT">("FLEXIBLE");

  useEffect(() => {
    getCancellationPolicies(locale).then((res) => {
      setPolicies(res);
    });

    // Check hash anchor in window
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "").toUpperCase();
      if (hash === "MODERATE" || hash === "STRICT" || hash === "FLEXIBLE") {
        setActiveTab(hash as any);
      }
    }
  }, [locale]);

  const selectedPolicy = policies.find((p) => p.key === activeTab) || policies[0];

  return (
    <PublicShell activeBottomTab="explore">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          {fromListing ? (
            <Link
              href={`/${locale}/rooms/${fromListing}`}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToListingBtn")}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backBtn")}</span>
            </button>
          )}

          {fromListing && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {t("appliedForThisStay")}
            </span>
          )}
        </div>

        {/* Title & Introduction */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
            {t("pageTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-2xl">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Policy Tab Switcher */}
        <div className="flex border-b border-[var(--color-border-subtle)] gap-2 sm:gap-4 overflow-x-auto">
          {[
            { key: "FLEXIBLE" as const, label: t("tabFlexible") },
            { key: "MODERATE" as const, label: t("tabModerate") },
            { key: "STRICT" as const, label: t("tabStrict") },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selected Policy Content */}
        {selectedPolicy && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Overview Card */}
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/60 border border-[var(--color-border-subtle)] space-y-3">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {selectedPolicy.name}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {selectedPolicy.summary}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                <Clock className="w-3.5 h-3.5" />
                <span>{t("timeCalculationNotice")}</span>
              </div>
            </div>

            {/* Milestones Refund Table */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t("refundMilestonesTableTitle")}
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-[var(--color-border-subtle)] shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">{t("colMilestone")}</th>
                      <th className="p-3.5">{t("colRoomFee")}</th>
                      <th className="p-3.5">{t("colCleaningFee")}</th>
                      <th className="p-3.5">{t("colServiceFee")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)] font-medium">
                    {selectedPolicy.milestones.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-850">
                        <td className="p-3.5 font-bold text-[var(--color-text-primary)]">
                          {m.label}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={
                              m.roomRefundPercent === 100
                                ? "text-emerald-600 font-bold"
                                : m.roomRefundPercent === 0
                                ? "text-rose-500 font-bold"
                                : "text-amber-600 font-bold"
                            }
                          >
                            {m.roomRefundPercent}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={
                              m.cleaningRefundPercent === 100
                                ? "text-emerald-600 font-bold"
                                : "text-rose-500 font-bold"
                            }
                          >
                            {m.cleaningRefundPercent}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={
                              m.serviceFeeRefundPercent === 100
                                ? "text-emerald-600 font-bold"
                                : "text-rose-500 font-bold"
                            }
                          >
                            {m.serviceFeeRefundPercent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Special Cases Section */}
            <div className="p-6 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-4">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>{t("specialCasesTitle")}</span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                <p>
                  <strong>{t("hostCancelTitle")}:</strong>{" "}
                  {selectedPolicy.specialCases.hostCancel}
                </p>
                <p>
                  <strong>{t("forceMajeureTitle")}:</strong>{" "}
                  {selectedPolicy.specialCases.forceMajeure}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
