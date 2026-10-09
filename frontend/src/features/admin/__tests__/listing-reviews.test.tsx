import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  getListingReviewQueue,
  getListingReviewDetail,
  acquireListingReviewLock,
  heartbeatListingReviewLock,
  releaseListingReviewLock,
  logDocumentView,
  submitListingDecision,
  LockBanner,
  DuplicateAddressBanner,
  ReviewDecisionModal,
} from "../index";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, any>) => {
    if (key === "lockBanner" && params) {
      return `Hồ sơ đang được ${params.name} xử lý từ ${params.time}`;
    }
    if (key === "duplicateAlertDesc" && params) {
      return `Trùng với #${params.dupId} (${params.dupTitle}) của Host ${params.dupHost}`;
    }
    if (key === "viewDuplicateListing" && params) {
      return `Xem chỗ nghỉ #${params.dupId} trùng →`;
    }
    if (key === "duplicateAddressReference" && params) {
      return `• Địa chỉ đối chiếu: ${params.address}`;
    }
    return key;
  },
  useLocale: () => "vi",
}));

describe("Slice FE-S08: Admin Thẩm Định & Duyệt Listing (A04)", () => {
  describe("1. Mock API Contract & Concurrency Lock (CMP-31)", () => {
    it("trả về hàng đợi listing sắp xếp cũ nhất trước (FIFO) và hỗ trợ lọc", async () => {
      const res = await getListingReviewQueue({ status: "ALL" });
      expect(res.items.length).toBeGreaterThanOrEqual(3);

      // Kiểm tra sắp xếp cũ nhất trước
      const firstTime = new Date(res.items[0].submittedAt).getTime();
      const secondTime = new Date(res.items[1].submittedAt).getTime();
      expect(firstTime).toBeLessThanOrEqual(secondTime);
    });

    it("lọc chính xác theo cờ trùng địa chỉ (DUPLICATE_ONLY)", async () => {
      const res = await getListingReviewQueue({ flag: "DUPLICATE_ONLY", status: "ALL" });
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.items.every((i) => i.flagDuplicateAddress)).toBe(true);
    });

    it("hỗ trợ trả về nội dung song ngữ tiếng Anh khi truyền locale='en'", async () => {
      const viDetail = await getListingReviewDetail("lst-rev-01", "vi");
      const enDetail = await getListingReviewDetail("lst-rev-01", "en");

      expect(viDetail.title).toContain("The Oasis Villa");
      expect(enDetail.title).toBe("The Oasis Villa at Tuyen Lam Lake with Pine Forest View");
      expect(enDetail.description).toContain("High-end luxury resort villa");
      expect(enDetail.photos[0].caption).toBe("Lake-view luxury living room");
      expect(enDetail.legal.legalDocs[0].fileName).toBe("business_registration_oasis_villa.pdf");
    });

    it("nhận khoá thành công và từ chối 409 khi người khác đang khoá", async () => {
      // lst-rev-01 đang tự do -> nhận khoá thành công
      const lock1 = await acquireListingReviewLock("lst-rev-01", "adm-001", "Admin Quang");
      expect(lock1.success).toBe(true);
      expect(lock1.lockedBy.adminId).toBe("adm-001");

      // lst-rev-03 đang bị khoá bởi adm-002 -> quăng lỗi 409
      await expect(
        acquireListingReviewLock("lst-rev-03", "adm-999", "Admin Khác")
      ).rejects.toThrow(/xử lý/);
    });

    it("gia hạn (heartbeat) và giải phóng khoá (release) an toàn", async () => {
      await acquireListingReviewLock("lst-rev-01", "adm-001");
      const beat = await heartbeatListingReviewLock("lst-rev-01", "adm-001");
      expect(beat).toBe(true);

      const released = await releaseListingReviewLock("lst-rev-01", "adm-001");
      expect(released).toBe(true);
    });

    it("ghi log kiểm toán truy cập tài liệu mật (CMP-30)", async () => {
      const log = await logDocumentView("lst-rev-01", "doc-01", "adm-001", "Admin Quang");
      expect(log.id).toBeDefined();
      expect(log.listingId).toBe("lst-rev-01");
      expect(log.docId).toBe("doc-01");
      expect(log.adminId).toBe("adm-001");
    });
  });

  describe("2. Quyết Định Thẩm Định & Chống Trùng Địa Chỉ (BR-LST-06)", () => {
    it("chặn APPROVE nếu có trùng địa chỉ mà chưa xác nhận (lỗi 422)", async () => {
      // lst-rev-02 có duplicates
      await expect(
        submitListingDecision("lst-rev-02", {
          decision: "APPROVE",
          acknowledgedDuplicateAddress: false,
        })
      ).rejects.toThrow(/cảnh báo trùng địa chỉ/);
    });

    it("cho phép APPROVE khi đã xác nhận đã kiểm tra cảnh báo trùng", async () => {
      const res = await submitListingDecision("lst-rev-02", {
        decision: "APPROVE",
        acknowledgedDuplicateAddress: true,
      });
      expect(res.success).toBe(true);

      const detail = await getListingReviewDetail("lst-rev-02");
      expect(detail.status).toBe("APPROVED");
    });

    it("yêu cầu ít nhất 1 reason có note ≥ 10 ký tự khi chọn NEEDS_CHANGES", async () => {
      // Thiếu reasons -> lỗi 422
      await expect(
        submitListingDecision("lst-rev-01", {
          decision: "NEEDS_CHANGES",
          reasons: [],
        })
      ).rejects.toThrow(/chọn ít nhất 1 mục/);

      // Note < 10 ký tự -> lỗi 422
      await expect(
        submitListingDecision("lst-rev-01", {
          decision: "NEEDS_CHANGES",
          reasons: [{ section: "PHOTOS", stepNumber: 3, note: "Sửa đi" }],
        })
      ).rejects.toThrow(/ít nhất 10 ký tự/);

      // Hợp lệ -> thành công
      const validRes = await submitListingDecision("lst-rev-01", {
        decision: "NEEDS_CHANGES",
        reasons: [
          {
            section: "PHOTOS",
            stepNumber: 3,
            note: "Ảnh phòng tắm bị nhoè, yêu cầu bổ sung ảnh góc rộng chụp ban ngày",
          },
        ],
      });
      expect(validRes.success).toBe(true);

      const detail = await getListingReviewDetail("lst-rev-01");
      expect(detail.status).toBe("NEEDS_CHANGES");
    });

    it("từ chối khi REJECT có note < 10 ký tự và chấp nhận khi note hợp lệ", async () => {
      await expect(
        submitListingDecision("lst-rev-04", {
          decision: "REJECT",
          note: "Ngắn",
        })
      ).rejects.toThrow(/ít nhất 10 ký tự/);

      const res = await submitListingDecision("lst-rev-04", {
        decision: "REJECT",
        note: "Giấy tờ pháp lý giả mạo và địa chỉ không tồn tại trên thực địa",
      });
      expect(res.success).toBe(true);

      const detail = await getListingReviewDetail("lst-rev-04");
      expect(detail.status).toBe("REJECTED");
    });
  });

  describe("3. Component UI & Banner Verification", () => {
    it("hiển thị LockBanner khi bị khoá bởi admin khác", () => {
      render(
        <LockBanner
          isLockedByOther={true}
          lockedByName="Trần CSKH"
          lockedAt="2026-10-09T08:00:00Z"
        />
      );
      expect(screen.getByText(/Trần CSKH/)).toBeDefined();
    });

    it("hiển thị DuplicateAddressBanner với link phòng trùng đối chiếu", () => {
      const alert = {
        duplicateListingId: "lst-207",
        duplicateListingTitle: "Condotel Mỹ Khê",
        duplicateHostId: "hst-999",
        duplicateHostName: "Biển Xanh Corp",
        similarity: "SAME_ADDRESS" as const,
        exactAddress: "88 Võ Nguyên Giáp, Đà Nẵng",
      };
      render(<DuplicateAddressBanner alert={alert} locale="vi" />);
      expect(screen.getByText(/duplicateAlertTitle/)).toBeDefined();
      expect(screen.getByText(/88 Võ Nguyên Giáp/)).toBeDefined();
    });

    it("ReviewDecisionModal validate checkbox duplicate khi APPROVE", async () => {
      const handleConfirm = vi.fn();
      render(
        <ReviewDecisionModal
          isOpen={true}
          onClose={vi.fn()}
          decisionType="APPROVE"
          listingTitle="The Oasis Villa"
          hasDuplicateAlert={true}
          onConfirm={handleConfirm}
        />
      );

      // Bấm submit khi chưa tick checkbox -> không gọi handleConfirm
      const submitBtn = screen.getByText("btnApprove");
      fireEvent.click(submitBtn);
      expect(handleConfirm).not.toHaveBeenCalled();

      // Tick checkbox -> gọi handleConfirm
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      fireEvent.click(submitBtn);
      expect(handleConfirm).toHaveBeenCalledWith({
        decision: "APPROVE",
        acknowledgedDuplicateAddress: true,
      });
    });
  });
});
