"use client";

import React, { use } from "react";
import { AdminShell } from "@/components/layouts";
import { ListingReviewQueueTable } from "@/features/admin";
import { useTranslations } from "next-intl";

export default function AdminListingReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const { locale } = resolvedParams;
  const t = useTranslations("adminListingReviews");

  return (
    <AdminShell
      activeItem="listing-reviews"
      title={t("queueTitle")}
      description={t("queueSubtitle")}
    >
      <div className="space-y-6">
        <ListingReviewQueueTable locale={locale} />
      </div>
    </AdminShell>
  );
}
