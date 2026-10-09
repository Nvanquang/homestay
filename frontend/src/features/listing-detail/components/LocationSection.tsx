"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MapPin, ShieldCheck, Lock } from "lucide-react";

interface LocationSectionProps {
  publicArea: {
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    label: string;
  };
}

export function LocationSection({ publicArea }: LocationSectionProps) {
  const t = useTranslations("listingDetail.location");

  return (
    <div className="py-6 border-b border-[var(--color-border-subtle)] space-y-3">
      <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
        {t("title")}
      </h3>

      <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-primary" />
        <span>{publicArea.label}</span>
      </p>

      {/* Obfuscated Map Container with Privacy Circle */}
      <div className="relative aspect-16/8 sm:aspect-2/1 w-full rounded-2xl overflow-hidden bg-[#E4E9EC] dark:bg-gray-800 border border-[var(--color-border-subtle)] flex items-center justify-center">
        {/* Vector decorative background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.2) 0%, transparent 70%),
              linear-gradient(#cbd5e1 1px, transparent 1px),
              linear-gradient(90deg, #cbd5e1 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 32px 32px, 32px 32px",
          }}
        />

        {/* Privacy Obfuscation Circle (500m area) */}
        <div className="relative z-10 w-36 h-36 rounded-full bg-primary/20 border-2 border-primary/60 flex items-center justify-center shadow-lg animate-pulse duration-3000">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        {/* Notice Badge */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto z-20 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs text-[11px] font-semibold text-[var(--color-text-secondary)] shadow-md flex items-center gap-1.5 border border-gray-200 dark:border-gray-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t("exactAddressNotice")}</span>
        </div>
      </div>
    </div>
  );
}
