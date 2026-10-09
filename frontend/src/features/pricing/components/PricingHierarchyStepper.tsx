"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Sparkles, Layers, Calendar, Sun, ShieldCheck } from "lucide-react";

export function PricingHierarchyStepper() {
  const t = useTranslations("pricing.hierarchy");
  const [isExpanded, setIsExpanded] = useState(true);

  const tiers = [
    {
      level: "1",
      badge: t("tier1Badge"),
      badgeColor: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800",
      title: t("tier1Title"),
      desc: t("tier1Desc"),
      icon: Sparkles,
      iconColor: "text-red-500",
    },
    {
      level: "2",
      badge: t("tier2Badge"),
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      title: t("tier2Title"),
      desc: t("tier2Desc"),
      icon: Sun,
      iconColor: "text-amber-500",
    },
    {
      level: "3",
      badge: t("tier3Badge"),
      badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      title: t("tier3Title"),
      desc: t("tier3Desc"),
      icon: Calendar,
      iconColor: "text-purple-500",
    },
    {
      level: "4",
      badge: t("tier4Badge"),
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      title: t("tier4Title"),
      desc: t("tier4Desc"),
      icon: ShieldCheck,
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div
      data-testid="pricing-hierarchy-stepper"
      className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-xs"
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 px-5 flex items-center justify-between hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              {t("headerTitle")}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t("headerSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] font-medium">
          <span>{isExpanded ? t("collapse") : t("expand")}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[var(--color-border-subtle)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.level}
                  className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/80 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}
                    >
                      {tier.badge}
                    </span>
                    <Icon className={`w-4 h-4 ${tier.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text-primary)]">
                      {tier.title}
                    </h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                      {tier.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 px-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
            <span>
              ℹ️ <strong>{t("discountNotePrefix")}:</strong> {t("discountNoteText")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
