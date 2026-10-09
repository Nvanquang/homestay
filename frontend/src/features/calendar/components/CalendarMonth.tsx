"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CalendarDay } from "../types";
import { formatMoney } from "@/lib/format";
import { ChevronLeft, ChevronRight, Clock, AlertCircle, ShieldCheck } from "lucide-react";

interface CalendarMonthProps {
  year: number;
  month: number; // 1-12
  days: CalendarDay[];
  todayStr: string; // YYYY-MM-DD
  timezone: string;
  selectedDates: string[]; // YYYY-MM-DD
  conflictDates?: string[]; // Ngày bị xung đột 409
  isReadOnly?: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectDate: (dateStr: string) => void;
  onRangeSelect: (startDateStr: string, endDateStr: string) => void;
  onBookingClick: (day: CalendarDay) => void;
  onQuickToggle?: (day: CalendarDay) => void;
}

export function CalendarMonth({
  year,
  month,
  days,
  todayStr,
  timezone,
  selectedDates,
  conflictDates = [],
  isReadOnly = false,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate,
  onRangeSelect,
  onBookingClick,
  onQuickToggle,
}: CalendarMonthProps) {
  const t = useTranslations("calendar");

  const weekdays = [
    t("daysOfWeek.mon"),
    t("daysOfWeek.tue"),
    t("daysOfWeek.wed"),
    t("daysOfWeek.thu"),
    t("daysOfWeek.fri"),
    t("daysOfWeek.sat"),
    t("daysOfWeek.sun"),
  ];

  // Tính số ô trống trước ngày 1 của tháng (Thứ 2 là ngày bắt đầu tuần, index 0)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  // In JS: 0=Sun, 1=Mon, ..., 6=Sat.
  // Nếu là CN (0) -> offset 6, nếu T2 (1) -> offset 0.
  const emptyDaysOffset = (firstDayOfMonth + 6) % 7;

  // Selected set để lookup O(1)
  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);
  const conflictSet = useMemo(() => new Set(conflictDates), [conflictDates]);

  const handleCellClick = (day: CalendarDay, e: React.MouseEvent) => {
    if (day.state === "PAST") return;

    if (day.state === "BOOKED" || day.state === "HOLD" || day.state === "PENDING_HOST") {
      onBookingClick(day);
      return;
    }

    if (isReadOnly) return;

    // Shift + Click để chọn khoảng
    if (e.shiftKey && selectedDates.length > 0) {
      onRangeSelect(selectedDates[selectedDates.length - 1], day.date);
    } else {
      onSelectDate(day.date);
    }
  };

  return (
    <div
      data-testid="calendar-month-view"
      className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-5 shadow-xs flex-1 flex flex-col justify-between"
    >
      {/* Calendar Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4 mb-4">
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

        {/* Timezone chip */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] text-[var(--color-text-secondary)]">
          <Clock className="w-3 h-3 text-primary" />
          <span>{t("timezoneChip", { tz: timezone })}</span>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[var(--color-text-tertiary)] pb-2">
        {weekdays.map((dayName, idx) => (
          <div key={idx} className="py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[360px]">
        {/* Empty placeholder cells for previous month offset */}
        {Array.from({ length: emptyDaysOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-20 sm:h-24 rounded-xl bg-gray-50/40 dark:bg-gray-900/20 border border-transparent opacity-40 select-none"
          />
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const isSelected = selectedSet.has(day.date);
          const isConflict = conflictSet.has(day.date);
          const isToday = day.date === todayStr;
          const dayNumber = parseInt(day.date.split("-")[2], 10);

          // Render style classes based on state
          let cellStyle = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50";
          let textColor = "text-[var(--color-text-primary)]";
          let badgeText: string | null = null;
          let badgeClass = "";

          if (day.state === "PAST") {
            cellStyle =
              "bg-gray-100/60 dark:bg-gray-900/40 border-transparent opacity-40 cursor-not-allowed select-none";
            textColor = "text-gray-400 dark:text-gray-500";
          } else if (day.state === "BOOKED") {
            cellStyle =
              "bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 border-transparent cursor-pointer shadow-xs";
            textColor = "text-white dark:text-slate-900 font-semibold";
            badgeText = t("legend.booked");
            badgeClass = "bg-slate-800/80 dark:bg-slate-200/90 text-white dark:text-slate-900";
          } else if (day.state === "HOLD") {
            cellStyle =
              "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 cursor-pointer";
            textColor = "text-amber-900 dark:text-amber-200";
            badgeText = t("legend.hold");
            badgeClass = "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200";
          } else if (day.state === "PENDING_HOST") {
            cellStyle =
              "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 cursor-pointer";
            textColor = "text-purple-900 dark:text-purple-200";
            badgeText = t("legend.pendingHost");
            badgeClass = "bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200";
          } else if (day.state === "BLOCKED") {
            cellStyle =
              "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(156,163,175,0.25)_4px,rgba(156,163,175,0.25)_8px)] cursor-pointer";
            textColor = "text-gray-700 dark:text-gray-300";
            badgeText = t("legend.blocked");
            badgeClass = "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
          } else {
            // AVAILABLE
            cellStyle = "cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/50";
          }

          return (
            <div
              key={day.date}
              data-testid={`calendar-day-${day.date}`}
              data-state={day.state}
              data-selected={isSelected}
              onClick={(e) => handleCellClick(day, e)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isReadOnly && (day.state === "AVAILABLE" || day.state === "BLOCKED")) {
                  onQuickToggle?.(day);
                }
              }}
              title={
                day.state === "AVAILABLE" && !isReadOnly
                  ? "Nhấp để chọn · Nhấp đúp để Chặn nhanh"
                  : day.state === "BLOCKED" && !isReadOnly
                  ? "Nhấp để chọn · Nhấp đúp để Mở nhanh"
                  : undefined
              }
              className={`relative h-20 sm:h-24 p-2 rounded-xl border transition-all flex flex-col justify-between select-none ${cellStyle} ${
                isSelected
                  ? "!ring-2 !ring-primary !border-primary bg-primary/10 dark:bg-primary/20"
                  : ""
              } ${
                isConflict
                  ? "!ring-2 !ring-red-500 !border-red-500 animate-pulse bg-red-50 dark:bg-red-950/40"
                  : ""
              } ${day.isPrepBuffer ? "border-dashed !border-blue-400" : ""}`}
            >
              {/* Top row: Day Number + Today / Rules indicator */}
              <div className="flex items-start justify-between">
                <span
                  className={`text-xs sm:text-sm font-semibold rounded-md px-1 ${textColor} ${
                    isToday ? "bg-primary text-white" : ""
                  }`}
                >
                  {dayNumber}
                </span>

                <div className="flex items-center gap-1">
                  {day.isOutsideBookingRules && (
                    <span
                      title={t("outsideRulesTooltip")}
                      className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500"
                    />
                  )}
                  {day.isPrepBuffer && (
                    <span
                      title={t("prepBufferTooltip")}
                      className="text-[10px] text-blue-500 font-bold"
                    >
                      ~
                    </span>
                  )}
                </div>
              </div>

              {/* Middle / Bottom row: Badge or Price or Quick Action Button */}
              <div className="mt-auto space-y-1">
                {isSelected && !isReadOnly && (day.state === "AVAILABLE" || day.state === "BLOCKED") ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickToggle?.(day);
                    }}
                    className={`w-full text-[10px] font-bold py-1 px-1 rounded-lg shadow-xs transition-transform active:scale-95 cursor-pointer ${
                      day.state === "AVAILABLE"
                        ? "bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {day.state === "AVAILABLE" ? t("actionPanel.blockBtn", { count: 1 }) : t("actionPanel.unblockBtn", { count: 1 })}
                  </button>
                ) : badgeText ? (
                  <div
                    className={`text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-sm truncate ${badgeClass}`}
                  >
                    {badgeText}
                  </div>
                ) : day.state === "AVAILABLE" && day.price ? (
                  <div className="text-[10px] sm:text-[11px] font-medium text-[var(--color-text-secondary)] truncate">
                    {formatMoney(day.price, "VND")}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
