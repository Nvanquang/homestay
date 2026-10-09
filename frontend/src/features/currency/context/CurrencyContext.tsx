"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  CurrencyCode,
  CurrencyContextValue,
  ConvertedMoney,
  ExchangeRateSnapshot,
  FxStatus,
} from "../types";
import { SUPPORTED_CURRENCIES, DEFAULT_FX_SNAPSHOT } from "../constants";
import {
  getExchangeRates,
  getCurrentFxSnapshot,
  getStoredPreferredCurrency,
  storePreferredCurrency,
} from "../api/mock-currency";
import { formatMoney } from "@/lib/format";

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("VND");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateSnapshot>(() => getCurrentFxSnapshot());
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo từ localStorage
  useEffect(() => {
    const stored = getStoredPreferredCurrency();
    setCurrencyState(stored);

    setIsLoading(true);
    getExchangeRates()
      .then((snapshot) => {
        setExchangeRates(snapshot);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    storePreferredCurrency(newCurrency);
  }, []);

  const fxStatus: FxStatus = exchangeRates.status;

  const convert = useCallback(
    (amountInVnd: number): ConvertedMoney => {
      const originalAmount = typeof amountInVnd === "number" && !isNaN(amountInVnd) ? amountInVnd : 0;
      const formattedOriginal = formatMoney(originalAmount, "VND", "vi");

      // Nếu người dùng chọn VND hoặc tỷ giá bị UNAVAILABLE / STALE thì fallback về VND (S13 AC)
      if (currency === "VND" || fxStatus === "UNAVAILABLE" || fxStatus === "STALE") {
        return {
          amount: originalAmount,
          currency: "VND",
          originalAmount,
          originalCurrency: "VND",
          isConverted: false,
          rate: 1,
          asOf: exchangeRates.asOf,
          formatted: formattedOriginal,
          formattedOriginal,
        };
      }

      const rate = exchangeRates.rates[currency] || 1;
      const rawConverted = originalAmount * rate;

      // Làm tròn theo số chữ số thập phân của đồng tiền
      const currInfo = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
      const decimals = currInfo ? currInfo.decimals : 2;

      let roundedAmount: number;
      if (decimals === 0) {
        roundedAmount = Math.round(rawConverted);
      } else {
        const factor = Math.pow(10, decimals);
        roundedAmount = Math.round((rawConverted + Number.EPSILON) * factor) / factor;
      }

      const formatted = formatMoney(roundedAmount, currency, "en");

      return {
        amount: roundedAmount,
        currency,
        originalAmount,
        originalCurrency: "VND",
        isConverted: true,
        rate,
        asOf: exchangeRates.asOf,
        formatted: `≈ ${formatted}`,
        formattedOriginal,
      };
    },
    [currency, exchangeRates, fxStatus]
  );

  const formatPrice = useCallback(
    (amountInVnd: number, locale: string = "vi"): string => {
      const res = convert(amountInVnd);
      if (!res.isConverted) {
        return formatMoney(amountInVnd, "VND", locale);
      }
      return res.formatted;
    },
    [convert]
  );

  const contextValue = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      exchangeRates,
      fxStatus,
      isLoading,
      convert,
      formatPrice,
    }),
    [currency, setCurrency, exchangeRates, fxStatus, isLoading, convert, formatPrice]
  );

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback nếu gọi ngoài provider (giúp test isolation & SSR an toàn)
    return {
      currency: "VND",
      setCurrency: () => {},
      supportedCurrencies: SUPPORTED_CURRENCIES,
      exchangeRates: DEFAULT_FX_SNAPSHOT,
      fxStatus: "OK",
      isLoading: false,
      convert: (amt) => ({
        amount: amt,
        currency: "VND",
        originalAmount: amt,
        originalCurrency: "VND",
        isConverted: false,
        rate: 1,
        asOf: "2026-10-09",
        formatted: formatMoney(amt, "VND", "vi"),
        formattedOriginal: formatMoney(amt, "VND", "vi"),
      }),
      formatPrice: (amt, locale = "vi") => formatMoney(amt, "VND", locale),
    };
  }
  return ctx;
}
