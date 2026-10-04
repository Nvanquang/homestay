import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PublicShell,
  AccountShell,
  HostShell,
  AdminShell,
} from "@/components/layouts";

describe("Layout Shells Suite", () => {
  describe("PublicShell", () => {
    it("renders brand logo, navigation and children content", () => {
      render(
        <PublicShell>
          <div data-testid="public-content">Trang chủ Khám phá</div>
        </PublicShell>
      );

      expect(screen.getByText("homestay")).toBeDefined();
      expect(screen.getByTestId("public-content")).toBeDefined();
      expect(screen.getAllByText("Trở thành Host").length).toBeGreaterThan(0);
      expect(screen.getByText("Địa điểm bất kỳ")).toBeDefined();
    });

    it("renders logged in username when provided", () => {
      render(
        <PublicShell isLoggedIn={true} userName="Nguyen Van Quang">
          <div>Content</div>
        </PublicShell>
      );

      expect(screen.getByText("Content")).toBeDefined();
    });
  });

  describe("AccountShell", () => {
    it("renders account sub-navigation items and active state", () => {
      render(
        <AccountShell activeTab="settings" title="Cài đặt tài khoản">
          <div data-testid="account-content">Nội dung cài đặt</div>
        </AccountShell>
      );

      expect(screen.getByText("Cài đặt tài khoản")).toBeDefined();
      expect(screen.getByText("Hồ sơ cá nhân")).toBeDefined();
      expect(screen.getByText("Cài đặt & Bảo mật")).toBeDefined();
      expect(screen.getByText("Xác minh danh tính")).toBeDefined();
      expect(screen.getByTestId("account-content")).toBeDefined();
    });
  });

  describe("HostShell", () => {
    it("renders host sidebar, breadcrumbs and title", () => {
      render(
        <HostShell
          activeItem="calendar"
          title="Lịch đặt phòng"
          breadcrumbs={[
            { label: "Bảng điều khiển", href: "/host" },
            { label: "Lịch phòng" },
          ]}
        >
          <div data-testid="host-content">Lịch tháng 10</div>
        </HostShell>
      );

      expect(screen.getByText("Lịch đặt phòng")).toBeDefined();
      expect(screen.getByText("Danh sách phòng")).toBeDefined();
      expect(screen.getAllByText("Lịch phòng").length).toBeGreaterThan(0);
      expect(screen.getByTestId("host-content")).toBeDefined();
    });
  });

  describe("AdminShell", () => {
    it("renders admin console header, search input and sidebar", () => {
      render(
        <AdminShell
          activeItem="identity-reviews"
          title="Duyệt hồ sơ danh tính"
          adminName="Quản trị viên A"
          adminRole="CSKH"
        >
          <div data-testid="admin-content">Bảng danh sách CCCD</div>
        </AdminShell>
      );

      expect(screen.getByText("Admin Console")).toBeDefined();
      expect(screen.getByText("Duyệt danh tính (A03)")).toBeDefined();
      expect(screen.getByText("Duyệt hồ sơ danh tính")).toBeDefined();
      expect(screen.getByTestId("admin-content")).toBeDefined();
    });
  });
});
