"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PriceRule, PriceRuleType, UpsertPriceRulePayload } from "../types";
import { priceRuleSchema } from "../schemas";
import { X, Sparkles, Sun, Calendar, AlertTriangle, ShieldAlert } from "lucide-react";

interface PriceRuleModalProps {
  isOpen: boolean;
  listingId: string;
  initialRule?: PriceRule | null;
  onClose: () => void;
  onSave: (payload: UpsertPriceRulePayload) => Promise<{ success: boolean; error?: string }>;
}

export function PriceRuleModal({
  isOpen,
  listingId,
  initialRule,
  onClose,
  onSave,
}: PriceRuleModalProps) {
  const t = useTranslations("pricing.modal");

  const formatInputMoney = (val: number | string) => {
    const digits = String(val).replace(/\D/g, "");
    if (!digits) return "";
    const num = parseInt(digits, 10);
    return isNaN(num) ? "" : num.toLocaleString("vi-VN");
  };

  const [type, setType] = useState<PriceRuleType>("HOLIDAY");
  const [name, setName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nightlyPrice, setNightlyPrice] = useState<string>("1.800.000");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialRule) {
      setType(initialRule.type);
      setName(initialRule.name);
      setDateFrom(initialRule.dateFrom);
      setDateTo(initialRule.dateTo);
      setNightlyPrice(formatInputMoney(initialRule.nightlyPrice));
    } else {
      setType("HOLIDAY");
      setName("");
      // Default from tomorrow to +7 days
      const now = new Date();
      now.setDate(now.getDate() + 1);
      const fromStr = now.toISOString().split("T")[0];
      now.setDate(now.getDate() + 6);
      const toStr = now.toISOString().split("T")[0];

      setDateFrom(fromStr);
      setDateTo(toStr);
      setNightlyPrice("1.800.000");
    }
    setErrorMsg(null);
  }, [initialRule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const priceNum = parseInt(nightlyPrice.replace(/\D/g, ""), 10);

    const resolvedName = name.trim() || (type === "HOLIDAY" ? t("defaultNameHoliday") : type === "SEASON" ? t("defaultNameSeason") : t("defaultNameSpecial"));

    const values = {
      id: initialRule?.id,
      listingId,
      type: type as "SEASON" | "HOLIDAY" | "SPECIAL",
      name: resolvedName,
      dateFrom,
      dateTo,
      nightlyPrice: priceNum,
    };

    const parsed = priceRuleSchema.safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      setErrorMsg(firstIssue || "Thông tin quy tắc chưa hợp lệ");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSave(values);
      if (!res.success) {
        setErrorMsg(res.error || "Không thể lưu quy tắc giá");
        return;
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi lưu quy tắc giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label={initialRule ? t("editTitle") : t("addTitle")}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {initialRule ? t("editTitle") : t("addTitle")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rule Type Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">
              {t("ruleTypeLabel")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("HOLIDAY")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  type === "HOLIDAY"
                    ? "border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold ring-1 ring-red-500"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-[var(--color-text-secondary)]"
                }`}
              >
                <Sparkles className="w-4 h-4 text-red-500" />
                <span className="text-xs">{t("typeHoliday")}</span>
                <span className="text-[10px] opacity-75">{t("tier1Badge")}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("SEASON")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  type === "SEASON"
                    ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-[var(--color-text-secondary)]"
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs">{t("typeSeason")}</span>
                <span className="text-[10px] opacity-75">{t("tier2Badge")}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("SPECIAL")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  type === "SPECIAL"
                    ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-500"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-[var(--color-text-secondary)]"
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-xs">{t("typeSpecial")}</span>
                <span className="text-[10px] opacity-75">{t("tier1Badge")}</span>
              </button>
            </div>
          </div>

          {/* Rule Name */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              {t("ruleNameLabel")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ruleNamePlaceholder")}
              maxLength={60}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Date Range: From -> To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                {t("dateFromLabel")}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                {t("dateToLabel")}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Nightly Price Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
              {t("nightlyPriceLabel")}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={nightlyPrice}
                onChange={(e) => setNightlyPrice(formatInputMoney(e.target.value))}
                className="w-full px-3 py-2.5 text-base font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                placeholder="1.800.000"
              />
              <span className="absolute right-3.5 top-2.5 text-sm text-[var(--color-text-tertiary)] font-bold">
                ₫ / {t("night")}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-[11px] text-[var(--color-text-secondary)] space-y-1">
            <div className="font-semibold text-[var(--color-text-primary)]">
              {t("hierarchyTipTitle")}:
            </div>
            <p>{t("hierarchyTipText")}</p>
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              {t("cancelBtn")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? t("saving") : t("saveBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
