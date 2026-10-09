"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Heart, Star, ChevronLeft, ChevronRight, Zap, Award } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useCurrency } from "@/features/currency";
import { ListingCardDTO } from "../types";

export interface ListingCardProps {
  listing: ListingCardDTO;
  checkin?: string;
  checkout?: string;
  adults?: number;
  childrenCount?: number;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
}

export function ListingCard({
  listing,
  checkin = "",
  checkout = "",
  adults = 1,
  childrenCount = 0,
  isHovered = false,
  onHover,
  onToggleFavorite,
}: ListingCardProps) {
  const t = useTranslations("search.listingCard");
  const locale = useLocale();

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(listing.isFavorite ?? false);
  const [imgError, setImgError] = useState(false);

  const { convert, currency, exchangeRates } = useCurrency();
  const convertedTotal = listing.price.total ? convert(listing.price.total) : null;
  const convertedNightly = convert(listing.price.nightlyAvg || 0);

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"
  ];

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (onToggleFavorite) {
      onToggleFavorite(listing.id, nextState);
    }
  };

  // Build room detail link preserving checkin, checkout, guests
  const queryParams = new URLSearchParams();
  if (checkin) queryParams.set("checkin", checkin);
  if (checkout) queryParams.set("checkout", checkout);
  if (adults > 1) queryParams.set("adults", adults.toString());
  if (childrenCount > 0) queryParams.set("children", childrenCount.toString());

  const detailHref = `/${locale}/rooms/${listing.id}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return (
    <div
      data-testid={`listing-card-${listing.id}`}
      onMouseEnter={() => onHover && onHover(listing.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border transition-all duration-200 ${
        isHovered
          ? "border-primary shadow-xl scale-[1.01]"
          : "border-[var(--color-border-subtle)] hover:shadow-lg"
      }`}
    >
      {/* Photo Carousel Container */}
      <div className="relative aspect-4/3 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <Link
          href={detailHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full relative"
        >
          <img
            src={imgError ? "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80" : photos[currentPhotoIdx]}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          {listing.isSuperhost && (
            <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-gray-900/90 text-gray-900 dark:text-white text-[11px] font-bold shadow-xs backdrop-blur-xs flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-500 fill-amber-500" />
              {t("superhost")}
            </span>
          )}
          {listing.bookingMode === "INSTANT" && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-bold shadow-xs backdrop-blur-xs flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-current" />
              {t("instant")}
            </span>
          )}
        </div>

        {/* Heart Favorite Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isFavorite ? t("removeFromWishlist") : t("addToWishlist")}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xs text-white transition-all active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? "text-rose-500 fill-rose-500 stroke-rose-500"
                : "text-white fill-none stroke-[2.2]"
            }`}
          />
        </button>

        {/* Photo Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentPhotoIdx
                      ? "w-4 bg-white shadow-xs"
                      : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Header row: Location & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--color-text-secondary)] truncate max-w-[200px]">
              {listing.areaLabel}
            </span>
            <div className="flex items-center gap-1 shrink-0 font-bold text-[var(--color-text-primary)]">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{listing.rating.toFixed(2)}</span>
              <span className="text-[var(--color-text-tertiary)] font-normal">
                ({listing.reviewCount})
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            href={detailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-1 font-bold text-sm text-[var(--color-text-primary)] hover:text-primary transition-colors line-clamp-1"
          >
            {listing.title}
          </Link>

          {/* Room Specs */}
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1 truncate">
            {listing.bedrooms} {t("bedrooms")} · {listing.beds} {t("beds")} · {t("maxGuests", { count: listing.maxGuests })}
          </p>
        </div>

        {/* Pricing display */}
        <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-end justify-between">
          {listing.price.mode === "TOTAL" && listing.price.total && convertedTotal ? (
            <div>
              <div className="text-sm sm:text-base font-extrabold text-[var(--color-text-primary)]">
                {convertedTotal.isConverted ? convertedTotal.formatted : formatMoney(listing.price.total, "VND", locale)}
                <span className="text-xs font-normal text-[var(--color-text-secondary)]">
                  {" "}
                  {t("totalForNights", { count: listing.price.nights || 1 })}
                </span>
              </div>
              <div className="text-[11px] text-[var(--color-text-tertiary)]">
                {convertedNightly.isConverted ? convertedNightly.formatted : formatMoney(listing.price.nightlyAvg || 0, "VND", locale)} / {t("night")} · {t("includesTaxes")}
              </div>
              {convertedTotal.isConverted && (
                <div className="text-[10px] text-[var(--color-text-tertiary)] italic">
                  Giá gốc {convertedTotal.formattedOriginal} · Tỷ giá {exchangeRates.asOf}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-sm sm:text-base font-extrabold text-[var(--color-text-primary)]">
                {t("fromPrice")}{" "}
                {convertedNightly.isConverted ? convertedNightly.formatted : formatMoney(listing.price.nightlyAvg || 0, "VND", locale)}
                <span className="text-xs font-normal text-[var(--color-text-secondary)]">
                  {" "}
                  / {t("night")}
                </span>
              </div>
              <div className="text-[11px] text-[var(--color-text-tertiary)]">
                {convertedNightly.isConverted ? (
                  <span>Giá gốc {convertedNightly.formattedOriginal} · Tỷ giá {exchangeRates.asOf}</span>
                ) : (
                  t("basePriceSub")
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
