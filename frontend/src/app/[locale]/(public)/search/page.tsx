"use client";

import React, { useState, useEffect, useTransition, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/layouts/public-shell";
import {
  SearchBar,
  FilterBar,
  ListingCard,
  MapPanel,
  searchListings,
  SearchFilterState,
  SearchResultsResponse,
  SearchSortOption,
  CancellationPolicyType,
} from "@/features/search";
import {
  Map as MapIcon,
  List,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";

export default function SearchResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse state from URL
  const destination = searchParams.get("destination") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults = Number(searchParams.get("adults")) || 1;
  const childrenCount = Number(searchParams.get("children")) || 0;
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 15000000;
  const type = (searchParams.get("type") as any) || "ALL";
  const bedrooms = Number(searchParams.get("bedrooms")) || 0;
  const instant = searchParams.get("instant") === "true";
  const sort = (searchParams.get("sort") as SearchSortOption) || "RELEVANCE";
  const bbox = searchParams.get("bbox") || "";
  const amenitiesParam = searchParams.get("amenities");
  const amenities = amenitiesParam ? amenitiesParam.split(",").filter(Boolean) : [];
  const policyParam = searchParams.get("policy");
  const policy = policyParam ? (policyParam.split(",").filter(Boolean) as CancellationPolicyType[]) : [];

  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [autoSearchOnMove, setAutoSearchOnMove] = useState(false);

  const currentFilters: SearchFilterState = {
    destination,
    checkin,
    checkout,
    adults,
    children: childrenCount,
    minPrice,
    maxPrice,
    type,
    bedrooms,
    beds: 0,
    amenities,
    instant,
    policy,
    sort,
    bbox,
    page,
    limit: 24,
  };

  // Fetch search results whenever filters or page changes
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    searchListings({
      ...currentFilters,
      page,
    }).then((res) => {
      if (active) {
        setResults(res);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [
    destination,
    checkin,
    checkout,
    adults,
    childrenCount,
    minPrice,
    maxPrice,
    type,
    bedrooms,
    instant,
    sort,
    bbox,
    amenitiesParam,
    policyParam,
    page,
  ]);

  const updateUrlFilters = (updated: Partial<SearchFilterState>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (updated.destination !== undefined) {
      if (updated.destination) nextParams.set("destination", updated.destination);
      else nextParams.delete("destination");
    }
    if (updated.checkin !== undefined) {
      if (updated.checkin) nextParams.set("checkin", updated.checkin);
      else nextParams.delete("checkin");
    }
    if (updated.checkout !== undefined) {
      if (updated.checkout) nextParams.set("checkout", updated.checkout);
      else nextParams.delete("checkout");
    }
    if (updated.adults !== undefined) {
      if (updated.adults > 1) nextParams.set("adults", updated.adults.toString());
      else nextParams.delete("adults");
    }
    if (updated.children !== undefined) {
      if (updated.children > 0) nextParams.set("children", updated.children.toString());
      else nextParams.delete("children");
    }
    if (updated.minPrice !== undefined) {
      if (updated.minPrice > 0) nextParams.set("minPrice", updated.minPrice.toString());
      else nextParams.delete("minPrice");
    }
    if (updated.maxPrice !== undefined) {
      if (updated.maxPrice < 15000000 && updated.maxPrice > 0) nextParams.set("maxPrice", updated.maxPrice.toString());
      else nextParams.delete("maxPrice");
    }
    if (updated.type !== undefined) {
      if (updated.type !== "ALL") nextParams.set("type", updated.type);
      else nextParams.delete("type");
    }
    if (updated.bedrooms !== undefined) {
      if (updated.bedrooms > 0) nextParams.set("bedrooms", updated.bedrooms.toString());
      else nextParams.delete("bedrooms");
    }
    if (updated.instant !== undefined) {
      if (updated.instant) nextParams.set("instant", "true");
      else nextParams.delete("instant");
    }
    if (updated.sort !== undefined) {
      if (updated.sort !== "RELEVANCE") nextParams.set("sort", updated.sort);
      else nextParams.delete("sort");
    }
    if (updated.bbox !== undefined) {
      if (updated.bbox) nextParams.set("bbox", updated.bbox);
      else nextParams.delete("bbox");
    }
    if (updated.amenities !== undefined) {
      if (updated.amenities.length > 0) nextParams.set("amenities", updated.amenities.join(","));
      else nextParams.delete("amenities");
    }
    if (updated.policy !== undefined) {
      if (updated.policy.length > 0) nextParams.set("policy", updated.policy.join(","));
      else nextParams.delete("policy");
    }

    setPage(1); // Reset page on filter change
    startTransition(() => {
      router.replace(`/${locale}/search?${nextParams.toString()}`);
    });
  };

  const handleClearAllFilters = () => {
    startTransition(() => {
      router.replace(`/${locale}/search${destination ? `?destination=${encodeURIComponent(destination)}` : ""}`);
    });
  };

  const items = results?.items || [];
  const total = results?.total || 0;

  return (
    <PublicShell activeBottomTab="explore">
      <div className="bg-white dark:bg-gray-900 border-b border-[var(--color-border-subtle)] sticky top-20 z-30 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
          {/* Top Search Bar */}
          <SearchBar
            initialDestination={destination}
            initialCheckin={checkin}
            initialCheckout={checkout}
            initialAdults={adults}
            initialChildren={childrenCount}
            isCompact={true}
            onSearchSubmit={(vals) => updateUrlFilters(vals)}
          />

          {/* Quick Filter Bar */}
          <FilterBar
            filters={currentFilters}
            onFilterChange={updateUrlFilters}
            locale={locale}
          />
        </div>
      </div>

      {/* Main Split Screen Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Count Header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[var(--color-text-primary)]">
              {destination
                ? t("resultsForDestination", { count: total, destination })
                : t("allResultsCount", { count: total })}
            </h1>
            {checkin && checkout && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {checkin} → {checkout} · {adults + childrenCount} {t("guests")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Listings Grid (55% on desktop -> 7 cols) */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              mobileView === "map" ? "hidden lg:block" : "block"
            }`}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden space-y-3"
                  >
                    <div className="aspect-4/3 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div
                data-testid="search-empty-state"
                className="py-16 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-8 space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  {t("emptyTitle")}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                  {t("emptySubtitle")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold shadow-xs hover:opacity-90"
                  >
                    {t("clearAllFiltersBtn")}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUrlFilters({ checkin: "", checkout: "" })}
                    className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold text-[var(--color-text-primary)] hover:bg-gray-50"
                  >
                    {t("tryDifferentDates")}
                  </button>
                </div>
              </div>
            ) : (
              /* Listings Grid */
              <>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-opacity duration-200 ${
                    isPending ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {items.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      checkin={checkin}
                      checkout={checkout}
                      adults={adults}
                      childrenCount={childrenCount}
                      isHovered={hoveredListingId === listing.id}
                      onHover={setHoveredListingId}
                    />
                  ))}
                </div>

                {/* Pagination Load More */}
                {results?.hasMore && (
                  <div className="pt-8 text-center border-t border-[var(--color-border-subtle)] space-y-3">
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {t("viewingCount", { current: items.length, total })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPage((prev) => prev + 1)}
                      className="px-8 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-bold text-xs text-[var(--color-text-primary)] shadow-sm hover:shadow-md hover:border-gray-400 transition-all cursor-pointer"
                    >
                      {t("showMoreBtn")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Interactive Map (45% on desktop -> 5 cols, sticky) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-48 h-[calc(100vh-220px)] min-h-[500px] ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <MapPanel
              listings={items}
              hoveredListingId={hoveredListingId}
              onMarkerHover={setHoveredListingId}
              autoSearchOnMove={autoSearchOnMove}
              onToggleAutoSearch={setAutoSearchOnMove}
              onClearBbox={() => updateUrlFilters({ bbox: "" })}
              hasBboxFilter={Boolean(bbox)}
              onSearchInArea={() => {
                // Mock search in current area
                updateUrlFilters({ bbox: "108.40,11.90,108.50,12.00" });
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Toggle Button (Mobile Only) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gray-900 text-white font-extrabold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          {mobileView === "list" ? (
            <>
              <MapIcon className="w-4 h-4 text-primary" />
              <span>{t("viewMapBtn")}</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4 text-primary" />
              <span>{t("viewListBtn")}</span>
            </>
          )}
        </button>
      </div>
    </PublicShell>
  );
}
