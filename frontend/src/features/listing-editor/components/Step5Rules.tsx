"use client";

import React from "react";
import { useLocale } from "next-intl";
import {
  Clock,
  CalendarDays,
  Shield,
  Ban,
  Dog,
  Cigarette,
  PartyPopper,
  Volume2,
  Info,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { BookingRulesData, HouseRulesData } from "../types";

export interface Step5RulesProps {
  data: BookingRulesData;
  onChange: (updated: Partial<BookingRulesData>) => void;
  crossFieldError?: string;
  isReadOnly?: boolean;
}

export function Step5Rules({
  data,
  onChange,
  crossFieldError,
  isReadOnly = false,
}: Step5RulesProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  const {
    minNights = 1,
    maxNights = 30,
    prepNights = 0,
    minNoticeHours = 0,
    maxAdvanceMonths = 12,
    houseRules = {
      smoking: false,
      pets: false,
      parties: false,
      quietHoursEnabled: true,
      quietHoursFrom: "22:00",
      quietHoursTo: "07:00",
      notes: "",
    },
  } = data;

  const hasCrossError = Boolean(crossFieldError) || minNights > maxNights;

  const handleHouseRuleChange = (field: keyof HouseRulesData, value: any) => {
    if (isReadOnly) return;
    onChange({
      houseRules: {
        ...houseRules,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Thông báo ⓘ "Thay đổi chỉ áp dụng cho đặt phòng mới" */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p>
          {isEn
            ? "Notice: Changes to booking and house rules will only apply to new reservations and will not affect existing bookings."
            : "Thông báo: Các thay đổi về thời gian lưu trú và nội quy chỉ áp dụng cho những lượt đặt phòng mới phát sinh, không ảnh hưởng tới các đặt phòng đã xác nhận trước đó."}
        </p>
      </div>

      {/* Section 1: Thời lượng lưu trú (Min/Max Nights) */}
      <div className="space-y-4">
        <div className="border-b border-[var(--color-border-subtle)] pb-2">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{isEn ? "Stay Length Requirements" : "Yêu cầu số đêm lưu trú"}</span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {isEn
              ? "Set the minimum and maximum nights guests can book."
              : "Thiết lập số đêm tối thiểu và tối đa cho mỗi lượt đặt phòng của khách."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Min Nights Stepper */}
          <div
            className={`p-4 rounded-xl border bg-[var(--color-bg-surface)] space-y-3 transition-colors ${
              hasCrossError
                ? "border-rose-500 bg-rose-50/20"
                : "border-[var(--color-border-subtle)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isEn ? "Minimum Nights" : "Đêm tối thiểu"}
                </label>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">
                  {isEn ? "Shortest allowed stay" : "Số đêm ít nhất cho 1 booking"}
                </p>
              </div>

              {/* Number Stepper */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isReadOnly || minNights <= 1}
                  onClick={() => onChange({ minNights: Math.max(1, minNights - 1) })}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label={isEn ? "Decrease minimum nights" : "Giảm đêm tối thiểu"}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-[var(--color-text-primary)]">
                  {minNights}
                </span>
                <button
                  type="button"
                  disabled={isReadOnly || minNights >= 365}
                  onClick={() => onChange({ minNights: minNights + 1 })}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label={isEn ? "Increase minimum nights" : "Tăng đêm tối thiểu"}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Max Nights Stepper */}
          <div
            className={`p-4 rounded-xl border bg-[var(--color-bg-surface)] space-y-3 transition-colors ${
              hasCrossError
                ? "border-rose-500 bg-rose-50/20"
                : "border-[var(--color-border-subtle)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isEn ? "Maximum Nights" : "Đêm tối đa"}
                </label>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">
                  {isEn ? "Longest allowed stay" : "Số đêm nhiều nhất cho 1 booking"}
                </p>
              </div>

              {/* Number Stepper */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isReadOnly || maxNights <= 1}
                  onClick={() => onChange({ maxNights: Math.max(1, maxNights - 1) })}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label={isEn ? "Decrease maximum nights" : "Giảm đêm tối đa"}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-[var(--color-text-primary)]">
                  {maxNights}
                </span>
                <button
                  type="button"
                  disabled={isReadOnly || maxNights >= 365}
                  onClick={() => onChange({ maxNights: maxNights + 1 })}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label={isEn ? "Increase maximum nights" : "Tăng đêm tối đa"}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-field error banner */}
        {hasCrossError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {isEn
                ? "✕ Minimum nights cannot be greater than maximum nights"
                : "✕ Đêm tối thiểu không được lớn hơn đêm tối đa"}
            </span>
          </div>
        )}
      </div>

      {/* Section 2: Thời gian chuẩn bị & Khoảng đặt trước */}
      <div className="space-y-4">
        <div className="border-b border-[var(--color-border-subtle)] pb-2">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{isEn ? "Turnover & Advance Notice" : "Thời gian chuẩn bị & Đặt trước"}</span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {isEn
              ? "Ensure adequate cleaning turnaround time between different guest bookings."
              : "Đảm bảo đủ thời gian dọn phòng và sắp xếp chỗ ở giữa các lượt khách liên tiếp."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Preparation Nights */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)]">
              {isEn ? "Turnover buffer" : "Thời gian chuẩn bị giữa 2 booking"}
            </label>
            <select
              value={prepNights}
              onChange={(e) => onChange({ prepNights: parseInt(e.target.value, 10) })}
              disabled={isReadOnly}
              className="w-full px-3 py-2 text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value={0}>{isEn ? "None (Back-to-back allowed)" : "Không chặn (Cho phép check-in cùng ngày)"}</option>
              <option value={1}>{isEn ? "1 night buffer" : "Chặn 1 đêm dọn dẹp"}</option>
              <option value={2}>{isEn ? "2 nights buffer" : "Chặn 2 đêm dọn dẹp"}</option>
              <option value={3}>{isEn ? "3 nights buffer" : "Chặn 3 đêm dọn dẹp"}</option>
            </select>
          </div>

          {/* Min notice hours */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)]">
              {isEn ? "Minimum notice" : "Báo trước tối thiểu"}
            </label>
            <select
              value={minNoticeHours}
              onChange={(e) => onChange({ minNoticeHours: parseInt(e.target.value, 10) })}
              disabled={isReadOnly}
              className="w-full px-3 py-2 text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value={0}>{isEn ? "Same day" : "Cùng ngày"}</option>
              <option value={24}>{isEn ? "At least 1 day notice" : "Ít nhất 1 ngày trước"}</option>
              <option value={48}>{isEn ? "At least 2 days notice" : "Ít nhất 2 ngày trước"}</option>
              <option value={72}>{isEn ? "At least 3 days notice" : "Ít nhất 3 ngày trước"}</option>
              <option value={168}>{isEn ? "At least 7 days notice" : "Ít nhất 7 ngày trước"}</option>
            </select>
          </div>

          {/* Max advance months */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)]">
              {isEn ? "Booking window" : "Giới hạn đặt xa nhất"}
            </label>
            <select
              value={maxAdvanceMonths}
              onChange={(e) => onChange({ maxAdvanceMonths: parseInt(e.target.value, 10) })}
              disabled={isReadOnly}
              className="w-full px-3 py-2 text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value={3}>{isEn ? "Up to 3 months in advance" : "Tối đa 3 tháng tới"}</option>
              <option value={6}>{isEn ? "Up to 6 months in advance" : "Tối đa 6 tháng tới"}</option>
              <option value={9}>{isEn ? "Up to 9 months in advance" : "Tối đa 9 tháng tới"}</option>
              <option value={12}>{isEn ? "Up to 12 months in advance" : "Tối đa 12 tháng tới (1 năm)"}</option>
              <option value={24}>{isEn ? "Up to 24 months in advance" : "Tối đa 24 tháng tới (2 năm)"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Nội quy chỗ ở (House Rules) */}
      <div className="space-y-4">
        <div className="border-b border-[var(--color-border-subtle)] pb-2">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{isEn ? "House Rules" : "Nội quy lưu trú"}</span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {isEn
              ? "Rules will be clearly shown on your listing details page for guests to review."
              : "Khách bắt buộc phải đọc và đồng ý với nội quy này trước khi hoàn tất đặt phòng."}
          </p>
        </div>

        {/* Binary rules toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Smoking */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Cigarette className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span>{isEn ? "Smoking" : "Hút thuốc lá"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleHouseRuleChange("smoking", false)}
                disabled={isReadOnly}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  !houseRules.smoking
                    ? "bg-rose-50 border-rose-400 text-rose-700 font-bold"
                    : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {isEn ? "No" : "Không"}
              </button>
              <button
                type="button"
                onClick={() => handleHouseRuleChange("smoking", true)}
                disabled={isReadOnly}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  houseRules.smoking
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold"
                    : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {isEn ? "Allowed" : "Cho phép"}
              </button>
            </div>
          </div>

          {/* Pets */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Dog className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span>{isEn ? "Pets" : "Thú cưng"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleHouseRuleChange("pets", false)}
                disabled={isReadOnly}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  !houseRules.pets
                    ? "bg-rose-50 border-rose-400 text-rose-700 font-bold"
                    : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {isEn ? "No" : "Không"}
              </button>
              <button
                type="button"
                onClick={() => handleHouseRuleChange("pets", true)}
                disabled={isReadOnly}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  houseRules.pets
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold"
                    : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {isEn ? "Allowed" : "Cho phép"}
              </button>
            </div>
          </div>

          {/* Parties */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <PartyPopper className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span>{isEn ? "Parties / Events" : "Tiệc tùng / Sự kiện"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleHouseRuleChange("parties", false)}
                disabled={isReadOnly}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  !houseRules.parties
                    ? "bg-rose-50 border-rose-400 text-rose-700 font-bold"
                    : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {isEn ? "No" : "Không"}
              </button>
              <button
                type="button"
                onClick={() => handleHouseRuleChange("parties", true)}
                disabled={isReadOnly}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  houseRules.parties
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold"
                    : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {isEn ? "Allowed" : "Cho phép"}
              </button>
            </div>
          </div>
        </div>

        {/* Quiet hours */}
        <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {isEn ? "Quiet Hours" : "Khung giờ yên tĩnh (Không làm ồn)"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={houseRules.quietHoursEnabled}
                onChange={(e) => handleHouseRuleChange("quietHoursEnabled", e.target.checked)}
                disabled={isReadOnly}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            </label>
          </div>

          {houseRules.quietHoursEnabled && (
            <div className="flex items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-text-secondary)]">{isEn ? "From:" : "Từ:"}</span>
                <input
                  type="time"
                  value={houseRules.quietHoursFrom}
                  onChange={(e) => handleHouseRuleChange("quietHoursFrom", e.target.value)}
                  disabled={isReadOnly}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-xs font-semibold"
                />
              </div>
              <span className="text-[var(--color-text-secondary)]">{isEn ? "to:" : "đến:"}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={houseRules.quietHoursTo}
                  onChange={(e) => handleHouseRuleChange("quietHoursTo", e.target.value)}
                  disabled={isReadOnly}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-xs font-semibold"
                />
                <span className="text-[var(--color-text-tertiary)]">{isEn ? "next morning" : "sáng hôm sau"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional custom notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-text-primary)]">
            {isEn ? "Additional rules & notes for guests" : "Ghi chú & quy định bổ sung của Host"}
          </label>
          <textarea
            rows={3}
            placeholder={
              isEn
                ? "e.g. Please take off shoes at the door, turn off air conditioning when leaving the house..."
                : "Ví dụ: Vui lòng để giày dép bên ngoài cửa, tắt điều hoà khi ra khỏi phòng..."
            }
            value={houseRules.notes || ""}
            onChange={(e) => handleHouseRuleChange("notes", e.target.value)}
            disabled={isReadOnly}
            className="w-full p-3 text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>
      </div>
    </div>
  );
}
