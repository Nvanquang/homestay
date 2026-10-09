"use client";

import React from "react";
import { useLocale } from "next-intl";
import { X, Calendar, ShieldCheck, Clock, Percent, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CancellationPolicyDetail } from "../types";

export interface CancellationRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: CancellationPolicyDetail;
}

export function CancellationRefundModal({
  isOpen,
  onClose,
  policy,
}: CancellationRefundModalProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="refund-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl border border-[var(--color-border-subtle)] shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-border-subtle)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                {isEn ? "Policy Details" : "Chi tiết chính sách huỷ"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold">
                {isEn ? policy.badgeEn : policy.badgeVi}
              </span>
            </div>
            <h3 id="refund-modal-title" className="text-lg font-bold">
              {isEn ? policy.nameEn : policy.nameVi}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {isEn ? policy.summaryEn : policy.summaryVi}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
            aria-label={isEn ? "Close modal" : "Đóng cửa sổ"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Timeline Diagram */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {isEn ? "Refund Timeline" : "Biểu đồ mốc hoàn tiền"}
          </h4>

          <div className="space-y-3">
            {policy.tiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/60 flex items-start gap-3.5"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    tier.refundPercent === 100
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : tier.refundPercent === 50
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {tier.refundPercent}%
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {isEn ? `Refund ${tier.refundPercent}%` : `Hoàn ${tier.refundPercent}%`}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tier.hoursBefore === 0
                        ? isEn
                          ? "After check-in deadline"
                          : "Sau mốc nhận phòng"
                        : isEn
                        ? `>= ${tier.hoursBefore}h before check-in`
                        : `>= ${tier.hoursBefore} giờ trước nhận phòng`}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {isEn ? tier.noteEn : tier.noteVi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rule Notice BR-LST-03 */}
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold">
              {isEn ? "Rule BR-LST-03: " : "Quy tắc BR-LST-03: "}
            </span>
            <span>
              {isEn
                ? "Any policy changes after publishing only apply to new reservations made after the update."
                : "Mọi thay đổi chính sách huỷ sau khi phòng đã hiển thị chỉ áp dụng cho các lượt đặt phòng mới được tạo sau thời điểm cập nhật."}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="text-xs px-5 py-2 cursor-pointer font-semibold"
          >
            {isEn ? "Close" : "Đã hiểu"}
          </Button>
        </div>
      </div>
    </div>
  );
}
