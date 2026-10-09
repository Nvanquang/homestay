"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  MapPin,
  Camera,
  Coffee,
  ShieldAlert,
  DollarSign,
  FileCheck2,
  Send,
  Check,
  Lock,
} from "lucide-react";
import { WizardStepId } from "../types";

export interface WizardNavProps {
  currentStep: WizardStepId;
  completedStepsCount: number;
  onSelectStep: (step: WizardStepId) => void;
  className?: string;
}

export const WIZARD_STEPS: {
  id: WizardStepId;
  stepNumber: number;
  labelKey: string;
  subLabelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  isImplemented: boolean;
}[] = [
  {
    id: "basic",
    stepNumber: 1,
    labelKey: "step1Label",
    subLabelKey: "step1Sub",
    icon: FileText,
    isImplemented: true,
  },
  {
    id: "location",
    stepNumber: 2,
    labelKey: "step2Label",
    subLabelKey: "step2Sub",
    icon: MapPin,
    isImplemented: true,
  },
  {
    id: "photos",
    stepNumber: 3,
    labelKey: "step3Label",
    subLabelKey: "step3Sub",
    icon: Camera,
    isImplemented: true,
  },
  {
    id: "amenities",
    stepNumber: 4,
    labelKey: "step4Label",
    subLabelKey: "step4Sub",
    icon: Coffee,
    isImplemented: true,
  },
  {
    id: "rules",
    stepNumber: 5,
    labelKey: "step5Label",
    subLabelKey: "step5Sub",
    icon: ShieldAlert,
    isImplemented: true,
  },
  {
    id: "pricing",
    stepNumber: 6,
    labelKey: "step6Label",
    subLabelKey: "step6Sub",
    icon: DollarSign,
    isImplemented: true,
  },
  {
    id: "policy",
    stepNumber: 7,
    labelKey: "step7Label",
    subLabelKey: "step7Sub",
    icon: FileCheck2,
    isImplemented: false,
  },
  {
    id: "legal",
    stepNumber: 8,
    labelKey: "step8Label",
    subLabelKey: "step8Sub",
    icon: Send,
    isImplemented: false,
  },
];

export function WizardNav({
  currentStep,
  completedStepsCount,
  onSelectStep,
  className = "",
}: WizardNavProps) {
  const t = useTranslations("listingWizard");
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav
      data-testid="wizard-nav"
      aria-label="Tiến trình tạo phòng"
      className={`bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] p-4 shadow-sm ${className}`}
    >
      <div className="mb-4 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
          <span>{t("progressCompletion")}</span>
          <span className="text-[var(--color-primary)] font-bold">
            {completedStepsCount}/8
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] transition-all duration-300 rounded-full"
            style={{ width: `${(completedStepsCount / 8) * 100}%` }}
          />
        </div>
      </div>

      <ol className="space-y-1">
        {WIZARD_STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = idx < completedStepsCount;
          const isUnlocked =
            step.isImplemented &&
            (idx <= completedStepsCount || idx <= currentIndex + 1);
          const isLocked = !isUnlocked;
          const IconComponent = step.icon;

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => isUnlocked && onSelectStep(step.id)}
                aria-current={isActive ? "step" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-semibold shadow-xs"
                    : isCompleted
                    ? "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] font-medium"
                    : isLocked
                    ? "text-[var(--color-text-tertiary)] opacity-60 cursor-not-allowed"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                }`}
              >
                {/* Step indicator icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : isLocked
                      ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)]"
                      : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                {/* Step labels */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate block">{t(step.labelKey as any)}</span>
                    {!step.isImplemented && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] font-normal ml-1">
                        S07
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] truncate block">
                    {t(step.subLabelKey as any)}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
