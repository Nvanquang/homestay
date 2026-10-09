"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PublicShell } from "@/components/layouts";
import { Button, Badge } from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import { getHostVerification } from "@/features/verification";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type HostOnboardingStatus =
  | "ANONYMOUS"
  | "EMAIL_UNVERIFIED"
  | "ELIGIBLE"
  | "PENDING"
  | "REJECTED"
  | "APPROVED";

export default function BecomeHostPage() {
  const t = useTranslations("becomeHost");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const [status, setStatus] = useState<HostOnboardingStatus>("ELIGIBLE");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkHostStatus() {
      try {
        const record = await getHostVerification();
        if (mounted) {
          if (record.status === "APPROVED") {
            setStatus("APPROVED");
          } else if (record.status === "PENDING") {
            setStatus("PENDING");
          } else if (record.status === "REJECTED") {
            setStatus("REJECTED");
          } else {
            setStatus("ELIGIBLE");
          }
        }
      } catch {
        if (mounted) setStatus("ANONYMOUS");
      }
    }
    checkHostStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCtaClick = () => {
    if (status === "ANONYMOUS") {
      router.push(`/${locale}/register?returnTo=/become-host?start=1`);
    } else if (status === "APPROVED") {
      router.push(`/${locale}/host/listings`);
    } else {
      router.push(`/${locale}/account/verification`);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: t("benefit1Title"),
      desc: t("benefit1Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("benefit2Title"),
      desc: t("benefit2Desc"),
    },
    {
      icon: Users,
      title: t("benefit3Title"),
      desc: t("benefit3Desc"),
    },
  ];

  const steps = [
    {
      step: "01",
      title: t("step1Title"),
      desc: t("step1Desc"),
    },
    {
      step: "02",
      title: t("step2Title"),
      desc: t("step2Desc"),
    },
    {
      step: "03",
      title: t("step3Title"),
      desc: t("step3Desc"),
    },
    {
      step: "04",
      title: t("step4Title"),
      desc: t("step4Desc"),
    },
  ];

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  const getCtaLabel = () => {
    switch (status) {
      case "ANONYMOUS":
        return t("ctaRegisterToStart");
      case "PENDING":
      case "REJECTED":
        return t("ctaContinueVerification");
      case "APPROVED":
        return t("ctaGoToListings");
      default:
        return t("ctaStartNow");
    }
  };

  return (
    <PublicShell>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 1. Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>{t("heroBadge")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-gray-900)] leading-tight">
              {t("heroTitle")}
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
              {t("heroSubtitle")}
            </p>

            {status === "EMAIL_UNVERIFIED" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold">{t("unverifiedEmailTitle")}</p>
                  <p className="text-xs text-amber-800 mt-0.5">{t("unverifiedEmailDesc")}</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleCtaClick}
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto font-bold text-base px-8 py-4 shadow-lg"
              >
                {getCtaLabel()}
              </Button>

              <Link
                href={`/${locale}/help`}
                className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t("viewHelpCenter")}</span>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                alt="Homestay hosting lifestyle"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Trust Card */}
            <div className="absolute -bottom-6 -left-6 bg-[var(--color-bg-surface)] p-4 rounded-2xl shadow-xl border border-[var(--color-border-default)] hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-gray-900)]">
                  {t("trustCardTitle")}
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {t("trustCardDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Benefits Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-gray-900)]">
              {t("benefitsHeading")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t("benefitsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-gray-900)]">
                    {b.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. How it Works (4 Steps) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-gray-900)]">
              {t("howItWorksHeading")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t("howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] space-y-3"
              >
                <span className="text-2xl font-black text-[var(--color-brand-600)]">
                  {s.step}
                </span>
                <h4 className="text-base font-bold text-[var(--color-gray-900)]">
                  {s.title}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Preparation Checklist */}
        <section className="bg-[var(--color-gray-900)] text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <Badge variant="neutral" className="bg-white/10 text-white">
              {t("preparationBadge")}
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold">
              {t("preparationHeading")}
            </h3>
            <p className="text-sm text-gray-300">
              {t("preparationSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">{t("prepDoc1Title")}</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t("prepDoc1Desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">{t("prepDoc2Title")}</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t("prepDoc2Desc")}
              </p>
            </div>
          </div>
        </section>

        {/* 5. FAQ Section */}
        <section className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-gray-900)]">
              {t("faqHeading")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t("faqSubtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[var(--color-border-default)] rounded-xl overflow-hidden bg-[var(--color-bg-surface)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[var(--color-gray-900)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform duration-200 ${
                      openFaqIndex === idx ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border-subtle)]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
