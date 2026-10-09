"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCurrency } from "../context/CurrencyContext";
import { CurrencyCode, CurrencyInfo } from "../types";
import { Check, ChevronDown, Search, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export interface CurrencySwitcherProps {
  className?: string;
  triggerVariant?: "pill" | "header" | "select";
}

export function CurrencySwitcher({
  className = "",
  triggerVariant = "header",
}: CurrencySwitcherProps) {
  const t = useTranslations("currency");
  const {
    currency,
    setCurrency,
    supportedCurrencies,
    exchangeRates,
    fxStatus,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrencyInfo =
    supportedCurrencies.find((c) => c.code === currency) || supportedCurrencies[0];

  // Đóng khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredCurrencies = supportedCurrencies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.symbol.includes(q)
    );
  });

  const handleSelect = (code: CurrencyCode) => {
    if (fxStatus === "UNAVAILABLE" && code !== "VND") {
      toast.error(t("fxUnavailableToast"));
      return;
    }
    setCurrency(code);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="currency-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={fxStatus === "UNAVAILABLE"}
        aria-label={t("switchCurrencyAria")}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          triggerVariant === "pill"
            ? "border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-primary shadow-xs"
            : "hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        } ${fxStatus === "UNAVAILABLE" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="text-primary font-black">{currentCurrencyInfo.symbol}</span>
        <span>{currentCurrencyInfo.code}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--color-text-tertiary)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu (Desktop & Tablet) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="p-3 border-b border-[var(--color-border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {t("selectCurrencyTitle")}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)]"
                aria-label={t("closeBtn")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-[var(--color-border-subtle)] focus:outline-none focus:border-primary transition-colors text-[var(--color-text-primary)]"
                autoFocus
              />
            </div>
          </div>

          {/* Currency List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredCurrencies.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--color-text-tertiary)]">
                {t("noResults")}
              </div>
            ) : (
              filteredCurrencies.map((c: CurrencyInfo) => {
                const isSelected = c.code === currency;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-center font-bold text-sm text-[var(--color-text-secondary)]">
                        {c.symbol}
                      </span>
                      <div className="text-left">
                        <div className="font-bold">{c.code}</div>
                        <div className="text-[11px] text-[var(--color-text-tertiary)]">
                          {c.name}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 bg-gray-50 dark:bg-gray-850/60 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span>
              {t("exchangeRateNotice", { date: exchangeRates.asOf })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
