"use client";

import React, { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Lock,
  Layers,
  Sparkles,
  Info,
  Loader2,
  ChevronRight,
  User,
  Coffee,
  Check,
} from "lucide-react";
import { AdminShell } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import {
  ListingReviewDetail,
  ListingDecisionType,
  ListingReviewDecisionPayload,
  getListingReviewDetail,
  acquireListingReviewLock,
  heartbeatListingReviewLock,
  releaseListingReviewLock,
  logDocumentView,
  submitListingDecision,
  LockBanner,
  DuplicateAddressBanner,
  ReviewDecisionModal,
} from "@/features/admin";
import { toast } from "sonner";

export default function AdminListingReviewDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const router = useRouter();
  const t = useTranslations("adminListingReviews");
  const tCommon = useTranslations("common");

  const [detail, setDetail] = useState<ListingReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "photos" | "legal" | "pricing" | "diff">("content");

  // Lock management
  const [isLockedByOther, setIsLockedByOther] = useState(false);
  const [lockedByName, setLockedByName] = useState<string | undefined>(undefined);
  const [lockedAtTime, setLockedAtTime] = useState<string | undefined>(undefined);
  const [isReleasing, setIsReleasing] = useState(false);

  // Decision Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<ListingDecisionType>("APPROVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox photo preview
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Document view logged notification
  const [viewedDocs, setViewedDocs] = useState<Record<string, boolean>>({});

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const AMENITY_LABELS: Record<string, { vi: string; en: string }> = {
    "amenity-wifi": { vi: "Wi-Fi tốc độ cao", en: "High-speed Wi-Fi" },
    "amenity-aircon": { vi: "Điều hoà 2 chiều", en: "Air Conditioning" },
    "amenity-tv": { vi: "Smart TV 55 inch", en: "55\" Smart TV" },
    "amenity-kitchen": { vi: "Bếp đầy đủ tiện nghi", en: "Fully Equipped Kitchen" },
    "amenity-parking": { vi: "Bãi đỗ xe miễn phí", en: "Free Parking" },
    "amenity-pool": { vi: "Bể bơi riêng biệt", en: "Private Pool" },
    "amenity-bbq": { vi: "Bếp nướng BBQ ngoài trời", en: "Outdoor BBQ Grill" },
    "amenity-washer": { vi: "Máy giặt sấy", en: "Washer & Dryer" },
    "amenity-workspace": { vi: "Bàn làm việc riêng", en: "Dedicated Workspace" },
  };

  const formatDocType = (docType: string, loc: string) => {
    if (loc === "en") {
      switch (docType) {
        case "OPERATING_LICENSE": return "Business Operation License";
        case "FIRE_SAFETY": return "Fire Safety Certificate";
        case "FOOD_SAFETY": return "Food Safety Certificate";
        default: return docType;
      }
    }
    switch (docType) {
      case "OPERATING_LICENSE": return "Giấy phép kinh doanh";
      case "FIRE_SAFETY": return "Chứng nhận PCCC";
      case "FOOD_SAFETY": return "Chứng nhận ATVSTP";
      default: return docType;
    }
  };

  const fetchDetailAndLock = async () => {
    setIsLoading(true);
    try {
      const data = await getListingReviewDetail(id, locale);
      setDetail(data);

      // Try acquiring lock
      try {
        const lockRes = await acquireListingReviewLock(id);
        setIsLockedByOther(false);
        setLockedByName(lockRes.lockedBy.adminName);
        setLockedAtTime(lockRes.lockedBy.lockedAt);
      } catch (lockErr: any) {
        if (lockErr.code === "LOCKED_BY_ANOTHER") {
          setIsLockedByOther(true);
          setLockedByName(data.lockedBy?.adminName);
          setLockedAtTime(data.lockedBy?.lockedAt);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load listing review details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailAndLock();

    // Setup heartbeat every 60 seconds
    heartbeatRef.current = setInterval(() => {
      heartbeatListingReviewLock(id);
    }, 60 * 1000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      // Auto release lock on unmount if we held it
      releaseListingReviewLock(id);
    };
  }, [id, locale]);

  const handleManualReleaseLock = async () => {
    setIsReleasing(true);
    try {
      await releaseListingReviewLock(id);
      toast.info(t("btnReleaseLock"));
      router.push(`/${locale}/admin/listing-reviews`);
    } finally {
      setIsReleasing(false);
    }
  };

  const handleViewDocument = async (docId: string, fileName: string) => {
    try {
      await logDocumentView(id, docId);
      setViewedDocs((prev) => ({ ...prev, [docId]: true }));
      toast.success(t("docViewLogged"));
    } catch (err: any) {
      toast.error(err.message || "Failed to log document access");
    }
  };

  const openDecisionModal = (type: ListingDecisionType) => {
    setDecisionType(type);
    setModalOpen(true);
  };

  const handleConfirmDecision = async (payload: ListingReviewDecisionPayload) => {
    setIsSubmitting(true);
    try {
      const res = await submitListingDecision(id, payload);
      toast.success(res.message);
      setModalOpen(false);

      if (res.nextListingId) {
        router.push(`/${locale}/admin/listing-reviews/${res.nextListingId}`);
      } else {
        router.push(`/${locale}/admin/listing-reviews`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminShell activeItem="listing-reviews">
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <span>{t("loadingDetail")}</span>
        </div>
      </AdminShell>
    );
  }

  if (!detail) {
    return (
      <AdminShell activeItem="listing-reviews">
        <div className="p-8 text-center space-y-4 text-xs text-[var(--color-text-secondary)]">
          <p>{t("notFoundTitle", { id })}</p>
          <Link
            href={`/${locale}/admin/listing-reviews`}
            className="text-[var(--color-primary)] hover:underline font-semibold"
          >
            {t("backToQueue")}
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      activeItem="listing-reviews"
      title={detail.title}
      description={`ID: #${detail.id} · Rev #${detail.revisionNo} · ${new Date(detail.submittedAt).toLocaleString(locale)}`}
    >
      <div className="space-y-6 pb-24">
        {/* Top Header Controls: Back button + Lock info + Preview */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${locale}/admin/listing-reviews`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("backToQueue")}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/rooms/${detail.id}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-xs font-semibold hover:bg-[var(--color-bg-subtle)] flex items-center gap-1.5 text-[var(--color-text-secondary)]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t("btnPreviewGuest")}</span>
            </Link>
          </div>
        </div>

        {/* Lock Banner (CMP-31) */}
        <LockBanner
          isLockedByOther={isLockedByOther}
          lockedByName={lockedByName}
          lockedAt={lockedAtTime}
          onReleaseLock={handleManualReleaseLock}
          isReleasing={isReleasing}
        />

        {/* Duplicate Address Warning Banner (BR-LST-06) */}
        {detail.duplicates.length > 0 && (
          <DuplicateAddressBanner alert={detail.duplicates[0]} locale={locale} />
        )}

        {/* Tab Controls */}
        <div className="border-b border-[var(--color-border-subtle)] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "content"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {t("tabContent")}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "photos"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {t("tabPhotos", { count: detail.photos.length })}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("legal")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "legal"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {t("tabLegal", { count: detail.legal.legalDocs.length })}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "pricing"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {t("tabPricing")}
          </button>

          <div
            className="px-4 py-2.5 text-xs font-semibold text-[var(--color-text-disabled)] cursor-not-allowed whitespace-nowrap flex items-center gap-1.5 opacity-60"
            title={t("tabDiffTooltip")}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t("tabDiffDisabled")}</span>
          </div>
        </div>

        {/* TAB 1: CONTENT & LOCATION */}
        {activeTab === "content" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            {/* Left Column: Property Specs, Description, Amenities, Rules */}
            <div className="lg:col-span-8 space-y-6">
              {/* Basic Overview Box */}
              <div className="bg-[var(--color-bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                  {t("overviewSpecs")}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--color-bg-subtle)]/50 space-y-1">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{t("propType")}</span>
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {detail.propertyType === "ENTIRE_PLACE" ? t("entirePlace") : t("privateRoom")}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-subtle)]/50 space-y-1">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{t("capacity")}</span>
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {t("maxGuestsLabel", { count: detail.maxGuests })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-subtle)]/50 space-y-1">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{t("bedroomsAndBeds")}</span>
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {t("bedroomsAndBedsValue", { bedrooms: detail.bedrooms, beds: detail.beds })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-subtle)]/50 space-y-1">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{t("bathroomsAndCheckIn")}</span>
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {t("bathroomsAndCheckInValue", { bathrooms: detail.bathrooms, checkIn: detail.checkInTime })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-xs text-[var(--color-text-secondary)]">
                    {t("descriptionLabel")}
                  </h4>
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line bg-[var(--color-bg-subtle)]/30 p-3.5 rounded-xl border border-[var(--color-border-subtle)]">
                    {detail.description}
                  </p>
                </div>
              </div>

              {/* Exact Location & GPS Coordinates (Admin View) */}
              <div className="bg-[var(--color-bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{t("locationTitle")}</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {t("adminFullAddressBadge")}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-bg-subtle)]/60 border border-[var(--color-border-subtle)] space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">
                      {t("exactAddress")}:
                    </span>
                    <strong className="text-sm text-[var(--color-text-primary)]">
                      {detail.location.exactAddress}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border-subtle)] text-[11px]">
                    <div>
                      <span className="text-[var(--color-text-tertiary)]">{t("latitudeLabel")} </span>
                      <span className="font-mono font-semibold">{detail.location.exactLat}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-tertiary)]">{t("longitudeLabel")} </span>
                      <span className="font-mono font-semibold">{detail.location.exactLng}</span>
                    </div>
                  </div>
                </div>

                {/* Mini Visual Map Placeholder */}
                <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 h-44 flex flex-col items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                  <MapPin className="w-7 h-7 text-[var(--color-primary)] animate-bounce" />
                  <span>{t("pinCoordinates", { lat: detail.location.exactLat, lng: detail.location.exactLng })}</span>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">
                    {t("publicRadiusNote")}
                  </span>
                </div>
              </div>

              {/* Amenities & House Rules */}
              <div className="bg-[var(--color-bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                  {t("amenitiesAndRules")}
                </h3>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    {t("amenities")} ({detail.amenityIds.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {detail.amenityIds.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2.5 py-1 rounded-lg text-xs bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] font-medium flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{AMENITY_LABELS[amenity]?.[locale === "en" ? "en" : "vi"] || amenity.replace("amenity-", "").toUpperCase()}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] space-y-2 text-xs">
                  <span className="font-semibold text-[var(--color-text-secondary)]">
                    {t("houseRules")}:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)]/40 flex items-center gap-2">
                      <span>{t("smokingRule")}</span>
                      <strong className={detail.houseRules.smoking ? "text-amber-600" : "text-emerald-600"}>
                        {detail.houseRules.smoking ? t("allowed") : t("notAllowed")}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)]/40 flex items-center gap-2">
                      <span>{t("petsRule")}</span>
                      <strong className={detail.houseRules.pets ? "text-emerald-600" : "text-zinc-600"}>
                        {detail.houseRules.pets ? t("allowed") : t("notAllowed")}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)]/40 flex items-center gap-2">
                      <span>{t("partiesRule")}</span>
                      <strong className={detail.houseRules.parties ? "text-amber-600" : "text-zinc-600"}>
                        {detail.houseRules.parties ? t("allowed") : t("notAllowed")}
                      </strong>
                    </div>
                  </div>
                  {detail.houseRules.quietHoursEnabled && (
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">
                      ⏰ {t("quietHoursLabel", { from: detail.houseRules.quietHoursFrom || "22:00", to: detail.houseRules.quietHoursTo || "07:00" })}
                    </p>
                  )}
                  {detail.houseRules.notes && (
                    <p className="text-[11px] italic text-[var(--color-text-secondary)]">
                      {t("rulesNotesLabel")} "{detail.houseRules.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Host Card & Checklist Quick Status */}
            <div className="lg:col-span-4 space-y-6">
              {/* Host Card */}
              <div className="bg-[var(--color-bg-surface)] p-5 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    {t("hostInfo")}
                  </h4>
                  {detail.host.identityStatus === "VERIFIED" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{t("hostVerified")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      <ShieldAlert className="w-3 h-3" />
                      <span>{t("hostUnverified")}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {detail.host.avatarUrl ? (
                    <img
                      src={detail.host.avatarUrl}
                      alt={detail.host.fullName}
                      className="w-12 h-12 rounded-full object-cover shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5 text-xs">
                    <p className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                      {detail.host.fullName}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                      {detail.host.email}
                    </p>
                    {detail.host.phone && (
                      <p className="text-[11px] text-[var(--color-text-tertiary)]">
                        {detail.host.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)] space-y-1">
                  <p>{t("ownedListings", { count: detail.host.listingCount })}</p>
                  <p>{t("joinedDate", { date: new Date(detail.host.joinedAt).toLocaleDateString(locale) })}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PHOTOS GALLERY */}
        {activeTab === "photos" && (
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                  {t("photoGalleryTitle", { count: detail.photos.length })}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {t("photoGallerySubtitle")}
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                detail.photos.length >= 5
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}>
                {detail.photos.length >= 5 ? t("photoStandardPass") : t("photoStandardFail")}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {detail.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setPreviewPhotoUrl(photo.url)}
                  className="group relative rounded-xl overflow-hidden border border-[var(--color-border-subtle)] aspect-4/3 bg-[var(--color-bg-subtle)] cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-primary)] text-white shadow-xs">
                      {t("coverPhotoBadge")}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 rounded-full bg-white/90 text-zinc-900">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                  {photo.caption && (
                    <p className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] text-white truncate">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Lightbox Modal */}
            {previewPhotoUrl && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
                onClick={() => setPreviewPhotoUrl(null)}
              >
                <div className="relative max-w-4xl max-h-[85vh]">
                  <img
                    src={previewPhotoUrl}
                    alt="Preview"
                    className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewPhotoUrl(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEGAL DOCUMENTS */}
        {activeTab === "legal" && (
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                  {t("legalDocsTitle", { count: detail.legal.legalDocs.length })}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {t("legalDocsSubtitle")}
                </p>
              </div>

              {detail.legal.legalRegistrationNumber && (
                <div className="text-right text-xs">
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">{t("businessRegNumber")}</span>
                  <p className="font-mono font-bold text-[var(--color-text-primary)]">
                    {detail.legal.legalRegistrationNumber}
                  </p>
                </div>
              )}
            </div>

            {detail.legal.legalDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200">
                <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                <p className="font-semibold">{t("noLegalDocs")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detail.legal.legalDocs.map((doc) => {
                  const hasViewed = viewedDocs[doc.id];
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold text-[var(--color-text-primary)] truncate" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-tertiary)]">
                            {formatDocType(doc.docType, locale)} · {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDocument(doc.id, doc.fileName)}
                        className="text-xs px-3 py-1 font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t("btnViewDoc")}</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRICING & POLICIES */}
        {activeTab === "pricing" && (
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-6 animate-in fade-in">
            <h3 className="font-bold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
              {t("pricingConfigTitle")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Pricing breakdown */}
              <div className="p-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 space-y-3">
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                  {t("pricingStructure")}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{t("pricingBase")}:</span>
                    <strong className="text-[var(--color-text-primary)]">
                      {detail.pricing.baseNightlyPrice.toLocaleString()} {detail.pricing.currency}
                    </strong>
                  </div>
                  {detail.pricing.weekendNightlyPrice && (
                    <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                      <span className="text-[var(--color-text-secondary)]">{t("pricingWeekend")}:</span>
                      <strong className="text-[var(--color-text-primary)]">
                        {detail.pricing.weekendNightlyPrice.toLocaleString()} {detail.pricing.currency}
                      </strong>
                    </div>
                  )}
                  {detail.pricing.cleaningFee && (
                    <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                      <span className="text-[var(--color-text-secondary)]">{t("cleaningFee")}:</span>
                      <strong>
                        {detail.pricing.cleaningFee.toLocaleString()} {detail.pricing.currency}
                      </strong>
                    </div>
                  )}
                  {detail.pricing.weeklyDiscountPct && (
                    <div className="flex justify-between py-1 text-emerald-600">
                      <span>{t("weeklyDiscount")}</span>
                      <strong>-{detail.pricing.weeklyDiscountPct}%</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Policies & Mode */}
              <div className="p-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 space-y-4">
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                  {t("policiesAndMode")}
                </h4>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">
                      {t("cancellationPolicy")}:
                    </span>
                    <strong className="text-sm text-[var(--color-primary)]">
                      {detail.policy.cancellationPolicy === "FLEXIBLE"
                        ? t("cancelPolicyFlexible")
                        : detail.policy.cancellationPolicy === "MODERATE"
                        ? t("cancelPolicyModerate")
                        : t("cancelPolicyStrict")}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] block">
                      {t("bookingMode")}:
                    </span>
                    <strong className="text-sm text-[var(--color-text-primary)]">
                      {detail.policy.bookingMode === "INSTANT"
                        ? t("bookingModeInstant")
                        : t("bookingModeRequest")}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DECISION ACTION BAR (Sticky Bottom) */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-t border-[var(--color-border-subtle)] py-3 px-4 sm:px-8 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[var(--color-text-primary)]">
                {t("decisionLabel")}
              </span>
              {detail.status === "APPROVED" && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  ✓ {t("statusApprovedBadge")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Reject */}
              <Button
                type="button"
                variant="secondary"
                disabled={isLockedByOther}
                onClick={() => openDecisionModal("REJECT")}
                className="text-xs px-4 py-2 text-rose-700 hover:bg-rose-50 border-rose-200 font-semibold cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                <span>{t("btnReject")}</span>
              </Button>

              {/* Request Changes */}
              <Button
                type="button"
                variant="secondary"
                disabled={isLockedByOther}
                onClick={() => openDecisionModal("NEEDS_CHANGES")}
                className="text-xs px-4 py-2 text-orange-700 hover:bg-orange-50 border-orange-200 font-semibold cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                <span>{t("btnRequestChanges")}</span>
              </Button>

              {/* Approve */}
              <Button
                type="button"
                disabled={isLockedByOther}
                onClick={() => openDecisionModal("APPROVE")}
                className="text-xs px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>{t("btnApprove")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Decision */}
        <ReviewDecisionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          decisionType={decisionType}
          listingTitle={detail.title}
          hasDuplicateAlert={detail.duplicates.length > 0}
          onConfirm={handleConfirmDecision}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminShell>
  );
}
