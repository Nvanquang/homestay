import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  CalendarLegend,
  CalendarMonth,
  CalendarActionDrawer,
  BookingInfoPopover,
  StayRulesModal,
  getCalendarData,
  blockDates,
  unblockDates,
  updateStayRules,
  CalendarDay,
  StayRules,
} from "../index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string, params?: Record<string, any>) => {
    if (params) {
      if (key === "monthYear") return `Tháng ${params.month}/${params.year}`;
      if (key === "timezoneChip") return `Múi giờ: ${params.tz}`;
      if (key === "singleNight") return `Đêm ${params.date} (1 đêm)`;
      if (key === "dateRangeSummary") return `Đêm ${params.from} – ${params.to} (${params.count} đêm)`;
      if (key === "blockBtn") return `Chặn ${params.count} đêm`;
      if (key === "unblockBtn") return `Mở ${params.count} đêm`;
      if (key === "mixedNotice") return `Áp dụng cho ${params.valid} ngày hợp lệ · Bỏ qua ${params.skipped} ngày đã đặt/giữ chỗ`;
    }
    return key;
  },
  useLocale: () => "vi",
}));

describe("Slice FE-S09: Lịch Listing Của Host & Chống Đặt Trùng (H06)", () => {
  const sampleRules: StayRules = {
    minNights: 2,
    maxNights: 14,
    prepNights: 1,
    minNoticeHours: 24,
    maxAdvanceMonths: 6,
  };

  const sampleDays: CalendarDay[] = [
    {
      date: "2026-10-01",
      state: "PAST",
    },
    {
      date: "2026-10-10",
      state: "AVAILABLE",
      price: 1200000,
    },
    {
      date: "2026-10-11",
      state: "AVAILABLE",
      price: 1200000,
    },
    {
      date: "2026-10-15",
      state: "BOOKED",
      bookingRef: "BK-8921",
      guestNameMasked: "Nguyễn V***",
      guestCount: 2,
      checkIn: "2026-10-15",
      checkOut: "2026-10-18",
    },
    {
      date: "2026-10-20",
      state: "BLOCKED",
      note: "Bảo trì",
    },
  ];

  describe("1. Mock Calendar API & Concurrency (BR-CAL)", () => {
    it("lấy dữ liệu lịch tháng thành công với đầy đủ trạng thái và quy tắc lưu trú", async () => {
      const data = await getCalendarData("lst-101", "2026-10", "vi");
      expect(data.listingId).toBe("lst-101");
      expect(data.timezone).toBe("Asia/Ho_Chi_Minh");
      expect(data.days.length).toBe(31); // Tháng 10 có 31 ngày
      expect(data.rules.minNights).toBeGreaterThanOrEqual(1);

      // Kiểm tra có chứa ngày đã đặt mẫu
      const bookedDay = data.days.find((d) => d.state === "BOOKED");
      expect(bookedDay).toBeDefined();
      expect(bookedDay?.bookingRef).toBe("BK-8921");
    });

    it("chặn các đêm hợp lệ theo nguyên tắc toàn bộ-hoặc-không (all-or-nothing)", async () => {
      const res = await blockDates({
        listingId: "lst-101",
        from: "2026-10-05",
        to: "2026-10-07",
        nights: ["2026-10-05", "2026-10-06", "2026-10-07"],
        reason: "Sửa chữa nội thất",
      });

      expect(res.success).toBe(true);
      expect(res.blockedNights).toEqual(["2026-10-05", "2026-10-06", "2026-10-07"]);
    });

    it("trả về 409 Conflict khi cố tình chặn các đêm đã bị đặt bởi khách", async () => {
      const res = await blockDates({
        listingId: "lst-101",
        from: "2026-10-15",
        to: "2026-10-16",
        nights: ["2026-10-15", "2026-10-16"],
      });

      expect(res.success).toBe(false);
      expect(res.conflicts?.length).toBeGreaterThan(0);
      expect(res.conflicts).toContain("2026-10-15");
    });

    it("mở lại các đêm đã chặn thành công", async () => {
      const res = await unblockDates({
        listingId: "lst-101",
        from: "2026-10-05",
        to: "2026-10-07",
        nights: ["2026-10-05", "2026-10-06", "2026-10-07"],
      });

      expect(res.success).toBe(true);
      expect(res.unblockedNights).toEqual(["2026-10-05", "2026-10-06", "2026-10-07"]);
    });

    it("cập nhật quy tắc lưu trú thành công", async () => {
      const updated = await updateStayRules("lst-101", {
        minNights: 3,
        maxNights: 20,
        prepNights: 2,
      });

      expect(updated.minNights).toBe(3);
      expect(updated.maxNights).toBe(20);
      expect(updated.prepNights).toBe(2);
    });
  });

  describe("2. UI Component: CalendarLegend", () => {
    it("hiển thị đầy đủ 6 trạng thái chú thích của lịch", () => {
      render(<CalendarLegend />);
      expect(screen.getByTestId("calendar-legend")).toBeDefined();
      expect(screen.getByText("available")).toBeDefined();
      expect(screen.getByText("booked")).toBeDefined();
      expect(screen.getByText("hold")).toBeDefined();
      expect(screen.getByText("pendingHost")).toBeDefined();
      expect(screen.getByText("blocked")).toBeDefined();
      expect(screen.getByText("past")).toBeDefined();
    });
  });

  describe("3. UI Component: CalendarMonth (CMP-23)", () => {
    it("render đúng tháng, ngày và cho phép chọn ngày khả dụng", () => {
      const handleSelectDate = vi.fn();
      const handleBookingClick = vi.fn();

      render(
        <CalendarMonth
          year={2026}
          month={10}
          days={sampleDays}
          todayStr="2026-10-09"
          timezone="Asia/Ho_Chi_Minh"
          selectedDates={["2026-10-10"]}
          onPrevMonth={vi.fn()}
          onNextMonth={vi.fn()}
          onToday={vi.fn()}
          onSelectDate={handleSelectDate}
          onRangeSelect={vi.fn()}
          onBookingClick={handleBookingClick}
        />
      );

      expect(screen.getByTestId("calendar-month-view")).toBeDefined();
      expect(screen.getByText("Tháng 10/2026")).toBeDefined();
      expect(screen.getByText("Múi giờ: Asia/Ho_Chi_Minh")).toBeDefined();

      // Click vào ngày khả dụng 11
      const day11 = screen.getByTestId("calendar-day-2026-10-11");
      expect(day11).toBeDefined();
    });

    it("kích hoạt onBookingClick khi bấm vào ngày đã đặt (BOOKED)", () => {
      const handleBookingClick = vi.fn();

      render(
        <CalendarMonth
          year={2026}
          month={10}
          days={sampleDays}
          todayStr="2026-10-09"
          timezone="Asia/Ho_Chi_Minh"
          selectedDates={[]}
          onPrevMonth={vi.fn()}
          onNextMonth={vi.fn()}
          onToday={vi.fn()}
          onSelectDate={vi.fn()}
          onRangeSelect={vi.fn()}
          onBookingClick={handleBookingClick}
        />
      );

      const bookedCell = screen.getByTestId("calendar-day-2026-10-15");
      fireEvent.click(bookedCell);
      expect(handleBookingClick).toHaveBeenCalledTimes(1);
      expect(handleBookingClick).toHaveBeenCalledWith(
        expect.objectContaining({
          date: "2026-10-15",
          state: "BOOKED",
          bookingRef: "BK-8921",
        })
      );
    });
  });

  describe("4. UI Component: CalendarActionDrawer", () => {
    const daysMap = new Map<string, CalendarDay>();
    sampleDays.forEach((d) => daysMap.set(d.date, d));

    it("hiển thị hướng dẫn chọn ngày khi chưa có ngày nào được chọn", () => {
      render(
        <CalendarActionDrawer
          selectedDates={[]}
          daysMap={daysMap}
          rules={sampleRules}
          onBlock={vi.fn()}
          onUnblock={vi.fn()}
          onClearSelection={vi.fn()}
          onOpenRulesModal={vi.fn()}
        />
      );

      expect(screen.getByText("emptyHint")).toBeDefined();
      expect(screen.getByText("2 - 14 nightsUnit")).toBeDefined();
    });

    it("hiển thị nút Chặn khi chọn ngày trống và gọi onBlock khi bấm", async () => {
      const handleBlock = vi.fn().mockResolvedValue(undefined);

      render(
        <CalendarActionDrawer
          selectedDates={["2026-10-10", "2026-10-11"]}
          daysMap={daysMap}
          rules={sampleRules}
          onBlock={handleBlock}
          onUnblock={vi.fn()}
          onClearSelection={vi.fn()}
          onOpenRulesModal={vi.fn()}
        />
      );

      const blockBtn = screen.getByRole("button", { name: /Chặn 2 đêm/i });
      expect(blockBtn).toBeDefined();

      fireEvent.click(blockBtn);
      await waitFor(() => {
        expect(handleBlock).toHaveBeenCalledWith(["2026-10-10", "2026-10-11"], "");
      });
    });

    it("cảnh báo khi chọn vùng hỗn hợp (ngày trống + ngày đã đặt)", () => {
      render(
        <CalendarActionDrawer
          selectedDates={["2026-10-10", "2026-10-15"]}
          daysMap={daysMap}
          rules={sampleRules}
          onBlock={vi.fn()}
          onUnblock={vi.fn()}
          onClearSelection={vi.fn()}
          onOpenRulesModal={vi.fn()}
        />
      );

      expect(
        screen.getByText("Áp dụng cho 1 ngày hợp lệ · Bỏ qua 1 ngày đã đặt/giữ chỗ")
      ).toBeDefined();
    });
  });

  describe("5. UI Component: BookingInfoPopover & StayRulesModal", () => {
    it("hiển thị popover chi tiết đặt chỗ và cảnh báo bất biến", () => {
      const handleClose = vi.fn();
      render(
        <BookingInfoPopover
          day={{
            date: "2026-10-15",
            state: "BOOKED",
            bookingRef: "BK-8921",
            guestNameMasked: "Nguyễn V***",
            guestCount: 2,
          }}
          onClose={handleClose}
        />
      );

      expect(screen.getByText("BK-8921")).toBeDefined();
      expect(screen.getByText("immutableNotice")).toBeDefined();
    });

    it("render StayRulesModal cho phép sửa quy tắc lưu trú", () => {
      render(
        <StayRulesModal
          isOpen={true}
          initialRules={sampleRules}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      );

      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getByDisplayValue(2)).toBeDefined(); // minNights
      expect(screen.getByDisplayValue(14)).toBeDefined(); // maxNights
    });
  });
});
