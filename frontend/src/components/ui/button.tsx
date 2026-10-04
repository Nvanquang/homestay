import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "danger-outline";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      className = "",
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gray-900)] focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed select-none";

    // Size styles
    const sizeClasses = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2.5 h-11 gap-2",
      lg: "text-base px-6 py-3.5 h-13 gap-2.5",
    }[size];

    // Variant styles
    let variantClasses = "";
    switch (variant) {
      case "primary":
        variantClasses =
          "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] active:bg-[var(--color-brand-800)] text-white shadow-[var(--shadow-1)] disabled:bg-[var(--color-action-disabled-bg)] disabled:text-[var(--color-action-disabled-text)] disabled:shadow-none";
        break;
      case "secondary":
        variantClasses =
          "bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] border border-[var(--color-gray-900)] disabled:border-[var(--color-border-default)] disabled:text-[var(--color-text-disabled)] disabled:bg-[var(--color-bg-surface)]";
        break;
      case "tertiary":
        variantClasses =
          "bg-transparent text-[var(--color-text-link)] underline underline-offset-4 hover:text-[var(--color-text-brand)] hover:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-disabled)] disabled:no-underline";
        break;
      case "danger":
        variantClasses =
          "bg-[var(--color-action-danger-bg)] hover:bg-[var(--color-action-danger-hover)] active:bg-[var(--color-action-danger-active)] text-white shadow-[var(--shadow-1)] disabled:bg-[var(--color-action-disabled-bg)] disabled:text-[var(--color-action-disabled-text)]";
        break;
      case "danger-outline":
        variantClasses =
          "bg-[var(--color-bg-surface)] border border-[var(--color-error-fg)] text-[var(--color-error-fg)] hover:bg-[var(--color-error-bg)] active:bg-[var(--color-error-border)] disabled:border-[var(--color-border-default)] disabled:text-[var(--color-text-disabled)] disabled:bg-[var(--color-bg-surface)]";
        break;
    }

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            {leftIcon}
            <span>{children}</span>
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
