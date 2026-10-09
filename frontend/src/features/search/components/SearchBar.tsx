"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, SlidersHorizontal, X, ArrowLeft } from "lucide-react";
import { DestinationPicker } from "./DestinationPicker";
import { DateRangePickerModal } from "./DateRangePickerModal";
import { GuestPickerModal } from "./GuestPickerModal";

export interface SearchBarProps {
  initialDestination?: string;
  initialCheckin?: string;
  initialCheckout?: string;
  initialAdults?: number;
  initialChildren?: number;
  isCompact?: boolean;
  onSearchSubmit?: (params: {
    destination: string;
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
  }) => void;
}

export function SearchBar({
  initialDestination = "",
  initialCheckin = "",
  initialCheckout = "",
  initialAdults = 1,
  initialChildren = 0,
  isCompact = false,
  onSearchSubmit,
}: SearchBarProps) {
  const t = useTranslations("search.searchBar");
  const locale = useLocale();
  const router = useRouter();

  const [destination, setDestination] = useState(initialDestination);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [adults, setAdults] = useState(initialAdults);
  const [childrenCount, setChildrenCount] = useState(initialChildren);
  const [infants, setInfants] = useState(0);

  const [activeStep, setActiveStep] = useState<"destination" | "dates" | "guests" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveStep(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (!destination.trim()) {
      setValidationError(t("destinationRequired"));
      setActiveStep("destination");
      return;
    }
    setValidationError(null);
    setActiveStep(null);
    setIsMobileModalOpen(false);

    const query = new URLSearchParams();
    if (destination) query.set("destination", destination.trim());
    if (checkin) query.set("checkin", checkin);
    if (checkout) query.set("checkout", checkout);
    if (adults > 1) query.set("adults", adults.toString());
    if (childrenCount > 0) query.set("children", childrenCount.toString());

    if (onSearchSubmit) {
      onSearchSubmit({
        destination,
        checkin,
        checkout,
        adults,
        children: childrenCount,
      });
    } else {
      router.push(`/${locale}/search?${query.toString()}`);
    }
  };

  return (
    <>
      {/* Desktop Search Bar */}
      <div
        ref={containerRef}
        data-testid="search-bar"
        className={`hidden md:flex items-center w-full mx-auto bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-xl transition-all relative ${
          activeStep ? "z-50 bg-gray-50/90 dark:bg-gray-850" : "z-30"
        } ${
          isCompact ? "max-w-3xl py-1 px-1.5" : "max-w-4xl py-1.5 px-2"
        }`}
      >
        <DestinationPicker
          value={destination}
          onChange={(val) => {
            setDestination(val);
            if (validationError) setValidationError(null);
          }}
          isOpen={activeStep === "destination"}
          onOpen={() => setActiveStep("destination")}
          onClose={() => setActiveStep(null)}
        />

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 shrink-0" />

        <DateRangePickerModal
          checkin={checkin}
          checkout={checkout}
          onChange={(inDate, outDate) => {
            setCheckin(inDate);
            setCheckout(outDate);
          }}
          isOpen={activeStep === "dates"}
          onOpen={() => setActiveStep("dates")}
          onClose={() => setActiveStep(null)}
        />

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 shrink-0" />

        <GuestPickerModal
          adults={adults}
          childrenCount={childrenCount}
          infants={infants}
          onChange={(a, c, inf) => {
            setAdults(a);
            setChildrenCount(c);
            if (inf !== undefined) setInfants(inf);
          }}
          isOpen={activeStep === "guests"}
          onOpen={() => setActiveStep("guests")}
          onClose={() => setActiveStep(null)}
        />

        {/* Search Action Button */}
        <div className="pr-1.5 shrink-0">
          <button
            type="button"
            data-testid="search-submit-btn"
            onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-primary to-rose-600 hover:from-primary/90 hover:to-rose-600/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            {!isCompact && <span>{t("searchBtn")}</span>}
          </button>
        </div>

        {/* Validation error tooltip */}
        {validationError && (
          <div className="absolute left-6 -bottom-10 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-1 z-50">
            {validationError}
          </div>
        )}
      </div>

      {/* Mobile Pill Button */}
      <div className="md:hidden w-full">
        <button
          type="button"
          onClick={() => setIsMobileModalOpen(true)}
          className="w-full flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[var(--color-text-primary)] truncate">
              {destination || t("mobileWhereTo")}
            </span>
            <span className="block text-xs text-[var(--color-text-tertiary)] truncate">
              {checkin && checkout
                ? `${checkin} · ${checkout}`
                : t("mobileAnytime")}{" "}
              · {adults + childrenCount} {t("mobileGuests")}
            </span>
          </div>
        </button>
      </div>

      {/* Mobile Fullscreen Modal */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {t("mobileSearchTitle")}
            </h3>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Step 1: Destination */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-[var(--color-border-subtle)]">
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1.5">
                {t("whereLabel")}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t("destinationPlaceholder")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-semibold text-[var(--color-text-primary)]"
              />
            </div>

            {/* Step 2: Dates */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-[var(--color-border-subtle)]">
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">
                {t("datesLabel")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[11px] text-[var(--color-text-tertiary)] mb-1">
                    {t("checkin")}
                  </span>
                  <input
                    type="date"
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-semibold"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-[var(--color-text-tertiary)] mb-1">
                    {t("checkout")}
                  </span>
                  <input
                    type="date"
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Guests */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-[var(--color-border-subtle)] flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)]">
                  {t("guestsLabel")}
                </label>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {adults + childrenCount} {t("mobileGuests")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold text-sm">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults((prev) => Math.min(16, prev + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-primary to-rose-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{t("searchBtn")}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
