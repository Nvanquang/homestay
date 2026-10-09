"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ListingDecisionType,
  ReviewSectionType,
  ReviewReasonItem,
  ListingReviewDecisionPayload,
} from "../types";
import { useTranslations } from "next-intl";

export interface ReviewDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionType: ListingDecisionType;
  listingTitle: string;
  hasDuplicateAlert: boolean;
  onConfirm: (payload: ListingReviewDecisionPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const SECTION_KEYS: { section: ReviewSectionType; stepNumber: number; key: string }[] = [
  { section: "PHOTOS", stepNumber: 3, key: "sectionPhotos" },
  { section: "DESCRIPTION", stepNumber: 1, key: "sectionDescription" },
  { section: "LOCATION", stepNumber: 2, key: "sectionLocation" },
  { section: "AMENITIES", stepNumber: 4, key: "sectionAmenities" },
  { section: "HOUSE_RULES", stepNumber: 5, key: "sectionHouseRules" },
  { section: "PRICING", stepNumber: 6, key: "sectionPricing" },
  { section: "LEGAL_DOCS", stepNumber: 8, key: "sectionLegalDocs" },
  { section: "OTHER", stepNumber: 7, key: "sectionOther" },
];

export function ReviewDecisionModal({
  isOpen,
  onClose,
  decisionType,
  listingTitle,
  hasDuplicateAlert,
  onConfirm,
  isSubmitting = false,
}: ReviewDecisionModalProps) {
  const t = useTranslations("adminListingReviews");
  const tCommon = useTranslations("common");

  // State for APPROVE
  const [acknowledgedDuplicate, setAcknowledgedDuplicate] = useState(false);

  // State for NEEDS_CHANGES
  const [reasons, setReasons] = useState<ReviewReasonItem[]>([
    { section: "PHOTOS", stepNumber: 3, note: "" },
  ]);

  // State for REJECT
  const [rejectReason, setRejectReason] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getSectionLabel = (sec: ReviewSectionType) => {
    const item = SECTION_KEYS.find((s) => s.section === sec);
    return item ? t(item.key as any) : sec;
  };

  const handleAddReasonSection = (sec: ReviewSectionType, step: number) => {
    if (reasons.some((r) => r.section === sec)) return;
    setReasons([...reasons, { section: sec, stepNumber: step, note: "" }]);
  };

  const handleRemoveReasonSection = (index: number) => {
    setReasons(reasons.filter((_, i) => i !== index));
  };

  const handleUpdateReasonNote = (index: number, text: string) => {
    const updated = [...reasons];
    updated[index].note = text;
    setReasons(updated);
  };

  const handleSubmit = async () => {
    setValidationError(null);

    if (decisionType === "APPROVE") {
      if (hasDuplicateAlert && !acknowledgedDuplicate) {
        setValidationError(t("ackDuplicateCheckbox"));
        return;
      }
      await onConfirm({
        decision: "APPROVE",
        acknowledgedDuplicateAddress: acknowledgedDuplicate,
      });
    } else if (decisionType === "NEEDS_CHANGES") {
      if (reasons.length === 0) {
        setValidationError(t("valSelectAtLeastOneSection"));
        return;
      }
      for (const r of reasons) {
        if (!r.note || r.note.trim().length < 10) {
          setValidationError(t("valSectionNoteMinChars", { section: getSectionLabel(r.section) }));
          return;
        }
      }
      await onConfirm({
        decision: "NEEDS_CHANGES",
        reasons,
      });
    } else if (decisionType === "REJECT") {
      if (!rejectReason || rejectReason.trim().length < 10) {
        setValidationError(t("valRejectReasonMinChars"));
        return;
      }
      await onConfirm({
        decision: "REJECT",
        note: rejectReason,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {decisionType === "APPROVE" ? (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : decisionType === "NEEDS_CHANGES" ? (
              <div className="p-2 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <XCircle className="w-5 h-5" />
              </div>
            )}

            <div>
              <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                {decisionType === "APPROVE"
                  ? t("modalApproveTitle")
                  : decisionType === "NEEDS_CHANGES"
                  ? t("modalRequestChangesTitle")
                  : t("modalRejectTitle")}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] truncate max-w-sm">
                {listingTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-subtle)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* APPROVE BODY */}
          {decisionType === "APPROVE" && (
            <div className="space-y-4">
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {t("modalApproveDesc")}
              </p>

              {hasDuplicateAlert && (
                <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{t("duplicateAckRequirement")}</span>
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={acknowledgedDuplicate}
                      onChange={(e) => setAcknowledgedDuplicate(e.target.checked)}
                      className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
                      {t("ackDuplicateCheckbox")}
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* NEEDS_CHANGES BODY */}
          {decisionType === "NEEDS_CHANGES" && (
            <div className="space-y-4">
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {t("modalRequestChangesDesc")}
              </p>

              {/* Fast Add Pill buttons */}
              <div>
                <span className="font-semibold text-[var(--color-text-secondary)] mb-2 block">
                  {t("addSectionToFix")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SECTION_KEYS.map((opt) => {
                    const isAdded = reasons.some((r) => r.section === opt.section);
                    return (
                      <button
                        key={opt.section}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddReasonSection(opt.section, opt.stepNumber)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          isAdded
                            ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-disabled)] border-transparent cursor-default"
                            : "bg-[var(--color-bg-surface)] text-[var(--color-primary)] border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] cursor-pointer"
                        }`}
                      >
                        + {t(opt.key as any)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* List of reason items */}
              <div className="space-y-3">
                {reasons.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-text-primary)]">
                        {getSectionLabel(r.section)}
                      </span>
                      {reasons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReasonSection(idx)}
                          className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={r.note}
                      onChange={(e) => handleUpdateReasonNote(idx, e.target.value)}
                      placeholder={t("reasonNotePlaceholder")}
                      className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REJECT BODY */}
          {decisionType === "REJECT" && (
            <div className="space-y-4">
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {t("modalRejectDesc")}
              </p>

              <div className="space-y-1.5">
                <label className="font-semibold text-[var(--color-text-primary)]">
                  {t("rejectReasonLabel")}
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t("rejectReasonPlaceholder")}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs px-4 py-2"
          >
            {tCommon("cancel")}
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`text-xs px-5 py-2 font-bold cursor-pointer text-white ${
              decisionType === "APPROVE"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : decisionType === "NEEDS_CHANGES"
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t("processing")}</span>
              </span>
            ) : decisionType === "APPROVE" ? (
              t("btnApprove")
            ) : decisionType === "NEEDS_CHANGES" ? (
              t("btnSendRequestChanges")
            ) : (
              t("btnConfirmReject")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
