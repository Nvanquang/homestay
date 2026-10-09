"use client";

import React from "react";
import { useTranslations } from "next-intl";

export function CalendarLegend() {
  const t = useTranslations("calendar.legend");

  const items = [
    {
      key: "available",
      label: t("available"),
      boxClass: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
    },
    {
      key: "booked",
      label: t("booked"),
      boxClass: "bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 border border-transparent",
    },
    {
      key: "hold",
      label: t("hold"),
      boxClass: "bg-amber-100 dark:bg-amber-950/60 border border-amber-400 dark:border-amber-600",
    },
    {
      key: "pendingHost",
      label: t("pendingHost"),
      boxClass: "bg-purple-100 dark:bg-purple-950/60 border border-purple-400 dark:border-purple-600",
    },
    {
      key: "blocked",
      label: t("blocked"),
      boxClass:
        "bg-gray-100 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(156,163,175,0.4)_4px,rgba(156,163,175,0.4)_8px)]",
    },
    {
      key: "past",
      label: t("past"),
      boxClass: "bg-gray-100/60 dark:bg-gray-900/40 border border-transparent opacity-50",
    },
  ];

  return (
    <div
      data-testid="calendar-legend"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)] py-2"
    >
      <span className="font-medium text-[var(--color-text-primary)] mr-1">
        {t("title")}:
      </span>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5 shrink-0">
          <span className={`w-4 h-4 rounded-xs shrink-0 ${item.boxClass}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
