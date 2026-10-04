"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordField, toast } from "@/components/ui";
import { resetPasswordSchema, ResetPasswordInput } from "@/features/auth/schemas";
import { mockResetPassword } from "@/features/auth/api/mock-auth";
import { AlertCircle, KeyRound } from "lucide-react";

function ResetPasswordContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Validate token initially
  useEffect(() => {
    if (!token) {
      setTokenError("Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã xác thực.");
    } else if (token === "expired" || token === "invalid") {
      setTokenError("Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng.");
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: ResetPasswordInput) => {
    setFormError(null);
    try {
      await mockResetPassword(token, data.password);
      toast.success(t("resetSuccessNotice"));
      router.push("/login?reset=1");
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Không thể đặt lại mật khẩu vào lúc này."
      );
    }
  };

  if (tokenError) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-2)] text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-error-bg)] text-[var(--color-error-fg)] flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--color-gray-900)]">
            Liên kết không hợp lệ
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
            {tokenError}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link href="/forgot-password" className="flex-1">
            <Button variant="primary" className="w-full">
              Yêu cầu liên kết mới
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button variant="secondary" className="w-full">
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-2)]">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-gray-900)]">
          {t("resetTitle")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("resetSubtitle")}
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-3.5 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error-fg)] flex items-start gap-2.5 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordField
          label={t("newPasswordLabel")}
          showCriteria={true}
          value={passwordValue}
          errorMessage={errors.password?.message}
          {...register("password")}
        />

        <PasswordField
          label={t("confirmPasswordLabel")}
          errorMessage={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {t("resetButton")}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Đang tải...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
