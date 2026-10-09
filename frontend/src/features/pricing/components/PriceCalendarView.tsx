"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarPriceDay, PriceSource } from "../types";
import { formatMoney } from "@/lib/format";
import { ChevronLeft, ChevronRight, Sparkles, Sun, Calendar, ShieldCheck, X } from "lucide-react";

interface PriceCalendarViewProps {
  year: number;
  month: number;
  calendarDays: CalendarPriceDay[];
  locale: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function PriceCalendarView({
  year,
  month,
  calendarDays,
  locale,
  onPrevMonth,
  onNextMonth,
  onToday,
}: PriceCalendarViewProps) {
  const t = useTranslations("pricing.calendar");
  const [selectedDay, setSelectedDay] = useState<CalendarPriceDay | null>(null);

  const weekdays = [
    t("daysOfWeek.mon"),
    t("daysOfWeek.tue"),
    t("daysOfWeek.wed"),
    t("daysOfWeek.thu"),
    t("daysOfWeek.fri"),
    t("daysOfWeek.sat"),
    t("daysOfWeek.sun"),
  ];

  // Tính số ô trống trước ngày 1 của tháng (Thứ 2 là ngày bắt đầu tuần, offset)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const emptyDaysOffset = (firstDayOfMonth + 6) % 7;

  const getSourceIndicator = (source: PriceSource) => {
    switch (source) {
      case "HOLIDAY":
      case "SPECIAL":
        return {
          dotClass: "bg-red-500",
          badgeClass: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
          text: t("sourceHoliday"),
        };
      case "SEASON":
        return {
          dotClass: "bg-amber-500",
          badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
          text: t("sourceSeason"),
        };
      case "WEEKEND":
        return {
          dotClass: "bg-purple-500",
          badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
          text: t("sourceWeekend"),
        };
      case "BASE":
      default:
        return {
          dotClass: "bg-blue-400",
          badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          text: t("sourceBase"),
        };
    }
  };

  return (
    <div
      data-testid="price-calendar-view"
      className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-5 shadow-xs space-y-4"
    >
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={onPrevMonth}
              aria-label={t("prevMonth")}
              className="p-1.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              aria-label={t("nextMonth")}
              className="p-1.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] px-1">
            {t("monthYear", { month: String(month).padStart(2, "0"), year })}
          </h3>

          <button
            type="button"
            onClick={onToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-[var(--color-text-secondary)] transition-colors cursor-pointer"
          >
            {t("todayBtn")}
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>{t("legendHoliday")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{t("legendSeason")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>{t("legendWeekend")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>{t("legendBase")}</span>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[var(--color-text-tertiary)] pb-1">
        {weekdays.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 min-h-[300px]">
        {/* Placeholder cells for offset */}
        {Array.from({ length: emptyDaysOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-16 sm:h-20 rounded-xl bg-gray-50/40 dark:bg-gray-900/20 border border-transparent opacity-40 select-none"
          />
        ))}

        {/* Days */}
        {calendarDays.map((day) => {
          const dayNumber = parseInt(day.date.split("-")[2], 10);
          const indicator = getSourceIndicator(day.source);
          const isSelected = selectedDay?.date === day.date;

          return (
            <div
              key={day.date}
              data-testid={`price-day-${day.date}`}
              onClick={() => setSelectedDay(day)}
              className={`relative h-16 sm:h-20 p-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-all flex flex-col justify-between cursor-pointer hover:border-primary/50 select-none ${
                day.isPast ? "opacity-50 bg-gray-50 dark:bg-gray-900/40" : "bg-white dark:bg-gray-800"
              } ${isSelected ? "!ring-2 !ring-primary !border-primary bg-primary/5" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {dayNumber}
                </span>
                <span className={`w-2 h-2 rounded-full ${indicator.dotClass}`} />
              </div>

              <div className="mt-auto">
                <div className="text-[11px] sm:text-xs font-bold text-[var(--color-text-primary)] truncate">
                  {formatMoney(day.price, "VND", locale)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Price Detail Popover/Banner when clicked */}
      {selectedDay && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                getSourceIndicator(selectedDay.source).dotClass
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {t("dayDetailPrefix", { date: selectedDay.date })}
              </div>
              <div className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <span>{formatMoney(selectedDay.price, "VND", locale)} / {t("night")}</span>
                <span className="text-xs font-normal text-[var(--color-text-secondary)]">
                  • {t("sourcePrefix")}: <strong>{selectedDay.sourceName}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
