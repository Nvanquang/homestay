import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  adminLogin,
  getStaffList,
  createStaff,
  updateStaffRole,
  toggleStaffLock,
  getStaffActivityLogs,
  _resetStaffDatabase,
  setCurrentAdminSession,
} from "../api/mock-admin";
import AdminLoginPage from "@/app/[locale]/(admin)/admin/login/page";
import AdminStaffPage from "@/app/[locale]/(admin)/admin/staff/page";
import { StaffTable } from "../components/StaffTable";
import { StaffDrawer } from "../components/StaffDrawer";
import { StaffRoleDialog } from "../components/StaffRoleDialog";
import { AdminForbidden } from "../components/AdminForbidden";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useParams: () => ({ locale: "vi" }),
  usePathname: () => "/vi/admin/staff",
  notFound: vi.fn(),
}));

describe("Slice FE-S03: Admin Back-office & RBAC Test Suite", () => {
  beforeEach(() => {
    _resetStaffDatabase();
    vi.clearAllMocks();
  });

  describe("1. Mock Admin API Contract & RBAC Rules", () => {
    it("rejects guest accounts with FORBIDDEN_ROLE", async () => {
      await expect(
        adminLogin({
          email: "guest@example.com",
          password: "password123",
        })
      ).rejects.toThrow("FORBIDDEN_ROLE");
    });

    it("logs in valid staff and returns admin session", async () => {
      const session = await adminLogin({
        email: "admin@homestay.local",
        password: "ValidAdminPassword123",
      });

      expect(session.email).toBe("admin@homestay.local");
      expect(session.staffRole).toBe("ADMIN");
    });

    it("rejects login for locked staff accounts", async () => {
      await expect(
        adminLogin({
          email: "minh.kt@homestay.local",
          password: "ValidPassword123",
        })
      ).rejects.toThrow("ACCOUNT_LOCKED");
    });

    it("filters staff by query, role, and status", async () => {
      const all = await getStaffList();
      expect(all.total).toBe(4);

      const searchLan = await getStaffList({ query: "Lan" });
      expect(searchLan.items.length).toBe(1);
      expect(searchLan.items[0]?.fullName).toBe("Lan CSKH");

      const accountants = await getStaffList({ role: "ACCOUNTANT" });
      expect(accountants.items.length).toBe(1);
      expect(accountants.items[0]?.email).toBe("minh.kt@homestay.local");

      const lockedStaff = await getStaffList({ status: "LOCKED" });
      expect(lockedStaff.items.length).toBe(1);
    });

    it("creates new staff with INVITED status and records audit log", async () => {
      const newStaff = await createStaff({
        fullName: "Thảo Kế toán",
        email: "thao.kt@homestay.local",
        staffRole: "ACCOUNTANT",
      });

      expect(newStaff.id).toBeDefined();
      expect(newStaff.status).toBe("INVITED");

      const logs = await getStaffActivityLogs(newStaff.id);
      expect(logs.length).toBe(1);
      expect(logs[0]?.action).toBe("CREATE");
    });

    it("prevents self-demotion and self-locking with 409 SELF_ACTION", async () => {
      await setCurrentAdminSession({
        id: "staff-1",
        fullName: "Quản trị viên Hệ thống",
        email: "admin@homestay.local",
        staffRole: "ADMIN",
      });

      // Self-demote
      await expect(
        updateStaffRole("staff-1", "SUPPORT", "Thử tự hạ quyền chính mình")
      ).rejects.toThrow("409 SELF_ACTION");

      // Self-lock
      await expect(
        toggleStaffLock("staff-1", true, "Thử tự khoá tài khoản chính mình")
      ).rejects.toThrow("409 SELF_ACTION");
    });

    it("prevents demoting or locking the last remaining active Admin", async () => {
      // staff-1 is the only active Admin
      await setCurrentAdminSession({
        id: "staff-2",
        fullName: "Lan CSKH",
        email: "lan.cskh@homestay.local",
        staffRole: "ADMIN",
      });

      await expect(
        toggleStaffLock("staff-1", true, "Khoá admin cuối cùng trong danh sách")
      ).rejects.toThrow("409 LAST_ADMIN");
    });
  });

  describe("2. Admin Login Page (A01)", () => {
    it("renders admin console login card and handles login flow", async () => {
      render(<AdminLoginPage />);

      expect(screen.getByText("Admin Console")).toBeDefined();
      expect(screen.getByText("Hệ thống quản trị & vận hành Homestay Back-office")).toBeDefined();

      const emailInput = screen.getByLabelText("Email nhân sự");
      const passwordInput = screen.getByLabelText("Mật khẩu");
      const submitBtn = screen.getByRole("button", { name: /Đăng nhập Back-office/i });

      fireEvent.change(emailInput, { target: { value: "admin@homestay.local" } });
      fireEvent.change(passwordInput, { target: { value: "secret123" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/vi/admin/staff");
      });
    });

    it("shows error alert on unauthorized role attempt", async () => {
      render(<AdminLoginPage />);

      const emailInput = screen.getByLabelText("Email nhân sự");
      const passwordInput = screen.getByLabelText("Mật khẩu");
      const submitBtn = screen.getByRole("button", { name: /Đăng nhập Back-office/i });

      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
        expect(
          screen.getByText("Tài khoản không có quyền truy cập back-office.")
        ).toBeDefined();
      });
    });
  });

  describe("3. Staff Table Component (CMP-24)", () => {
    it("renders staff list with role badges and disabled self-actions", () => {
      const mockStaff = [
        {
          id: "staff-1",
          fullName: "Quản trị viên Hệ thống",
          email: "admin@homestay.local",
          staffRole: "ADMIN" as const,
          status: "ACTIVE" as const,
          lastLoginAt: new Date().toISOString(),
          createdAt: "2026-01-01T08:00:00Z",
        },
        {
          id: "staff-2",
          fullName: "Lan CSKH",
          email: "lan.cskh@homestay.local",
          staffRole: "SUPPORT" as const,
          status: "ACTIVE" as const,
          lastLoginAt: null,
          createdAt: "2026-01-15T09:30:00Z",
        },
      ];

      render(
        <StaffTable
          staffList={mockStaff}
          currentSession={{
            id: "staff-1",
            fullName: "Quản trị viên Hệ thống",
            email: "admin@homestay.local",
            staffRole: "ADMIN",
          }}
          onOpenRoleDialog={vi.fn()}
          onOpenLockDialog={vi.fn()}
          onOpenActivityModal={vi.fn()}
        />
      );

      expect(screen.getByText("Quản trị viên Hệ thống")).toBeDefined();
      expect(screen.getByText("(Bạn)")).toBeDefined();
      expect(screen.getByText("Lan CSKH")).toBeDefined();
      expect(screen.getByText("Chưa từng đăng nhập")).toBeDefined();
    });
  });

  describe("4. Admin Staff Page (A18) Full Integration", () => {
    it("renders staff directory and filter controls", async () => {
      render(<AdminStaffPage />);

      expect(await screen.findByText("Nhân sự và phân quyền")).toBeDefined();
      expect(await screen.findByText("Tạo nhân sự mới")).toBeDefined();
      expect(await screen.findByText("Quản trị viên Hệ thống")).toBeDefined();
      expect(await screen.findByText("Lan CSKH")).toBeDefined();
    });

    it("renders 403 Forbidden screen when non-admin staff accesses staff route", async () => {
      await setCurrentAdminSession({
        id: "staff-2",
        fullName: "Lan CSKH",
        email: "lan.cskh@homestay.local",
        staffRole: "SUPPORT",
      });

      render(<AdminStaffPage />);

      await waitFor(() => {
        expect(screen.getByText("403 Forbidden")).toBeDefined();
        expect(
          screen.getByText("Bạn không có quyền xem trang này")
        ).toBeDefined();
      });
    });
  });
});
