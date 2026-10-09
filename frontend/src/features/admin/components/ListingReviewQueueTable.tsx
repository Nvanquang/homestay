"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Building,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  ListingReviewQueueItem,
  ListingReviewQueueFilter,
  ListingReviewStatus,
} from "../types";
import { getListingReviewQueue } from "../api/mock-listing-reviews";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export interface ListingReviewQueueTableProps {
  locale: string;
}

export function ListingReviewQueueTable({ locale }: ListingReviewQueueTableProps) {
  const t = useTranslations("adminListingReviews");

  const [items, setItems] = useState<ListingReviewQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("ALL");
  const [flag, setFlag] = useState<"ALL" | "DUPLICATE_ONLY" | "CLEAN_ONLY">("ALL");
  const [status, setStatus] = useState<ListingReviewStatus | "ALL">("PENDING_REVIEW");
  const [onlyMine, setOnlyMine] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getListingReviewQueue(
        {
          query,
          region,
          flag,
          status,
          onlyMine,
          page,
          pageSize: 10,
        },
        locale
      );
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, region, flag, status, onlyMine, locale]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-[var(--color-bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-subtle)] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Region */}
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] cursor-pointer"
            >
              <option value="ALL">{t("filterAllRegions")}</option>
              <option value="Lâm Đồng">Lâm Đồng (Đà Lạt)</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Lào Cai">Lào Cai (Sa Pa)</option>
            </select>

            {/* Filter Duplicate Flag */}
            <select
              value={flag}
              onChange={(e) => {
                setFlag(e.target.value as any);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] cursor-pointer"
            >
              <option value="ALL">{t("filterAllAddresses")}</option>
              <option value="DUPLICATE_ONLY">{t("filterDuplicateOnly")}</option>
              <option value="CLEAN_ONLY">{t("filterCleanOnly")}</option>
            </select>

            {/* Filter Status */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] cursor-pointer"
            >
              <option value="ALL">{t("filterAllStatus")}</option>
              <option value="PENDING_REVIEW">{t("statusPending")}</option>
              <option value="APPROVED">{t("statusApproved")}</option>
              <option value="NEEDS_CHANGES">{t("statusNeedsChanges")}</option>
              <option value="REJECTED">{t("statusRejected")}</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 cursor-pointer"
            >
              {t("filterAction")}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--color-border-subtle)]">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => {
                setOnlyMine(e.target.checked);
                setPage(1);
              }}
              className="rounded border-[var(--color-border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span>{t("filterOnlyMine")}</span>
          </label>

          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            {t("totalListings", { count: total })}
          </span>
        </div>
      </div>

      {/* DataTable (CMP-24) */}
      <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-subtle)] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
            <span>{t("loadingQueue")}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center space-y-2 text-xs text-[var(--color-text-secondary)]">
            <Building2 className="w-10 h-10 mx-auto text-[var(--color-text-tertiary)] opacity-60" />
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">
              {t("emptyQueue")}
            </p>
            <p className="text-[11px]">
              {t("emptyQueueFilter")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-subtle)]/70 text-[var(--color-text-tertiary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--color-border-subtle)]">
                  <th className="py-3 px-4">{t("thListing")}</th>
                  <th className="py-3 px-4">{t("thHost")}</th>
                  <th className="py-3 px-4">{t("thRegion")}</th>
                  <th className="py-3 px-4">{t("thSubmittedAt")}</th>
                  <th className="py-3 px-4 text-center">{t("thRevision")}</th>
                  <th className="py-3 px-4">{t("thStatus")}</th>
                  <th className="py-3 px-4 text-right">{t("thActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {items.map((item) => {
                  const isLockedByOther =
                    item.lockedBy && item.lockedBy.adminId !== "adm-001";
                  const isLockedByMe =
                    item.lockedBy && item.lockedBy.adminId === "adm-001";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--color-bg-subtle)]/50 transition-colors"
                    >
                      {/* Column 1: Listing */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          {item.coverPhotoUrl ? (
                            <img
                              src={item.coverPhotoUrl}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-subtle)] flex items-center justify-center shrink-0">
                              <Building className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                            </div>
                          )}
                          <div className="min-w-0 space-y-0.5">
                            <Link
                              href={`/${locale}/admin/listing-reviews/${item.id}`}
                              className="font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors truncate block max-w-[200px]"
                              title={item.title}
                            >
                              {item.title}
                            </Link>
                            <p className="text-[11px] text-[var(--color-text-tertiary)]">
                              ID: #{item.id} · {item.propertyType === "ENTIRE_PLACE" ? t("entirePlace") : t("privateRoom")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Host */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[var(--color-text-primary)]">
                            {item.hostName}
                          </p>
                          {item.hostVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{t("hostVerified")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                              <span>{t("hostUnverified")}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Region & Address */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[var(--color-text-primary)] truncate">
                            {item.regionName} ({item.districtName})
                          </p>
                          <p className="text-[11px] text-[var(--color-text-tertiary)] truncate" title={item.exactAddress}>
                            {item.exactAddress}
                          </p>
                          {item.flagDuplicateAddress && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{t("duplicateBadge")}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Submitted At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-[var(--color-text-secondary)]">
                        <div className="space-y-0.5">
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {new Date(item.submittedAt).toLocaleDateString(locale)}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-tertiary)]">
                            {new Date(item.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </td>

                      {/* Column 5: Revision No */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] text-[11px] font-bold text-[var(--color-text-secondary)]">
                          #{item.revisionNo}
                        </span>
                      </td>

                      {/* Column 6: Status & Lock */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {item.status === "PENDING_REVIEW" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              <span>{t("statusPendingBadge")}</span>
                            </span>
                          )}
                          {item.status === "APPROVED" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t("statusApprovedBadge")}</span>
                            </span>
                          )}
                          {item.status === "NEEDS_CHANGES" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{t("statusNeedsChangesBadge")}</span>
                            </span>
                          )}
                          {item.status === "REJECTED" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1 w-fit">
                              <span>{t("statusRejectedBadge")}</span>
                            </span>
                          )}

                          {isLockedByOther && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{item.lockedBy?.adminName}</span>
                            </span>
                          )}
                          {isLockedByMe && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>{t("holdingLockBadge")}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/${locale}/admin/listing-reviews/${item.id}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isLockedByOther
                              ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)]"
                              : isLockedByMe
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                              : "bg-[var(--color-primary)] hover:opacity-90 text-white shadow-2xs"
                          }`}
                        >
                          <span>
                            {isLockedByOther
                              ? t("btnViewOnly")
                              : isLockedByMe
                              ? t("btnContinueReview")
                              : t("btnReviewNow")}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {t("prevPage")}
            </Button>
            <span className="text-[var(--color-text-secondary)]">
              {t("pageIndicator", { page, total: totalPages })}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("nextPage")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
