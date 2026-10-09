"use client";

import React, { useState } from "react";
import {
  IdentityVerificationRecord,
  DocumentAttachment,
  IdentityType,
} from "../types";
import {
  IdentityVerificationFormValues,
  identityVerificationSchema,
  getIdentityVerificationSchema,
} from "../schemas";
import {
  saveVerificationDraft,
  submitVerification,
} from "../api/mock-verification";
import { FileUploader } from "./FileUploader";
import {
  TextField,
  Select,
  Button,
  Badge,
  ConfirmDialog,
} from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export interface IdentityVerificationFormProps {
  initialRecord?: IdentityVerificationRecord;
  isHost?: boolean;
  onRecordUpdated?: (record: IdentityVerificationRecord) => void;
}

const DEFAULT_RECORD: IdentityVerificationRecord = {
  id: "verif-host-current",
  userId: "user-me",
  applicantType: "HOST",
  legalName: "Nguyễn Văn Quang",
  dateOfBirth: "1994-07-22",
  phone: "0988123456",
  idType: "CCCD",
  idNumber: "079194008899",
  operatingRightDocs: [],
  status: "UNVERIFIED",
  history: [],
};

export function IdentityVerificationForm({
  initialRecord = DEFAULT_RECORD,
  isHost = true,
  onRecordUpdated,
}: IdentityVerificationFormProps) {
  const t = useTranslations("verification.form");
  const locale = useLocale();

  const [record, setRecord] = useState<IdentityVerificationRecord>(initialRecord);
  const isReadOnly = record.status === "PENDING" || record.status === "APPROVED";

  // Form states
  const [legalName, setLegalName] = useState(record.legalName || "");
  const [dateOfBirth, setDateOfBirth] = useState(record.dateOfBirth || "");
  const [phone, setPhone] = useState(record.phone || "");
  const [idType, setIdType] = useState<IdentityType>(record.idType || "CCCD");
  const [idNumber, setIdNumber] = useState(record.idNumber || "");

  // Files state
  const [idFront, setIdFront] = useState<DocumentAttachment | undefined>(
    record.idFront
  );
  const [idBack, setIdBack] = useState<DocumentAttachment | undefined>(
    record.idBack
  );
  const [operatingRightDocs, setOperatingRightDocs] = useState<
    DocumentAttachment[]
  >(record.operatingRightDocs || []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Mask id number when pending/approved
  const getMaskedIdNumber = (num: string) => {
    if (!num) return "";
    if (num.length <= 4) return num;
    return `${num.slice(0, 4)}••••${num.slice(-4)}`;
  };

  const handleSaveDraft = async () => {
    try {
      const updated = await saveVerificationDraft(
        { legalName, dateOfBirth, phone, idType, idNumber },
        { idFront, idBack, operatingRightDocs }
      );
      setRecord(updated);
      onRecordUpdated?.(updated);
      toast.success(t("draftSavedToast"));
    } catch {
      toast.error(t("draftSaveError"));
    }
  };

  const handleValidateAndPrompt = () => {
    const schema = getIdentityVerificationSchema(locale);
    const result = schema.safeParse({
      legalName,
      dateOfBirth,
      phone,
      idType,
      idNumber,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error(t("checkFormErrorsPrompt"));
      return;
    }

    if (!idFront) {
      toast.error(t("missingFrontDocError"));
      return;
    }

    if (idType === "CCCD" && !idBack) {
      toast.error(t("missingBackDocError"));
      return;
    }

    setErrors({});
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updated = await submitVerification(
        { legalName, dateOfBirth, phone, idType, idNumber },
        { idFront, idBack, operatingRightDocs }
      );
      setRecord(updated);
      onRecordUpdated?.(updated);
      setIsConfirmOpen(false);
      toast.success(t("submittedSuccessToast"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Status Banner */}
      {record.status === "PENDING" && (
        <div
          role="status"
          className="p-5 rounded-xl border border-sky-200 bg-sky-50 text-sky-950 flex items-start gap-4 shadow-[var(--shadow-1)] animate-in fade-in"
        >
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 flex-shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-sky-900">
                {t("pendingBannerTitle")}
              </h3>
              <Badge variant="info">{t("pendingBadge")}</Badge>
            </div>
            <p className="text-sm text-sky-800">
              {t("pendingBannerDesc")}
            </p>
            {record.submittedAt && (
              <p className="text-xs text-sky-700 pt-1">
                {t("submittedAtLabel", {
                  time: new Date(record.submittedAt).toLocaleString(
                    locale === "en" ? "en-US" : "vi-VN"
                  ),
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {record.status === "REJECTED" && (
        <div
          role="alert"
          className="p-5 rounded-xl border border-red-200 bg-red-50 text-red-950 flex items-start gap-4 shadow-[var(--shadow-1)] animate-in fade-in"
        >
          <div className="p-2.5 rounded-xl bg-red-100 text-[var(--color-error-fg)] flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--color-error-fg)]">
                {t("rejectedBannerTitle")}
              </h3>
              <Badge variant="error">{t("rejectedBadge")}</Badge>
            </div>
            <p className="text-sm text-red-900 font-medium">
              {record.rejectionReason?.note || t("defaultRejectionNote")}
            </p>
            <p className="text-xs text-red-700">
              {t("rejectedHelperNote")}
            </p>
          </div>
        </div>
      )}

      {record.status === "APPROVED" && (
        <div
          role="status"
          className="p-5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-start gap-4 shadow-[var(--shadow-1)] animate-in fade-in"
        >
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-emerald-900">
                {t("approvedBannerTitle")}
              </h3>
              <Badge variant="success">{t("approvedBadge")}</Badge>
            </div>
            <p className="text-sm text-emerald-800">
              {t("approvedBannerDesc")}
            </p>
            <div className="pt-2">
              <Link href={`/${locale}/host/listings`}>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {t("goToHostListingsBtn")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Verification Form */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-8 shadow-[var(--shadow-1)]">
        {/* Section A: Thông tin cá nhân */}
        <section aria-labelledby="section-personal-info" className="space-y-4">
          <div className="pb-2 border-b border-[var(--color-border-subtle)]">
            <h2
              id="section-personal-info"
              className="text-lg font-bold text-[var(--color-gray-900)] flex items-center gap-2"
            >
              <span>A. {t("personalInfoHeading")}</span>
              {isReadOnly && <Lock className="w-4 h-4 text-[var(--color-text-secondary)]" />}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {t("personalInfoSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              id="verif-legalName"
              label={t("legalNameLabel")}
              placeholder={t("legalNamePlaceholder")}
              value={legalName}
              onChange={(e) => {
                setLegalName(e.target.value);
                if (errors.legalName) setErrors((prev) => ({ ...prev, legalName: "" }));
              }}
              errorMessage={errors.legalName}
              disabled={isReadOnly}
            />

            <TextField
              id="verif-dob"
              type="date"
              label={t("dobLabel")}
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
              }}
              errorMessage={errors.dateOfBirth}
              disabled={isReadOnly}
            />

            <div className="sm:col-span-2">
              <TextField
                id="verif-phone"
                label={t("phoneLabel")}
                placeholder="0912345678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                errorMessage={errors.phone}
                disabled={isReadOnly}
                helperText={t("phoneHelperText")}
              />
            </div>
          </div>
        </section>

        {/* Section B: Giấy tờ danh tính */}
        <section aria-labelledby="section-id-docs" className="space-y-4">
          <div className="pb-2 border-b border-[var(--color-border-subtle)]">
            <h2
              id="section-id-docs"
              className="text-lg font-bold text-[var(--color-gray-900)] flex items-center gap-2"
            >
              <span>B. {t("idDocsHeading")}</span>
              {isReadOnly && <Lock className="w-4 h-4 text-[var(--color-text-secondary)]" />}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {t("idDocsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              id="verif-idType"
              label={t("idTypeLabel")}
              value={idType}
              onChange={(e) => setIdType(e.target.value as IdentityType)}
              options={[
                { value: "CCCD", label: t("idTypeCCCD") },
                { value: "PASSPORT", label: t("idTypePassport") },
              ]}
              disabled={isReadOnly}
            />

            <TextField
              id="verif-idNumber"
              label={t("idNumberLabel")}
              placeholder={idType === "CCCD" ? "079194001234" : "B1234567"}
              value={isReadOnly ? getMaskedIdNumber(idNumber) : idNumber}
              onChange={(e) => {
                setIdNumber(e.target.value);
                if (errors.idNumber) setErrors((prev) => ({ ...prev, idNumber: "" }));
              }}
              errorMessage={errors.idNumber}
              disabled={isReadOnly}
              helperText={
                isReadOnly
                  ? t("idNumberMaskedNotice")
                  : idType === "CCCD"
                  ? t("cccdFormatHelper")
                  : t("passportFormatHelper")
              }
            />
          </div>

          {/* Uploaders mặt trước / mặt sau */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <FileUploader
              purpose="ID_FRONT"
              label={t("idFrontLabel")}
              helperText={t("idFrontHelper")}
              accept="image/jpeg,image/png,image/webp"
              existingAttachment={idFront}
              onUploaded={(att) => setIdFront(att)}
              onRemove={() => setIdFront(undefined)}
              disabled={isReadOnly}
            />

            {idType === "CCCD" && (
              <FileUploader
                purpose="ID_BACK"
                label={t("idBackLabel")}
                helperText={t("idBackHelper")}
                accept="image/jpeg,image/png,image/webp"
                existingAttachment={idBack}
                onUploaded={(att) => setIdBack(att)}
                onRemove={() => setIdBack(undefined)}
                disabled={isReadOnly}
              />
            )}
          </div>
        </section>

        {/* Section C: Giấy tờ quyền khai thác (Chỉ dành cho Host) */}
        {isHost && (
          <section aria-labelledby="section-operating-docs" className="space-y-4">
            <div className="pb-2 border-b border-[var(--color-border-subtle)]">
              <h2
                id="section-operating-docs"
                className="text-lg font-bold text-[var(--color-gray-900)] flex items-center gap-2"
              >
                <span>C. {t("operatingDocsHeading")}</span>
                {isReadOnly && <Lock className="w-4 h-4 text-[var(--color-text-secondary)]" />}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {t("operatingDocsSubtitle")}
              </p>
            </div>

            <div className="space-y-3">
              <FileUploader
                purpose="OPERATING_RIGHT"
                label={t("operatingUploadLabel")}
                helperText={t("operatingUploadHelper")}
                onUploaded={(att) => setOperatingRightDocs((prev) => [...prev, att])}
                onRemove={() => {}}
                disabled={isReadOnly || operatingRightDocs.length >= 5}
              />

              {operatingRightDocs.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    {t("uploadedDocsListTitle", { count: operatingRightDocs.length })}
                  </span>
                  <div className="divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border-default)] rounded-lg">
                    {operatingRightDocs.map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[var(--color-brand-600)] flex-shrink-0" />
                          <span className="truncate">{doc.fileName}</span>
                        </div>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() =>
                              setOperatingRightDocs((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-xs text-[var(--color-error-fg)] hover:underline ml-2"
                          >
                            {t("deleteDocBtn")}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Submit Actions */}
        {!isReadOnly && (
          <div className="pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {t("saveDraftBtn")}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleValidateAndPrompt}
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              {record.status === "REJECTED" ? t("editAndResubmitBtn") : t("submitVerificationBtn")}
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog before submitting */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title={t("confirmDialogTitle")}
        description={t("confirmDialogDesc")}
        confirmLabel={t("confirmDialogBtn")}
        cancelLabel={t("cancel")}
        isLoading={isSubmitting}
      />
    </div>
  );
}
