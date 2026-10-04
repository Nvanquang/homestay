"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";
import { Button, TextField } from "@/components/ui";
import { mockVerifyEmail, mockResendVerification, VerifyEmailStatus } from "@/features/auth";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"LOADING" | VerifyEmailStatus>("LOADING");
  const [countdown, setCountdown] = useState<number>(5);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const [resendEmailInput, setResendEmailInput] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    async function executeVerification() {
      if (!token) {
        setStatus("INVALID");
        return;
      }
      try {
        const result = await mockVerifyEmail(token);
        setStatus(result);
      } catch {
        setStatus("INVALID");
      }
    }

    executeVerification();
  }, [token]);

  // Đếm ngược 5 giây tự động chuyển sang trang đăng nhập nếu VERIFIED
  useEffect(() => {
    if (status !== "VERIFIED" || isCancelled) return;

    if (countdown <= 0) {
      router.push(`/${locale}/login?verified=1`);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, isCancelled, countdown, locale, router]);

  // Đếm ngược gửi lại email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmailInput || resendCooldown > 0) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      const res = await mockResendVerification(resendEmailInput);
      setResendCooldown(res.resendAvailableIn);
      setResendMessage(t("checkEmailTitle"));
    } catch {
      setResendMessage("Có lỗi xảy ra khi gửi lại email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
      {status === "LOADING" && (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Đang xác minh email...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vui lòng chờ trong giây lát trong khi chúng tôi kích hoạt tài khoản của bạn.
          </p>
        </div>
      )}

      {status === "VERIFIED" && (
        <div className="py-6 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("verifySuccessTitle")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("verifySuccessDesc")}
          </p>

          {!isCancelled && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("autoRedirectNotice", { seconds: countdown })}{" "}
              <button
                type="button"
                onClick={() => setIsCancelled(true)}
                className="text-brand-600 hover:text-brand-700 font-semibold underline ml-1 cursor-pointer"
              >
                {t("cancelRedirect")}
              </button>
            </p>
          )}

          <div className="w-full pt-4">
            <Link href={`/${locale}/login?verified=1`} className="w-full block">
              <Button variant="primary" className="w-full">
                {t("loginButton")}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === "EXPIRED" && (
        <div className="py-6 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("verifyExpiredTitle")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("verifyExpiredDesc")}
          </p>

          <form onSubmit={handleResend} className="w-full space-y-3 pt-2 text-left">
            <TextField
              id="resend-email"
              label={t("emailLabel")}
              type="email"
              placeholder="name@example.com"
              value={resendEmailInput}
              onChange={(e) => setResendEmailInput(e.target.value)}
              required
            />
            {resendMessage && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {resendMessage}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isResending}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? t("resendCountdown", { seconds: resendCooldown })
                : t("resendEmail")}
            </Button>
          </form>

          <Link
            href={`/${locale}/login`}
            className="text-xs text-brand-600 hover:underline pt-2 inline-block"
          >
            {t("backToLogin")}
          </Link>
        </div>
      )}

      {status === "USED" && (
        <div className="py-6 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("verifyUsedTitle")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("verifyUsedDesc")}
          </p>
          <div className="w-full pt-4">
            <Link href={`/${locale}/login`} className="w-full block">
              <Button variant="primary" className="w-full">
                {t("loginButton")}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === "INVALID" && (
        <div className="py-6 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("verifyInvalidTitle")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("verifyInvalidDesc")}
          </p>
          <div className="w-full pt-4 space-y-2">
            <Link href={`/${locale}/register`} className="w-full block">
              <Button variant="primary" className="w-full">
                {t("registerButton")}
              </Button>
            </Link>
            <Link href={`/${locale}/login`} className="w-full block">
              <Button variant="secondary" className="w-full">
                {t("backToLogin")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-12 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
