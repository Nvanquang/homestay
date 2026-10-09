"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import { Calendar, DollarSign, ExternalLink, Check, Save } from "lucide-react";

interface BaselinePricingCardProps {
  listingId: string;
  locale: string;
  baseNightlyPrice: number;
  weekendNightlyPrice: number;
  onSaveWeekendPrice: (price: number) => Promise<void>;
}

export function BaselinePricingCard({
  listingId,
  locale,
  baseNightlyPrice,
  weekendNightlyPrice,
  onSaveWeekendPrice,
}: BaselinePricingCardProps) {
  const t = useTranslations("pricing.baseline");

  const formatInputMoney = (val: number | string) => {
    const digits = String(val).replace(/\D/g, "");
    if (!digits) return "";
    const num = parseInt(digits, 10);
    return isNaN(num) ? "" : num.toLocaleString("vi-VN");
  };

  const [weekendPriceInput, setWeekendPriceInput] = useState(
    formatInputMoney(weekendNightlyPrice)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setWeekendPriceInput(formatInputMoney(weekendNightlyPrice));
  }, [weekendNightlyPrice]);

  const handleSave = async () => {
    const parsed = parseInt(weekendPriceInput.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) return;

    try {
      setIsSaving(true);
      await onSaveWeekendPrice(parsed);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      data-testid="baseline-pricing-card"
      className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            {t("title")}
          </h3>
        </div>

        <Link
          href={`/${locale}/host/listings/${listingId}/edit/pricing`}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
        >
          <span>{t("editStep6Link")}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        {/* Base Price Read-only display */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">
              {t("basePriceLabel")}
            </span>
            <div className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mt-0.5">
              {formatMoney(baseNightlyPrice, "VND", locale)}
              <span className="text-xs font-normal text-[var(--color-text-tertiary)]">
                {" "}
                / {t("night")}
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
              {t("basePriceNotice")}
            </p>
          </div>
        </div>

        {/* Weekend Price Editable input */}
        <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {t("weekendPriceLabel")}
            </span>
            {isSaved && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {t("saved")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={weekendPriceInput}
                onChange={(e) => setWeekendPriceInput(formatInputMoney(e.target.value))}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                placeholder="1.500.000"
              />
              <span className="absolute right-3 top-2 text-xs text-[var(--color-text-tertiary)] font-bold">
                ₫
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? t("saving") : t("saveBtn")}</span>
            </button>
          </div>

          <p className="text-[11px] text-purple-800/80 dark:text-purple-300">
            {t("weekendAppliesNotice")}
          </p>
        </div>
      </div>
    </div>
  );
}
