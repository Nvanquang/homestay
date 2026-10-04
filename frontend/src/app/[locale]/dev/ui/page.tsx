"use client";

import React, { useState } from "react";
import { notFound, useParams, useRouter, usePathname } from "next/navigation";
import {
  Button,
  TextField,
  Select,
  Badge,
  toast,
} from "@/components/ui";
import {
  PublicShell,
  AccountShell,
  HostShell,
  AdminShell,
} from "@/components/layouts";
import { formatMoney, formatStayDate, formatDateRange } from "@/lib/format";
import { getErrorMessageByCode } from "@/lib/errors";
import {
  Globe,
  Palette,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";

// Static demo dates outside component render function for purity
const DEMO_DATE_START = new Date("2026-10-15T14:00:00Z");
const DEMO_DATE_END = new Date("2026-10-20T11:00:00Z");

export default function DevUiSandboxPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = (params?.locale as string) || "vi";

  // Production safety check
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  // Interactive states
  const [selectedShell, setSelectedShell] = useState<"none" | "public" | "account" | "host" | "admin">("none");
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputVal, setInputVal] = useState("homestay@booking.vn");
  const [hasInputError, setHasInputError] = useState(false);

  // Switch locale handler
  const handleToggleLocale = () => {
    const nextLocale = currentLocale === "vi" ? "en" : "vi";
    const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  // If a shell preview is selected, render it in full mode with exit button
  if (selectedShell === "public") {
    return (
      <PublicShell>
        <div className="py-8 text-center space-y-4">
          <Badge variant="success">Khung Xem Trước PublicShell</Badge>
          <h2 className="text-3xl font-bold">Trang Chủ Khám Phá (Public Shell)</h2>
          <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
            Bao gồm Header, thanh tìm kiếm viên thuốc (Search Pill), bộ chọn ngôn ngữ, nút Host và Footer đầy đủ.
          </p>
          <Button variant="secondary" onClick={() => setSelectedShell("none")}>
            ← Quay lại Sandbox UI
          </Button>
        </div>
      </PublicShell>
    );
  }

  if (selectedShell === "account") {
    return (
      <AccountShell activeTab="settings" title="Cài đặt tài khoản (Xem trước)">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Đây là phần bên trong card panel bo góc 12px của AccountShell, đi kèm sub-navigation gạch chân ngang.
          </p>
          <Button variant="secondary" onClick={() => setSelectedShell("none")}>
            ← Quay lại Sandbox UI
          </Button>
        </div>
      </AccountShell>
    );
  }

  if (selectedShell === "host") {
    return (
      <HostShell
        activeItem="listings"
        title="Danh sách phòng của bạn (Xem trước)"
        actionButton={<Button variant="primary">Thêm phòng mới</Button>}
        breadcrumbs={[{ label: "Kênh Host", href: "#" }, { label: "Listing" }]}
      >
        <div className="p-6 bg-white border border-[var(--color-border-default)] rounded-xl space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            HostShell với Sidebar 240px, vạch trái brand-600, Header chuyển đổi chế độ và Breadcrumbs.
          </p>
          <Button variant="secondary" onClick={() => setSelectedShell("none")}>
            ← Quay lại Sandbox UI
          </Button>
        </div>
      </HostShell>
    );
  }

  if (selectedShell === "admin") {
    return (
      <AdminShell
        activeItem="identity-reviews"
        title="Duyệt hồ sơ danh tính CCCD (Xem trước)"
        description="Màn hình thẩm định danh tính Host theo chuẩn bảo mật A03"
        actionButton={<Button variant="primary">Duyệt nhanh hàng đợi</Button>}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            AdminShell trên nền Canvas xám canvas (#F7F7F7), bọc trong Panel trắng bo góc 12px.
          </p>
          <Button variant="secondary" onClick={() => setSelectedShell("none")}>
            ← Quay lại Sandbox UI
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)] p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
      {/* Top Banner & Title */}
      <header className="border-b border-[var(--color-border-default)] pb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-brand-50)] text-[var(--color-brand-600)] border border-[var(--color-brand-100)]">
              Dev Sandbox
            </span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              /dev/ui · Cổng vào xây giao diện (FE-Base-04)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-gray-900)] tracking-tight">
            Design Tokens & UI Component Catalog
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Nền tảng giao diện chuẩn phong cách Airbnb, WCAG 2.1 AA, song ngữ VI/EN.
          </p>
        </div>

        {/* Locale Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleLocale}
            leftIcon={<Globe className="w-4 h-4 text-[var(--color-brand-600)]" />}
          >
            Ngôn ngữ: <strong className="ml-1 uppercase text-[var(--color-brand-600)]">{currentLocale}</strong> (Bấm để đổi)
          </Button>
        </div>
      </header>

      {/* Section 1: Color Palette & Design Tokens */}
      <section id="tokens" className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
          <Palette className="w-5 h-5 text-[var(--color-brand-600)]" />
          <h2 className="text-xl font-bold text-[var(--color-gray-900)]">
            1. Bảng Màu Design Tokens (Tỷ Lệ 90 / 9 / 1 & WCAG AA)
          </h2>
        </div>

        {/* Brand Swatches */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
            Màu Thương Hiệu (--brand-*)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { token: "--brand-50", hex: "#FFF0F3", text: "#A30830", desc: "Nền tint rất nhạt" },
              { token: "--brand-100", hex: "#FFD9E0", text: "#A30830", desc: "Viền tint" },
              { token: "--brand-500", hex: "#FF385C", text: "#FFFFFF", desc: "Logo / Đồ hoạ" },
              { token: "--brand-600", hex: "#E00B41", text: "#FFFFFF", desc: "Nút chính (4.89:1)" },
              { token: "--brand-700", hex: "#C20A38", text: "#FFFFFF", desc: "Hover (6.19:1)" },
              { token: "--brand-800", hex: "#A30830", text: "#FFFFFF", desc: "Pressed (7.97:1)" },
            ].map((c) => (
              <div
                key={c.token}
                className="p-3 rounded-xl border border-[var(--color-border-default)] shadow-[var(--shadow-1)] flex flex-col justify-between h-28"
                style={{ backgroundColor: c.hex, color: c.text }}
              >
                <div className="font-bold text-xs">{c.token}</div>
                <div>
                  <div className="font-mono text-xs">{c.hex}</div>
                  <div className="text-[11px] opacity-90">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grayscale Swatches */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
            Thang Xám Trung Tính (--gray-*)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { token: "--gray-0", hex: "#FFFFFF", text: "#222222", border: true },
              { token: "--gray-50", hex: "#F7F7F7", text: "#222222", border: true },
              { token: "--gray-100", hex: "#EBEBEB", text: "#222222" },
              { token: "--gray-200", hex: "#DDDDDD", text: "#222222" },
              { token: "--gray-400", hex: "#B0B0B0", text: "#FFFFFF" },
              { token: "--gray-500", hex: "#6A6A6A", text: "#FFFFFF" },
              { token: "--gray-700", hex: "#484848", text: "#FFFFFF" },
              { token: "--gray-900", hex: "#222222", text: "#FFFFFF" },
            ].map((c) => (
              <div
                key={c.token}
                className={`p-2.5 rounded-lg flex flex-col justify-between h-20 ${
                  c.border ? "border border-[var(--color-border-default)]" : ""
                }`}
                style={{ backgroundColor: c.hex, color: c.text }}
              >
                <span className="font-bold text-[11px]">{c.token}</span>
                <span className="font-mono text-[10px]">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic Colors */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
            Màu Ngữ Nghĩa Nhất Quán (WCAG AA)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: "Success", fg: "#00793A", bg: "#E6F4EA", label: "Đã xác minh / Thành công" },
              { name: "Error", fg: "#C13515", bg: "#FFF0ED", label: "Từ chối / Lỗi" },
              { name: "Warning", fg: "#8A5A00", bg: "#FFF4D6", label: "Chờ duyệt / Giữ chỗ" },
              { name: "Attention", fg: "#B34700", bg: "#FFEDE0", label: "Cần chỉnh sửa" },
              { name: "Info", fg: "#0B57D0", bg: "#E8F0FE", label: "Thông tin trung tính" },
            ].map((s) => (
              <div
                key={s.name}
                className="p-3.5 rounded-xl border flex flex-col gap-1.5"
                style={{ backgroundColor: s.bg, borderColor: s.fg, color: s.fg }}
              >
                <span className="font-bold text-sm">{s.name}</span>
                <span className="text-xs opacity-90">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: UI Primitives */}
      <section id="primitives" className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
          <Sparkles className="w-5 h-5 text-[var(--color-brand-600)]" />
          <h2 className="text-xl font-bold text-[var(--color-gray-900)]">
            2. Các UI Primitives Đợt 1 (CMP-01 đến CMP-10)
          </h2>
        </div>

        {/* Buttons (CMP-01) */}
        <div className="space-y-3 bg-[var(--color-bg-subtle)] p-6 rounded-2xl border border-[var(--color-border-subtle)]">
          <h3 className="font-bold text-sm text-[var(--color-gray-900)]">
            Nút Bấm (Button - CMP-01): Đủ biến thể & trạng thái
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Nút Chính</Button>
            <Button variant="secondary">Secondary Phụ</Button>
            <Button variant="danger">Danger Huỷ Diệt</Button>
            <Button variant="danger-outline">Danger Viền</Button>
            <Button variant="tertiary">Tertiary Đường dẫn</Button>
            <Button
              variant="primary"
              isLoading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 1500);
              }}
            >
              {btnLoading ? "Đang tải..." : "Bấm để Loading"}
            </Button>
            <Button variant="primary" disabled>
              Vô hiệu hoá
            </Button>
          </div>
        </div>

        {/* Form Fields (CMP-02 & CMP-04) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--color-bg-subtle)] p-6 rounded-2xl border border-[var(--color-border-subtle)]">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[var(--color-gray-900)]">
              Ô Nhập Liệu (TextField - CMP-02)
            </h3>
            <TextField
              label="Địa chỉ Email"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              helperText="Chúng tôi không bao giờ chia sẻ email của bạn."
              errorMessage={hasInputError ? "Định dạng email chưa chính xác" : undefined}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHasInputError(!hasInputError)}
            >
              Bật/Tắt Trạng Thái Lỗi
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[var(--color-gray-900)]">
              Menu Lựa Chọn (Select - CMP-04)
            </h3>
            <Select
              label="Khu vực lưu trú"
              options={[
                { value: "hanoi", label: "Hà Nội, Việt Nam" },
                { value: "danang", label: "Đà Nẵng, Việt Nam" },
                { value: "dalat", label: "Đà Lạt, Lâm Đồng" },
                { value: "saigon", label: "TP. Hồ Chí Minh" },
              ]}
              helperText="Chọn điểm đến bạn muốn khám phá."
            />
          </div>
        </div>

        {/* Badges (CMP-10) */}
        <div className="space-y-3 bg-[var(--color-bg-subtle)] p-6 rounded-2xl border border-[var(--color-border-subtle)]">
          <h3 className="font-bold text-sm text-[var(--color-gray-900)]">
            Huy Hiệu Trạng Thái (StatusBadge - CMP-10: Kèm Icon + Chữ)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">Bản nháp</Badge>
            <Badge variant="warning">Chờ duyệt (⏳)</Badge>
            <Badge variant="success">Đã xác minh (✓)</Badge>
            <Badge variant="attention">Cần chỉnh sửa (⚠)</Badge>
            <Badge variant="error">Bị từ chối (✕)</Badge>
            <Badge variant="error-solid">Bị khoá (🔒)</Badge>
            <Badge variant="info">Mới cập nhật</Badge>
          </div>
        </div>

        {/* Toast (Sonner - CMP-07) */}
        <div className="space-y-3 bg-[var(--color-bg-subtle)] p-6 rounded-2xl border border-[var(--color-border-subtle)]">
          <h3 className="font-bold text-sm text-[var(--color-gray-900)]">
            Thông Báo Toast (Sonner - CMP-07)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success("Đã lưu thông tin hồ sơ thành công!")}
            >
              Toast Thành công
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.error("Đã xảy ra lỗi kết nối tới máy chủ.")}
            >
              Toast Thất bại
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.warning("Phòng này chỉ còn 1 chỗ trống duy nhất.")}
            >
              Toast Cảnh báo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.info("Đã gửi email xác minh tới hòm thư.")}
            >
              Toast Thông tin
            </Button>
          </div>
        </div>
      </section>

      {/* Section 3: Format & Problem Details Demo */}
      <section id="format-i18n" className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
          <Terminal className="w-5 h-5 text-[var(--color-brand-600)]" />
          <h2 className="text-xl font-bold text-[var(--color-gray-900)]">
            3. Tiện Ích Định Dạng & Chuẩn Hoá Lỗi (FE-Base-03)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Demo */}
          <div className="bg-[var(--color-bg-subtle)] p-6 rounded-2xl border border-[var(--color-border-subtle)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--color-gray-900)]">Định dạng Tiền tệ & Ngày tháng</h3>
            <ul className="text-xs space-y-2 font-mono text-[var(--color-text-secondary)]">
              <li>{`formatMoney(1500000, "VND", "vi")`}: <strong className="text-[var(--color-gray-900)]">{formatMoney(1500000, "VND", "vi")}</strong></li>
              <li>{`formatMoney(150.5, "USD", "en")`}: <strong className="text-[var(--color-gray-900)]">{formatMoney(150.5, "USD", "en")}</strong></li>
              <li>{`formatStayDate(DEMO_DATE_START)`}: <strong className="text-[var(--color-gray-900)]">{formatStayDate(DEMO_DATE_START)}</strong></li>
              <li>{`formatDateRange(DEMO_DATE_START, DEMO_DATE_END)`}: <strong className="text-[var(--color-gray-900)]">{formatDateRange(DEMO_DATE_START, DEMO_DATE_END, currentLocale)}</strong></li>
            </ul>
          </div>

          {/* Error Normalizer Demo */}
          <div className="bg-[var(--color-bg-subtle)] p-6 rounded-2xl border border-[var(--color-border-subtle)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--color-gray-900)]">Chuẩn hoá Problem Details RFC 7807</h3>
            <div className="text-xs space-y-1.5 text-[var(--color-text-secondary)]">
              <p>Mã lỗi <code>calendar.unavailable</code> ({currentLocale}):</p>
              <div className="p-2.5 rounded bg-[var(--color-error-bg)] text-[var(--color-error-fg)] font-medium text-xs border border-[var(--color-error-border)]">
                {getErrorMessageByCode("calendar.unavailable", currentLocale as "vi" | "en")}
              </div>
              <p>Mã lỗi <code>booking.hold_expired</code> ({currentLocale}):</p>
              <div className="p-2.5 rounded bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)] font-medium text-xs border border-[var(--color-warning-border)]">
                {getErrorMessageByCode("booking.hold_expired", currentLocale as "vi" | "en")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Shell Layouts Preview */}
      <section id="shells" className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
          <Layers className="w-5 h-5 text-[var(--color-brand-600)]" />
          <h2 className="text-xl font-bold text-[var(--color-gray-900)]">
            4. Trải Nghiệm 4 Khung Mẫu Shell Layouts
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "public" as const,
              name: "PublicShell",
              desc: "Header với logo, Search pill, Language switch, Bottom nav điện thoại và Footer.",
              badge: "P01–P10",
            },
            {
              id: "account" as const,
              name: "AccountShell",
              desc: "PublicShell kết hợp Sub-navigation ngang gạch chân đen và Card Panel 12px.",
              badge: "C01–C03",
            },
            {
              id: "host" as const,
              name: "HostShell",
              desc: "Sidebar menu 240px, vạch trái brand-600, Header chuyển đổi Host/Guest.",
              badge: "H01–H16",
            },
            {
              id: "admin" as const,
              name: "AdminShell",
              desc: "Nền Canvas xám #F7F7F7, Header tìm nhanh, Sidebar duyệt hồ sơ danh tính.",
              badge: "A03, A04, A18",
            },
          ].map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-[var(--color-gray-900)]">{s.name}</span>
                  <Badge variant="neutral">{s.badge}</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  {s.desc}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedShell(s.id)}
                className="w-full"
              >
                Mở Xem Thử {s.name}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
