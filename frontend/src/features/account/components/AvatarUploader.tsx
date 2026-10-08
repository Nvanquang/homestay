"use client";

import React, { useRef, useState } from "react";
import { Camera, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { uploadAvatar, deleteAvatar } from "../api/mock-account";
import { toast } from "@/components/ui/toaster";
import { useTranslations } from "next-intl";

export interface AvatarUploaderProps {
  avatarUrl?: string;
  userName?: string;
  onAvatarChange?: (newUrl: string) => void;
  onAvatarRemove?: () => void;
  disabled?: boolean;
}

export function AvatarUploader({
  avatarUrl,
  userName = "Người dùng",
  onAvatarChange,
  onAvatarRemove,
  disabled = false,
}: AvatarUploaderProps) {
  const t = useTranslations("account.avatar");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Client-side validation: Format check
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(t("invalidFormat"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Client-side validation: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t("fileTooLarge"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadAvatar(file);
      onAvatarChange?.(res.avatarUrl);
      toast.success(t("updateSuccess"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading avatar";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setErrorMessage(null);
    try {
      setIsUploading(true);
      await deleteAvatar();
      onAvatarRemove?.();
      toast.success(t("removeSuccess"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error removing avatar";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div className="relative group">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] flex items-center justify-center shadow-[var(--shadow-1)]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold text-[var(--color-gray-600)] select-none">
              {getInitials(userName)}
            </span>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          aria-label={t("change")}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Tải tệp ảnh"
      />

      <div className="flex flex-col items-center sm:items-start gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? t("change") : t("upload")}
          </Button>

          {avatarUrl && (
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              disabled={disabled || isUploading}
              onClick={handleRemove}
              className="text-[var(--color-error-fg)] hover:text-[var(--color-action-danger-hover)]"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              {t("remove")}
            </Button>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-secondary)]">
          {t("hint")}
        </p>

        {errorMessage && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-error)] font-medium mt-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
    </div>
  );
}
