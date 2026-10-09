"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import {
  ShieldCheck,
  Zap,
  Clock,
  Check,
  Info,
  CalendarCheck2,
  FileCheck2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  CancellationPolicyType,
  BookingMode,
  PolicyData,
} from "../types";
import {
  MOCK_CANCELLATION_POLICIES,
  getCancellationPolicyDetails,
} from "../api/mock-policies";
import { CancellationRefundModal } from "./CancellationRefundModal";

export interface Step7PolicyProps {
  data: Partial<PolicyData>;
  onChange: (updated: Partial<PolicyData>) => void;
  errors?: Record<string, string>;
  isReadOnly?: boolean;
}

export function Step7Policy({
  data,
  onChange,
  errors = {},
  isReadOnly = false,
}: Step7PolicyProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  const selectedPolicy: CancellationPolicyType =
    data.cancellationPolicy || "FLEXIBLE";
  const selectedMode: BookingMode = data.bookingMode || "INSTANT";

  const [modalPolicyId, setModalPolicyId] =
    useState<CancellationPolicyType | null>(null);

  const policiesList: CancellationPolicyType[] = [
    "FLEXIBLE",
    "MODERATE",
    "STRICT",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* SECTION 1: CANCELLATION POLICY */}
      <div className="space-y-4">
        <div className="border-b border-[var(--color-border-subtle)] pb-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
              <span>
                {isEn ? "Cancellation Policy" : "Chính sách huỷ phòng"}
              </span>
            </h3>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {isEn ? "Required" : "Bắt buộc"} *
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {isEn
              ? "Choose the policy that best balances revenue security with attractiveness to guests."
              : "Chọn chính sách huỷ phù hợp nhất để cân bằng giữa bảo đảm thu nhập và mức độ hấp dẫn với khách hàng."}
          </p>
        </div>

        {/* 3 Radio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {policiesList.map((policyId) => {
            const policyDef = MOCK_CANCELLATION_POLICIES[policyId];
            const isSelected = selectedPolicy === policyId;

            return (
              <div
                key={policyId}
                onClick={() => {
                  if (!isReadOnly) {
                    onChange({ cancellationPolicy: policyId });
                  }
                }}
                className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]/40 ring-2 ring-[var(--color-primary)] shadow-sm"
                    : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]/40"
                } ${isReadOnly ? "opacity-75 cursor-default" : ""}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)]"
                      }`}
                    >
                      {isEn ? policyDef.badgeEn : policyDef.badgeVi}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-[var(--color-border-default)] bg-[var(--color-bg-surface)]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                    {isEn ? policyDef.nameEn : policyDef.nameVi}
                  </h4>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {isEn ? policyDef.summaryEn : policyDef.summaryVi}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-[var(--color-border-subtle)]/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalPolicyId(policyId);
                    }}
                    className="text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {isEn ? "View refund schedule" : "Xem bảng mốc hoàn tiền"}
                    </span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {errors.cancellationPolicy && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.cancellationPolicy}
          </p>
        )}

        {/* Note BR-LST-03 */}
        <div className="p-3.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-[var(--color-text-primary)]">
              {isEn ? "Notice: " : "Lưu ý quan trọng: "}
            </span>
            {isEn
              ? "You can change cancellation policy at any time during draft. Once published, modifications only apply to future reservations (Rule BR-LST-03)."
              : "Bạn có thể tự do thay đổi chính sách huỷ ở bước nháp. Sau khi phòng được duyệt và hiển thị, thay đổi chỉ áp dụng cho các booking mới phát sinh (Quy tắc BR-LST-03)."}
          </p>
        </div>
      </div>

      {/* SECTION 2: BOOKING MODE */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border-subtle)]">
        <div className="border-b border-[var(--color-border-subtle)] pb-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-[var(--color-primary)]" />
              <span>{isEn ? "Booking Mode" : "Kiểu đặt phòng"}</span>
            </h3>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {isEn ? "Required" : "Bắt buộc"} *
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {isEn
              ? "Decide how guests book your homestay: Instant confirmation or host approval."
              : "Lựa chọn cách khách hàng đặt phòng: Tự động xác nhận ngay lập tức hoặc chờ bạn phê duyệt."}
          </p>
        </div>

        {/* 2 Radio Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Instant Book */}
          <div
            onClick={() => {
              if (!isReadOnly) {
                onChange({ bookingMode: "INSTANT" });
              }
            }}
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedMode === "INSTANT"
                ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]/40 ring-2 ring-[var(--color-primary)] shadow-sm"
                : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]/40"
            } ${isReadOnly ? "opacity-75 cursor-default" : ""}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{isEn ? "Instant Book" : "Đặt phòng ngay (Instant Book)"}</span>
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    selectedMode === "INSTANT"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border-default)] bg-[var(--color-bg-surface)]"
                  }`}
                >
                  {selectedMode === "INSTANT" && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {isEn
                  ? "Guests can book and pay automatically without waiting for host confirmation. Increases booking conversion rate by up to 35%."
                  : "Khách đặt và thanh toán ngay mà không cần chờ bạn duyệt thủ công. Giúp tăng tỷ lệ lấp đầy phòng lên đến 35%."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isEn
                  ? "Guest is charged immediately"
                  : "Khách bị trừ tiền ngay khi đặt"}
              </span>
            </div>
          </div>

          {/* Option 2: Request to Book */}
          <div
            onClick={() => {
              if (!isReadOnly) {
                onChange({ bookingMode: "REQUEST" });
              }
            }}
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedMode === "REQUEST"
                ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]/40 ring-2 ring-[var(--color-primary)] shadow-sm"
                : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]/40"
            } ${isReadOnly ? "opacity-75 cursor-default" : ""}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>
                    {isEn ? "Request to Book" : "Chờ duyệt yêu cầu (Request to Book)"}
                  </span>
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    selectedMode === "REQUEST"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border-default)] bg-[var(--color-bg-surface)]"
                  }`}
                >
                  {selectedMode === "REQUEST" && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {isEn
                  ? "Guests send a reservation request. You have 24 hours to accept or decline before the request expires."
                  : "Khách gửi yêu cầu đặt phòng. Bạn có 24 giờ để phản hồi chấp thuận hoặc từ chối trước khi yêu cầu tự động hết hạn."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {isEn
                  ? "Guest is not charged until you accept"
                  : "Khách chưa bị trừ tiền cho đến khi bạn đồng ý"}
              </span>
            </div>
          </div>
        </div>

        {errors.bookingMode && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.bookingMode}
          </p>
        )}
      </div>

      {/* Modal Refund Schedule */}
      {modalPolicyId && (
        <CancellationRefundModal
          isOpen={Boolean(modalPolicyId)}
          onClose={() => setModalPolicyId(null)}
          policy={getCancellationPolicyDetails(modalPolicyId)}
        />
      )}
    </div>
  );
}
