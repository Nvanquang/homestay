"use client";

import React, { useEffect, useState, useTransition } from "react";
import { AdminShell } from "@/components/layouts";
import {
  StaffTable,
  StaffDrawer,
  StaffRoleDialog,
  StaffActivityModal,
  AdminForbidden,
  StaffUser,
  StaffRole,
  StaffStatus,
  AdminAuthSession,
  getStaffList,
  getCurrentAdminSession,
  createStaff,
  updateStaffRole,
  toggleStaffLock,
} from "@/features/admin";
import { CreateStaffFormValues } from "@/features/admin/schemas";
import { ConfirmDialog, Button, Select } from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import { Plus, Search, Filter } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminStaffPage() {
  const t = useTranslations("admin.staff");
  const [, startTransition] = useTransition();

  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<StaffStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Data state
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal dialog states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerSubmitting, setIsDrawerSubmitting] = useState(false);

  const [roleStaffTarget, setRoleStaffTarget] = useState<StaffUser | null>(null);
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);

  const [lockStaffTarget, setLockStaffTarget] = useState<StaffUser | null>(null);
  const [isLockSubmitting, setIsLockSubmitting] = useState(false);

  const [activityStaffTarget, setActivityStaffTarget] = useState<StaffUser | null>(null);

  // 1. Load Session
  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const current = await getCurrentAdminSession();
        if (mounted) {
          setSession(current);
        }
      } finally {
        if (mounted) setIsSessionLoading(false);
      }
    }
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch staff list
  const loadStaffData = async () => {
    setIsLoading(true);
    try {
      const res = await getStaffList({
        query: searchQuery,
        role: roleFilter,
        status: statusFilter,
        page,
        pageSize: 10,
      });
      setStaffList(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = searchQuery ? 300 : 0;
    const timer = setTimeout(() => {
      loadStaffData();
    }, delay);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, statusFilter, page]);

  // Handlers
  const handleCreateStaff = async (data: CreateStaffFormValues) => {
    setIsDrawerSubmitting(true);
    try {
      await createStaff(data);
      toast.success(t("createSuccessToast", { name: data.fullName }));
      await loadStaffData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("EMAIL_EXISTS")) {
        toast.error(t("emailExistsError"));
      } else {
        toast.error(t("createError"));
      }
    } finally {
      setIsDrawerSubmitting(false);
    }
  };

  const handleUpdateRole = async (newRole: StaffRole, reason: string) => {
    if (!roleStaffTarget) return;
    setIsRoleSubmitting(true);
    try {
      await updateStaffRole(roleStaffTarget.id, newRole, reason);
      toast.success(t("roleUpdateSuccessToast", { name: roleStaffTarget.fullName }));
      await loadStaffData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("SELF_ACTION")) {
        toast.error(t("cannotSelfModifyRole"));
      } else if (msg.includes("LAST_ADMIN")) {
        toast.error(t("cannotDemoteLastAdmin"));
      } else {
        toast.error(t("updateError"));
      }
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  const handleToggleLock = async (reason?: string) => {
    if (!lockStaffTarget) return;
    setIsLockSubmitting(true);
    const willLock = lockStaffTarget.status !== "LOCKED";
    try {
      await toggleStaffLock(lockStaffTarget.id, willLock, reason || "");
      toast.success(
        willLock
          ? t("lockSuccessToast", { name: lockStaffTarget.fullName })
          : t("unlockSuccessToast", { name: lockStaffTarget.fullName })
      );
      setLockStaffTarget(null);
      await loadStaffData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("SELF_ACTION")) {
        toast.error(t("cannotSelfLock"));
      } else if (msg.includes("LAST_ADMIN")) {
        toast.error(t("cannotLockLastAdmin"));
      } else {
        toast.error(t("updateError"));
      }
    } finally {
      setIsLockSubmitting(false);
    }
  };

  // 403 Forbidden check for non-Admin staff
  if (!isSessionLoading && session && session.staffRole !== "ADMIN") {
    return (
      <AdminShell
        activeItem="staff"
        adminName={session.fullName}
        adminRole={session.staffRole}
      >
        <AdminForbidden />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      activeItem="staff"
      title={t("title")}
      description={t("description")}
      adminName={session?.fullName}
      adminRole={session?.staffRole}
      actionButton={
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsDrawerOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-[var(--color-gray-900)] hover:bg-black text-white"
        >
          {t("createStaffBtn")}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:bg-[var(--color-bg-surface)] focus:border-[var(--color-border-strong)] transition-all placeholder:text-[var(--color-text-secondary)]"
            />
          </div>

          <Select
            id="filter-role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as StaffRole | "ALL");
              setPage(1);
            }}
            options={[
              { value: "ALL", label: t("allRoles") },
              { value: "ADMIN", label: t("roleAdmin") },
              { value: "SUPPORT", label: t("roleSupport") },
              { value: "ACCOUNTANT", label: t("roleAccountant") },
            ]}
          />

          <Select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StaffStatus | "ALL");
              setPage(1);
            }}
            options={[
              { value: "ALL", label: t("allStatuses") },
              { value: "ACTIVE", label: t("statusActive") },
              { value: "INVITED", label: t("statusInvited") },
              { value: "LOCKED", label: t("statusLocked") },
            ]}
          />
        </div>

        {/* Staff Table */}
        <StaffTable
          staffList={staffList}
          currentSession={session}
          onOpenRoleDialog={(staff) => setRoleStaffTarget(staff)}
          onOpenLockDialog={(staff) => setLockStaffTarget(staff)}
          onOpenActivityModal={(staff) => setActivityStaffTarget(staff)}
          isLoading={isLoading}
        />

        {/* Pagination bar */}
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pt-2">
          <span>
            {t("totalPersonnelCount", { count: totalCount })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("prevPage")}
            </Button>
            <span className="font-semibold text-[var(--color-gray-900)]">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("nextPage")}
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer Create Staff */}
      <StaffDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateStaff}
        isLoading={isDrawerSubmitting}
      />

      {/* Role Dialog */}
      <StaffRoleDialog
        isOpen={Boolean(roleStaffTarget)}
        onClose={() => setRoleStaffTarget(null)}
        staff={roleStaffTarget}
        onSubmit={handleUpdateRole}
        isLoading={isRoleSubmitting}
      />

      {/* Lock/Unlock Confirm Dialog with mandatory reason */}
      <ConfirmDialog
        isOpen={Boolean(lockStaffTarget)}
        onClose={() => setLockStaffTarget(null)}
        onConfirm={handleToggleLock}
        title={
          lockStaffTarget?.status === "LOCKED"
            ? t("unlockConfirmTitle", { name: lockStaffTarget?.fullName ?? "" })
            : t("lockConfirmTitle", { name: lockStaffTarget?.fullName ?? "" })
        }
        description={
          lockStaffTarget?.status === "LOCKED"
            ? t("unlockConfirmDesc")
            : t("lockConfirmDesc")
        }
        confirmLabel={
          lockStaffTarget?.status === "LOCKED"
            ? t("unlockConfirmBtn")
            : t("lockConfirmBtn")
        }
        cancelLabel={t("cancel")}
        isDanger={lockStaffTarget?.status !== "LOCKED"}
        isLoading={isLockSubmitting}
        requireReason={true}
        reasonLabel={t("reasonLabel")}
        reasonPlaceholder={t("lockReasonPlaceholder")}
        minReasonLength={10}
      />

      {/* Activity Logs Modal */}
      <StaffActivityModal
        isOpen={Boolean(activityStaffTarget)}
        onClose={() => setActivityStaffTarget(null)}
        staff={activityStaffTarget}
      />
    </AdminShell>
  );
}
