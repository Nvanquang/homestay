import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas";
import {
  mockLogin,
  mockRegister,
  mockVerifyEmail,
  mockForgotPassword,
  mockResetPassword,
  maskEmail,
} from "../api/mock-auth";
import LoginPage from "@/app/[locale]/(auth)/login/page";
import RegisterPage from "@/app/[locale]/(auth)/register/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "returnTo") return null;
      if (key === "verified") return null;
      if (key === "reset") return null;
      return null;
    },
  }),
  useParams: () => ({ locale: "vi" }),
  usePathname: () => "/vi/login",
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) {
      let str = key;
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
      return str;
    }
    return key;
  },
  useLocale: () => "vi",
}));

describe("Auth Feature Test Suite", () => {
  describe("1. Zod Validation Schemas", () => {
    it("validates login schema properly", () => {
      // Valid input
      const valid = loginSchema.safeParse({
        email: "guest@demo.test",
        password: "Password123",
        rememberMe: true,
      });
      expect(valid.success).toBe(true);

      // Invalid email
      const invalidEmail = loginSchema.safeParse({
        email: "not-an-email",
        password: "Password123",
      });
      expect(invalidEmail.success).toBe(false);

      // Empty password
      const emptyPass = loginSchema.safeParse({
        email: "guest@demo.test",
        password: "",
      });
      expect(emptyPass.success).toBe(false);
    });

    it("validates register schema with password complexity and terms acceptance", () => {
      // Valid register data
      const valid = registerSchema.safeParse({
        fullName: "Nguyen Van A",
        email: "test@example.com",
        password: "Password123",
        acceptTerms: true,
      });
      expect(valid.success).toBe(true);

      // Short name (< 2 chars)
      const shortName = registerSchema.safeParse({
        fullName: "A",
        email: "test@example.com",
        password: "Password123",
        acceptTerms: true,
      });
      expect(shortName.success).toBe(false);

      // Password without digits
      const onlyLetters = registerSchema.safeParse({
        fullName: "Nguyen Van A",
        email: "test@example.com",
        password: "passwordonly",
        acceptTerms: true,
      });
      expect(onlyLetters.success).toBe(false);

      // Terms not accepted
      const noTerms = registerSchema.safeParse({
        fullName: "Nguyen Van A",
        email: "test@example.com",
        password: "Password123",
        acceptTerms: false,
      });
      expect(noTerms.success).toBe(false);
    });

    it("validates forgotPassword and resetPassword schemas with match confirmation", () => {
      expect(
        forgotPasswordSchema.safeParse({ email: "user@demo.test" }).success
      ).toBe(true);
      expect(
        forgotPasswordSchema.safeParse({ email: "invalid-email" }).success
      ).toBe(false);

      // Matched passwords
      const matched = resetPasswordSchema.safeParse({
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(matched.success).toBe(true);

      // Mismatched passwords
      const mismatched = resetPasswordSchema.safeParse({
        password: "Password123",
        confirmPassword: "DifferentPassword123",
      });
      expect(mismatched.success).toBe(false);
    });
  });

  describe("2. Mock Auth API Contract", () => {
    it("handles login with valid credentials", async () => {
      const user = await mockLogin({
        email: "guest@demo.test",
        password: "Password123",
      });
      expect(user.email).toBe("guest@demo.test");
      expect(user.isHost).toBe(false);
      expect(user.staffRole).toBeNull();
    });

    it("rejects login with wrong password", async () => {
      await expect(
        mockLogin({ email: "guest@demo.test", password: "WrongPass123" })
      ).rejects.toThrow("Email hoặc mật khẩu không chính xác.");
    });

    it("rejects login for unverified user (403)", async () => {
      await expect(
        mockLogin({ email: "unverified@demo.test", password: "Password123" })
      ).rejects.toThrow("Tài khoản chưa được kích hoạt");
    });

    it("rejects login for locked user (423)", async () => {
      await expect(
        mockLogin({ email: "locked@demo.test", password: "Password123" })
      ).rejects.toThrow("Tài khoản đang bị tạm khoá");
    });

    it("handles new user registration and email masking", async () => {
      const res = await mockRegister({
        fullName: "Tran Van B",
        email: "b.tran@example.com",
        password: "Password123",
        acceptTerms: true,
      });
      expect(res.emailMasked).toBe("b.***@example.com");
      expect(res.resendAvailableIn).toBe(60);

      expect(maskEmail("b.tran@example.com")).toBe("b.***@example.com");
    });

    it("verifies email with status states", async () => {
      const valid = await mockVerifyEmail("valid-token-123");
      expect(valid).toBe("VERIFIED");

      const expired = await mockVerifyEmail("expired");
      expect(expired).toBe("EXPIRED");

      const used = await mockVerifyEmail("used");
      expect(used).toBe("USED");

      const invalid = await mockVerifyEmail("invalid");
      expect(invalid).toBe("INVALID");
    });

    it("handles forgot password and reset password flows", async () => {
      const forgot = await mockForgotPassword("guest@demo.test");
      expect(forgot.success).toBe(true);

      const reset = await mockResetPassword("valid-reset-token", "NewPassword123");
      expect(reset.success).toBe(true);
    });
  });

  describe("3. Auth UI Interaction", () => {
    it("renders LoginPage with email, password fields and login button", () => {
      render(<LoginPage />);

      expect(screen.getByLabelText("emailLabel")).toBeDefined();
      expect(screen.getByLabelText("passwordLabel")).toBeDefined();
      expect(screen.getByRole("button", { name: "loginButton" })).toBeDefined();
      expect(screen.getByText("forgotPasswordLink")).toBeDefined();
    });

    it("renders RegisterPage and responds to form validation", async () => {
      render(<RegisterPage />);

      expect(screen.getByLabelText("fullNameLabel")).toBeDefined();
      expect(screen.getByLabelText("emailLabel")).toBeDefined();
      expect(screen.getByLabelText("passwordLabel")).toBeDefined();

      const submitBtn = screen.getByRole("button", { name: "registerButton" });
      fireEvent.click(submitBtn);

      // Errors should appear for empty fields
      await waitFor(() => {
        expect(screen.getAllByText(/Họ tên|Email|Mật khẩu|đồng ý/).length).toBeGreaterThan(0);
      });
    });
  });
});
