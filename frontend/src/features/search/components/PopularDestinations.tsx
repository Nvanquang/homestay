"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { PopularDestination } from "../types";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/features/currency";

interface PopularDestinationsProps {
  destinations: PopularDestination[];
}

export function PopularDestinations({ destinations }: PopularDestinationsProps) {
  const t = useTranslations("home.popular");
  const locale = useLocale();
  const { convert, currency } = useCurrency();

  if (!destinations || destinations.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-primary tracking-widest uppercase">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mt-1 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {destinations.map((dest) => (
          <Link
            key={dest.id}
            href={`/${locale}/search?destination=${encodeURIComponent(dest.name.split(",")[0])}`}
            className="group relative rounded-3xl overflow-hidden aspect-4/5 bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <img
              src={dest.imageUrl}
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-medium text-white/80 block">
                {t("listingCount", { count: dest.listingCount })}
              </span>
              <h3 className="text-base sm:text-lg font-bold truncate mt-0.5">
                {dest.name}
              </h3>
              <span className="inline-block mt-2 text-[11px] font-semibold text-white/90 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
                {t("fromPrice", {
                  price:
                    currency === "VND"
                      ? formatMoney(dest.startingPrice, "VND", locale)
                      : convert(dest.startingPrice).formatted,
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
