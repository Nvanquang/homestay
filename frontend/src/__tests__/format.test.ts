import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatDate,
  formatStayDate,
  formatDateRange,
} from "@/lib/format";

describe("Format Utilities (src/lib/format.ts)", () => {
  describe("formatMoney", () => {
    it("formats VND amounts without decimals", () => {
      const formattedVi = formatMoney(1200000, "VND", "vi");
      // Replace non-breaking spaces with normal spaces for assertion resilience
      const normalizedVi = formattedVi.replace(/\u00a0/g, " ");
      expect(normalizedVi).toContain("1.200.000");
      expect(normalizedVi).toContain("₫");

      const formattedEn = formatMoney(1200000, "VND", "en");
      const normalizedEn = formattedEn.replace(/\u00a0/g, " ");
      expect(normalizedEn).toContain("1,200,000");
    });

    it("formats USD amounts with two decimal places", () => {
      const formattedEn = formatMoney(150.5, "USD", "en");
      expect(formattedEn).toContain("150.50");
      expect(formattedEn).toContain("$");

      const formattedVi = formatMoney(150.5, "USD", "vi");
      expect(formattedVi).toContain("150,50");
      expect(formattedVi).toContain("$");
    });

    it("handles zero, null, and undefined values safely", () => {
      const zeroVnd = formatMoney(0, "VND", "vi").replace(/\u00a0/g, " ");
      expect(zeroVnd).toContain("0");
      expect(zeroVnd).toContain("₫");

      const nullVnd = formatMoney(null, "VND", "vi").replace(/\u00a0/g, " ");
      expect(nullVnd).toContain("0");

      const undefinedUsd = formatMoney(undefined, "USD", "en");
      expect(undefinedUsd).toContain("0.00");
    });
  });

  describe("formatDate & formatStayDate", () => {
    const testDate = new Date("2026-10-15T10:00:00Z");

    it("formats date to ISO StayDate format (YYYY-MM-DD)", () => {
      const stayDate = formatStayDate(testDate, "Asia/Ho_Chi_Minh");
      // 10:00 UTC is 17:00 in UTC+7 (same day)
      expect(stayDate).toBe("2026-10-15");
    });

    it("formats date with short, medium and long styles", () => {
      const shortStr = formatDate(testDate, { style: "short", locale: "vi" });
      expect(shortStr).toContain("15");
      expect(shortStr).toContain("10");
      expect(shortStr).toContain("2026");

      const enMedium = formatDate(testDate, { style: "medium", locale: "en" });
      expect(enMedium).toContain("Oct");
      expect(enMedium).toContain("15");
      expect(enMedium).toContain("2026");
    });

    it("handles invalid or null dates gracefully", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
      expect(formatDate("invalid-date-string")).toBe("");
    });
  });

  describe("formatDateRange", () => {
    it("formats a check-in and check-out range", () => {
      const checkIn = new Date("2026-10-15T14:00:00Z");
      const checkOut = new Date("2026-10-20T11:00:00Z");

      const rangeVi = formatDateRange(checkIn, checkOut, "vi");
      expect(rangeVi).toContain("15");
      expect(rangeVi).toContain("20");
      expect(rangeVi).toContain("–");

      const rangeEn = formatDateRange(checkIn, checkOut, "en");
      expect(rangeEn).toContain("Oct");
      expect(rangeEn).toContain("15");
      expect(rangeEn).toContain("20");
    });
  });
});
