/**
 * Utility functions for currency and date formatting.
 * Complies with specifications in docs/base/08-i18n-seo-hieu-nang-truy-cap.md
 * and docs/giai-doan-1/00-foundations/common-data.md.
 */

export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

export interface FormatDateOptions {
  locale?: string;
  timeZone?: string;
  style?: "short" | "medium" | "long" | "isoDate";
}

/**
 * Formats a monetary amount into a localized currency string.
 * @param amount - Value in base unit (e.g. integer Dong for VND, whole/decimal Dollars for USD)
 * @param currency - ISO 4217 currency code ('VND', 'USD', etc.)
 * @param locale - BCP 47 language tag ('vi', 'en', 'vi-VN', 'en-US')
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: string = "VND",
  locale: string = "vi"
): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const upperCurrency = currency.toUpperCase();
  const targetLocale = locale.startsWith("en") ? "en-US" : "vi-VN";

  const fractionDigits = upperCurrency === "VND" ? 0 : 2;

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency: upperCurrency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safeAmount);
  } catch {
    // Fallback if currency code is unrecognized
    return `${safeAmount.toLocaleString(targetLocale)} ${upperCurrency}`;
  }
}

/**
 * Formats a date using Intl.DateTimeFormat with listing timezone support.
 * @param date - Date object, ISO timestamp string, or milliseconds timestamp
 * @param options - Locale, timeZone, and formatting style
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  options: FormatDateOptions = {}
): string {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const {
    locale = "vi",
    timeZone = DEFAULT_TIMEZONE,
    style = "medium",
  } = options;

  const targetLocale = locale.startsWith("en") ? "en-US" : "vi-VN";

  if (style === "isoDate") {
    // Return standard YYYY-MM-DD in the specified timezone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(d);
  }

  const intlOptions: Intl.DateTimeFormatOptions = {
    timeZone,
  };

  switch (style) {
    case "short":
      intlOptions.day = "2-digit";
      intlOptions.month = "2-digit";
      intlOptions.year = "numeric";
      break;
    case "long":
      intlOptions.weekday = "long";
      intlOptions.day = "numeric";
      intlOptions.month = "long";
      intlOptions.year = "numeric";
      break;
    case "medium":
    default:
      intlOptions.day = "numeric";
      intlOptions.month = "short";
      intlOptions.year = "numeric";
      break;
  }

  return new Intl.DateTimeFormat(targetLocale, intlOptions).format(d);
}

/**
 * Formats a StayDate (YYYY-MM-DD) based on listing timezone.
 */
export function formatStayDate(
  date: Date | string | number,
  timeZone: string = DEFAULT_TIMEZONE
): string {
  return formatDate(date, { style: "isoDate", timeZone });
}

/**
 * Formats a check-in and check-out date range.
 */
export function formatDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  locale: string = "vi",
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const startStr = formatDate(startDate, { locale, timeZone, style: "medium" });
  const endStr = formatDate(endDate, { locale, timeZone, style: "medium" });

  if (!startStr || !endStr) return startStr || endStr || "";

  return `${startStr} – ${endStr}`;
}
