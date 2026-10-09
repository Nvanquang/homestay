"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ShieldCheck, Award, MessageSquare, ArrowRight } from "lucide-react";
import { HostPublicProfile } from "../types";

interface HostCardProps {
  host: HostPublicProfile;
}

export function HostCard({ host }: HostCardProps) {
  const t = useTranslations("listingDetail.hostCard");
  const locale = useLocale();

  return (
    <div className="py-6 border-y border-[var(--color-border-subtle)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/hosts/${host.id}`} className="block shrink-0 relative group">
            <img
              src={host.avatarUrl}
              alt={host.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary group-hover:scale-105 transition-transform"
            />
            {host.verified && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary text-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t("hostedBy", { name: host.displayName })}
              </h3>
              {host.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  {t("verifiedBadge")}
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t("joinedAt", { date: host.joinedAt })} · {t("activeListingsCount", { count: host.activeListingCount })}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/hosts/${host.id}`}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-gray-900 text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center gap-1 shrink-0"
        >
          <span>{t("viewProfileBtn")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {host.bio && (
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-4 leading-relaxed line-clamp-2">
          {host.bio}
        </p>
      )}
    </div>
  );
}
