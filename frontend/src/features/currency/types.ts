export type CurrencyCode = "VND" | "USD" | "EUR" | "JPY" | "GBP";

export type FxStatus = "OK" | "STALE" | "UNAVAILABLE";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nameEn: string;
  decimals: number;
}

export interface ExchangeRateSnapshot {
  base: "VND";
  status: FxStatus;
  asOf: string; // ISO date YYYY-MM-DD
  rates: Record<CurrencyCode, number>; // 1 VND = rate [CurrencyCode]
  source: string;
}

export interface ConvertedMoney {
  amount: number;
  currency: CurrencyCode;
  originalAmount: number;
  originalCurrency: "VND";
  isConverted: boolean;
  rate: number;
  asOf: string;
  formatted: string;
  formattedOriginal: string;
}

export interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  supportedCurrencies: CurrencyInfo[];
  exchangeRates: ExchangeRateSnapshot;
  fxStatus: FxStatus;
  isLoading: boolean;
  convert: (amountInVnd: number) => ConvertedMoney;
  formatPrice: (amountInVnd: number, locale?: string) => string;
}
