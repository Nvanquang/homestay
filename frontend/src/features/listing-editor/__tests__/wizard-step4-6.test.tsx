import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Step4Amenities } from "../components/Step4Amenities";
import { Step5Rules } from "../components/Step5Rules";
import { Step6Pricing } from "../components/Step6Pricing";
import {
  bookingRulesSchema,
  pricingSchema,
  getBookingRulesSchema,
  getPricingSchema,
} from "../schemas";
import { calculatePricingPreview } from "../api/mock-pricing";
import { BookingRulesData, PricingData } from "../types";

// Mock next-intl
vi.mock("next-intl", () => ({
  useLocale: () => "vi",
  useTranslations: () => (key: string) => key,
}));

describe("Slice FE-S06: Wizard Bước 4-6 (Tiện nghi, Quy tắc lưu trú, Giá & Phí)", () => {
  /* ----------------------------------------------------
   * 1. Test Bước 4: Tiện nghi (Step4Amenities)
   * ---------------------------------------------------- */
  describe("Bước 4: Tiện nghi (Step4Amenities & CMP-29)", () => {
    it("hiển thị danh mục tiện nghi và bộ đếm số tiện nghi đã chọn", () => {
      const handleChange = vi.fn();
      render(
        <Step4Amenities
          selectedAmenityIds={["amenity-wifi", "amenity-aircon"]}
          onChange={handleChange}
        />
      );

      // Bộ đếm
      expect(screen.getByText("2 tiện nghi")).toBeDefined();
      // Danh mục
      expect(screen.getByText("Thiết yếu & Tiện nghi phòng")).toBeDefined();
      expect(screen.getByText("Wi-Fi tốc độ cao")).toBeDefined();
      expect(screen.getByText("Điều hoà không khí")).toBeDefined();
    });

    it("cho phép chọn và bỏ chọn tiện nghi", () => {
      const handleChange = vi.fn();
      render(
        <Step4Amenities
          selectedAmenityIds={["amenity-wifi"]}
          onChange={handleChange}
        />
      );

      // Nhấp chọn Điều hoà
      const airconBtn = screen.getByText("Điều hoà không khí").closest("button");
      expect(airconBtn).toBeTruthy();
      fireEvent.click(airconBtn!);

      expect(handleChange).toHaveBeenCalledWith(["amenity-wifi", "amenity-aircon"]);

      // Nhấp bỏ chọn Wifi
      const wifiBtn = screen.getByText("Wi-Fi tốc độ cao").closest("button");
      fireEvent.click(wifiBtn!);
      expect(handleChange).toHaveBeenCalledWith([]);
    });

    it("lọc tìm kiếm tiện nghi tức thời theo từ khoá", () => {
      render(
        <Step4Amenities
          selectedAmenityIds={[]}
          onChange={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Tìm tiện nghi/i);
      fireEvent.change(searchInput, { target: { value: "bể bơi" } });

      // Tiện ích Bể bơi xuất hiện, Wi-Fi bị ẩn
      expect(screen.getByText("Bể bơi riêng / Bể bơi chung")).toBeDefined();
      expect(screen.queryByText("Wi-Fi tốc độ cao")).toBeNull();
    });
  });

  /* ----------------------------------------------------
   * 2. Test Bước 5: Quy tắc lưu trú (Step5Rules & Validation)
   * ---------------------------------------------------- */
  describe("Bước 5: Quy tắc lưu trú (Step5Rules & Cross-field Validation)", () => {
    const mockRules: BookingRulesData = {
      minNights: 2,
      maxNights: 14,
      prepNights: 1,
      minNoticeHours: 24,
      maxAdvanceMonths: 12,
      houseRules: {
        smoking: false,
        pets: false,
        parties: false,
        quietHoursEnabled: true,
        quietHoursFrom: "22:00",
        quietHoursTo: "07:00",
        notes: "Giữ trật tự chung",
      },
    };

    it("hiển thị đúng số đêm tối thiểu và tối đa", () => {
      render(<Step5Rules data={mockRules} onChange={vi.fn()} />);

      expect(screen.getByText("2")).toBeDefined(); // minNights
      expect(screen.getByText("14")).toBeDefined(); // maxNights
      expect(screen.getByText("Chặn 1 đêm dọn dẹp")).toBeDefined();
    });

    it("kiểm tra chéo validation: Đêm tối thiểu KHÔNG được lớn hơn đêm tối đa (S06 AC)", () => {
      const invalidData = {
        ...mockRules,
        minNights: 5,
        maxNights: 3, // min > max
      };

      const result = bookingRulesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message);
        expect(errorMessages).toContain("Đêm tối thiểu không được lớn hơn đêm tối đa");
      }

      // Render báo lỗi chéo trực quan
      render(
        <Step5Rules
          data={invalidData}
          onChange={vi.fn()}
          crossFieldError="Đêm tối thiểu không được lớn hơn đêm tối đa"
        />
      );

      expect(
        screen.getByText("✕ Đêm tối thiểu không được lớn hơn đêm tối đa")
      ).toBeDefined();
    });

    it("hợp lệ khi đêm tối thiểu <= đêm tối đa", () => {
      const validData = {
        ...mockRules,
        minNights: 2,
        maxNights: 10,
      };

      const result = bookingRulesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("hỗ trợ song ngữ cho validation schema", () => {
      const enSchema = getBookingRulesSchema("en");
      const res = enSchema.safeParse({
        ...mockRules,
        minNights: 10,
        maxNights: 5,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe(
          "Minimum nights cannot be greater than maximum nights"
        );
      }
    });
  });

  /* ----------------------------------------------------
   * 3. Test Bước 6: Giá & Phí và Bảng giá xem trước (Step6Pricing)
   * ---------------------------------------------------- */
  describe("Bước 6: Giá & Phí và Bảng giá xem trước (Step6Pricing & PricingEngine)", () => {
    const mockPricing: PricingData = {
      baseNightlyPrice: 1000000,
      weekendNightlyPrice: 1200000,
      cleaningFee: 200000,
      baseGuests: 2,
      extraGuestFee: 150000,
      weeklyDiscountPct: 10,
      monthlyDiscountPct: 25,
      currency: "VND",
    };

    it("tính toán đúng tiền phòng cho 3 đêm tiêu chuẩn", () => {
      const result = calculatePricingPreview(
        mockPricing,
        { minNights: 1, maxNights: 30 },
        {
          checkIn: "2026-10-12", // Monday
          checkOut: "2026-10-15", // Thursday (3 weeknights)
          guests: 2, // base guests
        }
      );

      expect(result.nights).toBe(3);
      expect(result.roomSubtotal).toBe(3000000); // 3 * 1.000.000
      expect(result.cleaningFee).toBe(200000);
      expect(result.extraGuestTotal).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.hostTotal).toBe(3200000); // 3.000.000 + 200.000
      expect(result.platformFeeAmount).toBe(96000); // 3% of 3.200.000
    });

    it("tính toán phụ thu khách thêm chính xác", () => {
      const result = calculatePricingPreview(
        mockPricing,
        { minNights: 1, maxNights: 30 },
        {
          checkIn: "2026-10-12",
          checkOut: "2026-10-14", // 2 nights
          guests: 4, // 2 extra guests (4 - 2)
        }
      );

      expect(result.extraGuestsCount).toBe(2);
      // 2 guests * 150.000/guest/night * 2 nights = 600.000
      expect(result.extraGuestTotal).toBe(600000);
      expect(result.hostTotal).toBe(2000000 + 600000 + 200000);
    });

    it("áp dụng chiết khấu tuần khi lưu trú từ 7 đêm (≥7 đêm)", () => {
      const result = calculatePricingPreview(
        mockPricing,
        { minNights: 1, maxNights: 30 },
        {
          checkIn: "2026-10-01",
          checkOut: "2026-10-08", // 7 nights
          guests: 2,
        }
      );

      expect(result.nights).toBe(7);
      expect(result.discountType).toBe("WEEKLY");
      expect(result.discountPct).toBe(10);
      // 10% of room subtotal
      expect(result.discountAmount).toBe(Math.round(result.roomSubtotal * 0.1));
    });

    it("áp dụng quy tắc BR-PRC-02: Đủ cả 2 điều kiện (≥28 đêm) thì áp dụng mức giảm tháng", () => {
      const result = calculatePricingPreview(
        mockPricing,
        { minNights: 1, maxNights: 60 },
        {
          checkIn: "2026-10-01",
          checkOut: "2026-10-31", // 30 nights (>= 28)
          guests: 2,
        }
      );

      expect(result.nights).toBe(30);
      expect(result.discountType).toBe("MONTHLY");
      expect(result.discountPct).toBe(25);
      // Giảm 25% tháng
      expect(result.discountAmount).toBe(Math.round(result.roomSubtotal * 0.25));
    });

    it("cảnh báo vi phạm khi số đêm ít hơn minNights hoặc nhiều hơn maxNights", () => {
      const result = calculatePricingPreview(
        mockPricing,
        { minNights: 3, maxNights: 10 },
        {
          checkIn: "2026-10-01",
          checkOut: "2026-10-02", // 1 night (min is 3)
          guests: 2,
        }
      );

      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0].code).toBe("MIN_NIGHTS");
    });

    it("validate pricingSchema bắt buộc giá cơ bản >= 10.000₫", () => {
      const invalid = {
        ...mockPricing,
        baseNightlyPrice: 0,
      };

      const res = pricingSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });
});
