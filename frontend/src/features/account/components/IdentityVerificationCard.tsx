"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { IdentityVerificationStatus } from "../types";
import { useTranslations } from "next-intl";

export interface IdentityVerificationCardProps {
  status: IdentityVerificationStatus;
}

export function IdentityVerificationCard({ status }: IdentityVerificationCardProps) {
  const t = useTranslations("account.verification");

  const getBadge = () => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="success">{t("verifiedBadge")}</Badge>;
      case "PENDING":
        return <Badge variant="warning">{t("pendingBadge")}</Badge>;
      case "REJECTED":
        return <Badge variant="error">{t("rejectedBadge")}</Badge>;
      case "UNVERIFIED":
      default:
        return <Badge variant="neutral">{t("unverifiedBadge")}</Badge>;
    }
  };

  const getDetails = () => {
    switch (status) {
      case "VERIFIED":
        return {
          title: t("title"),
          desc: t("verifiedDesc"),
          showCta: false,
          ctaText: "",
        };
      case "PENDING":
        return {
          title: t("title"),
          desc: t("pendingDesc"),
          showCta: false,
          ctaText: "",
        };
      case "REJECTED":
        return {
          title: t("title"),
          desc: t("rejectedDesc"),
          showCta: true,
          ctaText: t("viewReasonResubmit"),
        };
      case "UNVERIFIED":
      default:
        return {
          title: t("title"),
          desc: t("unverifiedDesc"),
          showCta: true,
          ctaText: t("verifyNow"),
        };
    }
  };

  const details = getDetails();

  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "VERIFIED" ? (
            <ShieldCheck className="w-5 h-5 text-[var(--color-success-fg)]" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-[var(--color-warning-fg)]" />
          )}
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t("title")}
          </h3>
        </div>
        {getBadge()}
      </div>

      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        {details.desc}
      </p>

      {details.showCta && (
        <Link
          href="/account/verification"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-brand)] hover:underline mt-1"
        >
          <span>{details.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
