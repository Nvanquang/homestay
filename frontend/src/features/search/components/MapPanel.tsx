"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Navigation, Plus, Minus, RotateCcw, X, Layers } from "lucide-react";
import { ListingCardDTO } from "../types";

interface MapPanelProps {
  listings: ListingCardDTO[];
  hoveredListingId: string | null;
  onMarkerHover: (id: string | null) => void;
  onSearchInArea?: () => void;
  autoSearchOnMove?: boolean;
  onToggleAutoSearch?: (val: boolean) => void;
  onClearBbox?: () => void;
  hasBboxFilter?: boolean;
}

export function MapPanel({
  listings,
  hoveredListingId,
  onMarkerHover,
  onSearchInArea,
  autoSearchOnMove = false,
  onToggleAutoSearch,
  onClearBbox,
  hasBboxFilter = false,
}: MapPanelProps) {
  const t = useTranslations("search.map");
  const locale = useLocale();

  const [selectedListing, setSelectedListing] = useState<ListingCardDTO | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInAreaBtn, setShowInAreaBtn] = useState(false);

  // Auto select if hovered
  useEffect(() => {
    if (hoveredListingId) {
      const found = listings.find((l) => l.id === hoveredListingId);
      if (found) setSelectedListing(found);
    }
  }, [hoveredListingId, listings]);

  // Center coordinates calculation based on listings
  const centerLat = listings.length > 0
    ? listings.reduce((sum, l) => sum + l.map.lat, 0) / listings.length
    : 11.94;
  const centerLng = listings.length > 0
    ? listings.reduce((sum, l) => sum + l.map.lng, 0) / listings.length
    : 108.45;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(2.5, prev + delta * 0.2)));
    setShowInAreaBtn(true);
  };

  const handleSearchAreaClick = () => {
    setShowInAreaBtn(false);
    if (onSearchInArea) onSearchInArea();
  };

  return (
    <div
      data-testid="map-panel"
      className="relative w-full h-full min-h-[450px] bg-[#E5E9EC] dark:bg-gray-900 rounded-3xl overflow-hidden border border-[var(--color-border-subtle)] shadow-inner select-none flex items-center justify-center"
    >
      {/* Visual Stylized Map Background Pattern */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none transition-transform duration-300"
        style={{
          transform: `scale(${zoomLevel})`,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(200,220,240,0.4) 0%, transparent 60%),
            linear-gradient(#d1d5db 1px, transparent 1px),
            linear-gradient(90deg, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      {/* Waterways / Terrain organic lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 dark:opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,150 Q180,90 320,240 T700,200 T1200,320"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="32"
          strokeLinecap="round"
        />
        <path
          d="M150,0 Q240,250 400,350 T900,500"
          fill="none"
          stroke="#86efac"
          strokeWidth="48"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          {hasBboxFilter && (
            <button
              type="button"
              onClick={onClearBbox}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-white shadow-md flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span>{t("mapAreaFilter")}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleAutoSearch && (
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xs text-xs font-semibold text-[var(--color-text-primary)] shadow-md cursor-pointer">
              <input
                type="checkbox"
                checked={autoSearchOnMove}
                onChange={(e) => onToggleAutoSearch(e.target.checked)}
                className="rounded text-primary focus:ring-0"
              />
              <span>{t("searchAsMove")}</span>
            </label>
          )}
        </div>

        {/* Search in this area button */}
        {(showInAreaBtn || !autoSearchOnMove) && (
          <button
            type="button"
            onClick={handleSearchAreaClick}
            className="pointer-events-auto px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-primary rotate-45" />
            <span>{t("searchThisArea")}</span>
          </button>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-1">
        <button
          type="button"
          onClick={() => handleZoom(1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Markers Container */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {listings.map((l, index) => {
          const isHovered = hoveredListingId === l.id;
          const isSelected = selectedListing?.id === l.id;

          // Relative percentage positioning offset around center
          const deltaLat = l.map.lat - centerLat;
          const deltaLng = l.map.lng - centerLng;
          const leftPct = 50 + deltaLng * 500;
          const topPct = 50 - deltaLat * 500;

          const clampedLeft = Math.max(8, Math.min(92, leftPct));
          const clampedTop = Math.max(8, Math.min(92, topPct));

          const rawPrice =
            l.price.mode === "TOTAL" ? l.price.total || 0 : l.price.nightlyAvg || 0;
          const shortPrice =
            rawPrice >= 1000000
              ? `${(rawPrice / 1000000).toFixed(1).replace(".0", "")}tr ₫`
              : `${Math.round(rawPrice / 1000)}k ₫`;

          return (
            <div
              key={l.id}
              style={{
                left: `${clampedLeft}%`,
                top: `${clampedTop}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute z-10 transition-transform"
              onMouseEnter={() => onMarkerHover(l.id)}
              onMouseLeave={() => onMarkerHover(null)}
            >
              <button
                type="button"
                onClick={() => setSelectedListing(l)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-extrabold shadow-md transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  isHovered || isSelected
                    ? "bg-gray-900 text-white scale-110 shadow-2xl ring-4 ring-primary/30 z-30"
                    : "bg-white text-gray-900 hover:scale-105 hover:bg-gray-50 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <span>{shortPrice}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Marker Card Preview Popup */}
      {selectedListing && (
        <div className="absolute bottom-6 left-6 z-30 max-w-xs w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-[var(--color-border-subtle)] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onClick={() => setSelectedListing(null)}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <Link
            href={`/${locale}/rooms/${selectedListing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="aspect-16/9 w-full bg-gray-200 relative overflow-hidden">
              <img
                src={selectedListing.photos[0]}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                {selectedListing.areaLabel}
              </span>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate mt-0.5">
                {selectedListing.title}
              </h4>
              <div className="mt-2 text-xs font-extrabold text-primary">
                {selectedListing.price.mode === "TOTAL" && selectedListing.price.total
                  ? `${selectedListing.price.total.toLocaleString("vi-VN")} ₫ tổng`
                  : `Từ ${selectedListing.price.nightlyAvg?.toLocaleString("vi-VN")} ₫ / đêm`}
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
