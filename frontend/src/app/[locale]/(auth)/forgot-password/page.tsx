"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, toast } from "@/components/ui";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/features/auth/schemas";
import { mockForgotPassword } from "@/features/auth/api/mock-auth";
import { MailCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await mockForgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Đã gửi yêu cầu đặt lại mật khẩu.");
    } catch {
      // Always neutral response for security
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-2)] text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-fg)] flex items-center justify-center">
          <MailCheck className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-gray-900)]">
            Kiểm tra email của bạn
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {t("forgotSuccessDesc")}
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-sm text-[var(--color-gray-900)] hover:text-[var(--color-brand-600)]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-2)]">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-gray-900)]">
          {t("forgotTitle")}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("forgotDesc")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          label={t("emailLabel")}
          type="email"
          placeholder={t("emailPlaceholder")}
          errorMessage={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          {t("sendResetLink")}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)] text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gray-900)]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
