"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar as CalendarIcon,
  Users,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lock,
  Sparkles,
  Info,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import { ListingDetailDTO, BookingQuoteResult } from "../types";
import { calculateBookingQuote } from "../api/mock-listing-detail";

interface StickyBookingBoxProps {
  listing: ListingDetailDTO;
  initialCheckin?: string;
  initialCheckout?: string;
  initialAdults?: number;
  initialChildren?: number;
  onDatesChange?: (checkin: string, checkout: string) => void;
  onGuestsChange?: (adults: number, children: number) => void;
}

export function StickyBookingBox({
  listing,
  initialCheckin = "",
  initialCheckout = "",
  initialAdults = 1,
  initialChildren = 0,
  onDatesChange,
  onGuestsChange,
}: StickyBookingBoxProps) {
  const t = useTranslations("listingDetail.bookingBox");
  const locale = useLocale();

  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [adults, setAdults] = useState(initialAdults);
  const [childrenCount, setChildrenCount] = useState(initialChildren);

  const [quote, setQuote] = useState<BookingQuoteResult | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [showNightlyBreakdown, setShowNightlyBreakdown] = useState(false);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const totalGuests = adults + childrenCount;

  // Auto trigger quote calculation when dates are valid
  useEffect(() => {
    if (!checkin || !checkout || checkin >= checkout) {
      setQuote(null);
      return;
    }

    let active = true;
    setIsQuoting(true);

    const timer = setTimeout(async () => {
      try {
        const res = await calculateBookingQuote({
          listingId: listing.id,
          checkin,
          checkout,
          adults,
          children: childrenCount,
        });
        if (active) {
          setQuote(res);
          setIsQuoting(false);
        }
      } catch {
        if (active) setIsQuoting(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [listing.id, checkin, checkout, adults, childrenCount]);

  const handleDateChange = (newIn: string, newOut: string) => {
    setCheckin(newIn);
    setCheckout(newOut);
    if (onDatesChange) onDatesChange(newIn, newOut);
  };

  const handleAdultsChange = (delta: number) => {
    const next = Math.max(1, Math.min(listing.maxGuests - childrenCount, adults + delta));
    setAdults(next);
    if (onGuestsChange) onGuestsChange(next, childrenCount);
  };

  const handleChildrenChange = (delta: number) => {
    const next = Math.max(0, Math.min(listing.maxGuests - adults, childrenCount + delta));
    setChildrenCount(next);
    if (onGuestsChange) onGuestsChange(adults, next);
  };

  return (
    <div
      data-testid="sticky-booking-box"
      className="bg-white dark:bg-gray-800 rounded-3xl border border-[var(--color-border-subtle)] p-6 shadow-xl space-y-5"
    >
      {/* Header Price */}
      <div className="flex items-baseline justify-between border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            {formatMoney(listing.baseNightlyPrice, "VND", locale)}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-normal">
            {" "}
            / {t("night")}
          </span>
        </div>

        <div className="text-xs font-semibold text-[var(--color-text-tertiary)]">
          ★ {listing.ratingScore.toFixed(2)} ({listing.reviewCount})
        </div>
      </div>

      {/* Selectors Form Box */}
      <div className="rounded-2xl border border-gray-300 dark:border-gray-600 overflow-hidden text-xs">
        {/* Date Inputs */}
        <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-600 border-b border-gray-300 dark:border-gray-600">
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase text-[var(--color-text-tertiary)] mb-0.5">
              {t("checkinLabel")}
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkin}
              onChange={(e) => handleDateChange(e.target.value, checkout)}
              className="w-full bg-transparent font-bold text-[var(--color-text-primary)] focus:outline-hidden"
            />
          </div>
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase text-[var(--color-text-tertiary)] mb-0.5">
              {t("checkoutLabel")}
            </label>
            <input
              type="date"
              min={checkin || todayStr}
              value={checkout}
              onChange={(e) => handleDateChange(checkin, e.target.value)}
              className="w-full bg-transparent font-bold text-[var(--color-text-primary)] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Guests Input */}
        <div className="p-3 relative">
          <div
            onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div>
              <span className="block text-[10px] font-bold uppercase text-[var(--color-text-tertiary)]">
                {t("guestsLabel")}
              </span>
              <span className="font-bold text-[var(--color-text-primary)]">
                {totalGuests} {t("guestsCount")}
              </span>
            </div>
            {isGuestDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-[var(--color-text-tertiary)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--color-text-tertiary)]" />
            )}
          </div>

          {/* Guest Count Popover */}
          {isGuestDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl border border-[var(--color-border-subtle)] z-40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-bold text-[var(--color-text-primary)]">
                    {t("adults")}
                  </span>
                  <span className="block text-[11px] text-[var(--color-text-tertiary)]">
                    {t("adultsAge")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdultsChange(-1)}
                    disabled={adults <= 1}
                    className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold">{adults}</span>
                  <button
                    type="button"
                    onClick={() => handleAdultsChange(1)}
                    disabled={totalGuests >= listing.maxGuests}
                    className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
                <div>
                  <span className="block font-bold text-[var(--color-text-primary)]">
                    {t("children")}
                  </span>
                  <span className="block text-[11px] text-[var(--color-text-tertiary)]">
                    {t("childrenAge")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChildrenChange(-1)}
                    disabled={childrenCount <= 0}
                    className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={() => handleChildrenChange(1)}
                    disabled={totalGuests >= listing.maxGuests}
                    className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[var(--color-text-tertiary)] pt-1">
                {t("maxCapacityNotice", { count: listing.maxGuests })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Violations Inline Warning */}
      {quote?.violations && quote.violations.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{quote.violations[0].message}</span>
        </div>
      )}

      {/* CTA Button (Phase 1 disabled) */}
      <div className="space-y-2">
        <button
          type="button"
          disabled
          data-testid="booking-cta-btn"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-rose-600 text-white font-extrabold text-sm shadow-md opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>
            {listing.bookingMode === "INSTANT"
              ? t("instantBookBtn")
              : t("requestBookBtn")}
          </span>
        </button>

        <p className="text-[11px] text-center text-[var(--color-text-tertiary)]">
          {t("phase1DisabledNotice")}
        </p>
      </div>

      <p className="text-[11px] text-center text-[var(--color-text-secondary)]">
        {t("noChargeNotice")}
      </p>

      {/* Price Breakdown Details (CMP-22) */}
      {isQuoting ? (
        <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-2.5 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3" />
        </div>
      ) : quote && !quote.violations?.length ? (
        <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-3 text-xs">
          {quote.lines.map((line, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">{line.label}</span>
              <span
                className={`font-semibold ${
                  line.amount < 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {line.amount < 0 ? "-" : ""}
                {formatMoney(Math.abs(line.amount), "VND", locale)}
              </span>
            </div>
          ))}

          {/* Toggle Nightly Breakdown */}
          {quote.nightlyBreakdown && quote.nightlyBreakdown.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowNightlyBreakdown(!showNightlyBreakdown)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t("viewNightlyRates")}</span>
                {showNightlyBreakdown ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {showNightlyBreakdown && (
                <div className="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-[var(--color-border-subtle)] space-y-1.5 text-[11px]">
                  {quote.nightlyBreakdown.map((nb, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[var(--color-text-tertiary)]">
                        {nb.date} ({nb.source === "WEEKEND" ? t("weekend") : t("weekday")})
                      </span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {formatMoney(nb.price, "VND", locale)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-baseline justify-between text-sm sm:text-base font-extrabold text-[var(--color-text-primary)]">
            <span>{t("totalBeforeTaxes")}</span>
            <span>{formatMoney(quote.total, "VND", locale)}</span>
          </div>

          <div className="text-[10px] text-right text-[var(--color-text-tertiary)]">
            {t("includesFeesAndTaxesNotice")}
          </div>
        </div>
      ) : (
        <div className="pt-2 text-center text-xs text-[var(--color-text-tertiary)]">
          {t("addDatesToSeeTotal")}
        </div>
      )}
    </div>
  );
}
