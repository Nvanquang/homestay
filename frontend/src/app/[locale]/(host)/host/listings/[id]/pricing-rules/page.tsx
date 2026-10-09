"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  DollarSign,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  PricingHierarchyStepper,
  BaselinePricingCard,
  PriceRulesTable,
  PriceRuleModal,
  PriceCalendarView,
  PriceRule,
  PricingRulesOverview,
  CalendarPriceDay,
  UpsertPriceRulePayload,
  getPricingRulesOverview,
  upsertPriceRule,
  deletePriceRule,
  updateWeekendPrice,
  getPriceCalendar,
} from "@/features/pricing";
import { SaveIndicator, SaveStatus } from "@/features/listing-editor/components/SaveIndicator";

export default function PricingRulesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const isEn = locale === "en";

  const t = useTranslations("pricing");
  const tToast = useTranslations("pricing.toast");

  // Overview data
  const [overview, setOverview] = useState<PricingRulesOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Calendar data
  const currentDate = new Date();
  const [calendarYear, setCalendarYear] = useState(currentDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(currentDate.getMonth() + 1);
  const [calendarDays, setCalendarDays] = useState<CalendarPriceDay[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);

  // Auto-save states
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Fetch overview data
  const loadOverview = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setIsError(false);
      try {
        const data = await getPricingRulesOverview(id, locale);
        setOverview(data);
      } catch {
        setIsError(true);
        toast.error(isEn ? "Failed to load pricing rules" : "Không thể tải danh sách quy tắc giá");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [id, locale, isEn]
  );

  // Fetch calendar prices
  const loadCalendarPrices = useCallback(
    async () => {
      setIsCalendarLoading(true);
      const ym = `${calendarYear}-${String(calendarMonth).padStart(2, "0")}`;
      try {
        const days = await getPriceCalendar(id, ym, locale);
        setCalendarDays(days);
      } catch {
        // ignore
      } finally {
        setIsCalendarLoading(false);
      }
    },
    [id, calendarYear, calendarMonth, locale]
  );

  useEffect(() => {
    loadOverview(true);
  }, [loadOverview]);

  useEffect(() => {
    loadCalendarPrices();
  }, [loadCalendarPrices]);

  // Handler: Update weekend price
  const handleSaveWeekendPrice = async (price: number) => {
    setSaveStatus("saving");
    try {
      const res = await updateWeekendPrice(id, price);
      setOverview((prev) =>
        prev ? { ...prev, weekendNightlyPrice: res.weekendNightlyPrice } : prev
      );
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      toast.success(tToast("saveWeekendSuccess"));
      loadCalendarPrices(); // Refresh calendar to reflect new weekend rate
    } catch {
      setSaveStatus("error");
      toast.error(isEn ? "Failed to save weekend price" : "Không thể lưu giá cuối tuần");
    }
  };

  // Handler: Save rule (Add / Edit)
  const handleSaveRule = async (payload: UpsertPriceRulePayload) => {
    setSaveStatus("saving");
    try {
      const res = await upsertPriceRule(payload);
      if (!res.success) {
        setSaveStatus("error");
        return { success: false, error: res.error };
      }

      setSaveStatus("saved");
      setLastSavedAt(new Date());
      toast.success(tToast("saveRuleSuccess"));
      loadOverview(false);
      loadCalendarPrices();
      return { success: true };
    } catch (err: any) {
      setSaveStatus("error");
      return { success: false, error: err.message };
    }
  };

  // Handler: Delete rule
  const handleDeleteRule = async (ruleId: string) => {
    setSaveStatus("saving");
    try {
      await deletePriceRule(id, ruleId);
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      toast.success(tToast("deleteRuleSuccess"));
      loadOverview(false);
      loadCalendarPrices();
    } catch {
      setSaveStatus("error");
      toast.error(isEn ? "Failed to delete rule" : "Lỗi khi xóa quy tắc");
    }
  };

  // Calendar month navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth() + 1);
  };

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
                {overview?.listingTitle || (isEn ? "Pricing Rules" : "Quy tắc giá")}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                H08 · {t("pageTitle")}
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs + Save Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs switcher: [Lịch] & [Giá theo mùa] */}
            <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-[var(--color-border-subtle)]">
              <Link
                href={`/${locale}/host/listings/${id}/calendar`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{t("tabCalendar")}</span>
              </Link>
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-700 text-[var(--color-text-primary)] shadow-2xs flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span>{t("tabPricingRules")}</span>
              </span>
            </div>

            <SaveIndicator
              status={saveStatus}
              lastSavedAt={lastSavedAt}
              onRetry={() => loadOverview(false)}
            />

            <button
              type="button"
              onClick={() => {
                loadOverview(true);
                loadCalendarPrices();
              }}
              aria-label="Refresh pricing rules"
              title={isEn ? "Refresh" : "Làm mới"}
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content sections */}
        {isLoading && !overview ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-xs text-[var(--color-text-secondary)]">
              {isEn ? "Loading pricing rules..." : "Đang tải dữ liệu quy tắc giá..."}
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] p-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {isEn ? "Could not load pricing rules." : "Không thể tải dữ liệu quy tắc giá."}
            </p>
            <button
              type="button"
              onClick={() => loadOverview(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm"
            >
              {isEn ? "Try again" : "Thử lại"}
            </button>
          </div>
        ) : overview ? (
          <div className="space-y-6">
            {/* 1. Hierarchy Stepper */}
            <PricingHierarchyStepper />

            {/* 2. Baseline & Weekend Rates */}
            <BaselinePricingCard
              listingId={id}
              locale={locale}
              baseNightlyPrice={overview.baseNightlyPrice}
              weekendNightlyPrice={overview.weekendNightlyPrice}
              onSaveWeekendPrice={handleSaveWeekendPrice}
            />

            {/* 3. Price Rules Table */}
            <PriceRulesTable
              rules={overview.rules}
              locale={locale}
              onAddRule={() => {
                setEditingRule(null);
                setIsModalOpen(true);
              }}
              onEditRule={(rule) => {
                setEditingRule(rule);
                setIsModalOpen(true);
              }}
              onDeleteRule={handleDeleteRule}
            />

            {/* 4. Pricing Calendar by Month */}
            <PriceCalendarView
              year={calendarYear}
              month={calendarMonth}
              calendarDays={calendarDays}
              locale={locale}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
          </div>
        ) : null}

        {/* Modal Add / Edit Price Rule */}
        <PriceRuleModal
          isOpen={isModalOpen}
          listingId={id}
          initialRule={editingRule}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRule(null);
          }}
          onSave={handleSaveRule}
        />
      </div>
    </div>
  );
}
