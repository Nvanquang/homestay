"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import {
  BasicInfoData,
  createDraftListing,
  basicInfoSchema,
} from "@/features/listing-editor";
import { Step1Basic } from "@/features/listing-editor/components/Step1Basic";
import { SaveIndicator } from "@/features/listing-editor/components/SaveIndicator";
import { toast } from "sonner";

export default function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const router = useRouter();
  const t = useTranslations("listingWizard");

  const [formData, setFormData] = useState<BasicInfoData>({
    propertyType: "ENTIRE_PLACE",
    title: "",
    description: "",
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    currency: "VND",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (partial: Partial<BasicInfoData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
    const keys = Object.keys(partial);
    if (keys.length > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const handleProceed = async () => {
    const parseRes = basicInfoSchema.safeParse(formData);
    if (!parseRes.success) {
      const fieldErrors: Record<string, string> = {};
      parseRes.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString() || "form";
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(locale === "vi" ? "Vui lòng hoàn thiện đúng các trường thông tin cơ bản" : "Please fill in all required basic information fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const newListing = await createDraftListing(parseRes.data);
      toast.success(locale === "vi" ? "Đã khởi tạo bản nháp thành công!" : "Draft created successfully!");
      router.push(`/${locale}/host/listings/${newListing.id}/edit/location`);
    } catch {
      toast.error(locale === "vi" ? "Không thể tạo bản nháp. Vui lòng thử lại." : "Unable to create draft. Please retry.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] shadow-2xs">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href={`/${locale}/host/listings`}
              className="p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] transition-colors cursor-pointer shrink-0"
              title={t("back")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] truncate">
                {t("newTitle")}
              </h1>
              <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                {t("stepCounter", { step: 1 })} · {t("step1Label")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SaveIndicator status="idle" />
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>
            <Link
              href={`/${locale}/host/listings`}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] shrink-0"
            >
              <span className="hidden sm:inline">{t("saveAndExit")}</span>
              <span className="sm:hidden">{locale === "vi" ? "Thoát" : "Exit"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Form: 8 cols */}
          <div className="lg:col-span-8 bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-5 sm:p-7 lg:p-9 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {t("step1Label")}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {t("step1Sub")}
              </p>
            </div>

            <Step1Basic
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
              disabled={isSubmitting}
            />

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <Link
                href={`/${locale}/host/listings`}
                className="text-xs font-semibold text-[var(--color-text-secondary)] hover:underline"
              >
                {t("cancel")}
              </Link>

              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={handleProceed}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold px-6 py-2.5 shadow-sm cursor-pointer"
              >
                <span>{isSubmitting ? t("saving") : t("continueToLocation")}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Tips Column: 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-[var(--color-primary)] font-semibold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Tips & Guidelines</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {locale === "vi"
                  ? "Tên chỗ nghỉ nên nêu bật điểm độc đáo nhất (ví dụ: view rừng thông, gần biển, có bồn tắm lộ thiên)."
                  : "Highlight your listing's best unique feature (e.g. pine forest view, steps to beach, open-air bath)."}
              </p>
              <ul className="text-xs text-[var(--color-text-secondary)] space-y-1.5 list-disc pl-4">
                <li>{locale === "vi" ? "Độ dài tên từ 10 đến 80 ký tự." : "Title length from 10 to 80 characters."}</li>
                <li>{locale === "vi" ? "Mô tả tối thiểu 50 ký tự." : "Description minimum 50 characters."}</li>
                <li>{locale === "vi" ? "Tiền tệ cố định sau lần duyệt đầu." : "Currency fixed after first review."}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
