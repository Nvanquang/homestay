"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Building2,
  ShieldCheck,
  Calendar,
  Luggage,
  DollarSign,
  Lock,
  Menu,
  X,
  ChevronDown,
  User,
  ChevronRight,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

export type HostNavId = "listings" | "verification" | "calendar" | "bookings" | "earnings";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HostShellProps {
  children: React.ReactNode;
  activeItem?: HostNavId;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  actionButton?: React.ReactNode;
  userName?: string;
  onSwitchToGuest?: () => void;
}

export function HostShell({
  children,
  activeItem = "listings",
  breadcrumbs,
  title,
  actionButton,
  userName = "Chủ nhà",
  onSwitchToGuest,
}: HostShellProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tHost = useTranslations("hostListings");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: locale === "vi" ? "Bảng điều khiển Host" : "Host Dashboard", href: `/${locale}/host/listings` },
  ];

  const actualBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  const navigationItems = [
    {
      id: "listings" as const,
      label: locale === "vi" ? "Danh sách phòng" : "Listings",
      href: `/${locale}/host/listings`,
      icon: Building2,
      locked: false,
    },
    {
      id: "verification" as const,
      label: locale === "vi" ? "Xác minh Host" : "Host Verification",
      href: `/${locale}/host/verification`,
      icon: ShieldCheck,
      locked: false,
    },
    {
      id: "calendar" as const,
      label: locale === "vi" ? "Lịch phòng" : "Calendar",
      href: `/${locale}/host/calendar`,
      icon: Calendar,
      locked: false,
    },
    {
      id: "bookings" as const,
      label: locale === "vi" ? "Đặt phòng" : "Reservations",
      href: "#",
      icon: Luggage,
      locked: true,
      phaseNote: locale === "vi" ? "Giai đoạn sau" : "Next Phase",
    },
    {
      id: "earnings" as const,
      label: locale === "vi" ? "Thu nhập & Payout" : "Earnings & Payout",
      href: "#",
      icon: DollarSign,
      locked: true,
      phaseNote: locale === "vi" ? "Giai đoạn sau" : "Next Phase",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] h-16 flex items-center justify-between px-4 sm:px-6 shadow-[var(--shadow-1)]">
        {/* Left: Brand / Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] cursor-pointer"
            aria-label="Đóng mở menu Host"
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href={`/${locale}/host/listings`}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-500)]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline">
              homestay <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-brand-600)]">Host</span>
            </span>
          </Link>
        </div>

        {/* Right: Switch mode, locale, user */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/account/profile`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-muted)] border border-[var(--color-border-subtle)] transition-colors"
          >
            <span>{t("switchToGuest")}</span>
          </Link>

          {/* Language Switcher */}
          <LocaleSwitcher />

          {/* User profile dropdown trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[var(--color-bg-subtle)]"
              aria-label="Tài khoản Host"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-gray-900)] text-white flex items-center justify-center text-xs font-semibold">
                <User className="w-4 h-4" />
              </div>
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-2)] py-2 z-50 animate-in fade-in slide-in-from-top-1"
                >
                  <div className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] border-b border-[var(--color-border-subtle)]">
                    Host: {userName}
                  </div>
                  <Link
                    href={`/${locale}`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-[var(--color-brand-600)] hover:bg-[var(--color-bg-subtle)] font-medium"
                  >
                    {t("switchToGuest")}
                  </Link>
                  <Link
                    href={`/${locale}/account/settings`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-[var(--color-bg-subtle)]"
                  >
                    {t("settings")}
                  </Link>
                  <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] cursor-pointer"
                  >
                    {t("logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] pt-16 md:pt-0 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label={locale === "vi" ? "Thanh điều hướng Host" : "Host Navigation"}
        >
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              {locale === "vi" ? "Quản lý chỗ ở" : "Manage Listings"}
            </div>
            {navigationItems.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;

              if (item.locked) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-disabled)] opacity-60 cursor-not-allowed"
                    title={item.phaseNote}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[var(--color-text-disabled)]" />
                      <span>{item.label}</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-[var(--color-text-disabled)]" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-[var(--color-brand-600)] before:rounded-r"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[var(--color-brand-600)]" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Breadcrumb & Title */}
            <div>
              {actualBreadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mb-2">
                  {actualBreadcrumbs.map((b, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-disabled)]" />}
                      {b.href && idx < actualBreadcrumbs.length - 1 ? (
                        <Link href={b.href} className="hover:underline">
                          {b.label}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-text-primary)] font-medium">{b.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}

              {(title || actionButton) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-gray-900)] tracking-tight">
                      {title}
                    </h1>
                  )}
                  {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
                </div>
              )}
            </div>

            {/* Page Main Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
