"use client";

import React, { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Wifi,
  AirVent,
  Droplets,
  Laptop,
  Shirt,
  Wind,
  Sparkles,
  ChefHat,
  Refrigerator,
  Microwave,
  Coffee,
  UtensilsCrossed,
  Bath,
  Tv,
  Speaker,
  BookOpen,
  Flame,
  ShieldAlert,
  BellRing,
  KeyRound,
  Sun,
  Car,
  Waves,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { AmenityCategory, AmenityItem } from "../types";
import { MOCK_AMENITIES } from "../api/mock-amenities";

export interface Step4AmenitiesProps {
  selectedAmenityIds: string[];
  onChange: (newIds: string[]) => void;
  isReadOnly?: boolean;
}

const CATEGORY_ORDER: AmenityCategory[] = [
  "ESSENTIAL",
  "KITCHEN",
  "BATHROOM",
  "ENTERTAINMENT",
  "SAFETY",
  "OUTDOOR",
];

const CATEGORY_INFO: Record<
  AmenityCategory,
  { labelVi: string; labelEn: string; descVi: string; descEn: string }
> = {
  ESSENTIAL: {
    labelVi: "Thiết yếu & Tiện nghi phòng",
    labelEn: "Essentials & Room amenities",
    descVi: "Các tiện ích cơ bản cần thiết cho sinh hoạt hàng ngày",
    descEn: "Basic amenities required for daily living",
  },
  KITCHEN: {
    labelVi: "Phòng bếp & Bàn ăn",
    labelEn: "Kitchen & Dining",
    descVi: "Không gian và đồ dùng cho khách tự chuẩn bị bữa ăn",
    descEn: "Space and cookware for self-catering",
  },
  BATHROOM: {
    labelVi: "Tiện nghi phòng tắm",
    labelEn: "Bathroom Amenities",
    descVi: "Các đồ dùng vệ sinh cá nhân và tắm giặt",
    descEn: "Personal care and bathing essentials",
  },
  ENTERTAINMENT: {
    labelVi: "Giải trí & Thư giãn",
    labelEn: "Entertainment & Leisure",
    descVi: "Thiết bị giải trí trong nhà cho kỳ nghỉ",
    descEn: "Indoor amusement and media devices",
  },
  SAFETY: {
    labelVi: "An toàn & Bảo vệ",
    labelEn: "Safety & Security",
    descVi: "Thiết bị phòng cháy và bảo vệ tính mạng",
    descEn: "Life safety and fire protection equipment",
  },
  OUTDOOR: {
    labelVi: "Khu vực ngoài trời & Tiện ích thêm",
    labelEn: "Outdoor & Extra perks",
    descVi: "Không gian mở, bể bơi, bãi đỗ xe",
    descEn: "Open spaces, pool, and parking",
  },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  AirVent,
  Droplets,
  Laptop,
  Shirt,
  Wind,
  Sparkles,
  ChefHat,
  Refrigerator,
  Microwave,
  Coffee,
  UtensilsCrossed,
  Bath,
  Tv,
  Speaker,
  BookOpen,
  Flame,
  ShieldAlert,
  BellRing,
  KeyRound,
  Sun,
  Car,
  Waves,
};

export function Step4Amenities({
  selectedAmenityIds,
  onChange,
  isReadOnly = false,
}: Step4AmenitiesProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (category: AmenityCategory) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleAmenity = (id: string) => {
    if (isReadOnly) return;
    if (selectedAmenityIds.includes(id)) {
      onChange(selectedAmenityIds.filter((item) => item !== id));
    } else {
      onChange([...selectedAmenityIds, id]);
    }
  };

  // Normalize search string
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredAmenities = useMemo(() => {
    if (!normalizedQuery) return MOCK_AMENITIES;

    return MOCK_AMENITIES.filter((item) => {
      const name = isEn ? item.nameEn : item.nameVi;
      const desc = isEn ? item.descriptionEn || "" : item.descriptionVi || "";
      return (
        name.toLowerCase().includes(normalizedQuery) ||
        desc.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, isEn]);

  // Group by category
  const groupedAmenities = useMemo(() => {
    const map = new Map<AmenityCategory, AmenityItem[]>();
    CATEGORY_ORDER.forEach((cat) => map.set(cat, []));

    filteredAmenities.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });

    return map;
  }, [filteredAmenities]);

  return (
    <div className="space-y-6">
      {/* Search Bar & Selected Counter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border-subtle)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder={
              isEn
                ? "Search amenities (e.g. Wi-Fi, air conditioner, pool)..."
                : "Tìm tiện nghi (ví dụ: Wi-Fi, điều hoà, bể bơi)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <span className="text-[var(--color-text-secondary)] font-medium">
            {isEn ? "Selected:" : "Đã chọn:"}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold text-xs">
            {selectedAmenityIds.length} {isEn ? "amenities" : "tiện nghi"}
          </span>
        </div>
      </div>

      {/* No search results state */}
      {filteredAmenities.length === 0 && (
        <div className="py-12 text-center text-[var(--color-text-secondary)] space-y-2">
          <Search className="w-8 h-8 mx-auto text-[var(--color-text-tertiary)] stroke-[1.5]" />
          <p className="text-sm font-semibold">
            {isEn
              ? `No amenities found matching "${searchQuery}"`
              : `Không tìm thấy tiện nghi phù hợp với "${searchQuery}"`}
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs text-[var(--color-primary)] hover:underline font-medium cursor-pointer"
          >
            {isEn ? "Clear search" : "Xoá bộ lọc tìm kiếm"}
          </button>
        </div>
      )}

      {/* Categories and Cards */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const items = groupedAmenities.get(category) || [];
          if (items.length === 0) return null;

          const isCollapsed = collapsedCategories[category];
          const catInfo = CATEGORY_INFO[category];
          const selectedInCat = items.filter((it) => selectedAmenityIds.includes(it.id)).length;

          return (
            <div
              key={category}
              className="border border-[var(--color-border-subtle)] rounded-xl overflow-hidden bg-[var(--color-bg-surface)] shadow-2xs"
            >
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategoryCollapse(category)}
                className="w-full px-5 py-3.5 bg-[var(--color-bg-subtle)]/70 hover:bg-[var(--color-bg-subtle)] flex items-center justify-between text-left transition-colors cursor-pointer"
                aria-expanded={!isCollapsed}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      {isEn ? catInfo.labelEn : catInfo.labelVi}
                    </h3>
                    {selectedInCat > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                        {selectedInCat}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                    {isEn ? catInfo.descEn : catInfo.descVi}
                  </p>
                </div>

                <div className="p-1 rounded-md text-[var(--color-text-secondary)]">
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </button>

              {/* Items Grid */}
              {!isCollapsed && (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
                  {items.map((amenity) => {
                    const isSelected = selectedAmenityIds.includes(amenity.id);
                    const IconComponent = ICON_MAP[amenity.iconName] || Sparkles;

                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        disabled={isReadOnly}
                        className={`group p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]/40 ring-1 ring-[var(--color-primary)]"
                            : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-subtle)]/50"
                        } ${isReadOnly ? "opacity-75 cursor-default" : ""}`}
                      >
                        {/* Checkbox Icon Indicator */}
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
                            isSelected
                              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                              : "border-[var(--color-border-default)] group-hover:border-[var(--color-border-strong)] bg-[var(--color-bg-surface)]"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Icon and Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <IconComponent
                              className={`w-4 h-4 flex-shrink-0 ${
                                isSelected
                                  ? "text-[var(--color-primary)]"
                                  : "text-[var(--color-text-secondary)]"
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold truncate ${
                                isSelected
                                  ? "text-[var(--color-primary-strong)] font-bold"
                                  : "text-[var(--color-text-primary)]"
                              }`}
                            >
                              {isEn ? amenity.nameEn : amenity.nameVi}
                            </span>
                          </div>
                          {(amenity.descriptionVi || amenity.descriptionEn) && (
                            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                              {isEn ? amenity.descriptionEn : amenity.descriptionVi}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
