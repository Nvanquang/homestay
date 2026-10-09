import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import {
  CurrencyProvider,
  useCurrency,
  CurrencySwitcher,
  CurrencyFxBanner,
  SUPPORTED_CURRENCIES,
  DEFAULT_FX_SNAPSHOT,
  getExchangeRates,
  getStoredPreferredCurrency,
  storePreferredCurrency,
  setMockFxStatus,
  resetMockFxSnapshot,
} from "../index";
import { PopularDestinations } from "@/features/search";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string, params?: Record<string, any>) => {
    if (params) {
      let str = `${namespace ? namespace + "." : ""}${key}`;
      Object.entries(params).forEach(([k, v]) => {
        str += `_${k}:${v}`;
      });
      return str;
    }
    return `${namespace ? namespace + "." : ""}${key}`;
  },
  useLocale: () => "vi",
}));

// Test helper component to consume useCurrency
function CurrencyConsumer() {
  const { currency, setCurrency, convert, formatPrice, fxStatus } = useCurrency();
  const convertedUsd = convert(2500000);
  const convertedJpy = convert(1000000);

  return (
    <div>
      <div data-testid="current-currency">{currency}</div>
      <div data-testid="fx-status">{fxStatus}</div>
      <div data-testid="converted-usd-formatted">{convertedUsd.formatted}</div>
      <div data-testid="converted-usd-amount">{convertedUsd.amount}</div>
      <div data-testid="converted-usd-is-converted">{convertedUsd.isConverted ? "yes" : "no"}</div>
      <div data-testid="converted-jpy-amount">{convertedJpy.amount}</div>
      <div data-testid="price-formatted">{formatPrice(1250000, "vi")}</div>
      <button onClick={() => setCurrency("USD")}>Switch to USD</button>
      <button onClick={() => setCurrency("JPY")}>Switch to JPY</button>
      <button onClick={() => setCurrency("VND")}>Switch to VND</button>
    </div>
  );
}

