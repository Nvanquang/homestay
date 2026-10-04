"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  Menu,
  User,
  Heart,
  Luggage,
  MessageSquare,
  Compass,
  Lock,
} from "lucide-react";

export interface PublicShellProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  userName?: string;
  onSwitchToHost?: () => void;
  activeBottomTab?: "explore" | "wishlist" | "trips" | "inbox" | "profile";
}

export function PublicShell({
  children,
  isLoggedIn = false,
  userName = "Khách",
  onSwitchToHost,
  activeBottomTab = "explore",
}: PublicShellProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] shadow-[var(--shadow-1)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] rounded-md"
            aria-label="Homestay Booking Trang chủ"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-500)] group-hover:scale-105 transition-transform">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2.1l8.5 7.5c.3.3.5.7.5 1.1v9.8c0 .8-.7 1.5-1.5 1.5H15v-6h-6v6H4.5C3.7 22 3 21.3 3 20.5v-9.8c0-.4.2-.8.5-1.1L12 2.1z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--color-gray-900)]">
              homestay<span className="text-[var(--color-brand-600)]">.</span>
            </span>
          </Link>

          {/* Center Search Pill (Desktop) */}
          <div className="hidden md:flex items-center border border-[var(--color-border-default)] rounded-full py-2 px-4 shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow cursor-pointer bg-[var(--color-bg-surface)]">
            <button
              type="button"
              className="text-sm font-semibold px-3 py-1 hover:text-[var(--color-brand-600)] transition-colors border-r border-[var(--color-border-subtle)]"
            >
              Địa điểm bất kỳ
            </button>
            <button
              type="button"
              className="text-sm font-semibold px-3 py-1 hover:text-[var(--color-brand-600)] transition-colors border-r border-[var(--color-border-subtle)]"
            >
              Tuần bất kỳ
            </button>
            <button
              type="button"
              className="text-sm text-[var(--color-text-secondary)] px-3 py-1 hover:text-[var(--color-brand-600)] transition-colors"
            >
              Thêm khách
            </button>
            <div
              className="w-8 h-8 rounded-full bg-[var(--color-brand-600)] flex items-center justify-center text-white ml-2 flex-shrink-0"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/become-a-host"
              className="hidden sm:inline-flex text-sm font-medium px-3.5 py-2 rounded-full hover:bg-[var(--color-bg-subtle)] transition-colors"
            >
              Trở thành Host
            </Link>

            <button
              type="button"
              className="p-2.5 rounded-full hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] transition-colors"
              aria-label="Chọn ngôn ngữ (Hiện tại: Tiếng Việt)"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* User Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 border border-[var(--color-border-default)] p-1.5 pl-3 rounded-full hover:shadow-[var(--shadow-2)] transition-all bg-[var(--color-bg-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)]"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-label="Menu tài khoản"
              >
                <Menu className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <div className="w-7 h-7 rounded-full bg-[var(--color-gray-900)] text-white flex items-center justify-center text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-2)] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    {!isLoggedIn ? (
                      <>
                        <Link
                          href="/login"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-semibold hover:bg-[var(--color-bg-subtle)]"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          href="/register"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                        >
                          Đăng ký tài khoản
                        </Link>
                        <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                        <Link
                          href="/become-a-host"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          Cho thuê chỗ ở cùng Homestay
                        </Link>
                        <Link
                          href="/help"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          Trung tâm trợ giúp
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)]">
                          Đăng nhập với {userName}
                        </div>
                        <Link
                          href="/account/profile"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-bg-subtle)]"
                        >
                          Hồ sơ cá nhân
                        </Link>
                        <Link
                          href="/account/settings"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          Cài đặt tài khoản
                        </Link>
                        <Link
                          href="/account/verification"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          Xác minh danh tính
                        </Link>
                        <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSwitchToHost?.();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--color-brand-600)] hover:bg-[var(--color-bg-subtle)]"
                        >
                          Chuyển sang chế độ Host
                        </button>
                        <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                        <button
                          type="button"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                        >
                          Đăng xuất
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Airbnb style) */}
      <nav
        aria-label="Điều hướng chính trên điện thoại"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] px-2 py-1.5 flex justify-around items-center"
      >
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            activeBottomTab === "explore"
              ? "text-[var(--color-brand-600)] font-semibold"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Khám phá</span>
        </Link>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex flex-col items-center gap-1 py-1 px-2 text-xs text-[var(--color-text-disabled)] cursor-not-allowed opacity-60 relative"
          title="Yêu thích (Giai đoạn sau)"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--color-text-disabled)]" />
          </div>
          <span>Yêu thích</span>
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex flex-col items-center gap-1 py-1 px-2 text-xs text-[var(--color-text-disabled)] cursor-not-allowed opacity-60 relative"
          title="Chuyến đi (Giai đoạn sau)"
        >
          <div className="relative">
            <Luggage className="w-5 h-5" />
            <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--color-text-disabled)]" />
          </div>
          <span>Chuyến đi</span>
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex flex-col items-center gap-1 py-1 px-2 text-xs text-[var(--color-text-disabled)] cursor-not-allowed opacity-60 relative"
          title="Hộp thư (Giai đoạn sau)"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--color-text-disabled)]" />
          </div>
          <span>Hộp thư</span>
        </button>

        <Link
          href="/account/profile"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            activeBottomTab === "profile"
              ? "text-[var(--color-brand-600)] font-semibold"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Tài khoản</span>
        </Link>
      </nav>

      {/* Desktop/Tablet Footer */}
      <footer className="bg-[var(--color-bg-subtle)] border-t border-[var(--color-border-default)] mt-auto py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">Về Homestay</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href="/about" className="hover:underline">Giới thiệu</Link></li>
                <li><Link href="/careers" className="hover:underline">Cơ hội việc làm</Link></li>
                <li><Link href="/news" className="hover:underline">Tin tức</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">Đón tiếp khách</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href="/become-a-host" className="hover:underline">Trở thành Host</Link></li>
                <li><Link href="/host-insurance" className="hover:underline">Bảo hiểm cho Host</Link></li>
                <li><Link href="/community" className="hover:underline">Cộng đồng Host</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">Hỗ trợ</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href="/help" className="hover:underline">Trung tâm trợ giúp</Link></li>
                <li><Link href="/safety" className="hover:underline">Thông tin an toàn</Link></li>
                <li><Link href="/cancellation-policies" className="hover:underline">Chính sách huỷ phòng</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">Điều khoản & Pháp lý</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href="/terms" className="hover:underline">Điều khoản dịch vụ</Link></li>
                <li><Link href="/privacy" className="hover:underline">Chính sách quyền riêng tư</Link></li>
                <li><Link href="/sitemap" className="hover:underline">Sơ đồ trang web</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-text-secondary)] gap-3">
            <div>
              © 2026 Homestay Booking. Tất cả quyền được bảo lưu. Tuân thủ chuẩn WCAG 2.1 AA.
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-[var(--color-gray-900)]">Tiếng Việt (VN)</span>
              <span className="font-medium text-[var(--color-gray-900)]">₫ VND</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
