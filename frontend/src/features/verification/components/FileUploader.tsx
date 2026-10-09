"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { DocumentAttachment, DocumentPurpose } from "../types";
import { uploadDocumentFile } from "../api/mock-verification";
import { useTranslations } from "next-intl";

export interface FileUploaderProps {
  purpose: DocumentPurpose;
  label: string;
  helperText?: string;
  accept?: string;
  maxSizeMb?: number;
  existingAttachment?: DocumentAttachment;
  onUploaded: (attachment: DocumentAttachment) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function FileUploader({
  purpose,
  label,
  helperText = "PNG, JPG hoặc PDF (Tối đa 10MB)",
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  maxSizeMb = 10,
  existingAttachment,
  onUploaded,
  onRemove,
  disabled = false,
}: FileUploaderProps) {
  const t = useTranslations("verification.uploader");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelected = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const attachment = await uploadDocumentFile(file, purpose);
      onUploaded(attachment);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("uploadFailed");
      if (msg.includes("FILE_TOO_LARGE")) {
        setUploadError(t("fileTooLarge", { max: maxSizeMb }));
      } else if (msg.includes("INVALID_FORMAT")) {
        setUploadError(t("invalidFormat"));
      } else {
        setUploadError(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[var(--color-text-primary)]">
          {label}
        </label>
        {existingAttachment && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("uploaded")}
          </span>
        )}
      </div>

      {existingAttachment ? (
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center flex-shrink-0 text-[var(--color-brand-600)]">
              {existingAttachment.fileType === "application/pdf" ? (
                <FileText className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {existingAttachment.fileName}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {(existingAttachment.fileSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-md hover:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-error-fg)] transition-colors"
              aria-label={t("removeFileAria")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled && !isUploading) {
                fileInputRef.current?.click();
              }
            }}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
              isDragOver
                ? "border-[var(--color-brand-600)] bg-[var(--color-brand-50)]"
                : "border-[var(--color-border-default)] hover:border-[var(--color-gray-900)] bg-[var(--color-bg-surface)]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled || isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-[var(--color-brand-600)]">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-medium">{t("uploadingProgress")}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-text-secondary)] mb-1">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {t("dropOrClickPrompt")}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">{helperText}</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-error-fg)]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
