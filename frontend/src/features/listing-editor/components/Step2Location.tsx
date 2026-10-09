"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Building, Navigation } from "lucide-react";
import { LocationData } from "../types";
import { MapPanel } from "./MapPanel";

export interface Step2LocationProps {
  data: LocationData;
  onChange: (data: Partial<LocationData>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

// Location dictionary for cascading select
export const VIETNAM_LOCATIONS: Record<string, string[]> = {
  "Lâm Đồng": [
    "Thành phố Đà Lạt",
    "Thành phố Bảo Lộc",
    "Huyện Lạc Dương",
    "Huyện Đức Trọng",
    "Huyện Đơn Dương",
  ],
  "Khánh Hòa": [
    "Thành phố Nha Trang",
    "Thành phố Cam Ranh",
    "Thị xã Ninh Hòa",
    "Huyện Diên Khánh",
  ],
  "Đà Nẵng": [
    "Quận Hải Châu",
    "Quận Sơn Trà",
    "Quận Ngũ Hành Sơn",
    "Quận Thanh Khê",
    "Quận Cẩm Lệ",
    "Quận Liên Chiểu",
  ],
  "Hà Nội": [
    "Quận Hoàn Kiếm",
    "Quận Ba Đình",
    "Quận Tây Hồ",
    "Quận Đống Đa",
    "Quận Cầu Giấy",
    "Quận Nam Từ Liêm",
    "Huyện Ba Vì",
    "Huyện Sóc Sơn",
  ],
  "Hồ Chí Minh": [
    "Quận 1",
    "Quận 3",
    "Quận 4",
    "Quận 7",
    "Thành phố Thủ Đức",
    "Quận Bình Thạnh",
    "Quận Phú Nhuận",
  ],
  "Quảng Nam": [
    "Thành phố Hội An",
    "Thành phố Tam Kỳ",
    "Huyện Điện Bàn",
    "Huyện Duy Xuyên",
  ],
  "Kiên Giang": [
    "Thành phố Phú Quốc",
    "Thành phố Rạch Giá",
    "Thành phố Hà Tiên",
  ],
  "Thừa Thiên Huế": [
    "Thành phố Huế",
    "Thị xã Hương Thủy",
    "Thị xã Hương Trà",
  ],
  "Lào Cai": [
    "Thị xã Sa Pa",
    "Thành phố Lào Cai",
    "Huyện Bắc Hà",
  ],
  "Bà Rịa - Vũng Tàu": [
    "Thành phố Vũng Tàu",
    "Thành phố Bà Rịa",
    "Huyện Xuyên Mộc",
    "Huyện Côn Đảo",
  ],
};

export function Step2Location({
  data,
  onChange,
  errors = {},
  disabled = false,
}: Step2LocationProps) {
  const t = useTranslations("listingWizard");
  const provinces = useMemo(() => Object.keys(VIETNAM_LOCATIONS), []);

  const availableDistricts = useMemo(() => {
    if (!data.province || !VIETNAM_LOCATIONS[data.province]) {
      return [];
    }
    return VIETNAM_LOCATIONS[data.province];
  }, [data.province]);

  const handleProvinceChange = (newProvince: string) => {
    if (disabled) return;
    const districts = VIETNAM_LOCATIONS[newProvince] || [];
    const firstDistrict = districts.length > 0 ? districts[0] : "";
    onChange({
      province: newProvince,
      district: firstDistrict,
    });
  };

  const handleCoordsChange = ({ lat, lng }: { lat: number; lng: number }) => {
    if (disabled) return;
    onChange({
      exactLat: lat,
      exactLng: lng,
      publicArea: {
        centerLat: lat,
        centerLng: lng,
        radiusM: 500,
        label: `${data.district || ""}, ${data.province || ""}`.trim(),
      },
    });
  };

  return (
    <div data-testid="step2-location-form" className="space-y-6">
      {/* 1. Cascading Province and District Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Province */}
        <div className="space-y-1.5">
          <label
            htmlFor="province-select"
            className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5"
          >
            <Building className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span>{t("provinceLabel")}</span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            id="province-select"
            disabled={disabled}
            value={data.province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 ${
              errors.province
                ? "border-rose-500 focus:ring-rose-200"
                : "border-[var(--color-border-subtle)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">{t("selectProvince")}</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="text-xs text-rose-500 font-medium">{errors.province}</p>
          )}
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label
            htmlFor="district-select"
            className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5"
          >
            <Navigation className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span>{t("districtLabel")}</span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            id="district-select"
            disabled={disabled || !data.province}
            value={data.district}
            onChange={(e) => onChange({ district: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 ${
              errors.district
                ? "border-rose-500 focus:ring-rose-200"
                : "border-[var(--color-border-subtle)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            } ${disabled || !data.province ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">{t("selectDistrict")}</option>
            {availableDistricts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-xs text-rose-500 font-medium">{errors.district}</p>
          )}
        </div>
      </div>

      {/* 2. Exact Address Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="exact-address"
          className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5"
        >
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>{t("exactAddressLabel")}</span>
          <span className="text-rose-500">*</span>
        </label>
        <input
          id="exact-address"
          name="exact-address"
          type="text"
          disabled={disabled}
          value={data.exactAddress}
          onChange={(e) => onChange({ exactAddress: e.target.value })}
          placeholder="Số 12/4 Đường Khởi Nghĩa Bắc Sơn, Phường 10..."
          maxLength={200}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 ${
            errors.exactAddress
              ? "border-rose-500 focus:ring-rose-200"
              : "border-[var(--color-border-subtle)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        {errors.exactAddress && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.exactAddress}
          </p>
        )}
        <p className="text-xs text-[var(--color-text-tertiary)] italic">
          {t("exactAddressPrivacy")}
        </p>
      </div>

      {/* 3. Interactive Map & Privacy Radius */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          {t("step2Label")}
        </label>
        <MapPanel
          exactLat={data.exactLat}
          exactLng={data.exactLng}
          province={data.province}
          district={data.district}
          exactAddress={data.exactAddress}
          publicArea={data.publicArea}
          onChangeLocation={handleCoordsChange}
        />
      </div>
    </div>
  );
}
