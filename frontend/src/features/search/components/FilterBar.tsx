"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  SlidersHorizontal,
  ChevronDown,
  Zap,
  DollarSign,
  Home,
  Check,
  X,
} from "lucide-react";
import { SearchFilterState, SearchSortOption } from "../types";
import { FilterDialog } from "./FilterDialog";

interface FilterBarProps {
  filters: SearchFilterState;
  onFilterChange: (updated: Partial<SearchFilterState>) => void;
  locale: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  locale,
}: FilterBarProps) {
  const t = useTranslations("search.filterBar");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Count active custom filters
  let activeFilterCount = 0;
  if (filters.minPrice > 0 || (filters.maxPrice < 15000000 && filters.maxPrice > 0)) activeFilterCount++;
  if (filters.type && filters.type !== "ALL") activeFilterCount++;
  if (filters.bedrooms && filters.bedrooms > 0) activeFilterCount++;
  if (filters.amenities && filters.amenities.length > 0) activeFilterCount += filters.amenities.length;
  if (filters.instant) activeFilterCount++;
  if (filters.policy && filters.policy.length > 0) activeFilterCount += filters.policy.length;

  return (
    <>
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Filter: All Filters Button */}
          <button
            type="button"
            data-testid="all-filters-btn"
            onClick={() => setIsDialogOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-all ${
              activeFilterCount > 0
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--color-text-primary)] hover:border-gray-400"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t("allFiltersBtn")}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Filter: Price chip */}
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold transition-all ${
              filters.minPrice > 0 || (filters.maxPrice < 15000000 && filters.maxPrice > 0)
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--color-text-secondary)] hover:border-gray-300"
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>
              {filters.minPrice > 0 || (filters.maxPrice < 15000000 && filters.maxPrice > 0)
                ? t("priceFiltered")
                : t("priceLabel")}
            </span>
          </button>

          {/* Quick Filter: Property Type */}
          <button
            type="button"
            onClick={() => {
              const nextType =
                filters.type === "ALL"
                  ? "ENTIRE_PLACE"
                  : filters.type === "ENTIRE_PLACE"
                  ? "PRIVATE_ROOM"
                  : "ALL";
              onFilterChange({ type: nextType });
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold transition-all ${
              filters.type !== "ALL"
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--color-text-secondary)] hover:border-gray-300"
            }`}
          >
            <Home className="w-3 h-3" />
            <span>
              {filters.type === "ENTIRE_PLACE"
                ? t("typeEntire")
                : filters.type === "PRIVATE_ROOM"
                ? t("typePrivate")
                : t("typeLabel")}
            </span>
          </button>

          {/* Quick Filter: Instant Book */}
          <button
            type="button"
            onClick={() => onFilterChange({ instant: !filters.instant })}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold transition-all ${
              filters.instant
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--color-text-secondary)] hover:border-gray-300"
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>{t("instantLabel")}</span>
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[var(--color-text-tertiary)] font-medium hidden sm:inline">
            {t("sortPrefix")}:
          </span>
          <select
            value={filters.sort}
            onChange={(e) =>
              onFilterChange({ sort: e.target.value as SearchSortOption })
            }
            className="px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-[var(--color-text-primary)] focus:outline-hidden cursor-pointer"
          >
            <option value="RELEVANCE">{t("sortRelevance")}</option>
            <option value="PRICE_ASC">{t("sortPriceAsc")}</option>
            <option value="PRICE_DESC">{t("sortPriceDesc")}</option>
            <option value="NEWEST">{t("sortNewest")}</option>
          </select>
        </div>
      </div>

      <FilterDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        filters={filters}
        onApply={onFilterChange}
        locale={locale}
      />
    </>
  );
}
