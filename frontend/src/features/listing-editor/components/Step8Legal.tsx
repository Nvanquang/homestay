"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Send,
  Loader2,
  FileCheck2,
  Check,
  Building,
  DollarSign,
  Calendar,
  Eye,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalData,
  LegalDocItem,
  LegalDocType,
  ListingReadinessResult,
  ListingItem,
} from "../types";
import {
  checkListingReadiness,
  uploadLegalDocument,
  deleteLegalDocument,
  submitListingForReview,
} from "../api/mock-listings";
import { toast } from "sonner";

export interface Step8LegalProps {
  listingId: string;
  data: Partial<LegalData>;
  onChange: (updated: Partial<LegalData>) => void;
  onSubmitSuccess: () => void;
  errors?: Record<string, string>;
  isReadOnly?: boolean;
}

export function Step8Legal({
  listingId,
  data,
  onChange,
  onSubmitSuccess,
  errors = {},
  isReadOnly = false,
}: Step8LegalProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  const [docs, setDocs] = useState<LegalDocItem[]>(data.legalDocs || []);
  const [regNumber, setRegNumber] = useState<string>(
    data.legalRegistrationNumber || ""
  );
  const [selectedDocType, setSelectedDocType] =
    useState<LegalDocType>("OPERATING_LICENSE");

  const [isUploading, setIsUploading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [readiness, setReadiness] = useState<ListingReadinessResult | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch readiness checklist on mount and when docs change
  const refreshReadiness = async () => {
    setIsChecking(true);
    try {
      const res = await checkListingReadiness(listingId);
      setReadiness(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    refreshReadiness();
  }, [listingId, docs]);

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error(
        isEn
          ? "File size exceeds 15MB limit"
          : "Dung lượng tệp vượt quá giới hạn 15MB"
      );
      return;
    }

    setIsUploading(true);
    try {
      const newDoc = await uploadLegalDocument(listingId, file, selectedDocType);
      const updated = [...docs, newDoc];
      setDocs(updated);
      onChange({ legalDocs: updated, legalRegistrationNumber: regNumber });
      toast.success(
        isEn ? "Document uploaded successfully" : "Đã tải lên tài liệu thành công"
      );
    } catch (err: any) {
      toast.error(err.message || "Tải tài liệu thất bại");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle document deletion
  const handleDeleteDoc = async (docId: string) => {
    if (isReadOnly) return;
    try {
      await deleteLegalDocument(listingId, docId);
      const updated = docs.filter((d) => d.id !== docId);
      setDocs(updated);
      onChange({ legalDocs: updated, legalRegistrationNumber: regNumber });
      toast.success(isEn ? "Document removed" : "Đã xoá tài liệu");
    } catch (err: any) {
      toast.error(err.message || "Không thể xoá tài liệu");
    }
  };

  // Handle submit for review
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitListingForReview(listingId);
      toast.success(res.message);
      setIsConfirmOpen(false);
      onSubmitSuccess();
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi duyệt chỗ nghỉ");
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocTypeLabel = (type: LegalDocType) => {
    switch (type) {
      case "OPERATING_LICENSE":
        return isEn
          ? "Operating / Ownership License"
          : "Sổ đỏ / Quyền khai thác";
      case "BUSINESS_REGISTRATION":
        return isEn
          ? "Business Registration"
          : "Đăng ký kinh doanh lưu trú";
      case "FIRE_SAFETY":
        return isEn ? "Fire Safety Certificate" : "Chứng nhận PCCC";
      case "OTHER":
        return isEn ? "Other Document" : "Giấy tờ khác";
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* 2 COLUMNS LAYOUT: LEFT = LEGAL DOCS, RIGHT = READINESS CHECKLIST & SUMMARY */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LEGAL DOCUMENTS (7 cols on xl) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="border-b border-[var(--color-border-subtle)] pb-2.5">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[var(--color-primary)]" />
              <span>
                {isEn ? "Legal Documentation" : "Giấy tờ pháp lý & Quyền sở hữu"}
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {isEn
                ? "Upload documentation proving ownership, operation rights, or business registration (FR-LST-06)."
                : "Tải lên tài liệu chứng minh quyền sở hữu, hợp đồng uỷ quyền khai thác hoặc giấy phép kinh doanh theo quy định (FR-LST-06)."}
            </p>
          </div>

          {/* Document Type Selector & Upload Box */}
          <div className="p-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isEn ? "Document Type" : "Loại tài liệu tải lên"}
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) =>
                    setSelectedDocType(e.target.value as LegalDocType)
                  }
                  disabled={isReadOnly || isUploading}
                  className="w-full mt-1.5 px-3 py-2 text-xs font-semibold bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="OPERATING_LICENSE">
                    {isEn
                      ? "Operating / Ownership License *"
                      : "Giấy tờ quyền khai thác / Sổ đỏ *"}
                  </option>
                  <option value="BUSINESS_REGISTRATION">
                    {isEn
                      ? "Business Registration Certificate"
                      : "Giấy phép kinh doanh lưu trú"}
                  </option>
                  <option value="FIRE_SAFETY">
                    {isEn
                      ? "Fire Safety Certificate"
                      : "Biên bản kiểm tra an toàn PCCC"}
                  </option>
                  <option value="OTHER">
                    {isEn ? "Other Document" : "Tài liệu chứng minh khác"}
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-primary)]">
                  {isEn
                    ? "Registration Code (Optional)"
                    : "Mã số đăng ký kinh doanh (nếu có)"}
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0312456789-001"
                  value={regNumber}
                  disabled={isReadOnly}
                  onChange={(e) => {
                    setRegNumber(e.target.value);
                    onChange({
                      legalDocs: docs,
                      legalRegistrationNumber: e.target.value,
                    });
                  }}
                  className="w-full mt-1.5 px-3 py-2 text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Upload Drag/Click Zone */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={isReadOnly || isUploading}
                className="hidden"
                id="legal-file-input"
              />
              <label
                htmlFor="legal-file-input"
                className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer text-center ${
                  isUploading
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]/30 opacity-70 cursor-wait"
                    : isReadOnly
                    ? "border-[var(--color-border-subtle)] opacity-60 cursor-not-allowed"
                    : "border-[var(--color-border-default)] hover:border-[var(--color-primary)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]/50"
                }`}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-[var(--color-text-tertiary)]" />
                )}
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">
                    {isUploading
                      ? isEn
                        ? "Uploading document..."
                        : "Đang tải lên tài liệu..."
                      : isEn
                      ? "Click or drag document to upload"
                      : "Bấm để chọn hoặc kéo thả tệp tải lên"}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                    {isEn
                      ? "Supports PDF, PNG, JPG (Maximum 15MB)"
                      : "Hỗ trợ định dạng PDF, PNG, JPG (Tối đa 15MB)"}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-primary)]">
              <span>
                {isEn ? "Uploaded Documents" : "Danh sách tài liệu đã tải lên"} (
                {docs.length})
              </span>
              {docs.length === 0 && (
                <span className="text-rose-500 text-[11px] font-normal">
                  {isEn
                    ? "* At least 1 document required"
                    : "* Yêu cầu tối thiểu 1 tài liệu"}
                </span>
              )}
            </div>

            {docs.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[var(--color-border-subtle)] text-center text-xs text-[var(--color-text-tertiary)]">
                {isEn
                  ? "No documents uploaded yet. Please upload proof of operation."
                  : "Chưa có tài liệu nào. Vui lòng tải lên giấy tờ quyền khai thác để đủ điều kiện gửi duyệt."}
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-2 mt-0.5">
                          <span>{getDocTypeLabel(doc.type)}</span>
                          <span>·</span>
                          <span>{formatFileSize(doc.sizeBytes)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{isEn ? "Valid" : "Hợp lệ"}</span>
                      </span>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={isEn ? "Delete document" : "Xoá tài liệu"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: READINESS CHECKLIST & SUMMARY CARD (5 cols on xl) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Readiness Checklist Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                  <span>{isEn ? "Submission Readiness" : "Điều kiện gửi duyệt"}</span>
                </h4>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                  {isEn
                    ? "Verified against system requirements (Source: BE Engine)"
                    : "Nguồn dữ liệu kiểm tra đối chiếu trực tiếp từ Backend"}
                </p>
              </div>

              {readiness && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    readiness.canSubmit
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {readiness.canSubmit
                    ? isEn
                      ? "Ready"
                      : "Đủ điều kiện"
                    : isEn
                    ? "Incomplete"
                    : "Chưa đủ"}
                </span>
              )}
            </div>

            {/* Checklist Items List */}
            {isChecking ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                <span>{isEn ? "Verifying readiness..." : "Đang kiểm tra điều kiện..."}</span>
              </div>
            ) : readiness ? (
              <div className="space-y-2.5">
                {readiness.items.map((item) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                      item.ok
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200"
                        : "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {item.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold leading-relaxed">
                          {isEn ? item.messageEn : item.messageVi}
                        </p>
                      </div>
                    </div>

                    {!item.ok && (
                      <Link
                        href={item.linkUrl}
                        className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0 flex items-center gap-0.5"
                      >
                        <span>{isEn ? "Fix" : "Sửa"}</span>
                        <span>→</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Preview Summary Card */}
            {readiness?.summary && (
              <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-3">
                <h5 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                  {isEn ? "Listing Summary" : "Tóm tắt chỗ nghỉ"}
                </h5>

                <div className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/50 flex items-center gap-3">
                  {readiness.summary.coverPhotoUrl ? (
                    <img
                      src={readiness.summary.coverPhotoUrl}
                      alt="Cover"
                      className="w-16 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-14 rounded-lg bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-text-tertiary)] shrink-0">
                      <Building className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                      {readiness.summary.title}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {readiness.summary.district}, {readiness.summary.province}
                      </span>
                    </p>
                    <p className="text-[11px] font-semibold text-[var(--color-primary)]">
                      {readiness.summary.baseNightlyPrice.toLocaleString()}{" "}
                      ₫/đêm · {readiness.summary.bookingMode === "INSTANT" ? "Instant" : "Request"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                disabled={!readiness?.canSubmit || isReadOnly || isSubmitting}
                onClick={() => setIsConfirmOpen(true)}
                className="w-full py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isEn ? "Submit Listing for Review" : "Gửi duyệt chỗ nghỉ"}
                </span>
              </Button>

              {!readiness?.canSubmit && (
                <p className="text-[11px] text-center text-rose-500 font-medium mt-2">
                  {isEn
                    ? "Complete all requirements in checklist above to enable submission."
                    : "Vui lòng hoàn thành các mục chưa đạt trong danh sách để bật nút gửi duyệt."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog CMP-25 */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">
                  {isEn
                    ? "Submit Listing for Review?"
                    : "Xác nhận gửi duyệt chỗ nghỉ?"}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                  {isEn
                    ? "Once submitted, your listing will be locked from editing until the administration team completes verification (typically within 24–48 hours)."
                    : "Sau khi gửi duyệt, thông tin chỗ nghỉ sẽ ở chế độ chỉ đọc cho tới khi ban quản trị hoàn tất thẩm định (thông thường trong 24–48 giờ). Bạn có chắc chắn muốn gửi?"}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <span>
                {isEn
                  ? "Average approval time: 24 to 48 hours"
                  : "Thời gian xử lý trung bình: 24 đến 48 giờ"}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setIsConfirmOpen(false)}
                className="text-xs px-4 py-2 cursor-pointer"
              >
                {isEn ? "Cancel" : "Huỷ bỏ"}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="text-xs px-5 py-2 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isSubmitting
                    ? isEn
                      ? "Submitting..."
                      : "Đang gửi..."
                    : isEn
                    ? "Confirm & Submit"
                    : "Xác nhận gửi ngay"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
