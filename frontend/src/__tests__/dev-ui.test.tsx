import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DevUiSandboxPage from "@/app/[locale]/dev/ui/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "vi" }),
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/vi/dev/ui",
  notFound: vi.fn(),
}));

describe("Dev UI Sandbox Page (/dev/ui)", () => {
  it("renders page header and main sections", () => {
    render(<DevUiSandboxPage />);

    expect(screen.getByText("Design Tokens & UI Component Catalog")).toBeDefined();
    expect(screen.getByText("1. Bảng Màu Design Tokens (Tỷ Lệ 90 / 9 / 1 & WCAG AA)")).toBeDefined();
    expect(screen.getByText("2. Các UI Primitives Đợt 1 (CMP-01 đến CMP-10)")).toBeDefined();
    expect(screen.getByText("3. Tiện Ích Định Dạng & Chuẩn Hoá Lỗi (FE-Base-03)")).toBeDefined();
    expect(screen.getByText("4. Trải Nghiệm 4 Khung Mẫu Shell Layouts")).toBeDefined();
  });

  it("can switch shell previews interactively", () => {
    render(<DevUiSandboxPage />);

    const openPublicBtn = screen.getByText("Mở Xem Thử PublicShell");
    fireEvent.click(openPublicBtn);

    expect(screen.getByText("Khung Xem Trước PublicShell")).toBeDefined();

    const backBtn = screen.getByText("← Quay lại Sandbox UI");
    fireEvent.click(backBtn);

    expect(screen.getByText("Design Tokens & UI Component Catalog")).toBeDefined();
  });
});
