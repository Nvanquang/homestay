"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract locale from pathname (e.g. /vi/login -> vi)
  const isEn = pathname.startsWith("/en");
  const currentLocale = isEn ? "en" : "vi";

  const handleToggleLocale = () => {
    const nextLocale = isEn ? "vi" : "en";
    const nextPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
    router.push(nextPath);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {/* Auth Minimal Header */}
      <header className="h-16 sm:h-20 border-b border-[var(--color-border-subtle)] px-4 sm:px-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] rounded-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-500)]">
            <svg
              width="22"
              height="22"
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

        <button
          type="button"
          onClick={handleToggleLocale}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)] transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-[var(--color-brand-600)]" />
          <span className="uppercase">{currentLocale}</span>
        </button>
      </header>

      {/* Centered Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border-subtle)]">
        © 2026 Homestay Booking. Bảo lưu mọi quyền.
      </footer>
    </div>
  );
}
