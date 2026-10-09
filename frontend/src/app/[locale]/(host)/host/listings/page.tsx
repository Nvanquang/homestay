"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  Building2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { HostShell } from "@/components/layouts/host-shell";
import { Button } from "@/components/ui/button";
import {
  getHostListings,
  deleteDraftListing,
  ListingItem,
  ListingStatus,
} from "@/features/listing-editor";
import { ListingCardHost } from "@/features/listing-editor/components/ListingCardHost";
import { getHostVerification, IdentityVerificationRecord } from "@/features/verification";
import { toast } from "sonner";

export default function HostListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const router = useRouter();
  const t = useTranslations("hostListings");

  const [listings, setListings] = useState<ListingItem[]>([]);
  const [verification, setVerification] = useState<IdentityVerificationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const isVerifiedHost = verification?.status === "APPROVED";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [listingsRes, verifyRes] = await Promise.all([
        getHostListings({
          status: statusFilter,
          query: searchQuery,
        }),
        getHostVerification(),
      ]);
      setListings(listingsRes.items);
      setVerification(verifyRes);
    } catch {
      toast.error(t("loading"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await deleteDraftListing(id);
      toast.success(t("deleteSuccess"));
      loadData();
    } catch (err: any) {
      toast.error(err?.message || t("deleteDraft"));
    }
  };

  const handleCreateClick = () => {
    if (!isVerifiedHost) {
      setShowVerifyModal(true);
    } else {
      router.push(`/${locale}/host/listings/new`);
    }
  };

  const filterTabs = [
    { id: "ALL" as const, label: t("filterAll") },
    { id: "PUBLISHED" as const, label: t("filterPublished") },
    { id: "DRAFT" as const, label: t("filterDraft") },
    { id: "PENDING_APPROVAL" as const, label: t("filterPending") },
    { id: "REJECTED" as const, label: t("filterRejected") },
  ];

  return (
    <HostShell
      activeItem="listings"
      title={t("title")}
      breadcrumbs={[
        { label: t("breadcrumbRoot"), href: `/${locale}/host/listings` },
        { label: t("title") },
      ]}
      actionButton={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={handleCreateClick}
            className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t("createListing")}</span>
          </Button>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Verification Status Banner if not approved */}
        {!isVerifiedHost && (
          <div
            data-testid="host-verification-banner"
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                  {verification?.status === "PENDING"
                    ? t("pendingVerifyBannerTitle")
                    : t("unverifiedBannerTitle")}
                </h4>
                <p className="text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  {t("verificationBannerDesc")}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/account/verification`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shrink-0 shadow-2xs transition-colors"
            >
              <span>{t("viewVerification")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Toolbar: Search & Filter Tabs */}
        <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-[var(--color-border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[var(--color-primary)] text-white shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar & Reload Action */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1 md:w-64"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </form>

            <button
              type="button"
              onClick={() => loadData()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60 shrink-0"
              title={t("refresh")}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-300 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{t("refresh")}</span>
            </button>
          </div>
        </div>

        {/* Listings List */}
        {isLoading ? (
          <div className="py-16 text-center text-[var(--color-text-secondary)] flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
            <p className="text-sm">{t("loading")}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-center flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              {searchQuery || statusFilter !== "ALL"
                ? t("emptyFilteredTitle")
                : t("emptyTitle")}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-md">
              {searchQuery || statusFilter !== "ALL"
                ? t("emptyFilteredDesc")
                : isVerifiedHost
                ? t("emptyDesc")
                : t("verificationBannerDesc")}
            </p>
            {isVerifiedHost ? (
              <Button
                variant="primary"
                onClick={() => router.push(`/${locale}/host/listings/new`)}
                className="mt-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t("createFirstListing")}
              </Button>
            ) : (
              <Link
                href={`/${locale}/account/verification`}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <ShieldCheck className="w-4 h-4 mr-1" />
                {t("goToVerification")}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {listings.map((item) => (
              <ListingCardHost
                key={item.id}
                listing={item}
                locale={locale}
                onDeleteDraft={handleDeleteDraft}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Block: Host Not Verified Alert */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t("verifyModalTitle")}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                {t("verifyModalDesc")}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowVerifyModal(false)}
                className="text-xs"
              >
                {t("later")}
              </Button>
              <Link
                href={`/${locale}/account/verification`}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                {t("verifyNow")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </HostShell>
  );
}
