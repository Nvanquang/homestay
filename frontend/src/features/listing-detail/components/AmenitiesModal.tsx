"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Wifi,
  Utensils,
  Mountain,
  Flame,
  Car,
  Sun,
  Coffee,
  Laptop,
  Droplet,
  Shield,
  X,
  Sparkles,
} from "lucide-react";
import { AmenityDetail } from "../types";

interface AmenitiesModalProps {
  amenities: AmenityDetail[];
}

export function AmenitiesModal({ amenities }: AmenitiesModalProps) {
  const t = useTranslations("listingDetail.amenities");
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (id: string) => {
    switch (id) {
      case "wifi":
        return <Wifi className="w-5 h-5 text-primary" />;
      case "kitchen":
        return <Utensils className="w-5 h-5 text-primary" />;
      case "mountain_view":
        return <Mountain className="w-5 h-5 text-primary" />;
      case "bbq":
        return <Flame className="w-5 h-5 text-primary" />;
      case "parking":
        return <Car className="w-5 h-5 text-primary" />;
      case "balcony":
        return <Sun className="w-5 h-5 text-primary" />;
      case "coffee":
        return <Coffee className="w-5 h-5 text-primary" />;
      case "workspace":
        return <Laptop className="w-5 h-5 text-primary" />;
      case "hot_water":
        return <Droplet className="w-5 h-5 text-primary" />;
      default:
        return <Shield className="w-5 h-5 text-primary" />;
    }
  };

  const previewList = amenities.slice(0, 10);

  return (
    <div className="py-6 border-b border-[var(--color-border-subtle)] space-y-4">
      <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
        {t("title")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {previewList.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
              {getIcon(item.id)}
            </div>
            <span className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {amenities.length > 6 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-gray-900 text-xs font-bold text-[var(--color-text-primary)] transition-all cursor-pointer"
        >
          {t("showAllBtn", { count: amenities.length })}
        </button>
      )}

      {/* Full Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t("allAmenitiesModalTitle")}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl border border-[var(--color-border-subtle)] shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)]">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t("allAmenitiesModalTitle")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 divide-y divide-[var(--color-border-subtle)]">
              {amenities.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 mt-0.5">
                    {getIcon(item.id)}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[var(--color-text-primary)]">
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="block text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
