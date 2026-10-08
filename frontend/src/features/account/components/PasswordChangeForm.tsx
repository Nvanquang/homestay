"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordField, Button } from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import { changePasswordSchema, ChangePasswordInput } from "../schemas";
import { changePassword } from "../api/mock-account";
import { AppApiError } from "@/lib/errors";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function PasswordChangeForm() {
  const t = useTranslations("account.settings");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setSuccessBanner(null);

    try {
      await changePassword(data);
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessBanner(t("passwordChangedBanner"));
      toast.success(t("passwordSuccessToast"));
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.code === "WRONG_CURRENT" || err.status === 422)) {
        setError("currentPassword", {
          type: "manual",
          message:
            err.fieldErrors.currentPassword ||
            err.message ||
            t("wrongCurrentPassword"),
        });
      } else {
        const msg = err instanceof Error ? err.message : t("wrongCurrentPassword");
        toast.error(msg);
      }
    }
  };

  return (
    <div className="space-y-5">
      {successBanner && (
        <div
          role="status"
          className="p-4 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success-fg)] flex items-start gap-3 text-sm font-medium animate-in fade-in duration-200"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordField
          id="account-current-password"
          label={t("currentPasswordLabel")}
          placeholder={t("currentPasswordPlaceholder")}
          autoComplete="current-password"
          errorMessage={errors.currentPassword?.message}
          {...register("currentPassword")}
        />

        <PasswordField
          id="account-new-password"
          label={t("newPasswordLabel")}
          placeholder={t("newPasswordPlaceholder")}
          autoComplete="new-password"
          errorMessage={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordField
          id="account-confirm-password"
          label={t("confirmPasswordLabel")}
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          errorMessage={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            {t("changePasswordBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
}
