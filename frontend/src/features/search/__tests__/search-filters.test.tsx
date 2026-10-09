import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import {
  getDestinationSuggestions,
  getPopularDestinations,
  getFeaturedListings,
  searchListings,
  getSearchCount,
  SearchBar,
  ListingCard,
  FilterBar,
  MapPanel,
  ListingCardDTO,
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
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/vi/search",
}));

describe("Slice FE-S11: Trang Chủ, Tìm Kiếm & Bản Đồ (P01, P02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Mock Search API & Engine Logic", () => {
    it("trả về gợi ý điểm đến khi query rỗng và khi gõ từ khóa", async () => {
      const defaultSuggestions = await getDestinationSuggestions("");
      expect(defaultSuggestions.length).toBeGreaterThan(0);
      expect(defaultSuggestions[0].label).toContain("Đà Lạt");

      const filtered = await getDestinationSuggestions("Hội An");
      expect(filtered.some((s) => s.label.includes("Hội An"))).toBe(true);
    });

    it("trả về danh sách điểm đến phổ biến kèm số chỗ ở và giá từ", async () => {
      const popular = await getPopularDestinations();
      expect(popular.length).toBeGreaterThanOrEqual(4);
      expect(popular[0]).toHaveProperty("listingCount");
      expect(popular[0]).toHaveProperty("startingPrice");
    });

    it("lọc danh sách listing theo điểm đến", async () => {
      const res = await searchListings({ destination: "Đà Lạt" });
      expect(res.items.length).toBeGreaterThan(0);
      res.items.forEach((item) => {
        const matches =
          item.areaLabel.toLowerCase().includes("đà lạt") ||
          item.title.toLowerCase().includes("đà lạt");
        expect(matches).toBe(true);
      });
    });

    it("lọc theo số lượng khách tối đa", async () => {
      const res = await searchListings({ adults: 5 });
      res.items.forEach((item) => {
        expect(item.maxGuests).toBeGreaterThanOrEqual(5);
      });
    });

    it("lọc theo loại chỗ ở (ENTIRE_PLACE vs PRIVATE_ROOM)", async () => {
      const resEntire = await searchListings({ type: "ENTIRE_PLACE" });
      resEntire.items.forEach((item) => {
        expect(item.propertyType).toBe("ENTIRE_PLACE");
      });

      const resPrivate = await searchListings({ type: "PRIVATE_ROOM" });
      resPrivate.items.forEach((item) => {
        expect(item.propertyType).toBe("PRIVATE_ROOM");
      });
    });

    it("lọc theo tiện nghi (ví dụ: hồ bơi pool)", async () => {
      const res = await searchListings({ amenities: ["pool"] });
      res.items.forEach((item) => {
        expect(item.amenities).toContain("pool");
      });
    });

    it("lọc theo Instant Book", async () => {
      const res = await searchListings({ instant: true });
      res.items.forEach((item) => {
        expect(item.bookingMode).toBe("INSTANT");
      });
    });

    it("sắp xếp theo giá tăng dần và giảm dần", async () => {
      const resAsc = await searchListings({ sort: "PRICE_ASC" });
      for (let i = 0; i < resAsc.items.length - 1; i++) {
        const p1 = resAsc.items[i].price.nightlyAvg || 0;
        const p2 = resAsc.items[i + 1].price.nightlyAvg || 0;
        expect(p1).toBeLessThanOrEqual(p2);
      }

      const resDesc = await searchListings({ sort: "PRICE_DESC" });
      for (let i = 0; i < resDesc.items.length - 1; i++) {
        const p1 = resDesc.items[i].price.nightlyAvg || 0;
        const p2 = resDesc.items[i + 1].price.nightlyAvg || 0;
        expect(p1).toBeGreaterThanOrEqual(p2);
      }
    });

    it("tính toán tổng tiền chính xác khi có ngày checkin & checkout [BR-SRC-02]", async () => {
      // 3 nights
      const res = await searchListings({
        checkin: "2026-12-10",
        checkout: "2026-12-13",
      });
      expect(res.items.length).toBeGreaterThan(0);
      const first = res.items[0];
      expect(first.price.mode).toBe("TOTAL");
      expect(first.price.nights).toBe(3);
      expect(first.price.total).toBe((first.price.nightlyAvg || 0) * 3);
      expect(first.price.includesFeesAndTaxes).toBe(true);
    });

    it("hiển thị giá từ mức cơ sở khi chưa chọn ngày", async () => {
      const res = await searchListings({});
      expect(res.items.length).toBeGreaterThan(0);
      const first = res.items[0];
      expect(first.price.mode).toBe("FROM_NIGHTLY");
      expect(first.price.total).toBeUndefined();
    });

    it("hỗ trợ lọc theo tọa độ khung nhìn bản đồ (bbox)", async () => {
      // Bbox covering Da Lat
      const res = await searchListings({
        bbox: "108.40,11.90,108.50,12.00",
      });
      res.items.forEach((item) => {
        expect(item.map.lng).toBeGreaterThanOrEqual(108.4);
        expect(item.map.lng).toBeLessThanOrEqual(108.5);
        expect(item.map.lat).toBeGreaterThanOrEqual(11.9);
        expect(item.map.lat).toBeLessThanOrEqual(12.0);
      });
    });
  });

  describe("2. UI Component: SearchBar (CMP-18)", () => {
    it("render thanh tìm kiếm và hiển thị lỗi nếu bấm Tìm khi chưa có điểm đến", async () => {
      await act(async () => {
        render(<SearchBar initialDestination="" />);
      });
      const submitBtn = screen.getByTestId("search-submit-btn");
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText(/destinationRequired/i)).toBeDefined();
    });

    it("gửi đúng tham số tìm kiếm khi có điểm đến", async () => {
      const onSearchSubmit = vi.fn();
      await act(async () => {
        render(
          <SearchBar
            initialDestination="Đà Lạt"
            initialAdults={2}
            onSearchSubmit={onSearchSubmit}
          />
        );
      });
      const submitBtn = screen.getByTestId("search-submit-btn");
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(onSearchSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: "Đà Lạt",
          adults: 2,
        })
      );
    });
  });

  describe("3. UI Component: ListingCard (CMP-19)", () => {
    const sampleListing: ListingCardDTO = {
      id: "lst-sample-01",
      title: "Sample Dalat Homestay",
      propertyType: "ENTIRE_PLACE",
      areaLabel: "Phường 3, Đà Lạt",
      photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      bookingMode: "INSTANT",
      cancellationPolicy: "FLEXIBLE",
      amenities: ["wifi", "kitchen"],
      price: {
        mode: "FROM_NIGHTLY",
        nightlyAvg: 1200000,
        includesFeesAndTaxes: true,
      },
      map: { lat: 11.94, lng: 108.45 },
      rating: 4.95,
      reviewCount: 50,
      isSuperhost: true,
    };

    it("render thông tin thẻ listing, badge Instant, Superhost và tương tác hover", () => {
      const onHover = vi.fn();
      render(<ListingCard listing={sampleListing} onHover={onHover} />);

      expect(screen.getByText("Sample Dalat Homestay")).toBeDefined();
      expect(screen.getByText("Phường 3, Đà Lạt")).toBeDefined();
      expect(screen.getByText(/superhost/i)).toBeDefined();
      expect(screen.getByText(/instant/i)).toBeDefined();

      const card = screen.getByTestId("listing-card-lst-sample-01");
      fireEvent.mouseEnter(card);
      expect(onHover).toHaveBeenCalledWith("lst-sample-01");

      fireEvent.mouseLeave(card);
      expect(onHover).toHaveBeenCalledWith(null);
    });

    it("cho phép toggle yêu thích (tim)", () => {
      const onToggleFav = vi.fn();
      render(<ListingCard listing={sampleListing} onToggleFavorite={onToggleFav} />);

      const heartBtn = screen.getByRole("button", { name: /wishlist/i });
      fireEvent.click(heartBtn);
      expect(onToggleFav).toHaveBeenCalledWith("lst-sample-01", true);
    });
  });

  describe("4. UI Component: MapPanel (CMP-21)", () => {
    it("render bản đồ và các marker giá HTML", () => {
      const listings: ListingCardDTO[] = [
        {
          id: "m-01",
          title: "Homestay 1",
          propertyType: "ENTIRE_PLACE",
          areaLabel: "Đà Lạt",
          photos: ["https://example.com/p1.jpg"],
          maxGuests: 2,
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
          bookingMode: "INSTANT",
          cancellationPolicy: "FLEXIBLE",
          amenities: [],
          price: { mode: "FROM_NIGHTLY", nightlyAvg: 800000, includesFeesAndTaxes: true },
          map: { lat: 11.94, lng: 108.45 },
          rating: 4.8,
          reviewCount: 10,
        },
      ];

      render(
        <MapPanel
          listings={listings}
          hoveredListingId={null}
          onMarkerHover={vi.fn()}
        />
      );

      expect(screen.getByTestId("map-panel")).toBeDefined();
      expect(screen.getByText("800k ₫")).toBeDefined();
    });
  });
});
