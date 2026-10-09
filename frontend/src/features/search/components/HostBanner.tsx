"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Sparkles, ArrowRight, Home } from "lucide-react";

export function HostBanner() {
  const t = useTranslations("home.hostBanner");
  const locale = useLocale();

  return (
    <section className="my-12 sm:my-16 rounded-3xl overflow-hidden relative bg-gradient-to-r from-gray-900 via-gray-850 to-primary text-white p-8 sm:p-14 shadow-2xl">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80"
          alt="Host Homestay"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-xl space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          {t("badge")}
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          {t("title")}
        </h2>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          {t("description")}
        </p>

        <div className="pt-2">
          <Link
            href={`/${locale}/become-host`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-gray-900 hover:bg-gray-100 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <span>{t("ctaBtn")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const t = useTranslations("home.howItWorks");

  const steps = [
    {
      num: "01",
      titleKey: "step1Title",
      descKey: "step1Desc",
      icon: "🔍",
    },
    {
      num: "02",
      titleKey: "step2Title",
      descKey: "step2Desc",
      icon: "⚡",
    },
    {
      num: "03",
      titleKey: "step3Title",
      descKey: "step3Desc",
      icon: "🏡",
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-t border-[var(--color-border-subtle)]">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">
          {t("eyebrow")}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mt-1 tracking-tight">
          {t("title")}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((s) => (
          <div
            key={s.num}
            className="p-6 rounded-3xl bg-gray-50/70 dark:bg-gray-800/60 border border-[var(--color-border-subtle)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{s.icon}</span>
              <span className="text-2xl font-black text-gray-300 dark:text-gray-600 font-mono">
                {s.num}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
                {t(s.titleKey as any)}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {t(s.descKey as any)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
