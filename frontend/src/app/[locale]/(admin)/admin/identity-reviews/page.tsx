"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Lock,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { AdminShell } from "@/components/layouts";
import { getCurrentAdminSession, AdminAuthSession } from "@/features/admin";
import {
  IdentityVerificationRecord,
  ReviewQueueFilterParams,
  VerificationStatus,
  ApplicantType,
} from "@/features/verification/types";
import { getReviewQueue } from "@/features/verification/api/mock-verification";
import {
  Button,
  Badge,
  TextField,
  Select,
} from "@/components/ui";

export default function IdentityReviewsQueuePage() {
  const t = useTranslations("admin.verification");
  const locale = useLocale();

  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [records, setRecords] = useState<IdentityVerificationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [applicantFilter, setApplicantFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getCurrentAdminSession().then((s) => setSession(s));
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: ReviewQueueFilterParams = {
        page: 1,
        pageSize: 50,
      };
      if (statusFilter !== "ALL") {
        params.status = statusFilter as VerificationStatus;
      }
      if (applicantFilter !== "ALL") {
        params.applicantType = applicantFilter as ApplicantType;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await getReviewQueue(params);
      setRecords(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, applicantFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("statusApproved")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="error" className="gap-1">
            <XCircle className="w-3.5 h-3.5" />
            {t("statusRejected")}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="w-3.5 h-3.5" />
            {t("statusPending")}
          </Badge>
        );
      default:
        return <Badge variant="neutral">{t("statusUnverified")}</Badge>;
    }
  };

  return (
    <AdminShell
      activeItem="identity-reviews"
      title={t("queueTitle")}
      description={t("queueSubtitle", { total })}
      adminName={session?.fullName}
      adminRole={session?.staffRole}
      actionButton={
        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              <Search className="w-4 h-4 mr-1.5" />
              {t("searchBtn")}
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "ALL", label: t("filterAllStatus") },
                  { value: "PENDING", label: t("statusPending") },
                  { value: "APPROVED", label: t("statusApproved") },
                  { value: "REJECTED", label: t("statusRejected") },
                ]}
              />
            </div>
            <div className="w-36">
              <Select
                value={applicantFilter}
                onChange={(e) => setApplicantFilter(e.target.value)}
                options={[
                  { value: "ALL", label: t("filterAllRoles") },
                  { value: "HOST", label: t("roleHost") },
                  { value: "GUEST", label: t("roleGuest") },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-neutral-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-2" />
              <p className="text-sm">{t("loading")}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              <ShieldCheck className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
              <p className="font-medium text-neutral-700">{t("noRecordsFound")}</p>
              <p className="text-sm mt-1">{t("noRecordsDesc")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-700 uppercase font-semibold text-xs border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3.5">{t("colApplicant")}</th>
                    <th className="px-6 py-3.5">{t("colType")}</th>
                    <th className="px-6 py-3.5">{t("colIdInfo")}</th>
                    <th className="px-6 py-3.5">{t("colStatus")}</th>
                    <th className="px-6 py-3.5">{t("colSubmittedAt")}</th>
                    <th className="px-6 py-3.5 text-right">{t("colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {records.map((rec) => {
                    const isLocked =
                      rec.lockedBy &&
                      new Date(rec.lockedBy.lockedAt).getTime() + 5 * 60 * 1000 > Date.now();

                    return (
                      <tr
                        key={rec.id}
                        className="hover:bg-neutral-50/75 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900">
                            {rec.legalName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {rec.phone}
                          </div>
                          {rec.flaggedDuplicate && (
                            <div className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium mt-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{t("flagDuplicate")}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={rec.applicantType === "HOST" ? "info" : "neutral"}
                          >
                            {rec.applicantType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-neutral-800">
                            {rec.idType}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {rec.idNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {getStatusBadge(rec.status)}
                            {isLocked && (
                              <div className="text-xs text-amber-600 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>{rec.lockedBy?.adminName}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-500">
                          {rec.submittedAt
                            ? new Date(rec.submittedAt).toLocaleString(locale)
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/${locale}/admin/identity-reviews/${rec.id}`}
                          >
                            <Button
                              variant={rec.status === "PENDING" ? "primary" : "secondary"}
                              size="sm"
                              className="gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {rec.status === "PENDING"
                                ? t("actionReview")
                                : t("actionViewDetail")}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
