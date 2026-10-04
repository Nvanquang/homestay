"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, PasswordField, toast } from "@/components/ui";
import { registerSchema, RegisterInput } from "@/features/auth/schemas";
import { mockRegister, mockResendVerification } from "@/features/auth/api/mock-auth";
import { Mail, AlertCircle } from "lucide-react";
import { AppApiError } from "@/lib/errors";

export default function RegisterPage() {
  const t = useTranslations("auth");

  const [formError, setFormError] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<{
    maskedEmail: string;
    rawEmail: string;
  } | null>(null);

  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      acceptTerms: true,
    },
  });

  const passwordValue = watch("password");

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successState && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [successState, resendCooldown]);

  const onSubmit = async (data: RegisterInput) => {
    setFormError(null);
    try {
      const res = await mockRegister(data);
      setSuccessState({
        maskedEmail: res.emailMasked,
        rawEmail: data.email,
      });
      setResendCooldown(res.resendAvailableIn);
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
    } catch (err: unknown) {
      if (err instanceof AppApiError && err.fieldErrors?.email) {
        setFormError(err.fieldErrors.email);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Không thể tạo tài khoản vào lúc này.");
      }
    }
  };

  const handleResend = async () => {
    if (!successState?.rawEmail || resendCooldown > 0) return;
    setIsResending(true);
    try {
      await mockResendVerification(successState.rawEmail);
      setResendCooldown(60);
      toast.success("Đã gửi lại email xác minh!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gửi lại email thất bại.");
    } finally {
      setIsResending(false);
    }
  };

  // State: "Kiểm tra hộp thư của bạn"
  if (successState) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-2)] text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center">
          <Mail className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-gray-900)]">
            {t("checkEmailTitle")}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {t("checkEmailDesc")}{" "}
            <strong className="text-[var(--color-gray-900)]">{successState.maskedEmail}</strong>.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={resendCooldown > 0}
            isLoading={isResending}
            onClick={handleResend}
          >
            {resendCooldown > 0
              ? t("resendCountdown", { seconds: resendCooldown })
              : t("resendEmail")}
          </Button>
        </div>

        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-col gap-2 text-xs text-[var(--color-text-secondary)]">
          <button
            type="button"
            onClick={() => setSuccessState(null)}
            className="font-medium text-[var(--color-text-link)] hover:underline"
          >
            {t("wrongEmail")}
          </button>
          <Link href="/login" className="font-semibold text-[var(--color-gray-900)] hover:underline">
            {t("haveAccountPrompt")} {t("loginButton")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-2)]">
      {/* Header Form */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-gray-900)]">
          {t("registerTitle")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("registerSubtitle")}
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-3.5 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error-fg)] flex items-start gap-2.5 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{formError}</span>
            <div className="mt-1">
              <Link href="/login" className="font-bold underline">
                Đăng nhập ngay
              </Link>{" "}
              hoặc{" "}
              <Link href="/forgot-password" className="font-bold underline">
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          label={t("fullNameLabel")}
          placeholder={t("fullNamePlaceholder")}
          errorMessage={errors.fullName?.message}
          {...register("fullName")}
        />

        <TextField
          label={t("emailLabel")}
          type="email"
          placeholder={t("emailPlaceholder")}
          errorMessage={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          label={t("passwordLabel")}
          showCriteria={true}
          value={passwordValue}
          errorMessage={errors.password?.message}
          {...register("password")}
        />

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--color-text-secondary)] select-none">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-[var(--color-border-input)] text-[var(--color-gray-900)] focus:ring-[var(--color-gray-900)]"
              {...register("acceptTerms")}
            />
            <span>
              {t("acceptTermsPrefix")}{" "}
              <Link href="/terms" target="_blank" className="font-semibold underline text-[var(--color-text-primary)]">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy" target="_blank" className="font-semibold underline text-[var(--color-text-primary)]">
                {t("privacyPolicy")}
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-xs text-[var(--color-text-error)] font-medium">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {t("registerButton")}
        </Button>
      </form>

      {/* Footer Switch to Login */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)] text-center text-sm text-[var(--color-text-secondary)]">
        <span>{t("haveAccountPrompt")} </span>
        <Link
          href="/login"
          className="font-semibold text-[var(--color-gray-900)] underline hover:text-[var(--color-text-brand)]"
        >
          {t("loginButton")}
        </Link>
      </div>
    </div>
  );
}