describe("Slice FE-S13: Chuyển Đổi Đa Tiền Tệ & Tỷ Giá (C02, P02, P03 Mở Rộng)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetMockFxSnapshot();
  });

  describe("1. Currency Types, Constants & Persistence", () => {
    it("hỗ trợ đầy đủ 5 loại tiền tệ cơ bản với số chữ số thập phân chuẩn", () => {
      expect(SUPPORTED_CURRENCIES.length).toBe(5);
      const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
      expect(codes).toEqual(["VND", "USD", "EUR", "JPY", "GBP"]);

      const vnd = SUPPORTED_CURRENCIES.find((c) => c.code === "VND");
      const usd = SUPPORTED_CURRENCIES.find((c) => c.code === "USD");
      const jpy = SUPPORTED_CURRENCIES.find((c) => c.code === "JPY");

      expect(vnd?.decimals).toBe(0);
      expect(jpy?.decimals).toBe(0);
      expect(usd?.decimals).toBe(2);
    });

    it("lưu trữ và phục hồi tiền tệ ưa thích qua localStorage", () => {
      expect(getStoredPreferredCurrency()).toBe("VND");

      storePreferredCurrency("EUR");
      expect(getStoredPreferredCurrency()).toBe("EUR");

      storePreferredCurrency("USD");
      expect(getStoredPreferredCurrency()).toBe("USD");
    });

    it("trả về snapshot tỷ giá quy đổi hợp lệ từ Mock API", async () => {
      const snapshot = await getExchangeRates();
      expect(snapshot.base).toBe("VND");
      expect(snapshot.status).toBe("OK");
      expect(snapshot.rates.VND).toBe(1);
      expect(snapshot.rates.USD).toBeGreaterThan(0);
      expect(snapshot.rates.EUR).toBeGreaterThan(0);
      expect(snapshot.rates.JPY).toBeGreaterThan(0);
      expect(snapshot.rates.GBP).toBeGreaterThan(0);
    });
  });

  describe("2. Conversion Engine & Fallback Invariants", () => {
    it("giữ nguyên số tiền VND khi tiền tệ đang chọn là VND", () => {
      render(
        <CurrencyProvider>
          <CurrencyConsumer />
        </CurrencyProvider>
      );

      expect(screen.getByTestId("current-currency").textContent).toBe("VND");
      expect(screen.getByTestId("converted-usd-is-converted").textContent).toBe("no");
      expect(screen.getByTestId("converted-usd-amount").textContent).toBe("2500000");
    });

    it("quy đổi chính xác sang USD có 2 chữ số thập phân và tiền tố '≈'", async () => {
      render(
        <CurrencyProvider>
          <CurrencyConsumer />
        </CurrencyProvider>
      );

      // Chuyển sang USD
      fireEvent.click(screen.getByText("Switch to USD"));

      await waitFor(() => {
        expect(screen.getByTestId("current-currency").textContent).toBe("USD");
      });

      // 2,500,000 * 0.00004 = 100 USD
      expect(screen.getByTestId("converted-usd-amount").textContent).toBe("100");
      expect(screen.getByTestId("converted-usd-formatted").textContent).toContain("≈");
      expect(screen.getByTestId("converted-usd-is-converted").textContent).toBe("yes");
    });

    it("quy đổi sang JPY làm tròn không có chữ số thập phân", async () => {
      render(
        <CurrencyProvider>
          <CurrencyConsumer />
        </CurrencyProvider>
      );

      fireEvent.click(screen.getByText("Switch to JPY"));

      await waitFor(() => {
        expect(screen.getByTestId("current-currency").textContent).toBe("JPY");
      });

      // 1,000,000 * 0.0062 = 6200 JPY
      expect(screen.getByTestId("converted-jpy-amount").textContent).toBe("6200");
    });

    it("fallback về VND khi tỷ giá ở trạng thái STALE hoặc UNAVAILABLE", async () => {
      setMockFxStatus("UNAVAILABLE");

      render(
        <CurrencyProvider>
          <CurrencyConsumer />
        </CurrencyProvider>
      );

      fireEvent.click(screen.getByText("Switch to USD"));

      await waitFor(() => {
        // Khi UNAVAILABLE, convert bắt buộc fallback về VND
        expect(screen.getByTestId("converted-usd-is-converted").textContent).toBe("no");
        expect(screen.getByTestId("converted-usd-amount").textContent).toBe("2500000");
      });
    });

    it("PopularDestinations hiển thị giá quy đổi khi người dùng chuyển sang USD", async () => {
      const mockDestinations = [
        {
          id: "dest-1",
          name: "Đà Lạt, Lâm Đồng",
          regionId: "reg-dl",
          listingCount: 148,
          startingPrice: 650000,
          imageUrl: "https://example.com/dalat.jpg",
        },
      ];

      render(
        <CurrencyProvider>
          <PopularDestinations destinations={mockDestinations} />
          <CurrencyConsumer />
        </CurrencyProvider>
      );

      // Ban đầu VND
      expect(screen.getByText(/650\.000/)).toBeDefined();

      // Đổi sang USD
      fireEvent.click(screen.getByText("Switch to USD"));

      await waitFor(() => {
        // 650,000 * 0.00004 = 26 USD
        expect(screen.getByText(/≈ \$26/)).toBeDefined();
      });
    });
  });

  describe("3. UI Component: CurrencySwitcher", () => {
    it("render nút bấm hiển thị mã tiền tệ và symbol", () => {
      render(
        <CurrencyProvider>
          <CurrencySwitcher />
        </CurrencyProvider>
      );

      const btn = screen.getByRole("button", { name: /currency.switchCurrencyAria/i });
      expect(btn).toBeDefined();
      expect(btn.textContent).toContain("VND");
      expect(btn.textContent).toContain("₫");
    });

    it("mở dropdown và liệt kê danh sách tiền tệ hỗ trợ khi bấm", async () => {
      render(
        <CurrencyProvider>
          <CurrencySwitcher />
        </CurrencyProvider>
      );

      const btn = screen.getByRole("button", { name: /currency.switchCurrencyAria/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(screen.getByText("currency.selectCurrencyTitle")).toBeDefined();
        expect(screen.getByPlaceholderText("currency.searchPlaceholder")).toBeDefined();
        expect(screen.getByText("USD")).toBeDefined();
        expect(screen.getByText("EUR")).toBeDefined();
      });
    });

    it("lọc danh sách tiền tệ bằng ô tìm kiếm", async () => {
      render(
        <CurrencyProvider>
          <CurrencySwitcher />
        </CurrencyProvider>
      );

      const btn = screen.getByRole("button", { name: /currency.switchCurrencyAria/i });
      fireEvent.click(btn);

      const searchInput = screen.getByPlaceholderText("currency.searchPlaceholder");
      fireEvent.change(searchInput, { target: { value: "Euro" } });

      await waitFor(() => {
        expect(screen.getByText("EUR")).toBeDefined();
        expect(screen.queryByText("JPY")).toBeNull();
      });
    });

    it("cho phép chọn tiền tệ mới và đóng dropdown sau khi chọn", async () => {
      render(
        <CurrencyProvider>
          <CurrencySwitcher />
          <CurrencyConsumer />
        </CurrencyProvider>
      );

      const btn = screen.getByRole("button", { name: /currency.switchCurrencyAria/i });
      fireEvent.click(btn);

      const usdOption = screen.getByText("USD").closest("button");
      expect(usdOption).toBeDefined();
      fireEvent.click(usdOption!);

      await waitFor(() => {
        expect(screen.getByTestId("current-currency").textContent).toBe("USD");
        expect(screen.queryByText("currency.selectCurrencyTitle")).toBeNull();
      });

      // Kiểm tra đã lưu vào localStorage
      expect(localStorage.getItem("homestay_preferred_currency")).toBe("USD");
    });
  });

  describe("4. UI Component: CurrencyFxBanner", () => {
    it("không hiển thị khi tỷ giá OK", () => {
      const { container } = render(
        <CurrencyProvider>
          <CurrencyFxBanner />
        </CurrencyProvider>
      );

      expect(container.querySelector('[role="alert"]')).toBeNull();
    });

    it("hiển thị banner cảnh báo khi tỷ giá STALE", async () => {
      setMockFxStatus("STALE");

      render(
        <CurrencyProvider>
          <CurrencyFxBanner />
        </CurrencyProvider>
      );

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toBeDefined();
        expect(alert.textContent).toContain("currency.fxStaleBanner");
      });
    });

    it("hiển thị banner cảnh báo khi tỷ giá UNAVAILABLE", async () => {
      setMockFxStatus("UNAVAILABLE");

      render(
        <CurrencyProvider>
          <CurrencyFxBanner />
        </CurrencyProvider>
      );

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toBeDefined();
        expect(alert.textContent).toContain("currency.fxUnavailableBanner");
      });
    });
  });
});
