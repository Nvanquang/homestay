import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import {
  getListingDetail,
  calculateBookingQuote,
  getHostPublicProfile,
  getCancellationPolicies,
  StickyBookingBox,
  GalleryLightbox,
  HostCard,
  LocationSection,
  ListingDetailDTO,
  MOCK_LISTING_DETAIL_DL01,
} from "../index";

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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Slice FE-S12: Chi Tiết Phòng, Hồ Sơ Host & Chính Sách Hủy (P03, P04, P05)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Mock Listing Detail API & Pricing Engine", () => {
    it("lấy chi tiết listing đầy đủ thông tin ảnh, tiện nghi, host và nội quy", async () => {
      const listing = await getListingDetail("lst-dl-01");
      expect(listing).toBeDefined();
      expect(listing?.title).toContain("Mây Lang Thang");
      expect(listing?.photos.length).toBeGreaterThanOrEqual(5);
      expect(listing?.amenities.length).toBeGreaterThanOrEqual(8);
      expect(listing?.host.displayName).toBe("Nguyễn Văn An");
      expect(listing?.stayRules.minNights).toBe(2);
    });

    it("Pricing Engine tính đúng tiền phòng, phụ thu khách, phí vệ sinh, thuế và tổng tiền [BR-PRC-06]", async () => {
      // 3 nights (2 adults, 1 child = 3 total guests > 2 standard guests -> 1 extra guest)
      const quote = await calculateBookingQuote({
        listingId: "lst-dl-01",
        checkin: "2026-11-10",
        checkout: "2026-11-13",
        adults: 2,
        children: 1,
      });

      expect(quote.nights).toBe(3);
      expect(quote.guests).toBe(3);
      expect(quote.lines.some((l) => l.key === "ROOM")).toBe(true);
      expect(quote.lines.some((l) => l.key === "EXTRA_GUEST")).toBe(true);
      expect(quote.lines.some((l) => l.key === "CLEANING")).toBe(true);
      expect(quote.lines.some((l) => l.key === "SERVICE_FEE")).toBe(true);
      expect(quote.lines.some((l) => l.key === "TAX")).toBe(true);
      expect(quote.total).toBeGreaterThan(0);
      expect(quote.includesFeesAndTaxes).toBe(true);
    });

    it("áp dụng giảm giá theo tuần khi đặt từ 7 đêm trở lên", async () => {
      const quote = await calculateBookingQuote({
        listingId: "lst-dl-01",
        checkin: "2026-11-10",
        checkout: "2026-11-17",
        adults: 2,
        children: 0,
      });

      expect(quote.nights).toBe(7);
      const discountLine = quote.lines.find((l) => l.key === "DISCOUNT");
      expect(discountLine).toBeDefined();
      expect(discountLine?.amount).toBeLessThan(0); // Số âm
    });

    it("báo lỗi vi phạm MIN_NIGHTS khi đặt ít hơn 2 đêm", async () => {
      const quote = await calculateBookingQuote({
        listingId: "lst-dl-01",
        checkin: "2026-11-10",
        checkout: "2026-11-11", // 1 đêm
        adults: 2,
        children: 0,
      });

      expect(quote.violations).toBeDefined();
      expect(quote.violations?.some((v) => v.code === "MIN_NIGHTS")).toBe(true);
    });

    it("báo lỗi vi phạm CAPACITY khi vượt quá sức chứa tối đa", async () => {
      const quote = await calculateBookingQuote({
        listingId: "lst-dl-01",
        checkin: "2026-11-10",
        checkout: "2026-11-13",
        adults: 5, // Vượt quá maxGuests = 4
        children: 0,
      });

      expect(quote.violations).toBeDefined();
      expect(quote.violations?.some((v) => v.code === "CAPACITY")).toBe(true);
    });
  });

  describe("2. Host Profile & Cancellation Policies Mock", () => {
    it("lấy hồ sơ Host công khai và bảo mật thông tin cá nhân", async () => {
      const host = await getHostPublicProfile("host-01");
      expect(host).toBeDefined();
      expect(host?.displayName).toBe("Nguyễn Văn An");
      expect(host?.verified).toBe(true);
      // Không bao giờ chứa email/phone/identity docs
      expect((host as any).email).toBeUndefined();
      expect((host as any).phone).toBeUndefined();
      expect((host as any).idCard).toBeUndefined();
    });

    it("lấy danh sách 3 chính sách hủy với các mốc hoàn tiền", async () => {
      const policies = await getCancellationPolicies();
      expect(policies.length).toBe(3);
      expect(policies.some((p) => p.key === "FLEXIBLE")).toBe(true);
      expect(policies.some((p) => p.key === "MODERATE")).toBe(true);
      expect(policies.some((p) => p.key === "STRICT")).toBe(true);
      expect(policies[0].milestones.length).toBeGreaterThan(0);
    });

    it("hỗ trợ lấy chính sách hủy song ngữ tiếng Anh khi truyền locale='en'", async () => {
      const enPolicies = await getCancellationPolicies("en");
      expect(enPolicies.length).toBe(3);
      const flexEn = enPolicies.find((p) => p.key === "FLEXIBLE");
      expect(flexEn?.name).toBe("Flexible");
      expect(flexEn?.summary).toContain("Full refund");
      expect(flexEn?.milestones[0].label).toContain("24 hours before check-in");

      const listingEn = await getListingDetail("lst-dl-01", "en");
      expect(listingEn?.cancellationPolicy.name).toBe("Flexible");
      expect(listingEn?.title).toContain("May Lang Thang");

      const genericListingEn = await getListingDetail("lst-999", "en");
      expect(genericListingEn?.title).toContain("Premium Homestay Stay");
    });
  });

  describe("3. UI Component: StickyBookingBox (CMP-22)", () => {
    it("render hộp đặt phòng với giá ban đầu và CTA disabled ở giai đoạn 1", () => {
      render(<StickyBookingBox listing={MOCK_LISTING_DETAIL_DL01} />);

      expect(screen.getByTestId("sticky-booking-box")).toBeDefined();
      expect(screen.getByText(/1.250.000/)).toBeDefined();

      const ctaBtn = screen.getByTestId("booking-cta-btn");
      expect(ctaBtn).toBeDefined();
      expect((ctaBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it("tính toán và hiển thị PriceBreakdown khi chọn ngày hợp lệ", async () => {
      render(
        <StickyBookingBox
          listing={MOCK_LISTING_DETAIL_DL01}
          initialCheckin="2026-11-10"
          initialCheckout="2026-11-13"
          initialAdults={2}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/3 đêm/i)).toBeDefined();
        expect(screen.getByText(/Phí vệ sinh/i)).toBeDefined();
        expect(screen.getByText(/Thuế & phí/i)).toBeDefined();
      });
    });
  });

  describe("4. UI Component: GalleryLightbox (CMP-26)", () => {
    it("render lưới 1+4 ảnh và mở lightbox khi bấm xem tất cả ảnh", async () => {
      render(
        <GalleryLightbox
          photos={MOCK_LISTING_DETAIL_DL01.photos}
          title={MOCK_LISTING_DETAIL_DL01.title}
        />
      );

      const showAllBtn = screen.getByRole("button", { name: /showAllPhotosBtn/i });
      expect(showAllBtn).toBeDefined();

      await act(async () => {
        fireEvent.click(showAllBtn);
      });

      expect(screen.getByRole("dialog", { name: /lightboxTitle/i })).toBeDefined();
      expect(screen.getByText("1 / 8")).toBeDefined();
    });
  });

  describe("5. UI Component: HostCard (CMP-33) & LocationSection", () => {
    it("render HostCard có liên kết tới hồ sơ Host", () => {
      render(<HostCard host={MOCK_LISTING_DETAIL_DL01.host} />);

      expect(screen.getByText(/Nguyễn Văn An/i)).toBeDefined();
      expect(screen.getByText(/verifiedBadge/i)).toBeDefined();
      expect(screen.getByRole("link", { name: /viewProfileBtn/i })).toBeDefined();
    });

    it("render LocationSection với thông báo bảo vệ quyền riêng tư địa chỉ [BR-SRC-04]", () => {
      render(<LocationSection publicArea={MOCK_LISTING_DETAIL_DL01.publicArea} />);

      expect(screen.getByText(/Phường 3, Đà Lạt/i)).toBeDefined();
      expect(screen.getByText(/exactAddressNotice/i)).toBeDefined();
    });
  });
});
