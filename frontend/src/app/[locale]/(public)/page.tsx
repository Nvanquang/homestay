import React, { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { PublicShell } from "@/components/layouts/public-shell";
import {
  SearchBar,
  PopularDestinations,
  FeaturedListings,
  HostBanner,
  HowItWorks,
  getPopularDestinations,
  getFeaturedListings,
} from "@/features/search";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [destinations, featured] = await Promise.all([
    getPopularDestinations(),
    getFeaturedListings(),
  ]);

  return (
    <PublicShell activeBottomTab="explore">
      {/* Hero Section */}
      <section className="relative z-20 pt-12 pb-20 sm:pt-20 sm:pb-32 bg-gradient-to-b from-primary/5 via-rose-50/20 to-transparent dark:from-primary/10 dark:via-gray-900 dark:to-transparent">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {t("heroBadge")}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--color-text-primary)] tracking-tight leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] font-normal max-w-2xl mx-auto">
              {t("heroSubtitle")}
            </p>
          </div>

          {/* SearchBar Center Pill */}
          <div className="max-w-4xl mx-auto relative z-30">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <PopularDestinations destinations={destinations} />
        <FeaturedListings listings={featured} />
        <HostBanner />
        <HowItWorks />
      </main>
    </PublicShell>
  );
}
