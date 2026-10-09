"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, SlidersHorizontal, Check, Sparkles } from "lucide-react";
import { SearchFilterState, CancellationPolicyType, PropertyType } from "../types";
import { getSearchCount } from "../api/mock-search";
import { formatMoney } from "@/lib/format";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilterState;
  onApply: (updated: Partial<SearchFilterState>) => void;
  locale: string;
}

const AMENITY_OPTIONS = [
  { id: "wifi", labelVi: "Wifi tốc độ cao", labelEn: "High-speed Wifi" },
  { id: "kitchen", labelVi: "Bếp nấu đầy đủ", labelEn: "Full Kitchen" },
  { id: "pool", labelVi: "Hồ bơi", labelEn: "Swimming Pool" },
  { id: "ac", labelVi: "Điều hòa nhiệt độ", labelEn: "Air Conditioning" },
  { id: "parking", labelVi: "Chỗ đỗ xe miễn phí", labelEn: "Free Parking" },
  { id: "mountain_view", labelVi: "View đồi núi / Rừng thông", labelEn: "Mountain View" },
  { id: "beachfront", labelVi: "Sát bãi biển", labelEn: "Beachfront" },
  { id: "bbq", labelVi: "Bếp nướng BBQ ngoài trời", labelEn: "BBQ Grill" },
  { id: "bathtub", labelVi: "Bồn tắm thư giãn", labelEn: "Bathtub" },
  { id: "workspace", labelVi: "Bàn làm việc riêng", labelEn: "Dedicated Workspace" },
];

export function FilterDialog({
  isOpen,
  onClose,
  filters,
  onApply,
  locale,
}: FilterDialogProps) {
  const t = useTranslations("search.filters");
  const isEn = locale === "en";

  const [minPrice, setMinPrice] = useState(filters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || 15000000);
  const [propertyType, setPropertyType] = useState<"ALL" | "ENTIRE_PLACE" | "PRIVATE_ROOM">(
    filters.type || "ALL"
  );
  const [bedrooms, setBedrooms] = useState(filters.bedrooms || 0);
  const [amenities, setAmenities] = useState<string[]>(filters.amenities || []);
  const [instant, setInstant] = useState(filters.instant || false);
  const [policies, setPolicies] = useState<CancellationPolicyType[]>(filters.policy || []);

  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);

  // Sync when open
  useEffect(() => {
    if (isOpen) {
      setMinPrice(filters.minPrice || 0);
      setMaxPrice(filters.maxPrice || 15000000);
      setPropertyType(filters.type || "ALL");
      setBedrooms(filters.bedrooms || 0);
      setAmenities(filters.amenities || []);
      setInstant(filters.instant || false);
      setPolicies(filters.policy || []);
    }
  }, [isOpen, filters]);

  // Debounce count
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      setIsCounting(true);
      const count = await getSearchCount({
        ...filters,
        minPrice,
        maxPrice,
        type: propertyType,
        bedrooms,
        amenities,
        instant,
        policy: policies,
      });
      setMatchCount(count);
      setIsCounting(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, minPrice, maxPrice, propertyType, bedrooms, amenities, instant, policies]);

  if (!isOpen) return null;

  const handleToggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleTogglePolicy = (p: CancellationPolicyType) => {
    setPolicies((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleResetAll = () => {
    setMinPrice(0);
    setMaxPrice(15000000);
    setPropertyType("ALL");
    setBedrooms(0);
    setAmenities([]);
    setInstant(false);
    setPolicies([]);
  };

  const handleApply = () => {
    onApply({
      minPrice,
      maxPrice,
      type: propertyType,
      bedrooms,
      amenities,
      instant,
      policy: policies,
      page: 1, // Reset page
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl border border-[var(--color-border-subtle)] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {t("title")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-[var(--color-border-subtle)]">
          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {t("priceRangeTitle")}
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t("priceRangeSub")}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-2xl border border-gray-300 dark:border-gray-600">
                <span className="block text-[11px] font-bold text-[var(--color-text-tertiary)]">
                  {t("minPriceLabel")}
                </span>
                <input
                  type="number"
                  min={0}
                  step={100000}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full mt-1 font-bold text-sm bg-transparent focus:outline-hidden"
                />
                <span className="text-xs text-primary font-semibold">
                  {formatMoney(minPrice, "VND", locale)}
                </span>
              </div>
              <div className="p-3 rounded-2xl border border-gray-300 dark:border-gray-600">
                <span className="block text-[11px] font-bold text-[var(--color-text-tertiary)]">
                  {t("maxPriceLabel")}
                </span>
                <input
                  type="number"
                  min={100000}
                  step={500000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full mt-1 font-bold text-sm bg-transparent focus:outline-hidden"
                />
                <span className="text-xs text-primary font-semibold">
                  {formatMoney(maxPrice, "VND", locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="pt-6 space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {t("typeTitle")}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "ALL", label: t("typeAll") },
                { id: "ENTIRE_PLACE", label: t("typeEntire") },
                { id: "PRIVATE_ROOM", label: t("typePrivate") },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPropertyType(item.id as any)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    propertyType === item.id
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-gray-300 dark:border-gray-600 text-[var(--color-text-secondary)] hover:border-gray-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="pt-6 space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {t("bedroomsTitle")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { count: 0, label: t("anyCount") },
                { count: 1, label: "1" },
                { count: 2, label: "2" },
                { count: 3, label: "3" },
                { count: 4, label: "4+" },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => setBedrooms(item.count)}
                  className={`h-10 min-w-12 px-3 rounded-full border text-xs font-bold transition-all ${
                    bedrooms === item.count
                      ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "border-gray-300 dark:border-gray-600 text-[var(--color-text-secondary)] hover:border-gray-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instant Book */}
          <div className="pt-6 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                {t("instantBookTitle")}
              </h4>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {t("instantBookSub")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={instant}
                onChange={(e) => setInstant(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
            </label>
          </div>

          {/* Amenities */}
          <div className="pt-6 space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {t("amenitiesTitle")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-[var(--color-text-secondary)]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs truncate">
                      {isEn ? amenity.labelEn : amenity.labelVi}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="pt-6 space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
              {t("policyTitle")}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "FLEXIBLE" as const, label: t("policyFlexible") },
                { id: "MODERATE" as const, label: t("policyModerate") },
                { id: "STRICT" as const, label: t("policyStrict") },
              ].map((p) => {
                const isSelected = policies.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleTogglePolicy(p.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 dark:border-gray-600 text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-[var(--color-border-subtle)] bg-gray-50 dark:bg-gray-850 shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-red-500 underline transition-colors"
          >
            {t("clearAllBtn")}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={matchCount === 0 || isCounting}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-rose-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>
              {matchCount !== null
                ? t("showResultsCount", { count: matchCount })
                : t("showResults")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
