"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Grid, X, ChevronLeft, ChevronRight, Share2, Heart, Check } from "lucide-react";
import { ListingDetailPhoto } from "../types";

interface GalleryLightboxProps {
  photos: ListingDetailPhoto[];
  title: string;
}

export function GalleryLightbox({ photos, title }: GalleryLightboxProps) {
  const t = useTranslations("listingDetail.gallery");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowLeft") {
        setActiveIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, photos.length]);

  const mainPhoto = photos[0] || {
    id: "default",
    url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    order: 1,
  };
  const secondaryPhotos = photos.slice(1, 5);

  return (
    <>
      {/* Desktop 1+4 Grid Layout */}
      <div className="relative rounded-3xl overflow-hidden aspect-16/10 sm:aspect-2/1 w-full bg-gray-100 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
          {/* Main Large Photo (col-span-2) */}
          <div
            onClick={() => {
              setActiveIdx(0);
              setIsOpen(true);
            }}
            className="md:col-span-2 h-full relative group cursor-pointer overflow-hidden"
          >
            <img
              src={mainPhoto.url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* 4 Smaller Photos (2 columns of 2) */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
            {secondaryPhotos.map((photo, i) => (
              <div
                key={photo.id || i}
                onClick={() => {
                  setActiveIdx(i + 1);
                  setIsOpen(true);
                }}
                className="relative group cursor-pointer overflow-hidden h-full"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `${title} photo ${i + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* View All Photos Button */}
        <button
          type="button"
          onClick={() => {
            setActiveIdx(0);
            setIsOpen(true);
          }}
          className="absolute bottom-4 right-4 z-10 px-4 py-2.5 rounded-xl bg-white/95 dark:bg-gray-900/90 text-gray-900 dark:text-white text-xs font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700 backdrop-blur-xs cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{t("showAllPhotosBtn", { count: photos.length })}</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t("lightboxTitle")}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white shrink-0 pb-4">
            <span className="text-sm font-semibold tracking-wide">
              {activeIdx + 1} / {photos.length}
            </span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Image Viewport */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-auto">
            <img
              src={photos[activeIdx]?.url}
              alt={photos[activeIdx]?.caption || title}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
            />

            {/* Prev / Next Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) =>
                      prev === 0 ? photos.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) =>
                      prev === photos.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Caption footer */}
          <div className="text-center text-white/80 text-xs sm:text-sm py-2 shrink-0">
            {photos[activeIdx]?.caption || title}
          </div>
        </div>
      )}
    </>
  );
}
