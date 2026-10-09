import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Step7Policy } from "../components/Step7Policy";
import { CancellationRefundModal } from "../components/CancellationRefundModal";
import { Step8Legal } from "../components/Step8Legal";
import {
  policyStepSchema,
  legalStepSchema,
  getPolicyStepSchema,
  getLegalStepSchema,
} from "../schemas";
import {
  MOCK_CANCELLATION_POLICIES,
  getCancellationPolicyDetails,
} from "../api/mock-policies";
import {
  checkListingReadiness,
  submitListingForReview,
  withdrawListingSubmission,
  getListingReviewStatus,
} from "../api/mock-listings";

// Mock next-intl
vi.mock("next-intl", () => ({
  useLocale: () => "vi",
  useTranslations: () => (key: string) => key,
}));

describe("Slice FE-S07: Chính sách huỷ, Kiểu đặt, Pháp lý, Gửi duyệt & Trạng thái H05", () => {
  /* ----------------------------------------------------
   * 1. Test Bước 7: Chính sách huỷ & Kiểu đặt (Step7Policy)
   * ---------------------------------------------------- */
  describe("Bước 7: Chính sách huỷ & Kiểu đặt (Step7Policy & CMP-05)", () => {
    it("hiển thị đầy đủ 3 thẻ chính sách huỷ và 2 thẻ kiểu đặt phòng", () => {
      const handleChange = vi.fn();
      render(
        <Step7Policy
          data={{ cancellationPolicy: "FLEXIBLE", bookingMode: "INSTANT" }}
          onChange={handleChange}
        />
      );

      // 3 chính sách
      expect(screen.getByText("Linh hoạt (Flexible)")).toBeDefined();
      expect(screen.getByText("Trung bình (Moderate)")).toBeDefined();
      expect(screen.getByText("Nghiêm ngặt (Strict)")).toBeDefined();

      // 2 kiểu đặt
      expect(screen.getByText("Đặt phòng ngay (Instant Book)")).toBeDefined();
      expect(screen.getByText("Chờ duyệt yêu cầu (Request to Book)")).toBeDefined();
    });

    it("cho phép chuyển đổi lựa chọn chính sách huỷ và kiểu đặt", () => {
      const handleChange = vi.fn();
      render(
        <Step7Policy
          data={{ cancellationPolicy: "FLEXIBLE", bookingMode: "INSTANT" }}
          onChange={handleChange}
        />
      );

      // Chọn chính sách Nghiêm ngặt
      const strictCard = screen.getByText("Nghiêm ngặt (Strict)").closest("div");
      expect(strictCard).toBeTruthy();
      fireEvent.click(strictCard!);
      expect(handleChange).toHaveBeenCalledWith({ cancellationPolicy: "STRICT" });

      // Chọn kiểu đặt Request to Book
      const requestCard = screen.getByText("Chờ duyệt yêu cầu (Request to Book)").closest("div");
      expect(requestCard).toBeTruthy();
      fireEvent.click(requestCard!);
      expect(handleChange).toHaveBeenCalledWith({ bookingMode: "REQUEST" });
    });

    it("mở Modal bảng mốc hoàn tiền khi bấm 'Xem bảng mốc hoàn tiền'", () => {
      render(
        <Step7Policy
          data={{ cancellationPolicy: "MODERATE", bookingMode: "INSTANT" }}
          onChange={vi.fn()}
        />
      );

      const viewTiersBtns = screen.getAllByText("Xem bảng mốc hoàn tiền");
      expect(viewTiersBtns.length).toBeGreaterThan(0);
      fireEvent.click(viewTiersBtns[0]);

      // Modal hiển thị
      expect(screen.getByText("Chi tiết chính sách huỷ")).toBeDefined();
      expect(screen.getByText("Biểu đồ mốc hoàn tiền")).toBeDefined();
      expect(screen.getByText("Quy tắc BR-LST-03:")).toBeDefined();
    });

    it("validate policyStepSchema yêu cầu cả 2 trường hợp lệ", () => {
      const valid = policyStepSchema.safeParse({
        cancellationPolicy: "MODERATE",
        bookingMode: "INSTANT",
      });
      expect(valid.success).toBe(true);

      const invalid = policyStepSchema.safeParse({
        cancellationPolicy: "INVALID_POLICY",
        bookingMode: "INSTANT",
      });
      expect(invalid.success).toBe(false);
    });
  });

  /* ----------------------------------------------------
   * 2. Test Modal Mốc hoàn tiền (CancellationRefundModal)
   * ---------------------------------------------------- */
  describe("CMP-27 Modal Bảng mốc hoàn tiền (CancellationRefundModal)", () => {
    it("hiển thị chính xác các mức hoàn tiền theo chính sách", () => {
      const policy = getCancellationPolicyDetails("MODERATE");
      const handleClose = vi.fn();

      render(
        <CancellationRefundModal
          isOpen={true}
          onClose={handleClose}
          policy={policy}
        />
      );

      expect(screen.getByText("Trung bình (Moderate)")).toBeDefined();
      expect(screen.getByText("Hoàn 100%")).toBeDefined();
      expect(screen.getByText("Hoàn 50%")).toBeDefined();

      const closeBtn = screen.getByText("Đã hiểu");
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  /* ----------------------------------------------------
   * 3. Test Bước 8: Giấy tờ & Rà soát gửi duyệt (Step8Legal)
   * ---------------------------------------------------- */
  describe("Bước 8: Giấy tờ & Rà soát gửi duyệt (Step8Legal)", () => {
    const mockLegalData = {
      legalDocs: [
        {
          id: "doc-test-1",
          type: "OPERATING_LICENSE" as const,
          name: "so_do_nha_dat.pdf",
          fileUrl: "/docs/so_do.pdf",
          sizeBytes: 2500000,
          uploadedAt: new Date().toISOString(),
        },
      ],
      legalRegistrationNumber: "KD-998877",
    };

    it("hiển thị danh sách tài liệu đã tải lên và nút xoá", () => {
      render(
        <Step8Legal
          listingId="lst-101"
          data={mockLegalData}
          onChange={vi.fn()}
          onSubmitSuccess={vi.fn()}
        />
      );

      expect(screen.getByText("so_do_nha_dat.pdf")).toBeDefined();
      expect(screen.getByText("Sổ đỏ / Quyền khai thác")).toBeDefined();
      expect(screen.getByText("2.4 MB")).toBeDefined();
    });

    it("validate legalStepSchema yêu cầu ít nhất 1 tài liệu pháp lý", () => {
      const valid = legalStepSchema.safeParse(mockLegalData);
      expect(valid.success).toBe(true);

      const invalid = legalStepSchema.safeParse({
        legalDocs: [],
        legalRegistrationNumber: "",
      });
      expect(invalid.success).toBe(false);
    });
  });

  /* ----------------------------------------------------
   * 4. Test API Readiness, Submission & Revision (H04 & H05)
   * ---------------------------------------------------- */
  describe("API Điều kiện gửi duyệt & Trạng thái duyệt (Readiness Engine & H05)", () => {
    it("kiểm tra điều kiện gửi duyệt đối với listing nháp (lst-draft-demo)", async () => {
      const readiness = await checkListingReadiness("lst-draft-demo");

      expect(readiness).toBeDefined();
      expect(readiness.items.length).toBeGreaterThanOrEqual(8);

      // lst-draft-demo chỉ có 2 ảnh, thiếu 3 ảnh
      const photosCheck = readiness.items.find((i) => i.key === "photos");
      expect(photosCheck).toBeDefined();
      expect(photosCheck?.ok).toBe(false);
      expect(photosCheck?.messageVi).toContain("Cần thêm 3 ảnh (hiện có 2/5 ảnh)");

      // canSubmit phải là false khi chưa đủ ảnh
      expect(readiness.canSubmit).toBe(false);
    });

    it("gửi duyệt thành công đối với listing đủ điều kiện (lst-101)", async () => {
      // Bổ sung tài liệu hợp lệ cho lst-101
      const res = await submitListingForReview("lst-101");
      expect(res.status).toBe("PENDING_REVIEW");
      expect(res.message).toContain("Gửi duyệt chỗ nghỉ thành công");

      // Rút lại yêu cầu để tiếp tục sửa
      const withdrawn = await withdrawListingSubmission("lst-101");
      expect(withdrawn.status).toBe("DRAFT");
    });

    it("lấy dữ liệu trạng thái duyệt H05 cho listing chờ duyệt", async () => {
      const statusData = await getListingReviewStatus("lst-pending-demo");

      expect(statusData).toBeDefined();
      expect(statusData.status).toBe("PENDING_REVIEW");
      expect(statusData.revisions.length).toBeGreaterThanOrEqual(1);
    });

    it("lấy dữ liệu lý do từ chối/cần sửa cho listing lst-needs-changes-demo", async () => {
      const statusData = await getListingReviewStatus("lst-needs-changes-demo");

      expect(statusData).toBeDefined();
      expect(statusData.status).toBe("NEEDS_CHANGES");
      expect(statusData.currentReview?.reasons).toBeDefined();
      expect(statusData.currentReview!.reasons.length).toBe(2);

      // Có lý do về ảnh và pháp lý
      const sections = statusData.currentReview!.reasons.map((r) => r.section);
      expect(sections).toContain("PHOTOS");
      expect(sections).toContain("LEGAL");
    });
  });
});
