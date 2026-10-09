"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDay, StayRules } from "../types";
import {
  Ban,
  CheckCircle2,
  CalendarDays,
  Settings2,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";

interface CalendarActionDrawerProps {
  selectedDates: string[]; // YYYY-MM-DD
  daysMap: Map<string, CalendarDay>;
  rules: StayRules;
  isReadOnly?: boolean;
  onBlock: (nights: string[], reason?: string) => Promise<void>;
  onUnblock: (nights: string[]) => Promise<void>;
  onClearSelection: () => void;
  onOpenRulesModal: () => void;
}

export function CalendarActionDrawer({
  selectedDates,
  daysMap,
  rules,
  isReadOnly = false,
  onBlock,
  onUnblock,
  onClearSelection,
  onOpenRulesModal,
}: CalendarActionDrawerProps) {
  const t = useTranslations("calendar.actionPanel");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phân tích các ngày đã chọn
  const selectedDayItems = selectedDates
    .map((dateStr) => daysMap.get(dateStr))
    .filter((d): d is CalendarDay => Boolean(d));

  const totalSelected = selectedDayItems.length;

  const validAvailable = selectedDayItems.filter((d) => d.state === "AVAILABLE");
  const validBlocked = selectedDayItems.filter((d) => d.state === "BLOCKED");
  const unmodifiableBooked = selectedDayItems.filter(
    (d) => d.state === "BOOKED" || d.state === "HOLD" || d.state === "PENDING_HOST" || d.state === "PAST"
  );

  const canBlock = validAvailable.length > 0;
  const canUnblock = validBlocked.length > 0;

  // Format date range string (vd: Đêm 14 - 16/12)
  const formatSelectedSummary = () => {
    if (totalSelected === 0) return t("noSelection");
    if (totalSelected === 1) {
      const [y, m, d] = selectedDates[0].split("-");
      return t("singleNight", { date: `${d}/${m}/${y}` });
    }
    const sorted = [...selectedDates].sort();
    const first = sorted[0].split("-");
    const last = sorted[sorted.length - 1].split("-");
    return t("dateRangeSummary", {
      from: `${first[2]}/${first[1]}`,
      to: `${last[2]}/${last[1]}`,
      count: totalSelected,
    });
  };

  const handleBlock = async () => {
    if (validAvailable.length === 0 || isReadOnly) return;
    try {
      setIsSubmitting(true);
      await onBlock(
        validAvailable.map((d) => d.date),
        reason
      );
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblock = async () => {
    if (validBlocked.length === 0 || isReadOnly) return;
    try {
      setIsSubmitting(true);
      await onUnblock(validBlocked.map((d) => d.date));
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside
      data-testid="calendar-action-drawer"
      className="w-full lg:w-[360px] xl:w-[380px] shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-5 shadow-xs flex flex-col justify-between gap-6"
    >
      {/* Top Section: Selection & Actions */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {t("panelTitle")}
            </span>
          </div>
          {totalSelected > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t("clearSelection")}</span>
            </button>
          )}
        </div>

        {totalSelected === 0 ? (
          <div className="py-6 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-700 text-center space-y-2">
            <Info className="w-6 h-6 text-[var(--color-text-tertiary)] mx-auto" />
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
              {t("emptyHint")}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {t("emptySubHint")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {t("selectedTitle")}
              </div>
              <div className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                {formatSelectedSummary()}
              </div>

              {unmodifiableBooked.length > 0 && (
                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    {t("mixedNotice", {
                      valid: validAvailable.length + validBlocked.length,
                      skipped: unmodifiableBooked.length,
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Optional Reason for block */}
            {canBlock && !isReadOnly && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  {t("reasonLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("reasonPlaceholder")}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              {canBlock && (
                <button
                  type="button"
                  onClick={handleBlock}
                  disabled={isSubmitting || isReadOnly}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>
                    {t("blockBtn", { count: validAvailable.length })}
                  </span>
                </button>
              )}

              {canUnblock && (
                <button
                  type="button"
                  onClick={handleUnblock}
                  disabled={isSubmitting || isReadOnly}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {t("unblockBtn", { count: validBlocked.length })}
                  </span>
                </button>
              )}

              {isReadOnly && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                  {t("readOnlyListingWarning")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Stay Rules summary */}
      <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <h4 className="text-xs font-bold text-[var(--color-text-primary)]">
              {t("stayRulesTitle")}
            </h4>
          </div>
          <button
            type="button"
            onClick={onOpenRulesModal}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            {t("editRules")}
          </button>
        </div>

        <div className="text-xs space-y-1.5 text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-between">
            <span>{t("minMaxNights")}:</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {rules.minNights} - {rules.maxNights} {t("nightsUnit")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>{t("prepTime")}:</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {rules.prepNights === 0 ? t("noPrep") : `${rules.prepNights} ${t("nightsUnit")}`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>{t("minNotice")}:</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {rules.minNoticeHours === 0 ? t("sameDay") : `${rules.minNoticeHours}h`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>{t("maxAdvance")}:</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {rules.maxAdvanceMonths} {t("monthsUnit")}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-[var(--color-text-tertiary)] pt-1">
          {t("rulesNotice")}
        </p>
      </div>
    </aside>
  );
}
