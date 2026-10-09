"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  AlertCircle,
  Home,
  CheckCircle,
  Clock,
  ArrowRight,
  Lock,
} from "lucide-react";
import { ListingItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface ListingCardHostProps {
  listing: ListingItem;
  locale: string;
  onDeleteDraft?: (id: string) => void;
  className?: string;
}

export function ListingCardHost({
  listing,
  locale,
  onDeleteDraft,
  className = "",
}: ListingCardHostProps) {
  const t = useTranslations("hostListings");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const {
    id,
    status,
    basicInfo,
    location,
    coverPhotoUrl,
    draftProgress,
    updatedAt,
    capabilities,
    rejectionReason,
  } = listing;

  const isDraft = status === "DRAFT";
  const progressPercent = Math.round(
    ((draftProgress?.completedSteps || 0) / (draftProgress?.totalSteps || 8)) * 100
  );

  const resumeStep = draftProgress?.resumeStep || "basic";
  const editUrl = `/${locale}/host/listings/${id}/edit/${resumeStep}`;

  const getStatusBadge = () => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{t("publishedBadge")}</span>
          </Badge>
        );
      case "PENDING_APPROVAL":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="w-3 h-3" />
            <span>{t("pendingBadge")}</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="error" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{t("rejectedBadge")}</span>
          </Badge>
        );
      case "UNLISTED":
        return <Badge variant="neutral">{t("unlistedBadge")}</Badge>;
      case "DRAFT":
      default:
        return (
          <Badge variant="info">
            {t("draftProgress", { completed: draftProgress?.completedSteps || 0 })}
          </Badge>
        );
    }
  };

  const formattedDate = new Date(updatedAt).toLocaleDateString(
    locale === "vi" ? "vi-VN" : "en-US",
    {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }
  );

  return (
    <>
      <div
        data-testid={`listing-card-${id}`}
        className={`bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] p-4 hover:shadow-md transition-shadow relative flex flex-col md:flex-row gap-4 ${className}`}
      >
        {/* Thumbnail / Cover */}
        <div className="w-full md:w-48 h-36 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative">
          {coverPhotoUrl ? (
            <img
              src={coverPhotoUrl}
              alt={basicInfo.title || t("unnamed")}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-tertiary)] gap-1">
              <Home className="w-8 h-8 opacity-40" />
              <span className="text-[11px]">{t("noPhotos")}</span>
            </div>
          )}
          <div className="absolute top-2 left-2 md:hidden">
            {getStatusBadge()}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="hidden md:block mb-1.5">{getStatusBadge()}</div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate">
                  {basicInfo.title || t("unnamed")}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {location.district ? `${location.district}, ` : ""}
                  {location.province || "---"} ·{" "}
                  {basicInfo.propertyType === "ENTIRE_PLACE"
                    ? t("entirePlace")
                    : t("privateRoom")}{" "}
                  · {t("maxGuests", { count: basicInfo.maxGuests })}
                </p>
              </div>

              {/* Action Menu ⋮ */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label={t("actions")}
                  title={t("actions")}
                  className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
                >
                  <MoreVertical className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                </button>

                {isMenuOpen && (
                  <div
                    onMouseLeave={() => setIsMenuOpen(false)}
                    className="absolute right-0 top-8 w-48 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-lg py-1.5 z-20 text-xs animate-in fade-in zoom-in-95"
                  >
                    {capabilities.canEdit && (
                      <Link
                        href={editUrl}
                        className="flex items-center gap-2 px-3 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{t("editInfo")}</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={!capabilities.canPreview}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed text-left cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t("previewListing")}</span>
                    </button>

                    <div className="my-1 border-t border-[var(--color-border-subtle)]" />

                    <div className="px-3 py-1.5 text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>{t("futureFeatures")}</span>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-between px-3 py-1.5 text-[var(--color-text-tertiary)] opacity-60 cursor-not-allowed text-left"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t("calendarLocked")}</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-between px-3 py-1.5 text-[var(--color-text-tertiary)] opacity-60 cursor-not-allowed text-left"
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{t("pricingLocked")}</span>
                      </span>
                    </button>

                    {capabilities.canDelete && (
                      <>
                        <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsConfirmDeleteOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t("deleteDraft")}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rejection notice if any */}
            {rejectionReason && status === "REJECTED" && (
              <div className="mt-2 p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t("rejectionReason", { reason: rejectionReason })}</span>
              </div>
            )}
          </div>

          {/* Bottom row: Progress & CTA */}
          <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {t("updatedAt", { date: formattedDate })}
            </span>

            {isDraft ? (
              <div className="flex items-center gap-3">
                <div className="w-28 h-2 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-[var(--color-primary)] rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <Link
                  href={editUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <span>{t("continueEditing")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <Link
                href={`/${locale}/host/listings/${id}/edit/basic`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t("editListing")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Delete Draft Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          if (onDeleteDraft) {
            onDeleteDraft(id);
          }
        }}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDesc", {
          title: basicInfo.title || t("unnamed"),
        })}
        confirmLabel={t("deleteDraft")}
        cancelLabel={t("keepDraft")}
        isDanger={true}
      />
    </>
  );
}
