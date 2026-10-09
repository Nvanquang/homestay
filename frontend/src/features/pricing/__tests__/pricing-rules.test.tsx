import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  PricingHierarchyStepper,
  BaselinePricingCard,
  PriceRulesTable,
  PriceRuleModal,
  PriceCalendarView,
  getPricingRulesOverview,
  upsertPriceRule,
  deletePriceRule,
  updateWeekendPrice,
  getPriceCalendar,
  PriceRule,
  CalendarPriceDay,
} from "../index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string, params?: Record<string, any>) => {
    if (params) {
      if (key === "monthYear") return `Tháng ${params.month}/${params.year}`;
      if (key === "subtitle") return `Đang có ${params.count} quy tắc giá đặc biệt`;
      if (key === "dayDetailPrefix") return `Chi tiết giá đêm ${params.date}`;
    }
    return key;
  },
  useLocale: () => "vi",
}));

describe("Slice FE-S10: Giá Theo Mùa & Ngày Lễ (H08)", () => {
  const sampleRules: PriceRule[] = [
    {
      id: "rule-1",
      listingId: "lst-101",
      type: "HOLIDAY",
      name: "Tết Nguyên Đán 2027",
      dateFrom: "2027-02-05",
      dateTo: "2027-02-12",
      nightlyPrice: 2400000,
      phase: "UPCOMING",
      createdAt: "2026-10-01T08:00:00Z",
      updatedAt: "2026-10-01T08:00:00Z",
    },
    {
      id: "rule-2",
      listingId: "lst-101",
      type: "SEASON",
      name: "Mùa Hè Cao Điểm",
      dateFrom: "2026-06-01",
      dateTo: "2026-08-31",
      nightlyPrice: 1600000,
      phase: "PAST",
      createdAt: "2026-05-15T09:00:00Z",
      updatedAt: "2026-05-15T09:00:00Z",
    },
  ];

  describe("1. Mock API & Pricing Hierarchy Engine", () => {
    it("trả về thông tin giá cơ sở và danh sách quy tắc giá của listing", async () => {
      const overview = await getPricingRulesOverview("lst-101", "vi");
      expect(overview.listingId).toBe("lst-101");
      expect(overview.baseNightlyPrice).toBeGreaterThan(0);
      expect(overview.weekendNightlyPrice).toBeGreaterThan(0);
      expect(overview.weekendNights).toEqual(["FRI", "SAT"]);
      expect(overview.rules.length).toBeGreaterThanOrEqual(2);
    });

    it("tính toán lịch giá theo thứ tự ưu tiên 4 bậc (Holiday > Season > Weekend > Base)", async () => {
      const days = await getPriceCalendar("lst-101", "2027-02", "vi");
      expect(days.length).toBe(28); // Tháng 2/2027 có 28 ngày

      // Đêm 2027-02-06 (Thứ 7 và là ngày Tết): Phải ưu tiên giá HOLIDAY (2.400.000) thay vì giá cuối tuần
      const tetDay = days.find((d) => d.date === "2027-02-06");
      expect(tetDay).toBeDefined();
      expect(tetDay?.source).toBe("HOLIDAY");
      expect(tetDay?.price).toBe(2400000);

      // Đêm 2027-02-20 (Thứ 7 bình thường không có lễ/mùa): Phải là giá WEEKEND
      const weekendDay = days.find((d) => d.date === "2027-02-20");
      expect(weekendDay).toBeDefined();
      expect(weekendDay?.source).toBe("WEEKEND");

      // Đêm 2027-02-23 (Thứ 3 ngày thường): Phải là giá BASE
      const baseDay = days.find((d) => d.date === "2027-02-23");
      expect(baseDay).toBeDefined();
      expect(baseDay?.source).toBe("BASE");
    });

    it("từ chối thêm quy tắc khi trùng lặp cùng nhóm ưu tiên [Assumption A6]", async () => {
      // Nhóm 1: Trùng ngày với Tết 2027 (05/02 - 12/02)
      const conflictRes = await upsertPriceRule({
        listingId: "lst-101",
        type: "HOLIDAY",
        name: "Lễ hội Mùa Xuân Trùng Lịch",
        dateFrom: "2027-02-08",
        dateTo: "2027-02-15",
        nightlyPrice: 2800000,
      });

      expect(conflictRes.success).toBe(false);
      expect(conflictRes.conflictingRules?.length).toBeGreaterThan(0);
      expect(conflictRes.error).toContain("trùng với quy tắc cùng bậc ưu tiên");
    });

    it("cho phép thêm quy tắc khác nhóm ưu tiên chồng lên nhau (Holiday chồng Season)", async () => {
      const validRes = await upsertPriceRule({
        listingId: "lst-101",
        type: "HOLIDAY",
        name: "Lễ Quốc Khánh 2026",
        dateFrom: "2026-09-01",
        dateTo: "2026-09-03",
        nightlyPrice: 2200000,
      });

      expect(validRes.success).toBe(true);
      expect(validRes.rule?.name).toBe("Lễ Quốc Khánh 2026");
    });

    it("cập nhật giá cuối tuần thành công", async () => {
      const res = await updateWeekendPrice("lst-101", 1750000);
      expect(res.success).toBe(true);
      expect(res.weekendNightlyPrice).toBe(1750000);
    });

    it("xóa quy tắc giá thành công", async () => {
      const res = await deletePriceRule("lst-101", "rule-103");
      expect(res.success).toBe(true);
    });
  });

  describe("2. UI Component: PricingHierarchyStepper", () => {
    it("hiển thị 4 bậc ưu tiên và hỗ trợ gập/mở", () => {
      render(<PricingHierarchyStepper />);
      expect(screen.getByTestId("pricing-hierarchy-stepper")).toBeDefined();
      expect(screen.getByText("headerTitle")).toBeDefined();
      expect(screen.getByText("tier1Title")).toBeDefined();
      expect(screen.getByText("tier2Title")).toBeDefined();
      expect(screen.getByText("tier3Title")).toBeDefined();
      expect(screen.getByText("tier4Title")).toBeDefined();

      // Bấm nút gập/mở
      const toggleBtn = screen.getByRole("button");
      fireEvent.click(toggleBtn);
      // Gập lại
    });
  });

  describe("3. UI Component: BaselinePricingCard", () => {
    it("hiển thị giá cơ bản và cho phép lưu giá cuối tuần", async () => {
      const handleSaveWeekend = vi.fn().mockResolvedValue(undefined);

      render(
        <BaselinePricingCard
          listingId="lst-101"
          locale="vi"
          baseNightlyPrice={1200000}
          weekendNightlyPrice={1500000}
          onSaveWeekendPrice={handleSaveWeekend}
        />
      );

      expect(screen.getByTestId("baseline-pricing-card")).toBeDefined();
      expect(screen.getByText(/1.200.000/)).toBeDefined();

      const saveBtn = screen.getByRole("button", { name: /saveBtn/i });
      fireEvent.click(saveBtn);
      await waitFor(() => {
        expect(handleSaveWeekend).toHaveBeenCalledWith(1500000);
      });
    });
  });

  describe("4. UI Component: PriceRulesTable", () => {
    it("hiển thị danh sách quy tắc, lọc và mở modal sửa/xóa", () => {
      const handleAdd = vi.fn();
      const handleEdit = vi.fn();
      const handleDelete = vi.fn();

      render(
        <PriceRulesTable
          rules={sampleRules}
          locale="vi"
          onAddRule={handleAdd}
          onEditRule={handleEdit}
          onDeleteRule={handleDelete}
        />
      );

      expect(screen.getByTestId("price-rules-table")).toBeDefined();
      expect(screen.getByText("Tết Nguyên Đán 2027")).toBeDefined();
      expect(screen.getByText("Mùa Hè Cao Điểm")).toBeDefined();

      const addBtn = screen.getByRole("button", { name: /addRuleBtn/i });
      fireEvent.click(addBtn);
      expect(handleAdd).toHaveBeenCalledTimes(1);

      const editBtns = screen.getAllByTitle("actionEdit");
      fireEvent.click(editBtns[0]);
      expect(handleEdit).toHaveBeenCalledWith(sampleRules[0]);
    });
  });

  describe("5. UI Component: PriceRuleModal", () => {
    it("render modal thêm quy tắc và validate form", async () => {
      const handleSave = vi.fn().mockResolvedValue({ success: true });

      render(
        <PriceRuleModal
          isOpen={true}
          listingId="lst-101"
          onClose={vi.fn()}
          onSave={handleSave}
        />
      );

      expect(screen.getByRole("dialog")).toBeDefined();
      const submitBtn = screen.getByRole("button", { name: /saveBtn/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalled();
      });
    });
  });

  describe("6. UI Component: PriceCalendarView", () => {
    it("render lịch giá theo tháng và hiển thị popover khi click vào ngày", () => {
      const sampleCalendarDays: CalendarPriceDay[] = [
        {
          date: "2027-02-05",
          price: 2400000,
          source: "HOLIDAY",
          sourceName: "Tết Nguyên Đán",
        },
        {
          date: "2027-02-06",
          price: 2400000,
          source: "HOLIDAY",
          sourceName: "Tết Nguyên Đán",
        },
      ];

      render(
        <PriceCalendarView
          year={2027}
          month={2}
          calendarDays={sampleCalendarDays}
          locale="vi"
          onPrevMonth={vi.fn()}
          onNextMonth={vi.fn()}
          onToday={vi.fn()}
        />
      );

      expect(screen.getByTestId("price-calendar-view")).toBeDefined();
      expect(screen.getByText("Tháng 02/2027")).toBeDefined();

      const dayCell = screen.getByTestId("price-day-2027-02-05");
      fireEvent.click(dayCell);
      expect(screen.getByText("Chi tiết giá đêm 2027-02-05")).toBeDefined();
    });
  });
});
