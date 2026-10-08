"use client";

import React, { useEffect, useState } from "react";
import { Dialog, Badge } from "@/components/ui";
import { StaffUser, StaffActivityLog } from "../types";
import { getStaffActivityLogs } from "../api/mock-admin";
import { Loader2, History } from "lucide-react";
import { useTranslations } from "next-intl";

export interface StaffActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffUser | null;
}

export function StaffActivityModal({
  isOpen,
  onClose,
  staff,
}: StaffActivityModalProps) {
  const t = useTranslations("admin.staff");
  const [logs, setLogs] = useState<StaffActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !staff) return;
    let mounted = true;
    async function loadLogs() {
      setIsLoading(true);
      try {
        const data = await getStaffActivityLogs(staff!.id);
        if (mounted) setLogs(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadLogs();
    return () => {
      mounted = false;
    };
  }, [isOpen, staff]);

  if (!staff) return null;

  const renderActionBadge = (action: StaffActivityLog["action"]) => {
    switch (action) {
      case "CREATE":
        return <Badge variant="success">{t("actionCreate")}</Badge>;
      case "CHANGE_ROLE":
        return <Badge variant="neutral">{t("actionChangeRole")}</Badge>;
      case "LOCK":
        return <Badge variant="error">{t("actionLock")}</Badge>;
      case "UNLOCK":
        return <Badge variant="warning">{t("actionUnlock")}</Badge>;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--color-brand-600)]" />
          <span>{t("activityTitle", { name: staff.fullName })}</span>
        </div>
      }
      description={t("activityDesc", { email: staff.email })}
      maxWidth="lg"
    >
      <div className="pt-2 max-h-[60vh] overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-[var(--color-text-secondary)]">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-brand-600)]" />
            <span className="text-sm">{t("loading")}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
            {t("noActivityLogs")}
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-sm space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {renderActionBadge(log.action)}
                    <span className="font-semibold text-[var(--color-gray-900)]">
                      {log.actorName}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                {log.reason && (
                  <p className="text-[var(--color-text-secondary)] text-xs">
                    <strong className="text-[var(--color-text-primary)]">
                      {t("reasonLabel")}:
                    </strong>{" "}
                    {log.reason}
                  </p>
                )}

                {log.oldValue && log.newValue && (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {log.oldValue} → <strong>{log.newValue}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
