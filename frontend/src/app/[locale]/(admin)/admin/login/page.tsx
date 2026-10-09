"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TextField, PasswordField, Button } from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import { adminLogin, AdminLoginFormValues, adminLoginSchema } from "@/features/admin";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = adminLoginSchema.safeParse({ email, password });
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
    setIsLoading(true);

    try {
      const session = await adminLogin(result.data);
      toast.success(t("loginSuccessToast", { name: session.fullName }));
      if (session.staffRole === "ADMIN") {
        router.push(`/${locale}/admin/staff`);
      } else {
        router.push(`/${locale}/admin`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("FORBIDDEN_ROLE")) {
        setAuthError(t("forbiddenRoleError"));
      } else if (msg.includes("ACCOUNT_LOCKED")) {
        setAuthError(t("accountLockedError"));
      } else {
        setAuthError(t("invalidCredentialsError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-canvas)] p-4 sm:p-6">
      <div className="w-full max-w-md bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-2)]">
        {/* Brand Console Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-gray-900)] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-[var(--shadow-1)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-gray-900)]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {t("subtitle")}
          </p>
        </div>

        {/* Global Error Banner */}
        {authError && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-[var(--color-error-fg)] flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="admin-email"
            type="email"
            label={t("emailLabel")}
            placeholder="admin@homestay.local"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            errorMessage={errors.email}
            disabled={isLoading}
            autoComplete="username"
          />

          <PasswordField
            id="admin-password"
            label={t("passwordLabel")}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            errorMessage={errors.password}
            disabled={isLoading}
            autoComplete="current-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full bg-[var(--color-gray-900)] hover:bg-black text-white"
              isLoading={isLoading}
            >
              {t("submitButton")}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)] text-center">
          <p className="text-xs text-[var(--color-text-secondary)]">
            {t("securityNotice")}
          </p>
        </div>
      </div>
    </div>
  );
}
