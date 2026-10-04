import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, TextField, Select, Badge } from "@/components/ui";

describe("UI Primitives Suite", () => {
  describe("Button (CMP-01)", () => {
    it("renders primary button and handles click", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Bấm vào tôi</Button>);

      const btn = screen.getByText("Bấm vào tôi");
      expect(btn).toBeDefined();

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders loading state with disabled interaction", () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading={true} onClick={handleClick}>
          Lưu dữ liệu
        </Button>
      );

      expect(screen.getByText("Đang xử lý...")).toBeDefined();
      const btn = screen.getByRole("button");
      expect(btn.hasAttribute("disabled")).toBe(true);

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("renders danger variant", () => {
      render(<Button variant="danger">Xoá phòng</Button>);
      expect(screen.getByText("Xoá phòng")).toBeDefined();
    });
  });

  describe("TextField (CMP-02)", () => {
    it("renders with label and handles text change", () => {
      const handleChange = vi.fn();
      render(
        <TextField
          label="Họ và tên"
          placeholder="Nhập tên"
          onChange={handleChange}
        />
      );

      expect(screen.getByText("Họ và tên")).toBeDefined();
      const input = screen.getByPlaceholderText("Nhập tên");
      fireEvent.change(input, { target: { value: "Quang" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("displays error message when provided", () => {
      render(
        <TextField
          label="Mật khẩu"
          errorMessage="Mật khẩu phải có tối thiểu 8 ký tự"
        />
      );

      expect(screen.getByText("Mật khẩu phải có tối thiểu 8 ký tự")).toBeDefined();
    });
  });

  describe("Select (CMP-04)", () => {
    it("renders options and handles selection", () => {
      render(
        <Select
          label="Thành phố"
          options={[
            { value: "hn", label: "Hà Nội" },
            { value: "dn", label: "Đà Nẵng" },
          ]}
        />
      );

      expect(screen.getByText("Hà Nội")).toBeDefined();
      expect(screen.getByText("Đà Nẵng")).toBeDefined();
    });
  });

  describe("Badge (CMP-10)", () => {
    it("renders semantic variants with text", () => {
      render(
        <div>
          <Badge variant="success">Đã duyệt</Badge>
          <Badge variant="warning">Chờ duyệt</Badge>
          <Badge variant="error-solid">Bị khoá</Badge>
        </div>
      );

      expect(screen.getByText("Đã duyệt")).toBeDefined();
      expect(screen.getByText("Chờ duyệt")).toBeDefined();
      expect(screen.getByText("Bị khoá")).toBeDefined();
    });
  });
});
