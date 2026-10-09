"use client";

import React, { use } from "react";
import { HostShell } from "@/components/layouts/host-shell";
import { IdentityVerificationForm } from "@/features/verification";

import { useTranslations } from "next-intl";

export default function HostVerificationRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const t = useTranslations("verification.form");

  return (
    <HostShell
      activeItem="verification"
      title={t("hostVerificationTitle")}
      breadcrumbs={[
        { label: t("hostDashboardBreadcrumb"), href: `/${locale}/host/listings` },
        { label: t("identityVerificationBreadcrumb") },
      ]}
    >
      <div className="max-w-4xl mx-auto py-2">
        <IdentityVerificationForm />
      </div>
    </HostShell>
  );
}
