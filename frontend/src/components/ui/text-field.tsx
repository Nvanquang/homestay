import React from "react";
import { AlertCircle } from "lucide-react";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      leftAddon,
      rightAddon,
      disabled,
      readOnly,
      id,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {label}
            {props.required && <span className="text-[var(--color-error-fg)] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
              {leftAddon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            readOnly={readOnly}
            className={`w-full h-11 px-3.5 text-base sm:text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-lg transition-all focus:outline-none disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed read-only:bg-[var(--color-bg-subtle)] ${
              leftAddon ? "pl-10" : ""
            } ${rightAddon ? "pr-10" : ""} ${
              hasError
                ? "border-2 border-[var(--color-border-error)] focus:ring-2 focus:ring-[var(--color-error-fg)]/20"
                : "border border-[var(--color-border-input)] hover:border-[var(--color-border-strong)] focus:border-2 focus:border-[var(--color-border-strong)]"
            } ${className}`}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3.5 flex items-center text-[var(--color-text-secondary)]">
              {rightAddon}
            </div>
          )}
        </div>

        {hasError && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-error)] font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        {!hasError && helperText && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
