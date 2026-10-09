"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { PriceRule, PriceRuleType } from "../types";
import { formatMoney } from "@/lib/format";
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Sun,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface PriceRulesTableProps {
  rules: PriceRule[];
  locale: string;
  onAddRule: () => void;
  onEditRule: (rule: PriceRule) => void;
  onDeleteRule: (ruleId: string) => Promise<void>;
}

export function PriceRulesTable({
  rules,
  locale,
  onAddRule,
  onEditRule,
  onDeleteRule,
}: PriceRulesTableProps) {
  const t = useTranslations("pricing.table");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRules = rules.filter((r) => {
    if (filterType === "ALL") return true;
    return r.type === filterType;
  });

  const getBadgeType = (type: PriceRuleType) => {
    switch (type) {
      case "HOLIDAY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <Sparkles className="w-3 h-3" />
            {t("typeHoliday")}
          </span>
        );
      case "SEASON":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Sun className="w-3 h-3" />
            {t("typeSeason")}
          </span>
        );
      case "SPECIAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Calendar className="w-3 h-3" />
            {t("typeSpecial")}
          </span>
        );
      default:
        return null;
    }
  };

  const getBadgePhase = (phase: PriceRule["phase"]) => {
    switch (phase) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            ● {t("phaseActive")}
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            ⏳ {t("phaseUpcoming")}
          </span>
        );
      case "PAST":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            ⌛ {t("phasePast")}
          </span>
        );
    }
  };

  const formatDateRange = (from: string, to: string) => {
    const [y1, m1, d1] = from.split("-");
    const [y2, m2, d2] = to.split("-");
    if (y1 === y2) {
      return `${d1}/${m1} – ${d2}/${m2}/${y1}`;
    }
    return `${d1}/${m1}/${y1} – ${d2}/${m2}/${y2}`;
  };

  const handleConfirmDelete = async () => {
    if (!deletingRuleId) return;
    try {
      setIsDeleting(true);
      await onDeleteRule(deletingRuleId);
      setDeletingRuleId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      data-testid="price-rules-table"
      className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-xs space-y-4 p-5"
    >
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
            {t("title")}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {t("subtitle", { count: rules.length })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] ml-1.5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-[var(--color-text-primary)] pr-2 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{t("filterAll")}</option>
              <option value="HOLIDAY">{t("typeHoliday")}</option>
              <option value="SEASON">{t("typeSeason")}</option>
              <option value="SPECIAL">{t("typeSpecial")}</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onAddRule}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("addRuleBtn")}</span>
          </button>
        </div>
      </div>

      {/* Table / List */}
      {filteredRules.length === 0 ? (
        <div className="py-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-700 text-center space-y-3">
          <Calendar className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto opacity-50" />
          <div>
            <p className="text-xs font-bold text-[var(--color-text-primary)]">
              {t("emptyTitle")}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              {t("emptySubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onAddRule}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-xs"
          >
            {t("addFirstRuleBtn")}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-900/40 text-[var(--color-text-secondary)] font-semibold border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="py-3 px-4">{t("colName")}</th>
                <th className="py-3 px-3">{t("colType")}</th>
                <th className="py-3 px-3">{t("colDateRange")}</th>
                <th className="py-3 px-3">{t("colNightlyPrice")}</th>
                <th className="py-3 px-3">{t("colPhase")}</th>
                <th className="py-3 px-3 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filteredRules.map((rule) => {
                const isPast = rule.phase === "PAST";
                return (
                  <tr
                    key={rule.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">
                      {rule.name}
                    </td>
                    <td className="py-3.5 px-3">{getBadgeType(rule.type)}</td>
                    <td className="py-3.5 px-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
                      {formatDateRange(rule.dateFrom, rule.dateTo)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                      {formatMoney(rule.nightlyPrice, "VND", locale)}
                      <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">
                        {" "}
                        / {t("night")}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">{getBadgePhase(rule.phase)}</td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditRule(rule)}
                          className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          title={t("actionEdit")}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isPast}
                          onClick={() => setDeletingRuleId(rule.id)}
                          className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title={isPast ? t("cannotDeletePast") : t("actionDelete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingRuleId)}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDesc")}
        confirmLabel={t("confirmDeleteBtn")}
        cancelLabel={t("cancelBtn")}
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingRuleId(null)}
      />
    </div>
  );
}
