"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CalendarDay } from "../types";
import { Calendar, User, Clock, AlertCircle, X, ShieldCheck } from "lucide-react";

interface BookingInfoPopoverProps {
  day: CalendarDay | null;
  onClose: () => void;
}

export function BookingInfoPopover({ day, onClose }: BookingInfoPopoverProps) {
  const t = useTranslations("calendar.popover");

  if (!day || (day.state !== "BOOKED" && day.state !== "HOLD" && day.state !== "PENDING_HOST")) {
    return null;
  }

  const getStatusBadge = () => {
    switch (day.state) {
      case "BOOKED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("statusBooked")}
          </span>
        );
      case "HOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            {t("statusHold")}
          </span>
        );
      case "PENDING_HOST":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <AlertCircle className="w-3.5 h-3.5" />
            {t("statusPending")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] shadow-xl p-5 max-w-sm w-full relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium text-[var(--color-text-secondary)]">
                {day.bookingRef || "BK-RESERVATION"}
              </span>
              {getStatusBadge()}
            </div>
            <h4 className="text-base font-bold text-[var(--color-text-primary)]">
              {t("bookingDetails")}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>
              {t("dates")}: <strong>{day.checkIn || day.date}</strong> →{" "}
              <strong>{day.checkOut || day.date}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <User className="w-4 h-4 text-primary shrink-0" />
            <span>
              {t("guest")}: <strong>{day.guestNameMasked || t("platformGuest")}</strong>{" "}
              {day.guestCount ? `(${day.guestCount} ${t("guests")})` : ""}
            </span>
          </div>

          {day.note && (
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 text-[11px] text-[var(--color-text-secondary)]">
              <span className="font-semibold">{t("note")}:</span> {day.note}
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-[11px] text-blue-700 dark:text-blue-300">
            {t("immutableNotice")}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-[var(--color-text-primary)] transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
