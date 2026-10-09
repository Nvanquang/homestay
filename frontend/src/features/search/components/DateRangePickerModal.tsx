"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Calendar as CalendarIcon, ArrowRight, X } from "lucide-react";

interface DateRangePickerProps {
  checkin: string;
  checkout: string;
  onChange: (checkin: string, checkout: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function DateRangePickerModal({
  checkin,
  checkout,
  onChange,
  isOpen,
  onOpen,
  onClose,
}: DateRangePickerProps) {
  const t = useTranslations("search.datePicker");

  const todayStr = new Date().toISOString().split("T")[0];

  const calculateNights = () => {
    if (!checkin || !checkout) return 0;
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const [y, m, d] = dStr.split("-");
    return `${d}/${m}`;
  };

  const displayText =
    checkin && checkout
      ? `${formatDisplayDate(checkin)} - ${formatDisplayDate(checkout)} (${nights} ${t("nights")})`
      : checkin
      ? `${formatDisplayDate(checkin)} - ...`
      : t("addDates");

  return (
    <div className="relative flex-1">
      <div
        onClick={onOpen}
        className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full cursor-pointer transition-colors ${
          isOpen ? "bg-white dark:bg-gray-800 shadow-md" : "hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
        }`}
      >
        <span className="block text-xs font-bold text-[var(--color-text-secondary)] tracking-wider">
          {t("label")}
        </span>
        <span className={`block text-sm font-semibold truncate ${checkin ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"}`}>
          {displayText}
        </span>
      </div>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[115%] w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl border border-[var(--color-border-subtle)] z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                {t("title")}
              </h4>
            </div>
            {(checkin || checkout) && (
              <button
                type="button"
                onClick={() => onChange("", "")}
                className="text-xs text-[var(--color-text-secondary)] hover:text-red-500 font-medium"
              >
                {t("clear")}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                {t("checkinLabel")}
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkin}
                onChange={(e) => {
                  const newIn = e.target.value;
                  if (checkout && newIn >= checkout) {
                    onChange(newIn, "");
                  } else {
                    onChange(newIn, checkout);
                  }
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                {t("checkoutLabel")}
              </label>
              <input
                type="date"
                min={checkin || todayStr}
                value={checkout}
                onChange={(e) => {
                  onChange(checkin, e.target.value);
                  if (checkin && e.target.value > checkin) {
                    onClose();
                  }
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text-primary)] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="p-3 rounded-xl bg-primary/5 text-primary text-xs font-semibold text-center mb-3">
              {t("stayDuration", { count: nights })}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
          >
            {t("applyBtn")}
          </button>
        </div>
      )}
    </div>
  );
}
