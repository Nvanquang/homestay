"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Sparkles, SunMedium, Maximize2, ShieldCheck } from "lucide-react";
import { ListingPhotoItem } from "../types";
import { SortablePhotoGrid } from "./SortablePhotoGrid";

export interface Step3PhotosProps {
  photos: ListingPhotoItem[];
  onUpload: (files: FileList | File[]) => void;
  onReorder: (newPhotos: ListingPhotoItem[]) => void;
  onDeletePhoto: (photoId: string) => void;
  onUpdateCaption?: (photoId: string, caption: string) => void;
  onAddSamplePhotos?: () => void;
  disabled?: boolean;
}

export function Step3Photos({
  photos,
  onUpload,
  onReorder,
  onDeletePhoto,
  onUpdateCaption,
  onAddSamplePhotos,
  disabled = false,
}: Step3PhotosProps) {
  const t = useTranslations("listingWizard");

  return (
    <div data-testid="step3-photos-form" className="space-y-6">
      {/* Photography Tips Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t("photoTipsTitle")}</span>
          </div>

          {onAddSamplePhotos && photos.length === 0 && (
            <button
              type="button"
              onClick={onAddSamplePhotos}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer"
            >
              {t("addSamplePhotos")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-amber-800/90 dark:text-amber-300/80">
          <div className="flex items-center gap-1.5">
            <SunMedium className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{t("photoTip1")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{t("photoTip2")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{t("photoTip3")}</span>
          </div>
        </div>
      </div>

      {/* Main Sortable & Upload Grid */}
      <SortablePhotoGrid
        photos={photos}
        onUpload={onUpload}
        onReorder={onReorder}
        onDeletePhoto={onDeletePhoto}
        onUpdateCaption={onUpdateCaption}
        minRequired={5}
        maxAllowed={30}
      />
    </div>
  );
}
