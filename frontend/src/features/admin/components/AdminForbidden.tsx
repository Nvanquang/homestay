"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";

export function AdminForbidden() {
  const t = useTranslations("admin.forbidden");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-[var(--color-error-fg)] flex items-center justify-center mb-5">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-error-fg)] bg-red-100/50 px-2.5 py-1 rounded-md mb-2">
        403 Forbidden
      </span>

      <h1 className="text-2xl font-bold text-[var(--color-gray-900)] tracking-tight">
        {t("title")}
      </h1>

      <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-md">
        {t("description")}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link href="/admin">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {t("backHomeBtn")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
