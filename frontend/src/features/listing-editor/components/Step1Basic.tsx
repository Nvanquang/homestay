"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Home,
  DoorClosed,
  Users,
  Bed,
  Bath,
  Clock,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import { BasicInfoData, PropertyType } from "../types";

export interface Step1BasicProps {
  data: BasicInfoData;
  onChange: (data: Partial<BasicInfoData>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function Step1Basic({
  data,
  onChange,
  errors = {},
  disabled = false,
}: Step1BasicProps) {
  const t = useTranslations("listingWizard");
  const tHost = useTranslations("hostListings");

  const checkInTimes = [
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];
  const checkOutTimes = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
  ];

  const handlePropertyType = (type: PropertyType) => {
    if (disabled) return;
    onChange({ propertyType: type });
  };

  const handleCounter = (
    field: "maxGuests" | "bedrooms" | "beds" | "bathrooms",
    delta: number,
    min: number,
    max: number,
    step: number = 1
  ) => {
    if (disabled) return;
    const current = Number(data[field]);
    const nextVal = Math.min(max, Math.max(min, Number((current + delta * step).toFixed(1))));
    onChange({ [field]: nextVal });
  };

  return (
    <div data-testid="step1-basic-form" className="space-y-6">
      {/* 1. Property Type Cards */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          {t("propertyType")} <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Entire Place */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handlePropertyType("ENTIRE_PLACE")}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              data.propertyType === "ENTIRE_PLACE"
                ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] ring-1 ring-[var(--color-primary)]"
                : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div
              className={`p-2 rounded-lg ${
                data.propertyType === "ENTIRE_PLACE"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--color-text-primary)]">
                {tHost("entirePlace")}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {t("entirePlaceDesc")}
              </p>
            </div>
          </button>

          {/* Private Room */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handlePropertyType("PRIVATE_ROOM")}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              data.propertyType === "PRIVATE_ROOM"
                ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] ring-1 ring-[var(--color-primary)]"
                : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div
              className={`p-2 rounded-lg ${
                data.propertyType === "PRIVATE_ROOM"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"
              }`}
            >
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--color-text-primary)]">
                {tHost("privateRoom")}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {t("privateRoomDesc")}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="listing-title"
            className="text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {t("listingTitle")} <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-xs ${
              data.title.length > 80
                ? "text-rose-500 font-bold"
                : data.title.length < 10
                ? "text-[var(--color-text-tertiary)]"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {t("titleMinNotice", { count: data.title.length })}
          </span>
        </div>
        <input
          id="listing-title"
          name="listing-title"
          type="text"
          disabled={disabled}
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t("titlePlaceholder")}
          maxLength={80}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 ${
            errors.title
              ? "border-rose-500 focus:ring-rose-200"
              : "border-[var(--color-border-subtle)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        {errors.title && (
          <p className="text-xs text-rose-500 font-medium">{errors.title}</p>
        )}
      </div>

      {/* 3. Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="listing-description"
            className="text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {t("listingDescription")} <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-xs ${
              data.description.length > 2000
                ? "text-rose-500 font-bold"
                : data.description.length < 50
                ? "text-[var(--color-text-tertiary)]"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {t("descMinNotice", { count: data.description.length })}
          </span>
        </div>
        <textarea
          id="listing-description"
          name="listing-description"
          disabled={disabled}
          rows={5}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={t("descPlaceholder")}
          maxLength={2000}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 resize-y ${
            errors.description
              ? "border-rose-500 focus:ring-rose-200"
              : "border-[var(--color-border-subtle)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        {errors.description && (
          <p className="text-xs text-rose-500 font-medium">{errors.description}</p>
        )}
      </div>

      {/* 4. Counters: Guests, Bedrooms, Beds, Bathrooms */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          {t("capacityTitle")} <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Max Guests */}
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {t("maxGuestsLabel")}
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  {t("guestRange")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled || data.maxGuests <= 1}
                onClick={() => handleCounter("maxGuests", -1, 1, 30)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold">
                {data.maxGuests}
              </span>
              <button
                type="button"
                disabled={disabled || data.maxGuests >= 30}
                onClick={() => handleCounter("maxGuests", 1, 1, 30)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DoorClosed className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {t("bedroomsLabel")}
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  {t("studioNotice")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled || data.bedrooms <= 0}
                onClick={() => handleCounter("bedrooms", -1, 0, 20)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold">
                {data.bedrooms}
              </span>
              <button
                type="button"
                disabled={disabled || data.bedrooms >= 20}
                onClick={() => handleCounter("bedrooms", 1, 0, 20)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Beds */}
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bed className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {t("bedsLabel")}
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  {t("minBedsNotice")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled || data.beds <= 1}
                onClick={() => handleCounter("beds", -1, 1, 30)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold">
                {data.beds}
              </span>
              <button
                type="button"
                disabled={disabled || data.beds >= 30}
                onClick={() => handleCounter("beds", 1, 1, 30)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bath className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <div>
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {t("bathroomsLabel")}
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  {t("stepBathNotice")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled || data.bathrooms <= 0.5}
                onClick={() => handleCounter("bathrooms", -1, 0.5, 10, 0.5)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold">
                {data.bathrooms}
              </span>
              <button
                type="button"
                disabled={disabled || data.bathrooms >= 10}
                onClick={() => handleCounter("bathrooms", 1, 0.5, 10, 0.5)}
                className="w-7 h-7 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Times and Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Check-in */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
            {t("checkInLabel")}
          </label>
          <div className="relative">
            <select
              disabled={disabled}
              value={data.checkInTime}
              onChange={(e) => onChange({ checkInTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-xs text-[var(--color-text-primary)]"
            >
              {checkInTimes.map((tm) => (
                <option key={tm} value={tm}>
                  {t("fromTime", { time: tm })}
                </option>
              ))}
            </select>
            <Clock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Check-out */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
            {t("checkOutLabel")}
          </label>
          <div className="relative">
            <select
              disabled={disabled}
              value={data.checkOutTime}
              onChange={(e) => onChange({ checkOutTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-xs text-[var(--color-text-primary)]"
            >
              {checkOutTimes.map((tm) => (
                <option key={tm} value={tm}>
                  {t("beforeTime", { time: tm })}
                </option>
              ))}
            </select>
            <Clock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
            {t("currencyLabel")}
          </label>
          <div className="px-3 py-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text-secondary)] font-medium flex items-center justify-between">
            <span>{data.currency || "VND"}</span>
            <span className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-0.5">
              <Info className="w-3 h-3" />
              {t("currencyFixed")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
