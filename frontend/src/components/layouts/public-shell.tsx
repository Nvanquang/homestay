"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

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
  const t = useTranslations("common");
  const tFooter = useTranslations("footer");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleToggleLocale = () => {
    const nextLocale = locale === "vi" ? "en" : "vi";
    if (pathname) {
      const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.push(newPath);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] shadow-[var(--shadow-1)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] rounded-md"
            aria-label={`${t("appName")} ${t("explore")}`}
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
              {t("searchAnywhere")}
            </button>
            <button
              type="button"
              className="text-sm font-semibold px-3 py-1 hover:text-[var(--color-brand-600)] transition-colors border-r border-[var(--color-border-subtle)]"
            >
              {t("searchAnyWeek")}
            </button>
            <button
              type="button"
              className="text-sm text-[var(--color-text-secondary)] px-3 py-1 hover:text-[var(--color-brand-600)] transition-colors"
            >
              {t("addGuests")}
            </button>
            <div
              className="w-8 h-8 rounded-full bg-[var(--color-brand-600)] flex items-center justify-center text-white ml-2 flex-shrink-0"
              aria-label={t("search")}
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
              {t("becomeHost")}
            </Link>

            {/* Language Switcher */}
            <LocaleSwitcher />

            {/* User Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 border border-[var(--color-border-default)] p-1.5 pl-3 rounded-full hover:shadow-[var(--shadow-2)] transition-all bg-[var(--color-bg-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] cursor-pointer"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-label={t("account")}
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
                          {t("login")}
                        </Link>
                        <Link
                          href="/register"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                        >
                          {t("register")}
                        </Link>
                        <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                        <Link
                          href="/become-a-host"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          {t("becomeHost")}
                        </Link>
                        <Link
                          href="/help"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          {t("help")}
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)]">
                          {userName}
                        </div>
                        <Link
                          href="/account/profile"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-bg-subtle)]"
                        >
                          {t("profile")}
                        </Link>
                        <Link
                          href="/account/settings"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          {t("settings")}
                        </Link>
                        <Link
                          href="/account/verification"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg-subtle)]"
                        >
                          {t("verification")}
                        </Link>
                        <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSwitchToHost?.();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--color-brand-600)] hover:bg-[var(--color-bg-subtle)] cursor-pointer"
                        >
                          {t("switchToHost")}
                        </button>
                        <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                        <button
                          type="button"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] cursor-pointer"
                        >
                          {t("logout")}
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
        aria-label="Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] px-2 py-1.5 flex justify-around items-center"
      >
        <Link
          href={`/${locale}`}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            activeBottomTab === "explore"
              ? "text-[var(--color-brand-600)] font-semibold"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>{t("explore")}</span>
        </Link>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex flex-col items-center gap-1 py-1 px-2 text-xs text-[var(--color-text-disabled)] cursor-not-allowed opacity-60 relative"
          title={t("wishlist")}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--color-text-disabled)]" />
          </div>
          <span>{t("wishlist")}</span>
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex flex-col items-center gap-1 py-1 px-2 text-xs text-[var(--color-text-disabled)] cursor-not-allowed opacity-60 relative"
          title={t("trips")}
        >
          <div className="relative">
            <Luggage className="w-5 h-5" />
            <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--color-text-disabled)]" />
          </div>
          <span>{t("trips")}</span>
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex flex-col items-center gap-1 py-1 px-2 text-xs text-[var(--color-text-disabled)] cursor-not-allowed opacity-60 relative"
          title={t("inbox")}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--color-text-disabled)]" />
          </div>
          <span>{t("inbox")}</span>
        </button>

        <Link
          href={`/${locale}/account/profile`}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            activeBottomTab === "profile"
              ? "text-[var(--color-brand-600)] font-semibold"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          <User className="w-5 h-5" />
          <span>{t("account")}</span>
        </Link>
      </nav>

      {/* Desktop/Tablet Footer */}
      <footer className="bg-[var(--color-bg-subtle)] border-t border-[var(--color-border-default)] mt-auto py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">
                {tFooter("aboutTitle")}
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href={`/${locale}/about`} className="hover:underline">{tFooter("aboutUs")}</Link></li>
                <li><Link href={`/${locale}/careers`} className="hover:underline">{tFooter("careers")}</Link></li>
                <li><Link href={`/${locale}/news`} className="hover:underline">{tFooter("news")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">
                {tFooter("hostingTitle")}
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href={`/${locale}/become-a-host`} className="hover:underline">{tFooter("becomeHost")}</Link></li>
                <li><Link href={`/${locale}/host-insurance`} className="hover:underline">{tFooter("hostInsurance")}</Link></li>
                <li><Link href={`/${locale}/community`} className="hover:underline">{tFooter("hostCommunity")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">
                {tFooter("supportTitle")}
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href={`/${locale}/help`} className="hover:underline">{tFooter("helpCenter")}</Link></li>
                <li><Link href={`/${locale}/safety`} className="hover:underline">{tFooter("safetyInfo")}</Link></li>
                <li><Link href={`/${locale}/cancellation-policies`} className="hover:underline">{tFooter("cancellationPolicies")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-gray-900)] mb-3">
                {tFooter("legalTitle")}
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li><Link href={`/${locale}/terms`} className="hover:underline">{tFooter("termsOfService")}</Link></li>
                <li><Link href={`/${locale}/privacy`} className="hover:underline">{tFooter("privacyPolicy")}</Link></li>
                <li><Link href={`/${locale}/sitemap`} className="hover:underline">{tFooter("sitemap")}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-text-secondary)] gap-3">
            <div>
              {tFooter("copyright")}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-[var(--color-gray-900)]">
                {tFooter("currentLanguage")}
              </span>
              <span className="font-medium text-[var(--color-gray-900)]">
                {locale === "vi" ? tFooter("currencyVND") : tFooter("currencyUSD")}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
