"use client";

import React, { useState } from "react";
import { StaffUser, StaffRole, StaffStatus, AdminAuthSession } from "../types";
import { Badge, Button } from "@/components/ui";
import {
  Shield,
  Headphones,
  Calculator,
  Lock,
  Unlock,
  History,
  UserCog,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface StaffTableProps {
  staffList: StaffUser[];
  currentSession: AdminAuthSession | null;
  onOpenRoleDialog: (staff: StaffUser) => void;
  onOpenLockDialog: (staff: StaffUser) => void;
  onOpenActivityModal: (staff: StaffUser) => void;
  isLoading?: boolean;
}

export function StaffTable({
  staffList,
  currentSession,
  onOpenRoleDialog,
  onOpenLockDialog,
  onOpenActivityModal,
  isLoading = false,
}: StaffTableProps) {
  const t = useTranslations("admin.staff");

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge variant="attention" className="inline-flex items-center gap-1 font-semibold">
            <Shield className="w-3 h-3" />
            <span>{t("roleAdmin")}</span>
          </Badge>
        );
      case "SUPPORT":
        return (
          <Badge variant="info" className="inline-flex items-center gap-1">
            <Headphones className="w-3 h-3" />
            <span>{t("roleSupport")}</span>
          </Badge>
        );
      case "ACCOUNTANT":
        return (
          <Badge variant="warning" className="inline-flex items-center gap-1">
            <Calculator className="w-3 h-3" />
            <span>{t("roleAccountant")}</span>
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: StaffStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">{t("statusActive")}</Badge>;
      case "INVITED":
        return <Badge variant="neutral">{t("statusInvited")}</Badge>;
      case "LOCKED":
        return <Badge variant="error">{t("statusLocked")}</Badge>;
    }
  };

  const formatLastLogin = (lastLoginAt?: string | null) => {
    if (!lastLoginAt) return t("neverLoggedIn");
    const diffMin = Math.round(
      (Date.now() - new Date(lastLoginAt).getTime()) / (60 * 1000)
    );
    if (diffMin < 60) return `${diffMin} ${t("minutesAgo")}`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ${t("hoursAgo")}`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} ${t("daysAgo")}`;
  };

  const activeAdminCount = staffList.filter(
    (s) => s.staffRole === "ADMIN" && s.status !== "LOCKED"
  ).length;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border-default)]">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          <tr>
            <th scope="col" className="py-3 px-4">{t("nameColumn")}</th>
            <th scope="col" className="py-3 px-4">{t("emailColumn")}</th>
            <th scope="col" className="py-3 px-4">{t("roleColumn")}</th>
            <th scope="col" className="py-3 px-4">{t("statusColumn")}</th>
            <th scope="col" className="py-3 px-4 hidden md:table-cell">{t("lastLoginColumn")}</th>
            <th scope="col" className="py-3 px-4 text-right">{t("actionsColumn")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                {t("loading")}
              </td>
            </tr>
          ) : staffList.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                {t("noStaffFound")}
              </td>
            </tr>
          ) : (
            staffList.map((staff) => {
              const isSelf = currentSession?.id === staff.id;
              const isLastAdmin = staff.staffRole === "ADMIN" && activeAdminCount <= 1;
              const canModifyRole = !isSelf && !isLastAdmin;
              const canLock = !isSelf && !isLastAdmin;

              return (
                <tr
                  key={staff.id}
                  className="hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-gray-900)] text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                        {staff.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span>{staff.fullName}</span>
                        {isSelf && (
                          <span className="text-[11px] text-[var(--color-brand-600)] font-semibold">
                            ({t("youBadge")})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {staff.email}
                  </td>

                  <td className="py-3 px-4">
                    {getRoleBadge(staff.staffRole)}
                  </td>

                  <td className="py-3 px-4">
                    {getStatusBadge(staff.status)}
                  </td>

                  <td className="py-3 px-4 text-xs text-[var(--color-text-secondary)] hidden md:table-cell">
                    {formatLastLogin(staff.lastLoginAt)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {/* Đổi vai trò */}
                      <button
                        type="button"
                        onClick={() => onOpenRoleDialog(staff)}
                        disabled={!canModifyRole}
                        title={
                          isSelf
                            ? t("cannotSelfModifyRole")
                            : isLastAdmin
                            ? t("cannotDemoteLastAdmin")
                            : t("changeRoleTooltip")
                        }
                        className={`p-1.5 rounded-md transition-colors ${
                          canModifyRole
                            ? "hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-disabled)] cursor-not-allowed opacity-50"
                        }`}
                        aria-label={`Đổi vai trò cho ${staff.fullName}`}
                      >
                        <UserCog className="w-4 h-4" />
                      </button>

                      {/* Khoá / Mở khoá */}
                      <button
                        type="button"
                        onClick={() => onOpenLockDialog(staff)}
                        disabled={!canLock}
                        title={
                          isSelf
                            ? t("cannotSelfLock")
                            : isLastAdmin
                            ? t("cannotLockLastAdmin")
                            : staff.status === "LOCKED"
                            ? t("unlockTooltip")
                            : t("lockTooltip")
                        }
                        className={`p-1.5 rounded-md transition-colors ${
                          canLock
                            ? staff.status === "LOCKED"
                              ? "hover:bg-amber-50 text-amber-600"
                              : "hover:bg-red-50 text-[var(--color-error-fg)]"
                            : "text-[var(--color-text-disabled)] cursor-not-allowed opacity-50"
                        }`}
                        aria-label={
                          staff.status === "LOCKED"
                            ? `Mở khoá ${staff.fullName}`
                            : `Khoá ${staff.fullName}`
                        }
                      >
                        {staff.status === "LOCKED" ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </button>

                      {/* Lịch sử hoạt động */}
                      <button
                        type="button"
                        onClick={() => onOpenActivityModal(staff)}
                        title={t("viewHistoryTooltip")}
                        className="p-1.5 rounded-md hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        aria-label={`Xem lịch sử ${staff.fullName}`}
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
