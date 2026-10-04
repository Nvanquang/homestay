"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, PasswordField, toast } from "@/components/ui";
import { loginSchema, LoginInput } from "@/features/auth/schemas";
import { mockLogin, mockResendVerification } from "@/features/auth/api/mock-auth";
import { AppApiError } from "@/lib/errors";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

function LoginContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = searchParams.get("returnTo") || "/";
  const isVerifiedBanner = searchParams.get("verified") === "1";
  const isResetBanner = searchParams.get("reset") === "1";

  const [formError, setFormError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [lockedCountdown, setLockedCountdown] = useState<number | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setFormError(null);
    setUnverifiedEmail(null);

    try {
      const user = await mockLogin(data);
      toast.success(`Đăng nhập thành công! Xin chào ${user.fullName}`);

      // Safe returnTo navigation
      const safeTarget =
        returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
      router.push(safeTarget);
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        if (err.status === 423) {
          setFormError("Tài khoản đang bị tạm khoá do thử sai nhiều lần.");
          setLockedCountdown(15 * 60); // 15 mins mock
        } else if (err.status === 403) {
          setUnverifiedEmail(data.email);
          setFormError(t("unverifiedBanner"));
        } else {
          setFormError(err.message || "Email hoặc mật khẩu không chính xác.");
        }
      } else {
        setFormError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
      }
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    try {
      await mockResendVerification(unverifiedEmail);
      toast.success("Đã gửi lại email kích hoạt! Vui lòng kiểm tra hộp thư.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi lại email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-2)]">
      {/* Top Banners */}
      {isVerifiedBanner && (
        <div className="mb-6 p-3.5 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success-fg)] flex items-start gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t("emailVerifiedBanner")}</span>
        </div>
      )}

      {isResetBanner && (
        <div className="mb-6 p-3.5 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success-fg)] flex items-start gap-2.5 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t("resetSuccessNotice")}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {t("loginTitle")}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
          {t("loginSubtitle")}
        </p>
      </div>

      {/* Global Form Error Alert */}
      {formError && (
        <div className="mb-5 p-3.5 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error-fg)] text-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{formError}</span>
          </div>
          {unverifiedEmail && (
            <div className="pl-6">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={isResending}
                onClick={handleResendVerification}
                className="text-xs"
              >
                {t("resendEmail")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lock Notice */}
      {lockedCountdown && (
        <div className="mb-5 p-3.5 rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning-fg)] text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {t("accountLockedNotice", {
              time: `${Math.ceil(lockedCountdown / 60)} phút`,
            })}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          id="login-email"
          label={t("emailLabel")}
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          errorMessage={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          id="login-password"
          label={t("passwordLabel")}
          autoComplete="current-password"
          errorMessage={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--color-border-default)] text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)]"
              {...register("rememberMe")}
            />
            <span className="text-[var(--color-text-secondary)]">
              {t("rememberMe")}
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-[var(--color-text-brand)] hover:underline font-medium"
          >
            {t("forgotPasswordLink")}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          disabled={Boolean(lockedCountdown)}
          className="w-full mt-2"
        >
          {t("loginButton")}
        </Button>
      </form>

      {/* Footer Switch to Register */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)] text-center text-sm text-[var(--color-text-secondary)]">
        <span>{t("noAccountPrompt")} </span>
        <Link
          href="/register"
          className="font-semibold text-[var(--color-gray-900)] underline hover:text-[var(--color-text-brand)]"
        >
          {t("registerButton")}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}
