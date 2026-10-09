"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Switch, Badge } from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import { toggleHostMode } from "../api/mock-account";
import { Home, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { IdentityVerificationStatus } from "../types";
import { useTranslations } from "next-intl";

export interface HostModeCardProps {
  initialIsHost: boolean;
  verificationStatus: IdentityVerificationStatus;
  onHostModeChanged?: (isHost: boolean) => void;
}

export function HostModeCard({
  initialIsHost,
  verificationStatus,
  onHostModeChanged,
}: HostModeCardProps) {
  const t = useTranslations("account.settings");
  const [isHost, setIsHost] = useState(initialIsHost);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    if (!nextVal) return; // One-way toggle in Stage 1

    try {
      setIsLoading(true);
      const res = await toggleHostMode(true);
      setIsHost(res.isHost);
      onHostModeChanged?.(res.isHost);
      toast.success(t("hostModeSuccessToast"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error enabling host mode";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const isVerified = verificationStatus === "VERIFIED";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex-shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {t("hostModeLabel")}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {t("hostModeDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {isHost ? (
            <Badge variant="success" icon={<Check className="w-3.5 h-3.5" />}>
              {t("hostModeEnabledBadge")}
            </Badge>
          ) : (
            <Switch
              id="host-mode-toggle"
              checked={isHost}
              disabled={isLoading}
              onChange={handleToggle}
              aria-label={t("hostModeLabel")}
            />
          )}
        </div>
      </div>

      {isHost && !isVerified && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning-fg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t("hostModeVerificationWarningTitle")}</p>
              <p className="text-[var(--color-text-secondary)] mt-0.5">
                {t("hostModeVerificationWarningDesc")}
              </p>
            </div>
          </div>

          <Link
            href="/account/verification"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-warning-fg)] text-white hover:opacity-90 font-semibold self-start sm:self-center whitespace-nowrap transition-opacity shadow-sm"
          >
            <span>{t("completeVerificationBtn")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
