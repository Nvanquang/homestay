"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { ListingCardDTO } from "../types";
import { ListingCard } from "./ListingCard";

interface FeaturedListingsProps {
  listings: ListingCardDTO[];
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  const t = useTranslations("home.featured");
  const locale = useLocale();

  if (!listings || listings.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mt-1 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {t("subtitle")}
          </p>
        </div>

        <Link
          href={`/${locale}/search`}
          className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1 transition-colors"
        >
          <span>{t("viewAll")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((item) => (
          <ListingCard key={item.id} listing={item} />
        ))}
      </div>
    </section>
  );
}
