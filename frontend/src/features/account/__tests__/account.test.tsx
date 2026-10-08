import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  profileSchema,
  changePasswordSchema,
  notificationSettingsSchema,
} from "../schemas";
import {
  getAccountProfile,
  updateAccountProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  toggleHostMode,
  getNotificationSettings,
  updateNotificationSettings,
} from "../api/mock-account";
import AccountProfilePage from "@/app/[locale]/(account)/account/profile/page";
import AccountSettingsPage from "@/app/[locale]/(account)/account/settings/page";
import { AvatarUploader } from "../components/AvatarUploader";
import { HostModeCard } from "../components/HostModeCard";

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
  usePathname: () => "/vi/account/profile",
  notFound: vi.fn(),
}));

import viMessages from "../../../../messages/vi.json";

// Mock next-intl with real viMessages
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

// Mock sonner toast
vi.mock("@/components/ui/toaster", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Slice FE-S02: Account Feature Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("1. Zod Validation Schemas", () => {
    it("validates profile schema with valid input", () => {
      const valid = profileSchema.safeParse({
        fullName: "Nguyễn Văn Khách",
        phone: "0901234567",
        bio: "Xin chào thế giới!",
        language: "vi",
        displayCurrency: "VND",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects short or empty full name (< 2 chars)", () => {
      const invalid = profileSchema.safeParse({
        fullName: "A",
        phone: "0901234567",
        bio: "",
        language: "vi",
        displayCurrency: "VND",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects long bio (> 300 chars)", () => {
      const invalid = profileSchema.safeParse({
        fullName: "Nguyễn Văn Khách",
        phone: "0901234567",
        bio: "A".repeat(301),
        language: "vi",
        displayCurrency: "VND",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects invalid phone number format", () => {
      const invalid = profileSchema.safeParse({
        fullName: "Nguyễn Văn Khách",
        phone: "not-a-phone",
        bio: "",
        language: "vi",
        displayCurrency: "VND",
      });
      expect(invalid.success).toBe(false);
    });

    it("validates password change schema requiring different new password and matching confirmation", () => {
      // Valid change
      const valid = changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
        confirmPassword: "NewPassword456",
      });
      expect(valid.success).toBe(true);

      // Same password
      const samePassword = changePasswordSchema.safeParse({
        currentPassword: "Password123",
        newPassword: "Password123",
        confirmPassword: "Password123",
      });
      expect(samePassword.success).toBe(false);

      // Mismatched confirmation
      const mismatch = changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "NewPassword456",
        confirmPassword: "DifferentPassword789",
      });
      expect(mismatch.success).toBe(false);

      // Weak new password (no digits)
      const weak = changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "onlyletters",
        confirmPassword: "onlyletters",
      });
      expect(weak.success).toBe(false);
    });

    it("validates notification settings schema", () => {
      const valid = notificationSettingsSchema.safeParse({
        emailNotifications: true,
        smsNotifications: false,
        bookingUpdates: true,
        promoOffers: true,
      });
      expect(valid.success).toBe(true);
    });
  });

  describe("2. Mock Account API", () => {
    it("reads and updates account profile", async () => {
      const initial = await getAccountProfile();
      expect(initial.fullName).toBeDefined();

      const updated = await updateAccountProfile({
        fullName: "Trần Văn Mới",
        bio: "Cập nhật tiểu sử mới",
      });
      expect(updated.fullName).toBe("Trần Văn Mới");
      expect(updated.bio).toBe("Cập nhật tiểu sử mới");

      const reRead = await getAccountProfile();
      expect(reRead.fullName).toBe("Trần Văn Mới");
    });

    it("validates avatar file size and format in uploadAvatar", async () => {
      // Oversized file (> 5MB)
      const oversized = new File(["dummy content"], "large.png", {
        type: "image/png",
      });
      Object.defineProperty(oversized, "size", { value: 6 * 1024 * 1024 });

      await expect(uploadAvatar(oversized)).rejects.toThrow();

      // Unsupported format (e.g. text/plain or gif)
      const invalidType = new File(["dummy"], "file.txt", {
        type: "text/plain",
      });
      await expect(uploadAvatar(invalidType)).rejects.toThrow();

      // Delete avatar
      const del = await deleteAvatar();
      expect(del.success).toBe(true);
    });

    it("handles password change with correct and incorrect current passwords", async () => {
      // Correct password
      const res = await changePassword({
        currentPassword: "CurrentValidPassword123",
        newPassword: "NewSecretPassword999",
        confirmPassword: "NewSecretPassword999",
      });
      expect(res.success).toBe(true);
      expect(res.loggedOutOtherSessions).toBe(true);

      // Wrong current password
      await expect(
        changePassword({
          currentPassword: "WrongPassword123",
          newPassword: "NewSecretPassword999",
          confirmPassword: "NewSecretPassword999",
        })
      ).rejects.toThrow();
    });

    it("toggles host mode and updates notification settings", async () => {
      const hostRes = await toggleHostMode(true);
      expect(hostRes.isHost).toBe(true);

      const notifs = await getNotificationSettings();
      expect(notifs.emailNotifications).toBe(true);

      const updatedNotifs = await updateNotificationSettings({
        emailNotifications: false,
        smsNotifications: true,
        bookingUpdates: true,
        promoOffers: false,
      });
      expect(updatedNotifs.emailNotifications).toBe(false);
      expect(updatedNotifs.smsNotifications).toBe(true);
    });
  });

  describe("3. Avatar Uploader Component", () => {
    it("displays error without API call when choosing file > 5MB", async () => {
      const onAvatarChange = vi.fn();
      render(<AvatarUploader onAvatarChange={onAvatarChange} />);

      const fileInput = screen.getByLabelText("Tải tệp ảnh");
      const oversizedFile = new File(["a".repeat(100)], "big.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(oversizedFile, "size", { value: 6 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

      await waitFor(() => {
        expect(
          screen.getByText("Dung lượng ảnh không được vượt quá 5MB.")
        ).toBeDefined();
      });
      expect(onAvatarChange).not.toHaveBeenCalled();
    });

    it("displays error when choosing invalid format file", async () => {
      const onAvatarChange = vi.fn();
      render(<AvatarUploader onAvatarChange={onAvatarChange} />);

      const fileInput = screen.getByLabelText("Tải tệp ảnh");
      const badFile = new File(["dummy"], "bad.pdf", { type: "application/pdf" });

      fireEvent.change(fileInput, { target: { files: [badFile] } });

      await waitFor(() => {
        expect(
          screen.getByText("Chỉ hỗ trợ tệp định dạng JPG, PNG hoặc WebP.")
        ).toBeDefined();
      });
      expect(onAvatarChange).not.toHaveBeenCalled();
    });
  });

  describe("4. Account Profile Page (C01)", () => {
    it("renders profile details and enables cancel/save when dirty", async () => {
      render(<AccountProfilePage />);

      // Wait for data load
      await waitFor(() => {
        expect(screen.getByDisplayValue("Nguyễn Văn Khách")).toBeDefined();
      });

      expect(screen.getByRole("heading", { name: "Hồ sơ cá nhân" })).toBeDefined();
      expect(screen.getByDisplayValue("guest@demo.test")).toBeDefined();
      expect(screen.getByRole("heading", { name: "Xác minh danh tính" })).toBeDefined();

      // Initially save and cancel buttons are disabled because not dirty
      const saveBtn = screen.getByText("Lưu thay đổi").closest("button");
      const cancelBtn = screen.getByText("Huỷ thay đổi").closest("button");
      expect(saveBtn?.disabled).toBe(true);
      expect(cancelBtn?.disabled).toBe(true);

      // Modify full name
      const nameInput = screen.getByDisplayValue("Nguyễn Văn Khách");
      fireEvent.change(nameInput, { target: { value: "Nguyễn Khách Cập Nhật" } });

      await waitFor(() => {
        expect(saveBtn?.disabled).toBe(false);
        expect(cancelBtn?.disabled).toBe(false);
      });

      // Cancel changes restores original value
      fireEvent.click(cancelBtn!);
      await waitFor(() => {
        expect(screen.getByDisplayValue("Nguyễn Văn Khách")).toBeDefined();
        expect(saveBtn?.disabled).toBe(true);
      });
    });

    it("submits profile changes successfully", async () => {
      render(<AccountProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Nguyễn Văn Khách")).toBeDefined();
      });

      const nameInput = screen.getByDisplayValue("Nguyễn Văn Khách");
      fireEvent.change(nameInput, { target: { value: "Trần Đăng Khoa" } });

      const saveBtn = screen.getByText("Lưu thay đổi").closest("button");
      fireEvent.click(saveBtn!);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Trần Đăng Khoa")).toBeDefined();
      });
    });
  });

  describe("5. Account Settings Page (C02)", () => {
    it("renders all four settings sections", async () => {
      render(<AccountSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText("Ngôn ngữ & Tiền tệ")).toBeDefined();
      });

      expect(screen.getByRole("heading", { name: "Cài đặt & Bảo mật" })).toBeDefined();
      expect(screen.getByText("Mật khẩu đăng nhập")).toBeDefined();
      expect(screen.getByText("Cài đặt thông báo")).toBeDefined();
      expect(screen.getByText("Chế độ Chủ nhà (Host)")).toBeDefined();

      // Currency is disabled
      const currencySelect = screen.getByDisplayValue("VND (₫) - Đồng Việt Nam");
      expect((currencySelect as HTMLSelectElement).disabled).toBe(true);
    });

    it("submits password change and shows success banner", async () => {
      render(<AccountSettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Mật khẩu hiện tại")).toBeDefined();
      });

      const currentInput = screen.getByLabelText("Mật khẩu hiện tại");
      const newInput = screen.getByLabelText("Mật khẩu mới");
      const confirmInput = screen.getByLabelText("Xác nhận mật khẩu mới");
      const submitBtn = screen.getByText("Đổi mật khẩu").closest("button");

      fireEvent.change(currentInput, { target: { value: "CurrentPass123" } });
      fireEvent.change(newInput, { target: { value: "NewPass456" } });
      fireEvent.change(confirmInput, { target: { value: "NewPass456" } });

      fireEvent.click(submitBtn!);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Đã đổi mật khẩu thành công. Các phiên đăng nhập trên thiết bị khác đã bị đăng xuất."
          )
        ).toBeDefined();
      });
    });

    it("displays error on current password if wrong old password entered", async () => {
      render(<AccountSettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Mật khẩu hiện tại")).toBeDefined();
      });

      const currentInput = screen.getByLabelText("Mật khẩu hiện tại");
      const newInput = screen.getByLabelText("Mật khẩu mới");
      const confirmInput = screen.getByLabelText("Xác nhận mật khẩu mới");
      const submitBtn = screen.getByText("Đổi mật khẩu").closest("button");

      fireEvent.change(currentInput, { target: { value: "WrongPassword123" } });
      fireEvent.change(newInput, { target: { value: "NewPass456" } });
      fireEvent.change(confirmInput, { target: { value: "NewPass456" } });

      fireEvent.click(submitBtn!);

      await waitFor(() => {
        expect(
          screen.getByText("Mật khẩu hiện tại không chính xác.")
        ).toBeDefined();
      });
    });

    it("enables host mode and shows identity verification alert", async () => {
      render(
        <HostModeCard
          initialIsHost={false}
          verificationStatus="UNVERIFIED"
        />
      );

      const hostToggle = screen.getByRole("switch");
      fireEvent.click(hostToggle);

      await waitFor(() => {
        expect(screen.getByText("Đã bật chế độ Host")).toBeDefined();
        expect(
          screen.getByText("Bạn cần xác minh danh tính để bắt đầu tạo phòng")
        ).toBeDefined();
        expect(screen.getByText("Hoàn tất xác minh")).toBeDefined();
      });
    });
  });
});
