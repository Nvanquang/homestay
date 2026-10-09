"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Edit,
  RotateCcw,
  ExternalLink,
  Loader2,
  Building,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import {
  ListingReviewStatusDetail,
  getListingReviewStatus,
  withdrawListingSubmission,
} from "@/features/listing-editor";
import { toast } from "sonner";

export default function ListingStatusPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const isEn = locale === "en";
  const router = useRouter();
  const t = useTranslations("listingStatus");
  const tCommon = useTranslations("common");

  const [reviewData, setReviewData] = useState<ListingReviewStatusDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await getListingReviewStatus(id);
      setReviewData(data);
    } catch (err: any) {
      toast.error(err.message || (isEn ? "Failed to load status" : "Không thể tải thông tin trạng thái"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [id]);

  const handleWithdraw = async () => {
    if (!confirm(t("withdrawConfirm"))) {
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawListingSubmission(id);
      toast.success(isEn ? "Submission withdrawn to draft" : "Đã rút lại yêu cầu thành công");
      router.push(`/${locale}/host/listings/${id}/edit/1`);
    } catch (err: any) {
      toast.error(err.message || (isEn ? "Failed to withdraw submission" : "Không thể rút lại yêu cầu"));
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center text-[var(--color-text-secondary)]">
        <div className="flex flex-col items-center gap-3 text-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <span>{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-page)] p-8 text-center space-y-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {isEn ? "Listing review details not found" : "Không tìm thấy thông tin xét duyệt chỗ nghỉ"}
        </p>
        <Link
          href={`/${locale}/host/listings`}
          className="text-xs text-[var(--color-primary)] hover:underline"
        >
          {t("backToListings")}
        </Link>
      </div>
    );
  }

  const { status, title, coverPhotoUrl, submittedAt, currentReview, revisions, lockReason } = reviewData;

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] shadow-2xs">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/${locale}/host/listings`}
              className="p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] transition-colors cursor-pointer shrink-0"
              title={tCommon("cancel")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] truncate">
                {title}
              </h1>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">
                ID: {id} · {t("title")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <LocaleSwitcher />
            <Link
              href={`/${locale}/host/listings`}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            >
              {t("exit")}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* STATUS BANNER (CMP-10) */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-start gap-4">
              {coverPhotoUrl ? (
                <img
                  src={coverPhotoUrl}
                  alt={title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-text-tertiary)] shrink-0">
                  <Building className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold tracking-wider">
                    {t("currentStatus")}
                  </span>
                  {/* Status Badges */}
                  {status === "PENDING_REVIEW" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t("pendingReview")}</span>
                    </span>
                  )}
                  {status === "NEEDS_CHANGES" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{t("needsChanges")}</span>
                    </span>
                  )}
                  {(status === "PUBLISHED" || status === "ACTIVE") && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t("published")}</span>
                    </span>
                  )}
                  {status === "REJECTED" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t("rejected")}</span>
                    </span>
                  )}
                  {status === "LOCKED" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t("locked")}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                  {title}
                </h2>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  {submittedAt
                    ? isEn
                      ? `Submitted on: ${new Date(submittedAt).toLocaleString("en-US")}`
                      : `Thời điểm gửi: ${new Date(submittedAt).toLocaleString("vi-VN")}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Top Action Buttons based on status */}
            <div className="flex items-center gap-2.5 shrink-0">
              {status === "PENDING_REVIEW" && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isWithdrawing}
                  onClick={handleWithdraw}
                  className="text-xs px-3.5 py-2 font-semibold flex items-center gap-1.5 cursor-pointer text-amber-700 dark:text-amber-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("withdrawBtn")}</span>
                </Button>
              )}

              {(status === "NEEDS_CHANGES" || status === "REJECTED") && (
                <Link
                  href={`/${locale}/host/listings/${id}/edit/${
                    currentReview?.reasons?.[0]?.stepNumber || 1
                  }`}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" />
                  <span>{t("resubmitBtn")}</span>
                </Link>
              )}

              {(status === "PUBLISHED" || status === "ACTIVE") && (
                <>
                  <Link
                    href={`/rooms/${id}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t("viewPublicBtn")}</span>
                  </Link>
                  <Link
                    href={`/${locale}/host/listings`}
                    className="px-3.5 py-2 rounded-xl border border-[var(--color-border-subtle)] text-xs font-semibold hover:bg-[var(--color-bg-subtle)]"
                  >
                    {isEn ? "Manage Calendar" : "Quản lý lịch"}
                  </Link>
                </>
              )}

              {status === "LOCKED" && (
                <button
                  type="button"
                  onClick={() => toast.info(isEn ? "Contacting support..." : "Đang kết nối tới tổng đài hỗ trợ CSKH...")}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-bold"
                >
                  {isEn ? "Contact Support" : "Liên hệ hỗ trợ"}
                </button>
              )}
            </div>
          </div>

          {/* THREE-STAGE REVIEW TIMELINE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              {isEn ? "Review Progress Timeline" : "Tiến trình thẩm định"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1: Submitted */}
              <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t("timelineSubmitted")}</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {submittedAt
                    ? new Date(submittedAt).toLocaleDateString(locale)
                    : (isEn ? "Done" : "Hoàn tất")}
                </p>
              </div>

              {/* Step 2: Under Review */}
              <div
                className={`p-4 rounded-xl border space-y-1 ${
                  status === "PENDING_REVIEW"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]/40 ring-1 ring-[var(--color-primary)]"
                    : status === "PUBLISHED" || status === "ACTIVE" || status === "NEEDS_CHANGES" || status === "REJECTED"
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{t("timelineReviewing")}</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {isEn ? "Compliance & quality check" : "Thẩm định tiêu chuẩn chất lượng"}
                </p>
              </div>

              {/* Step 3: Result */}
              <div
                className={`p-4 rounded-xl border space-y-1 ${
                  status === "PUBLISHED" || status === "ACTIVE"
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : status === "NEEDS_CHANGES"
                    ? "border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20"
                    : status === "REJECTED"
                    ? "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {status === "PUBLISHED" || status === "ACTIVE" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : status === "NEEDS_CHANGES" ? (
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  ) : status === "REJECTED" ? (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  )}
                  <span>{t("timelineDecision")}</span>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {status === "PUBLISHED"
                    ? t("published")
                    : status === "NEEDS_CHANGES"
                    ? t("needsChanges")
                    : status === "REJECTED"
                    ? t("rejected")
                    : isEn ? "Pending" : "Đang chờ"}
                </p>
              </div>
            </div>
          </div>

          {/* ADMIN FEEDBACK BLOCK (WHEN NEEDS_CHANGES OR REJECTED) */}
          {currentReview?.reasons && currentReview.reasons.length > 0 && (
            <div className="p-5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-900 dark:text-orange-200 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span>
                    {t("adminFeedbackTitle")}
                  </span>
                </div>
                <span className="text-[11px] text-orange-700 dark:text-orange-300">
                  {isEn ? "(Admin identity hidden for privacy)" : "(Danh tính Admin được ẩn để bảo mật)"}
                </span>
              </div>

              <div className="space-y-2.5">
                {currentReview.reasons.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[var(--color-bg-surface)] border border-orange-200 dark:border-orange-900/40 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-primary)] uppercase text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-primary-subtle)]">
                          {r.section}
                        </span>
                        <span className="font-bold text-[var(--color-text-primary)]">
                          {isEn ? `Step ${r.stepNumber}` : `Bước ${r.stepNumber}`}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">
                        {r.note}
                      </p>
                    </div>

                    <Link
                      href={`/${locale}/host/listings/${id}/edit/${r.stepNumber}`}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white font-semibold text-xs shrink-0 hover:opacity-90 transition-opacity"
                    >
                      {isEn ? `Fix in Step ${r.stepNumber} →` : `Sửa tại Bước ${r.stepNumber} →`}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOCKED REASON BLOCK */}
          {status === "LOCKED" && lockReason && (
            <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>{isEn ? "Account / Listing Locked Notice" : "Lý do phòng bị khoá"}</span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {lockReason}
              </p>
            </div>
          )}
        </div>

        {/* SUBMISSION REVISION HISTORY */}
        {revisions && revisions.length > 0 && (
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{t("revisionsTitle")}</span>
            </h3>

            <div className="space-y-3">
              {revisions.map((rev) => (
                <div
                  key={rev.no}
                  className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/40 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {isEn ? `Submission #${rev.no}` : `Lần gửi #${rev.no}`}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">
                      {new Date(rev.submittedAt).toLocaleString(locale)}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        rev.result === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : rev.result === "NEEDS_CHANGES"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                          : rev.result === "REJECTED"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {rev.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
