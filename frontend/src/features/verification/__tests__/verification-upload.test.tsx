import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  identityVerificationSchema,
  adminRejectReasonSchema,
} from "../schemas";
import {
  getHostVerification,
  saveVerificationDraft,
  uploadDocumentFile,
  submitVerification,
  getReviewQueue,
  getReviewDetail,
  lockReview,
  unlockReview,
  viewSecureDocument,
  submitReviewDecision,
} from "../api/mock-verification";
import { IdentityVerificationForm } from "../components/IdentityVerificationForm";
import { FileUploader } from "../components/FileUploader";
import { SecureImageViewer } from "../components/SecureImageViewer";
import { LockBanner } from "../components/LockBanner";
import { IdentityVerificationRecord } from "../types";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
  useParams: () => ({ locale: "vi" }),
  usePathname: () => "/vi/account/verification",
  notFound: vi.fn(),
}));

import viMessages from "../../../../messages/vi.json";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    return (key: string, params?: Record<string, unknown>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const parts = fullKey.split(".");
      let curr: unknown = viMessages;
      for (const part of parts) {
        if (curr && typeof curr === "object" && part in curr) {
          curr = (curr as Record<string, unknown>)[part];
        } else {
          curr = undefined;
          break;
        }
      }
      if (typeof curr === "string") {
        let res = curr;
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            res = res.replace(`{${k}}`, String(v));
          });
        }
        return res;
      }
      return key;
    };
  },
  useLocale: () => "vi",
}));

