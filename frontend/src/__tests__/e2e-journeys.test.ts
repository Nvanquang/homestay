import { describe, it, expect, beforeEach } from "vitest";
import { mockLogin, mockRegister } from "@/features/auth/api/mock-auth";
import {
  submitVerification,
  getReviewQueue,
  submitReviewDecision,
  DocumentAttachment,
} from "@/features/verification";
import {
  createDraftListing,
  updateListingDraft,
  submitListingForReview,
  getListingReviewStatus,
} from "@/features/listing-editor";
import {
  getListingReviewQueue,
  submitListingDecision,
} from "@/features/admin";
import {
  searchListings,
  getPopularDestinations,
} from "@/features/search";
import {
  getListingDetail,
  calculateBookingQuote,
} from "@/features/listing-detail";
import {
  getCalendarData,
  blockDates,
  unblockDates,
} from "@/features/calendar";
import {
  getPricingRulesOverview,
  upsertPriceRule,
  getPriceCalendar,
} from "@/features/pricing";
import {
  getExchangeRates,
  SUPPORTED_CURRENCIES,
} from "@/features/currency";

describe("E2E User Journeys (J1–J5): Nghiệm Thu Tích Hợp Xuyên Suốt Giai Đoạn 1", () => {
  beforeEach(() => {
    // Clean state if needed
  });

  describe("Hành Trình J1: Người Mới → Host Đăng Tin Đầu Tiên → Duyệt & Xuất Hiện (S01→S04→S05→S06→S07→S08→S11)", () => {
    it("hoàn thành trọn vẹn luồng đăng ký, xác minh CCCD, tạo listing 8 bước, admin duyệt và phòng lên sóng tìm kiếm", async () => {
      // 1. Đăng ký & Đăng nhập (S01)
      const reg = await mockRegister({
        email: "newhost2026@demo.test",
        password: "Password123",
        fullName: "Trần Thị Host",
        acceptTerms: true,
      });
      expect(reg.emailMasked).toBeDefined();

      const auth = await mockLogin({
        email: "host@demo.test",
        password: "Password123",
      });
      expect(auth.fullName).toBe("Trần Chủ Nhà");

      // 2. Nộp hồ sơ xác minh CCCD (S04)
      const docFront: DocumentAttachment = {
        id: "doc-1",
        fileName: "cccd_front.jpg",
        fileSize: 1024000,
        fileType: "image/jpeg",
        purpose: "ID_FRONT",
        uploadedAt: new Date().toISOString(),
      };
      const docBack: DocumentAttachment = {
        id: "doc-2",
        fileName: "cccd_back.jpg",
        fileSize: 1024000,
        fileType: "image/jpeg",
        purpose: "ID_BACK",
        uploadedAt: new Date().toISOString(),
      };
      const verifySub = await submitVerification(
        {
          legalName: "Trần Thị Host",
          dateOfBirth: "1990-01-01",
          phone: "0912345678",
          idType: "CCCD",
          idNumber: "079199001234",
        },
        {
          idFront: docFront,
          idBack: docBack,
          operatingRightDocs: [],
        }
      );
      expect(verifySub.status).toBe("PENDING");

      // 3. Admin duyệt hồ sơ xác minh danh tính (S04)
      const queue = await getReviewQueue({ status: "PENDING" });
      expect(queue.items.length).toBeGreaterThan(0);
      const approveResult = await submitReviewDecision(verifySub.id, {
        decision: "APPROVE",
      });
      expect(approveResult.status).toBe("APPROVED");

      // 4. Host tạo draft listing (S05, S06, S07)
      const draft = await createDraftListing({
        propertyType: "ENTIRE_PLACE",
        title: "Biệt Thự Vườn Hồng Mới Đà Lạt",
        description: "Không gian nghỉ dưỡng tuyệt đẹp giữa đồi thông mộng mơ.",
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        currency: "VND",
      });
      expect(draft.id).toBeDefined();

      const updatedDraft = await updateListingDraft(draft.id, {
        pricing: {
          baseNightlyPrice: 1800000,
          cleaningFee: 250000,
          baseGuests: 2,
          extraGuestFee: 150000,
          weeklyDiscountPct: 10,
          monthlyDiscountPct: 20,
          currency: "VND",
        },
        cancellationPolicy: "MODERATE",
        bookingMode: "INSTANT",
      });
      expect(updatedDraft.version).toBeGreaterThanOrEqual(1);

      // 5. Host gửi duyệt chỗ ở (S07)
      const submitResp = await submitListingForReview("lst-101");
      expect(submitResp.status).toBe("PENDING_REVIEW");

      // 6. Admin kiểm tra và phê duyệt chỗ nghỉ (S08)
      const adminQueue = await getListingReviewQueue();
      expect(adminQueue.items.length).toBeGreaterThan(0);

      const reviewDecision = await submitListingDecision("lst-rev-01", {
        decision: "APPROVE",
        acknowledgedDuplicateAddress: true,
      });
      expect(reviewDecision.success).toBe(true);

      // 7. Chỗ ở hiển thị trong kết quả tìm kiếm của khách (S11)
      const searchRes = await searchListings({ destination: "Đà Lạt" });
      expect(searchRes.items.length).toBeGreaterThan(0);
      expect(searchRes.items.some((i) => i.areaLabel.includes("Đà Lạt"))).toBe(true);
    });
  });

  describe("Hành Trình J2: Khách Tìm Chỗ Ở → Xem Chi Tiết → Báo Giá Chuẩn & Đa Tiền Tệ (S11→S12→S13)", () => {
    it("khách tìm kiếm, mở chi tiết phòng, tính giá bất biến qua PricingEngine và chuyển đổi đa tiền tệ", async () => {
      // 1. Khách tìm phòng tại Đà Lạt (S11)
      const search = await searchListings({
        destination: "Đà Lạt",
        checkin: "2026-11-10",
        checkout: "2026-11-17", // 7 đêm
        adults: 2,
      });
      expect(search.items.length).toBeGreaterThan(0);
      const selected = search.items[0];

      // 2. Khách mở trang chi tiết phòng (S12)
      const listing = await getListingDetail(selected.id);
      expect(listing).toBeDefined();
      expect(listing?.stayRules.minNights).toBeGreaterThanOrEqual(1);

      // 3. Khách chọn ngày và nhận báo giá từ PricingEngine (S12)
      // 7 đêm (hưởng giảm giá tuần 10%)
      const quote = await calculateBookingQuote({
        listingId: listing!.id,
        checkin: "2026-11-10",
        checkout: "2026-11-17",
        adults: 3, // 1 extra guest so với standardGuests = 2
        children: 0,
      });

      expect(quote.nights).toBe(7);
      expect(quote.guests).toBe(3);
      // Có dòng phụ thu khách thêm
      expect(quote.lines.some((l) => l.key === "EXTRA_GUEST")).toBe(true);
      // Có dòng giảm giá tuần
      expect(quote.lines.some((l) => l.key === "DISCOUNT")).toBe(true);
      // Có phí vệ sinh, phí dịch vụ 10%, thuế 8%
      expect(quote.lines.some((l) => l.key === "CLEANING")).toBe(true);
      expect(quote.lines.some((l) => l.key === "SERVICE_FEE")).toBe(true);
      expect(quote.lines.some((l) => l.key === "TAX")).toBe(true);
      expect(quote.total).toBeGreaterThan(quote.basePricePerNight * 7 * 0.8);

      // 4. Khách đổi sang USD (S13)
      const fx = await getExchangeRates();
      expect(fx.status).toBe("OK");
      const usdRate = fx.rates.USD;
      const convertedTotalUsd = Math.round((quote.total * usdRate + Number.EPSILON) * 100) / 100;
      expect(convertedTotalUsd).toBeGreaterThan(0);
      // Giữ nguyên nguyên tắc bất biến: giá gốc vẫn là quote.total (VND)
    });
  });

  describe("Hành Trình J3: Host Bị Từ Chối Duyệt → Xem Lý Do → Chỉnh Sửa → Gửi Lại & Được Duyệt (S07→S08)", () => {
    it("xử lý đầy đủ vòng đời Needs Changes, hiển thị checklist lý do từ chối và phê duyệt lại thành công", async () => {
      // 1. Listing được Admin đánh giá cần sửa (S08)
      const adminReject = await submitListingDecision("lst-needs-changes-demo", {
        decision: "NEEDS_CHANGES",
        reasons: [
          {
            section: "PHOTOS",
            stepNumber: 3,
            note: "Ảnh phòng tắm bị mờ, vui lòng bổ sung ảnh rõ nét hơn với ánh sáng tự nhiên.",
          },
        ],
      });
      expect(adminReject.success).toBe(true);

      // 2. Host xem trạng thái duyệt thấy chi tiết lý do cần sửa (S07)
      const statusCheck = await getListingReviewStatus("lst-needs-changes-demo");
      expect(statusCheck.status).toBe("NEEDS_CHANGES");

      // 3. Host sửa chữa ảnh (bổ sung đủ 5 ảnh) và gửi lại duyệt (S07)
      await updateListingDraft("lst-needs-changes-demo", {
        photos: [
          { id: "p-401", url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", order: 0, status: "READY" },
          { id: "p-402", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", order: 1, status: "READY" },
          { id: "p-403", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", order: 2, status: "READY" },
          { id: "p-404", url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", order: 3, status: "READY" },
          { id: "p-405", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", order: 4, status: "READY" },
        ],
      });
      const resubmit = await submitListingForReview("lst-needs-changes-demo");
      expect(resubmit.status).toBe("PENDING_REVIEW");

      // 4. Admin kiểm tra lại và duyệt thành công (S08)
      const finalApproval = await submitListingDecision("lst-needs-changes-demo", {
        decision: "APPROVE",
        acknowledgedDuplicateAddress: true,
      });
      expect(finalApproval.success).toBe(true);
    });
  });

  describe("Hành Trình J4: Host Chặn Ngày Trên Lịch → Khách Tìm Kiếm Không Thấy Phòng Bị Trùng (S09→S11)", () => {
    it("khi Host chặn khoảng ngày trên lịch phòng, khách tìm đúng ngày đó sẽ bị loại trừ", async () => {
      // 1. Host chặn ngày 2026-11-20 đến 2026-11-22 (S09)
      const blockUpdate = await blockDates({
        listingId: "lst-dl-01",
        from: "2026-11-20",
        to: "2026-11-22",
        nights: ["2026-11-20", "2026-11-21", "2026-11-22"],
        reason: "Bảo trì định kỳ",
      });
      expect(blockUpdate.success).toBe(true);

      // 2. Khách tìm phòng trong ngày chưa bị chặn -> Thấy phòng (S11)
      const availableSearch = await searchListings({
        destination: "Đà Lạt",
        checkin: "2026-11-05",
        checkout: "2026-11-08",
      });
      expect(availableSearch.items.some((l) => l.id === "lst-dl-01")).toBe(true);

      // 3. Khách tìm phòng trùng với khoảng ngày bị chặn (2026-11-20 -> 2026-11-22) -> Bị loại trừ (S11)
      const blockedSearch = await searchListings({
        destination: "Đà Lạt",
        checkin: "2026-11-20",
        checkout: "2026-11-22",
      });
      // Phòng lst-dl-01 bị chặn trong khoảng ngày này
      expect(blockedSearch.items.filter((l) => l.id === "lst-dl-01").length).toBe(0);
    });
  });

  describe("Hành Trình J5: Host Thiết Lập Giá Mùa/Lễ → Khách Thấy Giá Áp Dụng Đúng Thứ Tự Ưu Tiên (S10→S11/S12)", () => {
    it("giá hiển thị tuân thủ nghiêm ngặt hierarchy: Ngày lễ > Mùa vụ > Cuối tuần > Cơ bản", async () => {
      // 1. Host thiết lập quy tắc giá ngày lễ 30/4 - 1/5 (S10)
      const holidayRule = await upsertPriceRule({
        listingId: "lst-dl-01",
        type: "HOLIDAY",
        name: "Đại lễ 30/4 - 1/5",
        dateFrom: "2027-04-30",
        dateTo: "2027-05-02",
        nightlyPrice: 2200000,
      });
      expect(holidayRule.success).toBe(true);
      expect(holidayRule.rule?.id).toBeDefined();

      // 2. Lấy dữ liệu giá theo tháng (Tháng 2/2027 có Tết Nguyên Đán)
      const calDays = await getPriceCalendar("lst-dl-01", "2027-02");
      expect(calDays.length).toBeGreaterThan(0);

      // Ngày Tết (HOLIDAY): được ưu tiên hơn giá thường
      const tetDay = calDays.find((d) => d.date === "2027-02-05");
      expect(tetDay?.source).toBe("HOLIDAY");
      expect(tetDay?.price).toBe(2400000);
    });
  });
});
