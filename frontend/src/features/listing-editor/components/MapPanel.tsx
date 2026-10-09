"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Search,
  Shield,
  Compass,
  AlertCircle,
  EyeOff,
  Navigation,
} from "lucide-react";
import { PublicAreaCircle } from "../types";

export interface MapPanelProps {
  exactLat: number;
  exactLng: number;
  province: string;
  district: string;
  exactAddress: string;
  publicArea?: PublicAreaCircle;
  onChangeLocation: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export function MapPanel({
  exactLat,
  exactLng,
  province,
  district,
  exactAddress,
  publicArea,
  onChangeLocation,
  className = "",
}: MapPanelProps) {
  const t = useTranslations("listingWizard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualLat, setManualLat] = useState(exactLat.toString());
  const [manualLng, setManualLng] = useState(exactLng.toString());
  const [isSearching, setIsSearching] = useState(false);
  const [pinPrompt, setPinPrompt] = useState<string | null>(null);

  // Quick preset locations in Vietnam
  const quickLocations = [
    { name: "Đà Lạt (Lâm Đồng)", lat: 11.9404, lng: 108.4583 },
    { name: "Nha Trang (Khánh Hòa)", lat: 12.2388, lng: 109.1967 },
    { name: "Hà Nội (Hoàn Kiếm)", lat: 21.0285, lng: 105.8542 },
    { name: "TP. Hồ Chí Minh (Quận 1)", lat: 10.7769, lng: 106.7009 },
    { name: "Đà Nẵng (Hải Châu)", lat: 16.0544, lng: 108.2022 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      // Find matching preset or simulate geocode
      const match = quickLocations.find((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        onChangeLocation({ lat: match.lat, lng: match.lng });
        setManualLat(match.lat.toString());
        setManualLng(match.lng.toString());
        setPinPrompt(`✓ ${match.name}`);
      } else {
        const newLat = exactLat + (Math.random() - 0.5) * 0.01;
        const newLng = exactLng + (Math.random() - 0.5) * 0.01;
        onChangeLocation({
          lat: Number(newLat.toFixed(5)),
          lng: Number(newLng.toFixed(5)),
        });
        setManualLat(newLat.toFixed(5));
        setManualLng(newLng.toFixed(5));
        setPinPrompt(`✓ "${searchQuery}"`);
      }
      setIsSearching(false);
    }, 300);
  };

  const handleManualApply = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onChangeLocation({ lat, lng });
      setPinPrompt("✓ Coordinates applied");
    }
  };

  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    const deltaLat = -yRatio * 0.02;
    const deltaLng = xRatio * 0.02;

    const newLat = Number((exactLat + deltaLat).toFixed(5));
    const newLng = Number((exactLng + deltaLng).toFixed(5));

    onChangeLocation({ lat: newLat, lng: newLng });
    setManualLat(newLat.toString());
    setManualLng(newLng.toString());
    setPinPrompt("✓ Pin position updated");
  };

  return (
    <div
      data-testid="map-panel"
      className={`rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden shadow-sm ${className}`}
    >
      {/* Header controls */}
      <div className="p-3 bg-[var(--color-bg-subtle)] border-b border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-2">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchMapPlaceholder")}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <Search className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] absolute left-3 top-2.5" />
          <button
            type="submit"
            disabled={isSearching}
            className="hidden"
            aria-label="Search"
          >
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsManualInput(!isManualInput)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{isManualInput ? t("hideCoords") : t("manualCoords")}</span>
        </button>
      </div>

      {/* Manual Coordinates Form if expanded */}
      {isManualInput && (
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-800/30 text-xs flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--color-text-secondary)]">{t("latLabel")}:</span>
            <input
              type="number"
              step="any"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="w-28 px-2 py-1 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--color-text-secondary)]">{t("lngLabel")}:</span>
            <input
              type="number"
              step="any"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="w-28 px-2 py-1 rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
            />
          </div>
          <button
            type="button"
            onClick={handleManualApply}
            className="px-3 py-1 bg-[var(--color-primary)] text-white rounded font-medium hover:opacity-90 cursor-pointer"
          >
            {t("apply")}
          </button>
        </div>
      )}

      {/* Interactive Map Visual Simulation */}
      <div
        onClick={handleMapCanvasClick}
        title="Nhấp để di chuyển ghim vị trí"
        role="button"
        tabIndex={0}
        aria-label="Interactive map canvas"
        className="relative w-full h-[280px] sm:h-[320px] bg-slate-100 dark:bg-slate-900 cursor-crosshair overflow-hidden select-none border-b border-[var(--color-border-subtle)] group"
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <path
            d="M 0,150 Q 150,180 300,120 T 600,200"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
          />
          <path
            d="M 100,0 L 250,350"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="6"
          />
        </svg>

        {/* Public area circle */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-primary)]/10 flex items-center justify-center pointer-events-none transition-all duration-300"
        >
          <div className="text-[10px] text-[var(--color-primary)] font-bold bg-[var(--color-bg-surface)]/90 px-2 py-0.5 rounded-full shadow-xs border border-[var(--color-primary)]/30">
            ~500m
          </div>
        </div>

        {/* Exact Pin */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none">
          <div className="bg-rose-600 text-white p-2 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-900 animate-bounce">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="w-3 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5" />
        </div>

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-auto">
          <div className="bg-[var(--color-bg-surface)]/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-[11px] shadow-sm flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Navigation className="w-3 h-3 text-[var(--color-primary)]" />
            <span>
              {exactLat.toFixed(4)}, {exactLng.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 pointer-events-none bg-[var(--color-bg-surface)]/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] shadow-xs">
          {t("mapInteractiveNotice")}
        </div>
      </div>

      {/* Pin prompt update notice */}
      {pinPrompt && (
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{pinPrompt}</span>
        </div>
      )}

      {/* Privacy Guarantee Explanation (BR-SRC-04) */}
      <div className="p-4 bg-[var(--color-bg-surface)] flex items-start gap-3 text-xs">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
          <EyeOff className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <span>{t("privacyCardTitle")}</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.2 rounded font-mono">
              BR-SRC-04
            </span>
          </div>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {t("privacyCardDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
