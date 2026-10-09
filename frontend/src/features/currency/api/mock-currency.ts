import { CurrencyCode, ExchangeRateSnapshot } from "../types";
import { DEFAULT_FX_SNAPSHOT, CURRENCY_STORAGE_KEY } from "../constants";

let memoryFxSnapshot: ExchangeRateSnapshot = { ...DEFAULT_FX_SNAPSHOT };

export function getCurrentFxSnapshot(): ExchangeRateSnapshot {
  return memoryFxSnapshot;
}

export async function getExchangeRates(): Promise<ExchangeRateSnapshot> {
  // Giả lập network delay ngắn
  await new Promise((resolve) => setTimeout(resolve, 30));
  return memoryFxSnapshot;
}

export function setMockFxStatus(status: "OK" | "STALE" | "UNAVAILABLE") {
  memoryFxSnapshot = {
    ...memoryFxSnapshot,
    status,
  };
}

export function resetMockFxSnapshot() {
  memoryFxSnapshot = { ...DEFAULT_FX_SNAPSHOT };
}

export function getStoredPreferredCurrency(): CurrencyCode {
  if (typeof window === "undefined") {
    return "VND";
  }
  try {
    const val = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
    if (val && ["VND", "USD", "EUR", "JPY", "GBP"].includes(val)) {
      return val;
    }
  } catch {
    // Ignore localStorage errors
  }
  return "VND";
}

export function storePreferredCurrency(currency: CurrencyCode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  } catch {
    // Ignore localStorage errors
  }
}
