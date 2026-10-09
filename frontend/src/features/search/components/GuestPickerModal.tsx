"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Users, Plus, Minus } from "lucide-react";

interface GuestPickerProps {
  adults: number;
  childrenCount: number;
  infants?: number;
  onChange: (adults: number, childrenCount: number, infants?: number) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function GuestPickerModal({
  adults,
  childrenCount,
  infants = 0,
  onChange,
  isOpen,
  onOpen,
  onClose,
}: GuestPickerProps) {
  const t = useTranslations("search.guestPicker");

  const totalGuests = adults + childrenCount;

  const handleUpdate = (type: "adults" | "children" | "infants", delta: number) => {
    let nextAdults = adults;
    let nextChildren = childrenCount;
    let nextInfants = infants;

    if (type === "adults") {
      nextAdults = Math.max(1, Math.min(16 - nextChildren, adults + delta));
    } else if (type === "children") {
      nextChildren = Math.max(0, Math.min(16 - nextAdults, childrenCount + delta));
    } else if (type === "infants") {
      nextInfants = Math.max(0, Math.min(5, infants + delta));
    }

    onChange(nextAdults, nextChildren, nextInfants);
  };

  const getDisplayText = () => {
    if (totalGuests === 1 && infants === 0) {
      return t("oneGuest");
    }
    const parts = [];
    parts.push(t("guestsCount", { count: totalGuests }));
    if (infants > 0) {
      parts.push(t("infantsCount", { count: infants }));
    }
    return parts.join(", ");
  };

  return (
    <div className="relative flex-1">
      <div
        onClick={onOpen}
        className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full cursor-pointer transition-colors ${
          isOpen ? "bg-white dark:bg-gray-800 shadow-md" : "hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
        }`}
      >
        <span className="block text-xs font-bold text-[var(--color-text-secondary)] tracking-wider">
          {t("label")}
        </span>
        <span className="block text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {getDisplayText()}
        </span>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-[115%] w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl border border-[var(--color-border-subtle)] z-50 animate-in fade-in zoom-in-95">
          <div className="space-y-4">
            {/* Adults */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <span className="block text-sm font-bold text-[var(--color-text-primary)]">
                  {t("adultsTitle")}
                </span>
                <span className="block text-xs text-[var(--color-text-tertiary)]">
                  {t("adultsSub")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdate("adults", -1)}
                  disabled={adults <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:border-gray-900 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-bold text-[var(--color-text-primary)]">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdate("adults", 1)}
                  disabled={totalGuests >= 16}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:border-gray-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <span className="block text-sm font-bold text-[var(--color-text-primary)]">
                  {t("childrenTitle")}
                </span>
                <span className="block text-xs text-[var(--color-text-tertiary)]">
                  {t("childrenSub")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdate("children", -1)}
                  disabled={childrenCount <= 0}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:border-gray-900 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-bold text-[var(--color-text-primary)]">
                  {childrenCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdate("children", 1)}
                  disabled={totalGuests >= 16}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:border-gray-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-[var(--color-text-primary)]">
                  {t("infantsTitle")}
                </span>
                <span className="block text-xs text-[var(--color-text-tertiary)]">
                  {t("infantsSub")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdate("infants", -1)}
                  disabled={infants <= 0}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:border-gray-900 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-bold text-[var(--color-text-primary)]">
                  {infants}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdate("infants", 1)}
                  disabled={infants >= 5}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[var(--color-text-primary)] disabled:opacity-30 hover:border-gray-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
          >
            {t("applyBtn")}
          </button>
        </div>
      )}
    </div>
  );
}
