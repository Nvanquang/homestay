"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/layouts/public-shell";
import {
  GalleryLightbox,
  HostCard,
  AmenitiesModal,
  PolicyTimeline,
  LocationSection,
  StickyBookingBox,
  getListingDetail,
  ListingDetailDTO,
} from "@/features/listing-detail";
import {
  Share2,
  Heart,
  ArrowLeft,
  Star,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  const t = useTranslations("listingDetail");
  const router = useRouter();
  const searchParams = useSearchParams();

  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults = Number(searchParams.get("adults")) || 1;
  const childrenCount = Number(searchParams.get("children")) || 0;

  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    getListingDetail(id, locale).then((data) => {
      if (active) {
        setListing(data);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [id, locale]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success(t("linkCopiedToast"));
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(
      isFavorite ? t("removedFromWishlistToast") : t("addedToWishlistToast")
    );
  };

  if (isLoading) {
    return (
      <PublicShell activeBottomTab="explore">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {t("loadingListing")}
            </span>
          </div>
        </div>
      </PublicShell>
    );
  }

  if (!listing) {
    return (
      <PublicShell activeBottomTab="explore">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {t("notFoundTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
            {t("notFoundSubtitle")}
          </p>
          <Link
            href={`/${locale}/search`}
            className="inline-block mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-md"
          >
            {t("browseOtherStaysBtn")}
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell activeBottomTab="explore">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Navigation & Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("backBtn")}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-gray-900 text-xs font-bold text-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isCopied ? t("copied") : t("shareBtn")}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                isFavorite
                  ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                  : "border-gray-300 dark:border-gray-600 text-[var(--color-text-primary)] hover:border-gray-900"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorite ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span>{t("saveBtn")}</span>
            </button>
          </div>
        </div>

        {/* Title & Location Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {listing.title}
          </h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold">{listing.areaLabel}</span>
            <span>·</span>
            <div className="flex items-center gap-1 font-bold text-[var(--color-text-primary)]">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{listing.ratingScore.toFixed(2)}</span>
              <span className="text-[var(--color-text-tertiary)] font-normal">
                ({listing.reviewCount} {t("reviews")})
              </span>
            </div>
          </div>
        </div>

        {/* Gallery Grid & Lightbox (CMP-26) */}
        <GalleryLightbox photos={listing.photos} title={listing.title} />

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
          {/* Left Column: Room Specs, Host, Description, Amenities, Rules, Location */}
          <div className="lg:col-span-7 space-y-6">
            {/* Specs Overview */}
            <div className="pb-4">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {listing.propertyType === "ENTIRE_PLACE"
                  ? t("entirePlaceTitle")
                  : t("privateRoomTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
                {t("capacitySummary", {
                  guests: listing.maxGuests,
                  bedrooms: listing.bedrooms,
                  beds: listing.beds,
                  bathrooms: listing.bathrooms,
                })}
              </p>
            </div>

            {/* HostCard (CMP-33) */}
            <HostCard host={listing.host} />

            {/* Highlights */}
            <div className="py-4 border-b border-[var(--color-border-subtle)] space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                    {t("highlightSelfCheckin")}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t("highlightSelfCheckinDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                    {t("highlightCleanliness")}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {t("highlightCleanlinessDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-4 border-b border-[var(--color-border-subtle)] space-y-3">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t("descriptionTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities Modal (CMP-29) */}
            <AmenitiesModal amenities={listing.amenities} />

            {/* Stay Rules & Hours */}
            <div className="py-4 border-b border-[var(--color-border-subtle)] space-y-3">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t("houseRulesTitle")}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{t("checkinTime", { time: listing.checkInTime })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{t("checkoutTime", { time: listing.checkOutTime })}</span>
                </div>
              </div>
              <ul className="space-y-1.5 pt-2 text-xs text-[var(--color-text-secondary)] list-disc pl-5">
                {listing.houseRules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Cancellation Policy (CMP-27) */}
            <PolicyTimeline policy={listing.cancellationPolicy} listingId={listing.id} />

            {/* Location (Privacy Circle BR-SRC-04) */}
            <LocationSection publicArea={listing.publicArea} />

            {/* Reviews Section (Phase 1 placeholder) */}
            <div className="py-6 space-y-2">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t("reviewsTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                {t("noReviewsYetPhase1")}
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Booking Box (CMP-22) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <StickyBookingBox
              listing={listing}
              initialCheckin={checkin}
              initialCheckout={checkout}
              initialAdults={adults}
              initialChildren={childrenCount}
            />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
