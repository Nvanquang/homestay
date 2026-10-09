"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  FileCheck2,
  Users,
  BarChart3,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Lock,
  LogOut,
  Bell,
  Globe,
} from "lucide-react";

import { useLocale, useTranslations } from "next-intl";

export type AdminNavId = "identity-reviews" | "listing-reviews" | "staff" | "reports";

export interface AdminShellProps {
  children: React.ReactNode;
  activeItem?: AdminNavId;
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
  adminName?: string;
  adminRole?: string;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
}

export function AdminShell({
  children,
  activeItem = "identity-reviews",
  title,
  description,
  actionButton,
  adminName,
  adminRole,
  onLogout,
  onSearch,
}: AdminShellProps) {
  const t = useTranslations("admin.shell");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const displayAdminName = adminName || t("defaultAdminName");
  const displayAdminRole = adminRole || t("defaultAdminRole");

  const handleToggleLocale = () => {
    const nextLocale = locale === "vi" ? "en" : "vi";
    if (pathname) {
      const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.push(newPath);
    }
  };

  const navigationItems = [
    {
      id: "identity-reviews" as const,
      label: t("navIdentity"),
      href: `/${locale}/admin/identity-reviews`,
      icon: ShieldCheck,
      locked: false,
    },
    {
      id: "listing-reviews" as const,
      label: t("navListing"),
      href: `/${locale}/admin/listings-review`,
      icon: FileCheck2,
      locked: false,
    },
    {
      id: "staff" as const,
      label: t("navStaff"),
      href: `/${locale}/admin/staff`,
      icon: Users,
      locked: false,
    },
    {
      id: "reports" as const,
      label: t("navReports"),
      href: "#",
      icon: BarChart3,
      locked: true,
      phaseNote: t("phaseNote"),
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] h-16 flex items-center justify-between px-4 sm:px-6 shadow-[var(--shadow-1)]">
        {/* Left: Console Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]"
            aria-label={t("toggleMenuAria")}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gray-900)] text-white flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[var(--color-gray-900)]">
                {t("consoleTitle")}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)] -mt-1">
                {t("consoleSubtitle")}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Quick Search */}
        <div className="hidden sm:block flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:bg-[var(--color-bg-surface)] focus:border-[var(--color-border-strong)] transition-all placeholder:text-[var(--color-text-secondary)]"
            />
          </form>
        </div>

        {/* Right: Language, Notifications & Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={handleToggleLocale}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            aria-label={`Language (Current: ${locale === "vi" ? "Tiếng Việt" : "English"})`}
            title={locale === "vi" ? "Chuyển sang English" : "Chuyển sang Tiếng Việt"}
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-bold text-[var(--color-text-primary)]">
              {locale === "vi" ? "VI" : "EN"}
            </span>
            <span className="text-[10px] text-neutral-400 font-normal hidden sm:inline">
              ({locale === "vi" ? "Tiếng Việt" : "English"})
            </span>
          </button>

          <button
            type="button"
            className="p-2 rounded-full hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] relative"
            aria-label={t("notificationsLabel")}
          >
            <Bell className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
              aria-label={t("accountMenuLabel")}
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-7 h-7 rounded-full bg-[var(--color-gray-900)] text-white flex items-center justify-center text-xs font-semibold">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-[var(--color-gray-900)] leading-none">
                  {displayAdminName}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-none">
                  {displayAdminRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
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
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-2)] py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                >
                  <div className="px-4 py-2 border-b border-[var(--color-border-subtle)] md:hidden">
                    <p className="text-xs font-semibold text-[var(--color-gray-900)]">{displayAdminName}</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">{displayAdminRole}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-error-fg)] hover:bg-[var(--color-bg-subtle)]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("logoutBtn")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Panels Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Admin Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] pt-16 lg:pt-0 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label={t("navAria")}
        >
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              {t("navSectionTitle")}
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
                      ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-[var(--color-gray-900)] before:rounded-r"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[var(--color-gray-900)]" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Admin Content Area (Canvas background, Surface Panels) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {(title || actionButton) && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-[var(--color-gray-900)] tracking-tight">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {description}
                    </p>
                  )}
                </div>
                {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
              </div>
            )}

            {/* Main content panel wrapper */}
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-1)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
