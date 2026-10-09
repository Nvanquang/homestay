"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldAlert, Maximize2, X, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export interface SecureImageViewerProps {
  documentId: string;
  documentTitle: string;
  adminName: string;
  onFetchSecureUrl: (docId: string) => Promise<string>;
  initialBlurred?: boolean;
}

export function SecureImageViewer({
  documentId,
  documentTitle,
  adminName,
  onFetchSecureUrl,
  initialBlurred = true,
}: SecureImageViewerProps) {
  const t = useTranslations("verification.secureViewer");
  const [isRevealed, setIsRevealed] = useState(!initialBlurred);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watermarkTime, setWatermarkTime] = useState("");

  const handleRevealImage = async () => {
    setIsLoading(true);
    try {
      const url = await onFetchSecureUrl(documentId);
      setImageUrl(url);
      setIsRevealed(true);
      setWatermarkTime(new Date().toLocaleTimeString("vi-VN"));
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động che mờ lại sau 120 giây (bảo mật hết hạn URL)
  useEffect(() => {
    if (!isRevealed) return;
    const timer = setTimeout(() => {
      setIsRevealed(false);
      setImageUrl(null);
    }, 120 * 1000);
    return () => clearTimeout(timer);
  }, [isRevealed]);

  const watermarkText = `${adminName} • ${watermarkTime || new Date().toLocaleTimeString("vi-VN")}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
        <span>{documentTitle}</span>
        {isRevealed && (
          <span className="text-amber-600 font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {t("expiresNotice")}
          </span>
        )}
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] aspect-[4/3] flex items-center justify-center select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Blurred Image Placeholder or Real Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={documentTitle}
            onDragStart={(e) => e.preventDefault()}
            className={`w-full h-full object-contain transition-all duration-300 ${
              isRevealed ? "filter-none" : "blur-xl scale-105"
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-gray-900)]/5 backdrop-blur-md text-[var(--color-text-secondary)] p-4 text-center">
            <ShieldAlert className="w-8 h-8 mb-2 opacity-60 text-[var(--color-brand-600)]" />
            <span className="text-xs font-medium">{t("blurredPrompt")}</span>
          </div>
        )}

        {/* Watermark Overlay (Only when revealed) */}
        {isRevealed && imageUrl && (
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <div className="transform -rotate-25 text-[var(--color-gray-900)]/20 font-black text-sm sm:text-base tracking-widest uppercase border-2 border-[var(--color-gray-900)]/20 px-4 py-2 rounded-lg select-none">
              {watermarkText}
            </div>
          </div>
        )}

        {/* Reveal Overlay Action */}
        {!isRevealed && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 p-4 z-10">
            <button
              type="button"
              onClick={handleRevealImage}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg bg-[var(--color-gray-900)] hover:bg-black text-white text-xs font-semibold shadow-[var(--shadow-2)] flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer disabled:opacity-60"
            >
              <Eye className="w-4 h-4" />
              <span>{isLoading ? t("fetchingSecureImage") : t("clickToRevealBtn")}</span>
            </button>
            <p className="text-[11px] text-white/80 max-w-xs text-center drop-shadow">
              {t("auditLogNotice")}
            </p>
          </div>
        )}

        {/* Action controls when revealed */}
        {isRevealed && imageUrl && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
              title={t("fullscreenTooltip")}
              aria-label={t("fullscreenTooltip")}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRevealed(false);
                setImageUrl(null);
              }}
              className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
              title={t("hideImageTooltip")}
              aria-label={t("hideImageTooltip")}
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Đóng toàn màn hình"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img
              src={imageUrl}
              alt={documentTitle}
              onDragStart={(e) => e.preventDefault()}
              className="max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="transform -rotate-25 text-white/30 font-black text-2xl tracking-widest uppercase border-4 border-white/30 px-6 py-3 rounded-xl select-none">
                {watermarkText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