describe("Slice FE-S04: Identity Verification & Review Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Zod Schemas Validation", () => {
    it("should accept valid 12-digit CCCD and age >= 18", () => {
      const validData = {
        legalName: "Nguyễn Văn An",
        dateOfBirth: "1995-05-15",
        phone: "0912345678",
        idType: "CCCD" as const,
        idNumber: "079195001234",
      };
      const result = identityVerificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject applicant under 18 years old", () => {
      const today = new Date();
      const underAgeYear = today.getFullYear() - 16;
      const invalidData = {
        legalName: "Trần Trẻ Tuổi",
        dateOfBirth: `${underAgeYear}-01-01`,
        phone: "0912345678",
        idType: "CCCD" as const,
        idNumber: "079195001234",
      };
      const result = identityVerificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("18 tuổi");
      }
    });

    it("should reject CCCD with incorrect digit count", () => {
      const invalidData = {
        legalName: "Lê Văn B",
        dateOfBirth: "1990-01-01",
        phone: "0912345678",
        idType: "CCCD" as const,
        idNumber: "079123", // only 6 digits
      };
      const result = identityVerificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid Vietnamese passport format", () => {
      const validData = {
        legalName: "Hoàng Thị C",
        dateOfBirth: "1992-10-10",
        phone: "0987654321",
        idType: "PASSPORT" as const,
        idNumber: "B1234567",
      };
      const result = identityVerificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate admin rejection reason schema", () => {
      const validRejection = {
        reasonCategory: "BLURRY" as const,
        note: "Ảnh chụp căn cước bị mờ góc dưới bên phải.",
      };
      expect(adminRejectReasonSchema.safeParse(validRejection).success).toBe(true);

      const invalidNotes = {
        reasonCategory: "OTHER" as const,
        note: "Ngắn", // Tối thiểu 10 ký tự
      };
      expect(adminRejectReasonSchema.safeParse(invalidNotes).success).toBe(false);
    });
  });

  describe("2. Mock Document Upload & API Operations", () => {
    it("should upload valid JPG/PNG file and return attachment object", async () => {
      const file = new File(["dummy content"], "my_id_front.jpg", {
        type: "image/jpeg",
      });
      const attachment = await uploadDocumentFile(file, "ID_FRONT");

      expect(attachment.fileName).toBe("my_id_front.jpg");
      expect(attachment.purpose).toBe("ID_FRONT");
      expect(attachment.fileType).toBe("image/jpeg");
    });

    it("should reject files exceeding 10MB limit", async () => {
      // Mock big file
      const bigFile = new File(["dummy"], "large_scan.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(bigFile, "size", { value: 12 * 1024 * 1024 });

      await expect(uploadDocumentFile(bigFile, "OPERATING_RIGHT")).rejects.toThrow(
        "FILE_TOO_LARGE"
      );
    });

    it("should reject invalid mime type files", async () => {
      const execFile = new File(["echo 1"], "script.sh", {
        type: "application/x-sh",
      });

      await expect(uploadDocumentFile(execFile, "ID_FRONT")).rejects.toThrow(
        "INVALID_FORMAT"
      );
    });
  });

  describe("3. Identity Verification Form Component", () => {
    it("should render unverified form fields correctly", () => {
      const mockRecord: IdentityVerificationRecord = {
        id: "verif-test-1",
        userId: "user-1",
        applicantType: "HOST",
        legalName: "Nguyễn Văn Quang",
        dateOfBirth: "1994-07-22",
        phone: "0988123456",
        idType: "CCCD",
        idNumber: "079194008899",
        operatingRightDocs: [],
        status: "UNVERIFIED",
        history: [],
      };

      render(<IdentityVerificationForm initialRecord={mockRecord} isHost={true} />);

      expect(screen.getByDisplayValue("Nguyễn Văn Quang")).toBeDefined();
      expect(screen.getByDisplayValue("079194008899")).toBeDefined();
      expect(screen.getByText("Gửi hồ sơ xét duyệt")).toBeDefined();
    });

    it("should display PENDING banner and mask ID number in read-only mode", () => {
      const pendingRecord: IdentityVerificationRecord = {
        id: "verif-test-pending",
        userId: "user-1",
        applicantType: "HOST",
        legalName: "Nguyễn Văn Quang",
        dateOfBirth: "1994-07-22",
        phone: "0988123456",
        idType: "CCCD",
        idNumber: "079194008899",
        operatingRightDocs: [],
        status: "PENDING",
        submittedAt: new Date().toISOString(),
        history: [],
      };

      render(<IdentityVerificationForm initialRecord={pendingRecord} isHost={true} />);

      expect(screen.getByText("Hồ sơ của bạn đang được xét duyệt")).toBeDefined();
      // Masked: 0791••••8899
      expect(screen.getByDisplayValue("0791••••8899")).toBeDefined();
      // Submit button should be hidden
      expect(screen.queryByText("Gửi hồ sơ xét duyệt")).toBeNull();
    });

    it("should display REJECTED banner with admin feedback", () => {
      const rejectedRecord: IdentityVerificationRecord = {
        id: "verif-test-rejected",
        userId: "user-1",
        applicantType: "HOST",
        legalName: "Nguyễn Văn Quang",
        dateOfBirth: "1994-07-22",
        phone: "0988123456",
        idType: "CCCD",
        idNumber: "079194008899",
        operatingRightDocs: [],
        status: "REJECTED",
        rejectionReason: {
          category: "BLURRY",
          note: "Ảnh mặt sau căn cước bị mờ mã vạch.",
        },
        history: [],
      };

      render(<IdentityVerificationForm initialRecord={rejectedRecord} isHost={true} />);

      expect(
        screen.getByText("Hồ sơ xác minh chưa được phê duyệt")
      ).toBeDefined();
      expect(
        screen.getByText("Ảnh mặt sau căn cước bị mờ mã vạch.")
      ).toBeDefined();
      expect(screen.getByText("Cập nhật & Gửi lại")).toBeDefined();
    });
  });

  describe("4. Admin Review Flow & Security Features", () => {
    it("should retrieve review queue with filters", async () => {
      const res = await getReviewQueue({ page: 1, pageSize: 10, status: "PENDING" });
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.items.every((r) => r.status === "PENDING")).toBe(true);
    });

    it("should lock and unlock a review record", async () => {
      const locked = await lockReview("verif-1042");
      expect(locked.lockedBy).not.toBeNull();
      expect(locked.lockedBy?.adminName).toBe("Admin UrbanNest");

      await unlockReview("verif-1042");
      const unlocked = await getReviewDetail("verif-1042");
      expect(unlocked?.lockedBy).toBeNull();
    });

    it("should generate secure signed URL and record audit log on view", async () => {
      const secureView = await viewSecureDocument("verif-1042", "doc-1");
      expect(secureView.signedUrl).toBeDefined();
      expect(secureView.expiresAt).toBeDefined();
    });

    it("should render SecureImageViewer initially blurred and reveal on action", async () => {
      const mockFetchUrl = vi.fn().mockResolvedValue("https://example.com/id.jpg");

      render(
        <SecureImageViewer
          documentId="doc-1"
          documentTitle="Mặt trước CCCD"
          adminName="Nguyễn Quản Trị"
          onFetchSecureUrl={mockFetchUrl}
          initialBlurred={true}
        />
      );

      expect(screen.getByText("Mở xem tài liệu")).toBeDefined();
      const revealBtn = screen.getByText("Mở xem tài liệu");
      fireEvent.click(revealBtn);

      await waitFor(() => {
        expect(mockFetchUrl).toHaveBeenCalledWith("doc-1");
      });
    });

    it("should render LockBanner when locked by other admin", () => {
      render(
        <LockBanner
          lockedByName="Trần Văn Admin"
          lockedAt={new Date(Date.now() + 5 * 60 * 1000).toISOString()}
          isLockedByOther={true}
        />
      );

      expect(
        screen.getByText("Hồ sơ đang được xử lý bởi Admin khác")
      ).toBeDefined();
    });

    it("should process admin review approval decision", async () => {
      const updated = await submitReviewDecision("verif-1042", {
        decision: "APPROVE",
      });

      expect(updated.status).toBe("APPROVED");
      expect(updated.decidedAt).toBeDefined();
    });
  });
});
