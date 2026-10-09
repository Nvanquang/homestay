"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { StayRules } from "../types";
import { stayRulesSchema } from "../schemas";
import { X, Clock, CalendarDays, ShieldAlert, Sparkles } from "lucide-react";

interface StayRulesModalProps {
  isOpen: boolean;
  initialRules: StayRules;
  onClose: () => void;
  onSave: (rules: StayRules) => Promise<void>;
}

export function StayRulesModal({
  isOpen,
  initialRules,
  onClose,
  onSave,
}: StayRulesModalProps) {
  const t = useTranslations("calendar.rulesModal");
  const [minNights, setMinNights] = useState(initialRules.minNights);
  const [maxNights, setMaxNights] = useState(initialRules.maxNights);
  const [prepNights, setPrepNights] = useState(initialRules.prepNights);
  const [minNoticeHours, setMinNoticeHours] = useState(initialRules.minNoticeHours);
  const [maxAdvanceMonths, setMaxAdvanceMonths] = useState(initialRules.maxAdvanceMonths);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const values = {
      minNights,
      maxNights,
      prepNights,
      minNoticeHours,
      maxAdvanceMonths,
    };

    const parsed = stayRulesSchema.safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      setErrorMsg(firstIssue || "Thông tin quy tắc chưa hợp lệ");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(values);
      onClose();
    } catch {
      setErrorMsg("Không thể lưu quy tắc. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {t("title")}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Min & Max nights */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {t("minNights")}
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={minNights}
                onChange={(e) => setMinNights(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {t("maxNights")}
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={maxNights}
                onChange={(e) => setMaxNights(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Prep nights */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              {t("prepNights")}
            </label>
            <select
              value={prepNights}
              onChange={(e) => setPrepNights(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value={0}>{t("noPrep")}</option>
              <option value={1}>{t("oneNightPrep")}</option>
              <option value={2}>{t("twoNightsPrep")}</option>
            </select>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
              {t("prepHint")}
            </p>
          </div>

          {/* Advance notice & Max advance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {t("minNotice")}
              </label>
              <select
                value={minNoticeHours}
                onChange={(e) => setMinNoticeHours(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value={0}>{t("noticeSameDay")}</option>
                <option value={24}>{t("notice1Day")}</option>
                <option value={48}>{t("notice2Days")}</option>
                <option value={72}>{t("notice3Days")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {t("maxAdvance")}
              </label>
              <select
                value={maxAdvanceMonths}
                onChange={(e) => setMaxAdvanceMonths(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value={3}>{t("months3")}</option>
                <option value={6}>{t("months6")}</option>
                <option value={9}>{t("months9")}</option>
                <option value={12}>{t("months12")}</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text-primary)]">
              {t("importantNoticeTitle")}:
            </span>{" "}
            {t("importantNoticeText")}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-[var(--color-text-primary)] transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
