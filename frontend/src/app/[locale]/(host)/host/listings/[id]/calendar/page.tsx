"use client";

import React, { useState, useEffect, useCallback, useMemo, use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Ban,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  CalendarMonth,
  CalendarLegend,
  CalendarActionDrawer,
  BookingInfoPopover,
  StayRulesModal,
  CalendarMonthData,
  CalendarDay,
  StayRules,
  getCalendarData,
  blockDates,
  unblockDates,
  updateStayRules,
} from "@/features/calendar";
import { SaveIndicator, SaveStatus } from "@/features/listing-editor/components/SaveIndicator";

export default function ListingCalendarPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const isEn = locale === "en";

  const t = useTranslations("calendar");
  const tToast = useTranslations("calendar.toast");

  // Current viewed Month state
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);

  // Data states
  const [data, setData] = useState<CalendarMonthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Selection states
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [conflictDates, setConflictDates] = useState<string[]>([]);

  // Popover & Modal states
  const [activeBookingDay, setActiveBookingDay] = useState<CalendarDay | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Auto-save & Polling states
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Map ngày để truy xuất O(1)
  const daysMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    if (data?.days) {
      for (const d of data.days) {
        map.set(d.date, d);
      }
    }
    return map;
  }, [data]);

  // Fetch month data
  const loadData = useCallback(
    async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setIsLoading(true);
      setIsError(false);

      const yearMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
      try {
        const res = await getCalendarData(id, yearMonth, locale);
        setData(res);
        setSaveStatus("idle");
      } catch {
        setIsError(true);
        toast.error(isEn ? "Failed to load calendar data" : "Không thể tải dữ liệu lịch");
      } finally {
        if (showLoadingSpinner) setIsLoading(false);
      }
    },
    [id, currentYear, currentMonth, locale, isEn]
  );

  // Initial fetch and on month change
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Keyboard shortcut: Esc to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDates([]);
        setActiveBookingDay(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Polling every 60s when tab is active + window focus refetch
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadData(false);
      }
    }, 60000);

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        loadData(false);
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [loadData]);

  // Navigate months
  const handlePrevMonth = () => {
    setSelectedDates([]);
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDates([]);
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setSelectedDates([]);
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  // Date selection handlers
  const handleSelectDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleRangeSelect = (startDateStr: string, endDateStr: string) => {
    if (!data?.days) return;
    const sorted = [startDateStr, endDateStr].sort();
    const [start, end] = sorted;

    const inRange = data.days
      .filter((d) => d.date >= start && d.date <= end && d.state !== "PAST")
      .map((d) => d.date);

    setSelectedDates(Array.from(new Set(inRange)));
  };

  // Optimistic Block Handler
  const handleBlock = async (nights: string[], reason?: string) => {
    if (!data) return;

    // Save previous state for rollback
    const prevDays = [...data.days];

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) =>
          nights.includes(d.date) && d.state === "AVAILABLE"
            ? { ...d, state: "BLOCKED", note: reason || (isEn ? "Blocked by host" : "Chủ nhà chặn") }
            : d
        ),
      };
    });

    setSaveStatus("saving");

    try {
      const res = await blockDates({
        listingId: id,
        from: nights[0],
        to: nights[nights.length - 1],
        nights,
        reason,
      });

      if (!res.success) {
        // 409 Conflict handling
        setData((prev) => (prev ? { ...prev, days: prevDays } : prev));
        setSaveStatus("error");
        if (res.conflicts && res.conflicts.length > 0) {
          setConflictDates(res.conflicts);
          setTimeout(() => setConflictDates([]), 3000);
        }
        toast.error(tToast("conflictError"));
        loadData(false);
        return;
      }

      setSaveStatus("saved");
      setLastSavedAt(new Date());
      setSelectedDates([]);

      const summary = `${nights[0]} → ${nights[nights.length - 1]}`;
      toast.success(tToast("blockSuccess", { count: nights.length, summary }), {
        action: {
          label: tToast("undoBtn"),
          onClick: () => handleUnblock(nights),
        },
        duration: 5000,
      });
    } catch {
      setData((prev) => (prev ? { ...prev, days: prevDays } : prev));
      setSaveStatus("error");
      toast.error(isEn ? "Failed to block dates" : "Không thể chặn ngày");
    }
  };

  // Optimistic Unblock Handler
  const handleUnblock = async (nights: string[]) => {
    if (!data) return;

    const prevDays = [...data.days];

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) =>
          nights.includes(d.date) && d.state === "BLOCKED"
            ? { ...d, state: "AVAILABLE", note: undefined }
            : d
        ),
      };
    });

    setSaveStatus("saving");

    try {
      const res = await unblockDates({
        listingId: id,
        from: nights[0],
        to: nights[nights.length - 1],
        nights,
      });

      if (!res.success) {
        setData((prev) => (prev ? { ...prev, days: prevDays } : prev));
        setSaveStatus("error");
        toast.error(isEn ? "Failed to unblock dates" : "Không thể mở ngày");
        return;
      }

      setSaveStatus("saved");
      setLastSavedAt(new Date());
      setSelectedDates([]);

      const summary = `${nights[0]} → ${nights[nights.length - 1]}`;
      toast.success(tToast("unblockSuccess", { count: nights.length, summary }), {
        action: {
          label: tToast("undoBtn"),
          onClick: () => handleBlock(nights),
        },
        duration: 5000,
      });
    } catch {
      setData((prev) => (prev ? { ...prev, days: prevDays } : prev));
      setSaveStatus("error");
      toast.error(isEn ? "Failed to unblock dates" : "Không thể mở ngày");
    }
  };

  // Save Stay Rules
  const handleSaveStayRules = async (rules: StayRules) => {
    try {
      const updated = await updateStayRules(id, rules);
      setData((prev) => (prev ? { ...prev, rules: updated } : prev));
      toast.success(tToast("rulesSuccess"));
    } catch {
      toast.error(isEn ? "Failed to update stay rules" : "Lỗi khi lưu quy tắc lưu trú");
      throw new Error();
    }
  };

  // Quick toggle (Double click hoặc nút trên ô)
  const handleQuickToggle = async (day: CalendarDay) => {
    if (isReadOnly) return;
    if (day.state === "AVAILABLE") {
      await handleBlock([day.date]);
    } else if (day.state === "BLOCKED") {
      await handleUnblock([day.date]);
    }
  };

  const isReadOnly = data?.listingStatus === "LOCKED";
  const isUnpublished =
    data?.listingStatus === "DRAFT" ||
    data?.listingStatus === "PENDING_APPROVAL" ||
    data?.listingStatus === "PENDING_REVIEW";

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href={`/${locale}/host/listings`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("backToListings")}</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {data?.listingTitle || (isEn ? "Listing Calendar" : "Lịch chỗ nghỉ")}
              </h1>
              {data && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)]">
                  {data.listingStatus}
                </span>
              )}
            </div>
          </div>

          {/* Sub Navigation Tabs + Save Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs switcher: [Lịch] & [Giá theo mùa] */}
            <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-[var(--color-border-subtle)]">
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-700 text-[var(--color-text-primary)] shadow-2xs flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                <span>{t("tabCalendar")}</span>
              </span>
              <Link
                href={`/${locale}/host/listings/${id}/pricing-rules`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{t("tabPricingRules")}</span>
              </Link>
            </div>

            <SaveIndicator
              status={saveStatus}
              lastSavedAt={lastSavedAt}
              onRetry={() => loadData(false)}
            />

            <button
              type="button"
              onClick={() => loadData(true)}
              aria-label="Refresh calendar"
              title={isEn ? "Refresh" : "Làm mới"}
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status notice banners */}
        {isReadOnly ? (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                {t("readOnlyBannerTitle")}
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                {t("readOnlyBannerDesc")}
              </p>
            </div>
          </div>
        ) : isUnpublished ? (
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                {isEn ? "Draft / Pending listing mode" : "Chỗ nghỉ đang ở chế độ Nháp / Chờ duyệt"}
              </h3>
              <p className="text-xs text-blue-800/80 dark:text-blue-300 mt-0.5">
                {isEn
                  ? "This listing is not public yet, but you can freely manage your calendar and block dates in advance."
                  : "Chỗ nghỉ chưa hiển thị công khai cho khách đặt, nhưng bạn hoàn toàn có thể thiết lập lịch và chặn trước các ngày bận."}
              </p>
            </div>
          </div>
        ) : null}

        {/* Legend */}
        <CalendarLegend />

        {/* Main Calendar View & Action Drawer */}
        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-xs text-[var(--color-text-secondary)]">
              {isEn ? "Loading calendar data..." : "Đang tải dữ liệu lịch..."}
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {isEn ? "Could not load calendar." : "Không thể tải dữ liệu lịch."}
            </p>
            <button
              type="button"
              onClick={() => loadData(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm"
            >
              {isEn ? "Try again" : "Thử lại"}
            </button>
          </div>
        ) : data ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: Calendar Month Grid CMP-23 */}
            <CalendarMonth
              year={currentYear}
              month={currentMonth}
              days={data.days}
              todayStr={data.today}
              timezone={data.timezone}
              selectedDates={selectedDates}
              conflictDates={conflictDates}
              isReadOnly={isReadOnly}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
              onSelectDate={handleSelectDate}
              onRangeSelect={handleRangeSelect}
              onBookingClick={(day) => setActiveBookingDay(day)}
              onQuickToggle={handleQuickToggle}
            />

            {/* Right: Action Panel & Stay Rules */}
            <CalendarActionDrawer
              selectedDates={selectedDates}
              daysMap={daysMap}
              rules={data.rules}
              isReadOnly={isReadOnly}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              onClearSelection={() => setSelectedDates([])}
              onOpenRulesModal={() => setIsRulesModalOpen(true)}
            />
          </div>
        ) : null}

        {/* Floating Sticky Quick Action Bar when dates are selected */}
        {selectedDates.length > 0 && !isReadOnly && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-300 dark:border-gray-700 shadow-2xl rounded-2xl p-2.5 sm:p-3 px-4 sm:px-6 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200 dark:border-gray-700">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {selectedDates.length === 1
                  ? t("actionPanel.singleNight", { date: selectedDates[0] })
                  : t("actionPanel.dateRangeSummary", {
                      from: selectedDates[0],
                      to: selectedDates[selectedDates.length - 1],
                      count: selectedDates.length,
                    })}
              </span>
            </div>

            {/* Nút Chặn */}
            {selectedDates.some((d) => daysMap.get(d)?.state === "AVAILABLE") && (
              <button
                type="button"
                onClick={() => {
                  const available = selectedDates.filter((d) => daysMap.get(d)?.state === "AVAILABLE");
                  if (available.length > 0) handleBlock(available);
                }}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>
                  {t("actionPanel.blockBtn", {
                    count: selectedDates.filter((d) => daysMap.get(d)?.state === "AVAILABLE").length,
                  })}
                </span>
              </button>
            )}

            {/* Nút Mở */}
            {selectedDates.some((d) => daysMap.get(d)?.state === "BLOCKED") && (
              <button
                type="button"
                onClick={() => {
                  const blocked = selectedDates.filter((d) => daysMap.get(d)?.state === "BLOCKED");
                  if (blocked.length > 0) handleUnblock(blocked);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {t("actionPanel.unblockBtn", {
                    count: selectedDates.filter((d) => daysMap.get(d)?.state === "BLOCKED").length,
                  })}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedDates([])}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors cursor-pointer"
            >
              {t("actionPanel.clearSelection")}
            </button>
          </div>
        )}

        {/* Popover chi tiết booking khi bấm ô đã đặt/giữ chỗ */}
        <BookingInfoPopover
          day={activeBookingDay}
          onClose={() => setActiveBookingDay(null)}
        />

        {/* Modal chỉnh sửa quy tắc lưu trú */}
        {data && (
          <StayRulesModal
            isOpen={isRulesModalOpen}
            initialRules={data.rules}
            onClose={() => setIsRulesModalOpen(false)}
            onSave={handleSaveStayRules}
          />
        )}
      </div>
    </div>
  );
}
