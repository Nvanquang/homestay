"use client";

import React from "react";
import Link from "next/link";
import { PublicShell } from "./public-shell";
import { User, Settings, ShieldCheck } from "lucide-react";

export type AccountTab = "profile" | "settings" | "verification";

export interface AccountShellProps {
  children: React.ReactNode;
  activeTab?: AccountTab;
  title?: string;
  description?: string;
  userName?: string;
  onSwitchToHost?: () => void;
}

export function AccountShell({
  children,
  activeTab = "profile",
  title = "Tài khoản của bạn",
  description = "Quản lý thông tin cá nhân, cài đặt bảo mật và trạng thái xác minh danh tính.",
  userName = "Người dùng",
  onSwitchToHost,
}: AccountShellProps) {
  const tabs = [
    {
      id: "profile" as const,
      label: "Hồ sơ cá nhân",
      href: "/account/profile",
      icon: User,
    },
    {
      id: "settings" as const,
      label: "Cài đặt & Bảo mật",
      href: "/account/settings",
      icon: Settings,
    },
    {
      id: "verification" as const,
      label: "Xác minh danh tính",
      href: "/account/verification",
      icon: ShieldCheck,
    },
  ];

  return (
    <PublicShell
      isLoggedIn={true}
      userName={userName}
      onSwitchToHost={onSwitchToHost}
      activeBottomTab="profile"
    >
      <div className="max-w-5xl mx-auto py-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-gray-900)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
              {description}
            </p>
          )}
        </div>

        {/* Horizontal Sub-Navigation */}
        <nav
          aria-label="Thanh điều hướng tài khoản"
          className="flex border-b border-[var(--color-border-default)] mb-6 overflow-x-auto no-scrollbar"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 py-3.5 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] ${
                  isActive
                    ? "border-[var(--color-gray-900)] text-[var(--color-gray-900)] font-semibold"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-gray-900)] hover:border-[var(--color-border-subtle)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Content Container (Card with rounded-12 and border-default) */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] p-6 sm:p-8 shadow-[var(--shadow-1)]">
          {children}
        </div>
      </div>
    </PublicShell>
  );
}
