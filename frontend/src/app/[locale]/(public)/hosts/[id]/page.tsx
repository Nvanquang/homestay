"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/layouts/public-shell";
import { ListingCard } from "@/features/search";
import {
  getHostPublicProfile,
  getListingDetail,
  HostPublicProfile,
} from "@/features/listing-detail";
import { ListingCardDTO } from "@/features/search/types";
import {
  ShieldCheck,
  Calendar,
  Home,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Share2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function HostProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  const t = useTranslations("hostProfile");
  const router = useRouter();

  const [host, setHost] = useState<HostPublicProfile | null>(null);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    getHostPublicProfile(id).then((profile) => {
      if (active) {
        setHost(profile);

        // Fetch sample active listings for this host
        const sampleHostListings: ListingCardDTO[] = [
          {
            id: "lst-dl-01",
            title: "Mây Lang Thang Homestay - View Đồi Thông Bạt Ngàn",
            propertyType: "ENTIRE_PLACE",
            areaLabel: "Phường 3, Đà Lạt",
            photos: [
              "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80",
            ],
            maxGuests: 4,
            bedrooms: 2,
            beds: 2,
            bathrooms: 2,
            bookingMode: "INSTANT",
            cancellationPolicy: "FLEXIBLE",
            amenities: ["wifi", "kitchen", "parking", "bbq"],
            price: {
              mode: "FROM_NIGHTLY",
              nightlyAvg: 1250000,
              includesFeesAndTaxes: true,
            },
            map: { lat: 11.9365, lng: 108.4412 },
            rating: 4.92,
            reviewCount: 84,
            isSuperhost: true,
          },
          {
            id: "lst-dl-04",
            title: "Tiệm Cà Phê & Homestay Túi Mơ To - View Thung Lũng Đèn",
            propertyType: "PRIVATE_ROOM",
            areaLabel: "Phường 11, Đà Lạt",
            photos: [
              "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
            ],
            maxGuests: 2,
            bedrooms: 1,
            beds: 1,
            bathrooms: 1,
            bookingMode: "INSTANT",
            cancellationPolicy: "FLEXIBLE",
            amenities: ["wifi", "garden"],
            price: {
              mode: "FROM_NIGHTLY",
              nightlyAvg: 850000,
              includesFeesAndTaxes: true,
            },
            map: { lat: 11.9567, lng: 108.4812 },
            rating: 4.91,
            reviewCount: 204,
            isSuperhost: true,
          },
        ];
        setListings(sampleHostListings);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success(t("linkCopiedToast"));
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <PublicShell activeBottomTab="explore">
        <div className="max-w-[1280px] mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicShell>
    );
  }

  if (!host) {
    return (
      <PublicShell activeBottomTab="explore">
        <div className="max-w-[1280px] mx-auto px-4 py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">{t("notFoundTitle")}</h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full bg-primary text-white text-xs font-bold"
          >
            {t("goBackBtn")}
          </button>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell activeBottomTab="explore">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Back & Share */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("backBtn")}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold text-[var(--color-text-primary)] hover:border-gray-900 transition-all cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>{isCopied ? t("copied") : t("shareBtn")}</span>
          </button>
        </div>

        {/* Host Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-[var(--color-border-subtle)] p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <img
              src={host.avatarUrl}
              alt={host.displayName}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-primary/20 shadow-lg"
            />
            {host.verified && (
              <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-primary text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                {host.displayName}
              </h1>
              {host.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full self-center sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t("identityVerified")}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              {t("joinedDate", { date: host.joinedAt })} · {t("activeListingsCount", { count: host.activeListingCount })}
            </p>

            {host.bio && (
              <p className="text-xs sm:text-sm text-[var(--color-text-primary)] leading-relaxed pt-2">
                {host.bio}
              </p>
            )}
          </div>
        </div>

        {/* Host Listings Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {t("listingsByHostTitle", { name: host.displayName, count: listings.length })}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
