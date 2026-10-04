import React from "react";
import {
  Check,
  AlertTriangle,
  Clock,
  X,
  Lock,
  Info,
  CircleDot,
} from "lucide-react";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "attention"
  | "error"
  | "error-solid"
  | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "neutral",
  icon,
  className = "",
  ...props
}: BadgeProps) {
  let defaultIcon: React.ReactNode = null;
  let variantClasses = "";

  switch (variant) {
    case "neutral":
      defaultIcon = <CircleDot className="w-3 h-3 text-[var(--color-gray-700)]" />;
      variantClasses =
        "bg-[var(--color-bg-muted)] text-[var(--color-gray-700)] border border-[var(--color-border-subtle)]";
      break;
    case "success":
      defaultIcon = <Check className="w-3 h-3 text-[var(--color-success-fg)]" />;
      variantClasses =
        "bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border border-[var(--color-success-border)]";
      break;
    case "warning":
      defaultIcon = <Clock className="w-3 h-3 text-[var(--color-warning-fg)]" />;
      variantClasses =
        "bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)] border border-[var(--color-warning-border)]";
      break;
    case "attention":
      defaultIcon = <AlertTriangle className="w-3 h-3 text-[var(--color-attention-fg)]" />;
      variantClasses =
        "bg-[var(--color-attention-bg)] text-[var(--color-attention-fg)] border border-[var(--color-attention-border)]";
      break;
    case "error":
      defaultIcon = <X className="w-3 h-3 text-[var(--color-error-fg)]" />;
      variantClasses =
        "bg-[var(--color-error-bg)] text-[var(--color-error-fg)] border border-[var(--color-error-border)]";
      break;
    case "error-solid":
      defaultIcon = <Lock className="w-3 h-3 text-white" />;
      variantClasses =
        "bg-[var(--color-action-danger-bg)] text-white border-transparent";
      break;
    case "info":
      defaultIcon = <Info className="w-3 h-3 text-[var(--color-info-fg)]" />;
      variantClasses =
        "bg-[var(--color-info-bg)] text-[var(--color-info-fg)] border border-[var(--color-info-border)]";
      break;
  }

  const renderIcon = icon !== undefined ? icon : defaultIcon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses} ${className}`}
      {...props}
    >
      {renderIcon}
      <span>{children}</span>
    </span>
  );
}
