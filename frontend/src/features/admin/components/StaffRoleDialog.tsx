"use client";

import React, { useState, useEffect } from "react";
import { Dialog, Select, TextArea, Button } from "@/components/ui";
import { StaffUser, StaffRole } from "../types";
import { updateStaffRoleSchema } from "../schemas";
import { useTranslations } from "next-intl";

export interface StaffRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffUser | null;
  onSubmit: (role: StaffRole, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function StaffRoleDialog({
  isOpen,
  onClose,
  staff,
  onSubmit,
  isLoading = false,
}: StaffRoleDialogProps) {
  const t = useTranslations("admin.staff");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("SUPPORT");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staff) {
      setSelectedRole(staff.staffRole);
      setReason("");
      setError(null);
    }
  }, [staff, isOpen]);

  if (!staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateStaffRoleSchema.safeParse({
      staffRole: selectedRole,
      reason,
    });

    if (!result.success) {
      const issue = result.error.issues[0];
      setError(issue ? issue.message : "Dữ liệu không hợp lệ");
      return;
    }

    setError(null);
    await onSubmit(selectedRole, reason.trim());
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("changeRoleTitle", { name: staff.fullName })}
      description={t("changeRoleDesc")}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Select
          id="change-role-select"
          label={t("newRoleLabel")}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
          options={[
            { value: "SUPPORT", label: t("roleSupport") },
            { value: "ACCOUNTANT", label: t("roleAccountant") },
            { value: "ADMIN", label: t("roleAdmin") },
          ]}
          disabled={isLoading}
        />

        <TextArea
          id="change-role-reason"
          label={t("reasonLabel")}
          placeholder={t("reasonPlaceholder")}
          value={reason}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setReason(e.target.value);
            if (error) setError(null);
          }}
          rows={3}
          errorMessage={error || undefined}
          helperText={
            !error
              ? t("reasonHelper")
              : undefined
          }
          disabled={isLoading}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border-subtle)]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            {t("saveRoleBtn")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
