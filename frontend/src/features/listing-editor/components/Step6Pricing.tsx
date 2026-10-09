"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import {
  DollarSign,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Percent,
  CheckCircle2,
  CalendarRange,
} from "lucide-react";
import {
  PricingData,
  BookingRulesData,
  PricingPreviewParams,
  PricingPreviewResult,
} from "../types";
import { calculatePricingPreview } from "../api/mock-pricing";

export interface Step6PricingProps {
  data: PricingData;
  bookingRules?: BookingRulesData;
  maxGuests?: number;
  onChange: (updated: Partial<PricingData>) => void;
  errors?: Record<string, string>;
  isReadOnly?: boolean;
}

export function Step6Pricing({
  data,
  bookingRules,
  maxGuests = 4,
  onChange,
  errors = {},
  isReadOnly = false,
}: Step6PricingProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  const {
    baseNightlyPrice = 0,
    weekendNightlyPrice = 0,
    cleaningFee = 0,
    baseGuests = 2,
    extraGuestFee = 0,
    weeklyDiscountPct = 0,
    monthlyDiscountPct = 0,
    currency = "VND",
  } = data;

  // Format currency helper
  const formatMoney = (val: number) => {
    return val.toLocaleString(isEn ? "en-US" : "vi-VN");
  };

  // Preview state (Default: Check-in after 14 days, 3 nights)
  const defaultCheckIn = new Date(Date.now() + 14 * 86400 * 1000);
  const defaultCheckOut = new Date(defaultCheckIn.getTime() + 3 * 86400 * 1000);

  const [previewCheckIn, setPreviewCheckIn] = useState<string>(
    defaultCheckIn.toISOString().split("T")[0]
  );
  const [previewCheckOut, setPreviewCheckOut] = useState<string>(
    defaultCheckOut.toISOString().split("T")[0]
  );
  const [previewGuests, setPreviewGuests] = useState<number>(
    Math.min(maxGuests, (baseGuests || 1) + 1)
  );

  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [previewResult, setPreviewResult] = useState<PricingPreviewResult | null>(null);

  // Soft warning: monthly discount < weekly discount
  const hasDiscountWarning =
    monthlyDiscountPct > 0 &&
    weeklyDiscountPct > 0 &&
    monthlyDiscountPct < weeklyDiscountPct;

  // Recalculate preview with 500ms debounce
  useEffect(() => {
    if (!baseNightlyPrice || baseNightlyPrice <= 0) {
      setPreviewResult(null);
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      const res = calculatePricingPreview(data, bookingRules, {
        checkIn: previewCheckIn,
        checkOut: previewCheckOut,
        guests: previewGuests,
      });
      setPreviewResult(res);
      setIsCalculating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    baseNightlyPrice,
    weekendNightlyPrice,
    cleaningFee,
    baseGuests,
    extraGuestFee,
    weeklyDiscountPct,
    monthlyDiscountPct,
    previewCheckIn,
    previewCheckOut,
    previewGuests,
    bookingRules,
    data,
  ]);

  // Quick buttons to set nights
  const handleSetQuickNights = (nightsCount: number) => {
    const start = new Date(previewCheckIn);
    const newEnd = new Date(start.getTime() + nightsCount * 86400 * 1000);
    setPreviewCheckOut(newEnd.toISOString().split("T")[0]);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Pricing Inputs Form (7 cols on xl) */}
      <div className="xl:col-span-7 space-y-8">
        {/* Section 1: Giá cơ bản & Cuối tuần */}
        <div className="space-y-4">
          <div className="border-b border-[var(--color-border-subtle)] pb-2">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{isEn ? "Nightly Base Price" : "Giá thuê theo đêm"}</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {isEn
                ? "The base rate charged for reservations on standard weeknights."
                : "Mức giá thuê chuẩn áp dụng cho các đêm thông thường trong tuần."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Base Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                {isEn ? "Base price per night" : "Giá cơ bản mỗi đêm"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1.200.000"
                  value={baseNightlyPrice ? formatMoney(baseNightlyPrice) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    onChange({ baseNightlyPrice: raw ? parseInt(raw, 10) : 0 });
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3.5 py-2.5 pr-14 text-sm font-bold bg-[var(--color-bg-surface)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    errors.baseNightlyPrice
                      ? "border-rose-500 bg-rose-50/20"
                      : "border-[var(--color-border-default)]"
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-secondary)]">
                  ₫ {currency}
                </span>
              </div>
              {errors.baseNightlyPrice && (
                <p className="text-[11px] text-rose-600">{errors.baseNightlyPrice}</p>
              )}
            </div>

            {/* Weekend Price (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                {isEn ? "Weekend price (Friday & Saturday)" : "Giá cuối tuần (Thứ 6 & Thứ 7)"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={baseNightlyPrice ? formatMoney(Math.round(baseNightlyPrice * 1.15)) : "1.400.000"}
                  value={weekendNightlyPrice ? formatMoney(weekendNightlyPrice) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    onChange({ weekendNightlyPrice: raw ? parseInt(raw, 10) : 0 });
                  }}
                  disabled={isReadOnly}
                  className="w-full px-3.5 py-2.5 pr-14 text-sm font-bold bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-secondary)]">
                  ₫ {currency}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">
                {isEn ? "Optional. Leave blank to use base rate." : "Không bắt buộc. Để trống sẽ dùng giá cơ bản."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Phí dịch vụ & Phụ thu */}
        <div className="space-y-4">
          <div className="border-b border-[var(--color-border-subtle)] pb-2">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{isEn ? "Fees & Extra Guest Surcharges" : "Phí vệ sinh & Phụ thu thêm khách"}</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {isEn
                ? "Cleaning fee is charged once per stay. Extra guest surcharge applies per additional guest per night."
                : "Phí vệ sinh tính 1 lần mỗi booking. Phụ thu áp dụng cho mỗi khách vượt quá giới hạn cơ bản."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Cleaning Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                {isEn ? "Cleaning fee (1x)" : "Phí vệ sinh (1 lần)"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="200.000"
                  value={cleaningFee ? formatMoney(cleaningFee) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    onChange({ cleaningFee: raw ? parseInt(raw, 10) : 0 });
                  }}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 pr-10 text-xs font-bold bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-text-tertiary)]">
                  ₫
                </span>
              </div>
            </div>

            {/* Base Guests Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                {isEn ? "Base guests included" : "Số khách tính giá cơ bản"}
              </label>
              <select
                value={baseGuests}
                onChange={(e) => onChange({ baseGuests: parseInt(e.target.value, 10) })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 text-xs font-semibold bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {Array.from({ length: Math.max(1, maxGuests) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {isEn ? (n === 1 ? "guest" : "guests") : "khách"}
                  </option>
                ))}
              </select>
            </div>

            {/* Extra Guest Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                {isEn ? "Extra guest / night" : "Phụ thu / khách thêm / đêm"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="100.000"
                  value={extraGuestFee ? formatMoney(extraGuestFee) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    onChange({ extraGuestFee: raw ? parseInt(raw, 10) : 0 });
                  }}
                  disabled={isReadOnly || baseGuests >= maxGuests}
                  className={`w-full px-3 py-2 pr-10 text-xs font-bold bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                    baseGuests >= maxGuests ? "opacity-50 cursor-not-allowed bg-[var(--color-bg-subtle)]" : ""
                  }`}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-text-tertiary)]">
                  ₫
                </span>
              </div>
              {baseGuests >= maxGuests && (
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  {isEn ? "Disabled: Equals max guests capacity" : "Đã bằng sức chứa tối đa của phòng"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Giảm giá lưu trú dài ngày (Weekly & Monthly) */}
        <div className="space-y-4">
          <div className="border-b border-[var(--color-border-subtle)] pb-2">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{isEn ? "Length-of-Stay Discounts" : "Giảm giá theo thời gian lưu trú"}</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {isEn
                ? "Encourage longer reservations with automatic weekly and monthly discounts."
                : "Thu hút khách đặt phòng dài ngày hơn bằng các mức chiết khấu tự động."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weekly Discount */}
            <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-primary)]">
                    {isEn ? "Weekly discount (≥ 7 nights)" : "Giảm giá theo tuần (Từ 7 đêm)"}
                  </label>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">
                    {isEn ? "Applies to 7 nights or more" : "Áp dụng tự động từ đêm thứ 7"}
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--color-primary)]">
                  {weeklyDiscountPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={weeklyDiscountPct}
                onChange={(e) => onChange({ weeklyDiscountPct: parseInt(e.target.value, 10) })}
                disabled={isReadOnly}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
              />
            </div>

            {/* Monthly Discount */}
            <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-primary)]">
                    {isEn ? "Monthly discount (≥ 28 nights)" : "Giảm giá theo tháng (Từ 28 đêm)"}
                  </label>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">
                    {isEn ? "Applies to 28 nights or more" : "Áp dụng tự động từ đêm thứ 28"}
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--color-primary)]">
                  {monthlyDiscountPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={monthlyDiscountPct}
                onChange={(e) => onChange({ monthlyDiscountPct: parseInt(e.target.value, 10) })}
                disabled={isReadOnly}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
              />
            </div>
          </div>

          {/* Soft warning when monthly < weekly discount */}
          {hasDiscountWarning && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                {isEn
                  ? "Suggestion: Monthly discounts are typically higher than weekly discounts to incentivize long stays."
                  : "Gợi ý: Mức giảm theo tháng thường nên cao hơn hoặc bằng mức giảm theo tuần để khuyến khích khách lưu trú dài ngày."}
              </p>
            </div>
          )}

          {/* BR-PRC-02 Notice */}
          <div className="flex items-start gap-2 text-[11px] text-[var(--color-text-secondary)]">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--color-primary)]" />
            <p>
              {isEn
                ? "Rule BR-PRC-02: When a booking qualifies for both thresholds, only the higher monthly discount rate applies."
                : "Quy tắc BR-PRC-02: Khi một lượt đặt phòng thỏa mãn cả hai ngưỡng (≥28 đêm), hệ thống sẽ tự động áp dụng mức giảm theo tháng cao hơn."}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Price Breakdown Preview (5 cols on xl) */}
      <div className="xl:col-span-5 xl:sticky xl:top-24 space-y-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-[var(--color-primary)]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                {isEn ? "Pricing Preview" : "Bảng giá xem trước"}
              </h4>
            </div>
            {isCalculating && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
            )}
          </div>

          {/* Simulation Controls: Dates and Guests */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[var(--color-bg-subtle)]/70 border border-[var(--color-border-subtle)] text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
                  {isEn ? "Check-in" : "Nhận phòng"}
                </label>
                <input
                  type="date"
                  value={previewCheckIn}
                  onChange={(e) => setPreviewCheckIn(e.target.value)}
                  className="w-full mt-1 p-1.5 text-xs font-semibold bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-md"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
                  {isEn ? "Check-out" : "Trả phòng"}
                </label>
                <input
                  type="date"
                  value={previewCheckOut}
                  onChange={(e) => setPreviewCheckOut(e.target.value)}
                  className="w-full mt-1 p-1.5 text-xs font-semibold bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                {isEn ? "Guests count:" : "Số lượng khách:"}
              </span>
              <select
                value={previewGuests}
                onChange={(e) => setPreviewGuests(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-md text-xs font-bold"
              >
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {isEn ? (n === 1 ? "guest" : "guests") : "khách"}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick nights test buttons */}
            <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center gap-1.5">
              <span className="text-[10px] text-[var(--color-text-tertiary)] mr-1">
                {isEn ? "Quick test:" : "Thử nhanh:"}
              </span>
              <button
                type="button"
                onClick={() => handleSetQuickNights(3)}
                className="px-2 py-1 rounded bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-[11px] font-semibold cursor-pointer"
              >
                {isEn ? "3 nights" : "3 đêm"}
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickNights(7)}
                className="px-2 py-1 rounded bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-[11px] font-semibold cursor-pointer text-[var(--color-primary)]"
                title={isEn ? "Tests weekly discount" : "Kiểm tra giảm tuần"}
              >
                {isEn ? "7 nights (Week)" : "7 đêm (Tuần)"}
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickNights(28)}
                className="px-2 py-1 rounded bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-[11px] font-semibold cursor-pointer text-[var(--color-primary)]"
                title={isEn ? "Tests monthly discount" : "Kiểm tra giảm tháng"}
              >
                {isEn ? "28 nights (Month)" : "28 đêm (Tháng)"}
              </button>
            </div>
          </div>

          {/* Result Content */}
          {!baseNightlyPrice || baseNightlyPrice <= 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-secondary)] space-y-2">
              <DollarSign className="w-8 h-8 mx-auto text-[var(--color-text-tertiary)] stroke-[1.5]" />
              <p className="font-semibold">
                {isEn
                  ? "Enter a base price per night to view live calculations"
                  : "Vui lòng nhập giá cơ bản mỗi đêm để xem bảng tính doanh thu"}
              </p>
            </div>
          ) : previewResult?.violations && previewResult.violations.length > 0 ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{isEn ? "Rule Violation in Sample" : "Vi phạm quy tắc đặt phòng ví dụ"}</span>
              </div>
              <p>{previewResult.violations[0].message}</p>
              <button
                type="button"
                onClick={() => handleSetQuickNights(bookingRules?.minNights || 1)}
                className="text-[11px] font-bold text-rose-700 underline"
              >
                {isEn ? "Adjust sample to valid nights" : "Điều chỉnh lại số đêm hợp lệ"}
              </button>
            </div>
          ) : previewResult ? (
            <div className="space-y-3 text-xs">
              {/* Line 1: Room subtotal */}
              <div className="flex items-center justify-between text-[var(--color-text-primary)]">
                <span>
                  {previewResult.nights} {isEn ? "nights" : "đêm"} × {formatMoney(baseNightlyPrice)}₫
                </span>
                <span className="font-bold">
                  {formatMoney(previewResult.roomSubtotal)}₫
                </span>
              </div>

              {/* Line 2: Extra guests fee if applicable */}
              {previewResult.extraGuestsCount > 0 && previewResult.extraGuestTotal > 0 && (
                <div className="flex items-center justify-between text-[var(--color-text-primary)]">
                  <span>
                    {isEn
                      ? `Extra guests (${previewResult.extraGuestsCount} guests × ${previewResult.nights} nights)`
                      : `Phụ thu (${previewResult.extraGuestsCount} khách thêm × ${previewResult.nights} đêm)`}
                  </span>
                  <span className="font-bold">
                    +{formatMoney(previewResult.extraGuestTotal)}₫
                  </span>
                </div>
              )}

              {/* Line 3: Cleaning fee */}
              {previewResult.cleaningFee > 0 && (
                <div className="flex items-center justify-between text-[var(--color-text-primary)]">
                  <span>{isEn ? "Cleaning fee" : "Phí vệ sinh"}</span>
                  <span className="font-bold">
                    +{formatMoney(previewResult.cleaningFee)}₫
                  </span>
                </div>
              )}

              {/* Line 4: Discount if applicable */}
              {previewResult.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>
                    {previewResult.discountType === "MONTHLY"
                      ? isEn
                        ? `Monthly discount (-${previewResult.discountPct}%)`
                        : `Giảm giá theo tháng (-${previewResult.discountPct}%)`
                      : isEn
                      ? `Weekly discount (-${previewResult.discountPct}%)`
                      : `Giảm giá theo tuần (-${previewResult.discountPct}%)`}
                  </span>
                  <span>-{formatMoney(previewResult.discountAmount)}₫</span>
                </div>
              )}

              {/* Accordion: Nightly breakdown */}
              <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  <span>{isEn ? "Nightly breakdown details" : "Chi tiết giá từng đêm"}</span>
                  {isBreakdownExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {isBreakdownExpanded && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[var(--color-bg-subtle)] space-y-1.5 text-[11px] max-h-40 overflow-y-auto">
                    {previewResult.nightlyBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[var(--color-text-secondary)]">
                        <span>{item.date}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
                            {item.source === "WEEKEND" ? (isEn ? "Weekend" : "Cuối tuần") : isEn ? "Base" : "Cơ bản"}
                          </span>
                          <span className="font-semibold text-[var(--color-text-primary)]">
                            {formatMoney(item.price)}₫
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Host Total Output */}
              <div className="pt-3 border-t-2 border-[var(--color-border-default)] flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">
                    {isEn ? "Host gross booking total" : "Tổng tiền host đặt"}
                  </span>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    {isEn ? "Before host service fee" : "Chưa trừ phí dịch vụ nền tảng"}
                  </p>
                </div>
                <span className="text-lg font-black text-[var(--color-primary)]">
                  {formatMoney(previewResult.hostTotal)}₫
                </span>
              </div>

              {/* Host Net estimated payout */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-emerald-950 dark:text-emerald-100 font-bold">
                  <span>{isEn ? "Estimated Host Payout:" : "Ước tính Host thực nhận:"}</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-black text-sm">
                    {formatMoney(previewResult.hostTotal - previewResult.platformFeeAmount)}₫
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-[10px]">
                  <span>{isEn ? "Platform service fee (3%):" : "Phí dịch vụ nền tảng (3%):"}</span>
                  <span>-{formatMoney(previewResult.platformFeeAmount)}₫</span>
                </div>
              </div>

              <p className="text-[10px] text-[var(--color-text-tertiary)] pt-1 text-center">
                {isEn
                  ? "ⓘ Guest service fee & taxes are configured by platform and will display on public listing page."
                  : "ⓘ Phí dịch vụ cho khách và thuế do nền tảng cấu hình, sẽ hiển thị công khai trên trang phòng cho khách xem."}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
