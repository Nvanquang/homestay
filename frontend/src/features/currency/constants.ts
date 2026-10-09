import { CurrencyInfo, ExchangeRateSnapshot } from "./types";

export const CURRENCY_STORAGE_KEY = "homestay_preferred_currency";

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  {
    code: "VND",
    symbol: "₫",
    name: "Đồng Việt Nam",
    nameEn: "Vietnamese Dong",
    decimals: 0,
  },
  {
    code: "USD",
    symbol: "$",
    name: "Đô la Mỹ",
    nameEn: "US Dollar",
    decimals: 2,
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    nameEn: "Euro",
    decimals: 2,
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Yên Nhật",
    nameEn: "Japanese Yen",
    decimals: 0,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "Bảng Anh",
    nameEn: "British Pound",
    decimals: 2,
  },
];

export const DEFAULT_FX_SNAPSHOT: ExchangeRateSnapshot = {
  base: "VND",
  status: "OK",
  asOf: "2026-10-09",
  rates: {
    VND: 1,
    USD: 0.00004, // 1 USD ~ 25,000 VND
    EUR: 0.000037, // 1 EUR ~ 27,027 VND
    JPY: 0.0062, // 1 JPY ~ 161.29 VND
    GBP: 0.000031, // 1 GBP ~ 32,258 VND
  },
  source: "State Bank of Vietnam (SBV) Reference Rates",
};
