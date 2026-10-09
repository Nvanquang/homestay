"use client";

import React, { useState } from "react";
import { Dialog, TextField, Select, Button } from "@/components/ui";
import { CreateStaffFormValues, createStaffSchema } from "../schemas";
import { StaffRole } from "../types";
import { useTranslations } from "next-intl";

export interface StaffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function StaffDrawer({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: StaffDrawerProps) {
  const t = useTranslations("admin.staff");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("SUPPORT");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    if (isLoading) return;
    setFullName("");
    setEmail("");
    setStaffRole("SUPPORT");
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createStaffSchema.safeParse({
      fullName,
      email,
      staffRole,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(result.data);
    handleClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={t("createModalTitle")}
      description={t("createModalDesc")}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <TextField
          id="staff-fullName"
          label={t("nameColumn")}
          placeholder={t("namePlaceholder")}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) {
              setErrors((prev) => ({ ...prev, fullName: "" }));
            }
          }}
          errorMessage={errors.fullName}
          disabled={isLoading}
        />

        <TextField
          id="staff-email"
          type="email"
          label={t("emailColumn")}
          placeholder="staff@homestay.local"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
          errorMessage={errors.email}
          disabled={isLoading}
        />

        <Select
          id="staff-role"
          label={t("roleColumn")}
          value={staffRole}
          onChange={(e) => setStaffRole(e.target.value as StaffRole)}
          options={[
            { value: "SUPPORT", label: t("roleSupport") },
            { value: "ACCOUNTANT", label: t("roleAccountant") },
            { value: "ADMIN", label: t("roleAdmin") },
          ]}
          disabled={isLoading}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
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
            {t("createAndInviteBtn")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
