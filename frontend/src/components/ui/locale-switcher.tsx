"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";

export interface LocaleSwitcherProps {
  className?: string;
  variant?: "badge" | "button" | "minimal";
}

export function LocaleSwitcher({
  className = "",
  variant = "badge",
}: LocaleSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "vi", label: "Tiếng Việt", short: "VI", flag: "🇻🇳" },
    { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const handleSelectLanguage = (newLocale: "vi" | "en") => {
    setIsOpen(false);
    if (newLocale === locale) return;

    // Set cookie for persistence
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    if (pathname) {
      const segments = pathname.split("/");
      if (segments.length > 1 && (segments[1] === "vi" || segments[1] === "en")) {
        segments[1] = newLocale;
        router.push(segments.join("/"));
      } else {
        router.push(`/${newLocale}${pathname}`);
      }
    } else {
      router.push(`/${newLocale}`);
    }
  };

  const handleToggle = () => {
    const nextLocale = locale === "vi" ? "en" : "vi";
    handleSelectLanguage(nextLocale);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`p-2 rounded-full hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer flex items-center gap-1.5 ${className}`}
        title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
        aria-label="Đổi ngôn ngữ"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-bold uppercase">{locale}</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] flex items-center gap-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Chọn ngôn ngữ / Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-[var(--color-primary)]" />
        <span className="font-bold">{currentLang.short}</span>
        <span className="text-[var(--color-text-secondary)] hidden sm:inline font-normal">
          ({currentLang.label})
        </span>
        <ChevronDown className="w-3 h-3 text-[var(--color-text-tertiary)]" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-lg py-1.5 z-50 text-xs animate-in fade-in zoom-in-95"
        >
          <div className="px-3 py-1 text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider border-b border-[var(--color-border-subtle)] mb-1">
            Ngôn ngữ / Language
          </div>

          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="menuitem"
              onClick={() => handleSelectLanguage(lang.code as "vi" | "en")}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                lang.code === locale
                  ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-semibold"
                  : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {lang.code === locale && (
                <Check className="w-3.5 h-3.5 text-[var(--color-primary)] stroke-[2.5]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
