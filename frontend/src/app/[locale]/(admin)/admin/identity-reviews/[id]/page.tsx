"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Calendar,
  Phone,
  User,
  CreditCard,
  FileText,
  Clock,
  History,
} from "lucide-react";
import { AdminShell } from "@/components/layouts";
import { getCurrentAdminSession, AdminAuthSession } from "@/features/admin";
import {
  IdentityVerificationRecord,
  ReviewDecisionPayload,
  RejectionCategory,
} from "@/features/verification/types";
import {
  getReviewDetail,
  lockReview,
  unlockReview,
  viewSecureDocument,
  submitReviewDecision,
} from "@/features/verification/api/mock-verification";
import { SecureImageViewer } from "@/features/verification/components/SecureImageViewer";
import { LockBanner } from "@/features/verification/components/LockBanner";
import {
  Button,
  Badge,
  ConfirmDialog,
  Select,
  TextArea,
} from "@/components/ui";
import { toast } from "@/components/ui/toaster";

export default function IdentityReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const resolvedParams = use(params);
  const { id, locale } = resolvedParams;
  const router = useRouter();

  const t = useTranslations("admin.verification");

  const [record, setRecord] = useState<IdentityVerificationRecord | null>(null);
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLockedByMe, setIsLockedByMe] = useState(false);
  const [isLockedByOther, setIsLockedByOther] = useState(false);

  // Decision state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState<RejectionCategory>("BLURRY");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDataAndLock = async () => {
    setLoading(true);
    try {
      const data = await getReviewDetail(id);
      if (!data) {
        toast.error(t("recordNotFound"));
        router.push(`/${locale}/admin/identity-reviews`);
        return;
      }
      setRecord(data);

      // Check lock status
      if (
        data.lockedBy &&
        new Date(data.lockedBy.lockedAt).getTime() + 5 * 60 * 1000 > Date.now()
      ) {
        if (data.lockedBy.adminId === "admin-current") {
          setIsLockedByMe(true);
          setIsLockedByOther(false);
        } else {
          setIsLockedByOther(true);
          setIsLockedByMe(false);
        }
      } else if (data.status === "PENDING") {
        // Acquire soft lock
        const lockedRec = await lockReview(id);
        setRecord(lockedRec);
        setIsLockedByMe(true);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentAdminSession().then((s) => setSession(s));
    loadDataAndLock();

    return () => {
      // Soft unlock on unmount if locked by current admin and still pending
      if (id) {
        unlockReview(id).catch(() => {});
      }
    };
  }, [id]);

  const handleDocumentFetch = async (docId: string): Promise<string> => {
    const res = await viewSecureDocument(id, docId);
    return res.signedUrl;
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const payload: ReviewDecisionPayload = {
        decision: "APPROVE",
      };
      const updated = await submitReviewDecision(id, payload);
      setRecord(updated);
      setIsApproveOpen(false);
      toast.success(t("approvedSuccess"));
      setTimeout(() => {
        router.push(`/${locale}/admin/identity-reviews`);
      }, 1200);
    } catch {
      toast.error(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionNotes.trim()) {
      toast.error(t("notesRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ReviewDecisionPayload = {
        decision: "REJECT",
        reasonCategory: rejectionCategory,
        note: rejectionNotes.trim(),
      };
      const updated = await submitReviewDecision(id, payload);
      setRecord(updated);
      setIsRejectOpen(false);
      toast.success(t("rejectedSuccess"));
      setTimeout(() => {
        router.push(`/${locale}/admin/identity-reviews`);
      }, 1200);
    } catch {
      toast.error(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !record) {
    return (
      <div className="p-12 text-center text-neutral-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-2" />
        <p className="text-sm">{t("loadingDetail")}</p>
      </div>
    );
  }

  const isPending = record.status === "PENDING";
  const canDecide = isPending && !isLockedByOther;

  return (
    <AdminShell
      activeItem="identity-reviews"
      title={t("detailTitle", { name: record.legalName })}
      adminName={session?.fullName}
      adminRole={session?.staffRole}
      actionButton={
        <Link href={`/${locale}/admin/identity-reviews`}>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            {t("backToQueue")}
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Status Header Badge */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600">{t("colStatus")}:</span>
            {record.status === "APPROVED" && (
              <Badge variant="success" className="gap-1 text-sm py-1 px-3">
                <CheckCircle2 className="w-4 h-4" />
                {t("statusApproved")}
              </Badge>
            )}
            {record.status === "REJECTED" && (
              <Badge variant="error" className="gap-1 text-sm py-1 px-3">
                <XCircle className="w-4 h-4" />
                {t("statusRejected")}
              </Badge>
            )}
            {record.status === "PENDING" && (
              <Badge variant="warning" className="gap-1 text-sm py-1 px-3">
                <Clock className="w-4 h-4" />
                {t("statusPending")}
              </Badge>
            )}
          </div>
          <span className="text-xs text-neutral-400">ID: {record.id}</span>
        </div>

      {/* Soft Lock Banner */}
      {isLockedByOther && record.lockedBy && (
        <LockBanner
          lockedByName={record.lockedBy.adminName}
          lockedAt={record.lockedBy.lockedAt}
          isLockedByOther={isLockedByOther}
        />
      )}

      {/* Duplicate Alert Banner */}
      {record.flaggedDuplicate && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-amber-900">
              {t("duplicateWarningTitle")}
            </h4>
            <p className="text-amber-800 mt-0.5">
              {t("duplicateWarningDesc", {
                email: record.duplicateOfEmail || "nguyen.b@homestay.local",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Applicant Meta & History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-semibold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" />
              {t("applicantInfoSection")}
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t("lblLegalName")}</span>
                <span className="font-semibold text-neutral-900">
                  {record.legalName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t("lblDob")}</span>
                <span className="font-medium text-neutral-800">
                  {record.dateOfBirth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t("lblPhone")}</span>
                <span className="font-medium text-neutral-800">
                  {record.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t("lblApplicantRole")}</span>
                <Badge variant={record.applicantType === "HOST" ? "info" : "neutral"}>
                  {record.applicantType}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t("lblIdType")}</span>
                <span className="font-medium text-neutral-800">
                  {record.idType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">{t("lblIdNumber")}</span>
                <span className="font-mono font-medium text-neutral-900">
                  {record.idNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Submission / Decision History */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center gap-2">
              <History className="w-4 h-4 text-primary-600" />
              {t("auditHistorySection")}
            </h3>

            <div className="space-y-3 text-xs text-neutral-600">
              {record.submittedAt && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-neutral-700">
                      {t("historySubmitted")}:
                    </span>{" "}
                    {new Date(record.submittedAt).toLocaleString(locale)}
                  </div>
                </div>
              )}
              {record.decidedAt && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-neutral-700">
                      {t("historyDecided")}:
                    </span>{" "}
                    {new Date(record.decidedAt).toLocaleString(locale)}
                  </div>
                </div>
              )}
              {record.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 space-y-1">
                  <div className="font-semibold">{t("reasonCodeLabel")}: {record.rejectionReason.category}</div>
                  <p>{record.rejectionReason.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Decision Action Box */}
          {canDecide && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-neutral-900">
                {t("decisionSectionTitle")}
              </h3>
              <p className="text-xs text-neutral-500">
                {t("decisionSectionDesc")}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="danger-outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  {t("rejectButton")}
                </Button>
                <Button
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setIsApproveOpen(true)}
                  disabled={isSubmitting}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {t("approveButton")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Secure Document Viewers (CMP-30) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                {t("documentsReviewSection")}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {t("secureViewerAuditNotice")}
              </p>
            </div>

            <div className="space-y-6">
              {/* ID Front */}
              <div>
                <h4 className="text-sm font-medium text-neutral-800 mb-2">
                  1. {t("idFrontLabel")}
                </h4>
                <SecureImageViewer
                  documentId={record.idFront?.id || "doc-front"}
                  documentTitle={record.idFront?.fileName || "cccd_mat_truoc.jpg"}
                  onFetchSecureUrl={handleDocumentFetch}
                  adminName="Admin UrbanNest"
                />
              </div>

              {/* ID Back */}
              <div>
                <h4 className="text-sm font-medium text-neutral-800 mb-2">
                  2. {t("idBackLabel")}
                </h4>
                <SecureImageViewer
                  documentId={record.idBack?.id || "doc-back"}
                  documentTitle={record.idBack?.fileName || "cccd_mat_sau.jpg"}
                  onFetchSecureUrl={handleDocumentFetch}
                  adminName="Admin UrbanNest"
                />
              </div>

              {/* Operating right documents */}
              {record.operatingRightDocs && record.operatingRightDocs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-800 mb-2">
                    3. {t("operatingDocsLabel")}
                  </h4>
                  <div className="space-y-4">
                    {record.operatingRightDocs.map((doc, idx) => (
                      <div key={doc.id || idx}>
                        <SecureImageViewer
                          documentId={doc.id}
                          documentTitle={doc.fileName}
                          onFetchSecureUrl={handleDocumentFetch}
                          adminName="Admin UrbanNest"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        title={t("confirmApproveTitle")}
        description={t("confirmApproveDesc", { name: record.legalName })}
        confirmLabel={t("confirmApproveBtn")}
        cancelLabel={t("cancelBtn")}
        isLoading={isSubmitting}
      />

      {/* Reject Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-neutral-100">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-lg">
                  {t("rejectModalTitle")}
                </h3>
                <p className="text-xs text-neutral-500">
                  {t("rejectModalSubtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  {t("rejectReasonSelectLabel")}
                </label>
                <Select
                  value={rejectionCategory}
                  onChange={(e) => setRejectionCategory(e.target.value as RejectionCategory)}
                  options={[
                    { value: "BLURRY", label: t("reasonBlurryPhoto") },
                    { value: "EXPIRED_DOC", label: t("reasonExpiredDoc") },
                    { value: "MISMATCH", label: t("reasonNameMismatch") },
                    { value: "INVALID_DOC", label: t("reasonDuplicateId") },
                    { value: "OTHER", label: t("reasonOther") },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  {t("rejectNotesLabel")}
                </label>
                <TextArea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder={t("rejectNotesPlaceholder")}
                  rows={3}
                  className="w-full text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsRejectOpen(false)}
                disabled={isSubmitting}
              >
                {t("cancelBtn")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={isSubmitting}
              >
                {t("confirmRejectBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminShell>
  );
}
